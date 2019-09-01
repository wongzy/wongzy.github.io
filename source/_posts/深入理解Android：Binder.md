---
title: 深入理解Android：Binder
date: 2019-08-27 21:43:25
categories: 深入理解Android系列丛书学习
---


Binder是Android提供给我们的一种跨进程通信方案，Android虽然说是基于Linux内核的，可以使用Linux的管道进行跨进程通信，也可以使用网络的方法（使用Socket）进行跨进程通信，但是这些方式都没有Binder方便和灵活。

从宏观的角度来看，Android可以看作是一个基于Binder通信的C/S架构。Binder在里面起到了一个网络的作用，它将Android系统的各个部分连接在了一起。

# 总体架构

在基于Binder通信的C/S架构体系中，除了C/S架构所包括的Client端和Server端外，Android还有一个全局的ServiceManager端，它的作用是管理系统中的各种服务（Service）。这三者之间的关系如下图所示：

![Client_SM_S.PNG](https://i.loli.net/2019/08/28/e95E8zTGXZrgm4i.png)


> 注意，一个Server进程可以注册多个Service

上图中三者的先后关系是这样的：

1. Server进程要先注册一些Service到ServiceManager中，所以Server是ServiceManager的客户端，两者之间的C/S关系为，Server对应客户端（Client），ServiceManager对应服务端（Server）
2. 如果某个Client进程要使用某个Service，必须先到ServiceManager中获取该Service的相关信息，所以Client是ServiceManager的客户端，两者之间的C/S关系为，Client对应客户端（Client），ServiceManager对应服务端（Server）
3. Client根据得到的Service信息与Service所在的Server建立通信，然后就可以直接与Service交互了，所以Client也是Service的客户端，两者之间的C/S关系为，Client对应客户端（Client），Server对应服务端（Server）

这三者之间交互全部都是基于Binder通信的。

> Binder只是为这种C/S架构提供了一种通信方式，我们也完全可以次啊用其他IPC方式进行通信，实际上，系统中有很多其他的程序就是采用Socket或者Pipe（管道）方法进行进程间通信。ServiceManager并没有使用BpXXX和BnXXX

## MediaServer

> MediaServer以下均称为MS。

MS是一个可执行程序，虽然Android的SDK提供Java层的API，但Android系统本身还是一个完整的基于Linux内核的操作系统，所以并非所有的程序都是用Java编写的，MS就是一个使用C++编写的可执行程序。

MS是系统诸多重要Service的栖息地，它们包括了：

* AudioFlinger：音频系统中的核心服务。
* AudioPolicyService：音频系统中关于音频策略的重要服务。
* MediaPlayerService：多媒体系统中的重要服务
* CameraService：有关摄像/拍照的重要服务

可以看到，MS除了不涉及Surface系统外，其他重要的服务基本上都设涉及了。

MS是一个可执行程序，入口函数为main，写在Main_MediaServer.cpp当中

```cpp
int main(int argc,char **argv)
{
//1.获得一个ProcessState实例。
sp<ProcessState> proc(ProcessState::self());
//2.MS作为ServiceManager的客户端，需要向ServiceManager注册服务。
//调用defaultServiceManager，得到一个IServiceManager。
sp<IServiceManager> sm = defaultServiceManager();
//初始化音频系统的AudioFlinger服务。
AudioFlinger::instantiate();
//3.多媒体系统的MediaPlayer服务，我们将以它作为主切入点。
 MidiaPlayerService::Instantiate();
//CameraService服务。
 CameraService::instantiate();
//音频系统的AudioPolicy服务。
 AudioPolicyService::instantiate();
//4.根据名称来推断，难道是要创建一个线程池吗？
 ProcessState::self()->startThreadPool();
//5.下面的操作是要将自己加入到刚才的线程池中吗？
 IPCThreadState::self()->joinThreadPool();
}
```

上面的代码中，确定了个关键点，我们通过对这五个关键点的分析，来认识和理解Binder。

### 获得一个ProcessState实例：sp<ProcessState> proc(ProcessState::self());

1. 单例的ProcessState

ProcessState的代码在ProcessState.cpp中

```cpp
sp<ProcessState> PeocessState::self() {
//gProcess是在Static.cpp中定义的一个全局变量。
//程序刚开始，gProcess一定为空
if (gPrecess!=NULL) Return gProcess;
AutoMutex_I(gPeocessMutex);
//创建一个ProcessState对象，并赋给gProcess。
if (gProcess == NULL) gProcess = new ProcessState;
return gProcess;
```

self函数采用了单例模式，根据这个以及ProcessState的名字很明确地告诉我们了一个信息：每个进程只有一个ProcessState对象，这一点，从它的命名中也可以看出端倪。

2. ProcessState的构造

再来看Process的构造很熟，这个函数非常重要，它悄悄地打开了Binder设备。代码如下所示，在ProcessState.cpp中可以找到：

```cpp
ProcessState::ProcessState()
//Android中有很多代码都是这么写的，稍不留神这里就调用了一个很重要的函数。
:mDriver(open_driver())
.mVMState(MAP_FAILED)//映射内存的起始地址
.mManagesContexts(false)
.mBinderContextCheckFunc(NULL)
.mBinderContextUserData(NULL)
.mThreadPoolStarted(false)
.mThreadPoolSeq(1) 
{
if (mDriverFD >= 0 ) {
/*BINDER_VM_SIZE定义为（1*1024*1024）-（4096*2）=1M - 8k，mmap真正的实现和驱动有关系，而Binder驱动会分配一块内存来接收数据。*/
mVMStart = mmap(0,BINDER_VM_SIZE,PROT_READ.MAP_PRIVATE|MAP_NORESERVE,mDriverDF,0);
}
...
}
```

3. open_driver：打开binder设备

open_driver的作用就是打开/dev/binder这个设备，它是Android在内核中为完成进程间通信而专门设置的一个虚拟设备，具体实现如下所示，在ProcessState.cpp中：

```cpp
static int open_driver() {
int fd = open("/dev/binder",O_PDWR);
//打开/dev/binder设备。
if (fd >= 0) {
....
size_t maxThread = 15;
//通过ioctl方式告诉binder驱动，这个fd支持的最大线程数是15个。
result = ioctl(fd, BINDER_SET_MAX_THREADS, &maxThreads);
}
return fd;
....
}
```

对于Process::self函数的作用总结如下：

* 打开dev/Binder设备，相当于与内核的Binder驱动有了交互的通道
* 对返回的fd使用mmap，这样Binder驱动就会分配一块内存来接收数据。
* 由于ProcessState具有唯一性，因此一个进程只打开设备一次

### sp<IserviceManager> sm = defaultServiceManager();:调用defaultServiceManager，得到一个IServiceManager。

defaultServiceManager函数的实现在IServiceManager.cpp中完成。它会返回一个IServiceManager对象，通过这个对象，我们可以神奇地与另一个进程ServiceManager进行交互。

1. defaultServiceManager调用的函数

defaultServiceManager的代码藏在IServiceManager中，如下：

```cpp
sp<IServiceManager> defaultServiceManager() {
//看样子又是一个单例，英文名字叫Singleton，Android是一个优秀的源码库，大量使用了设计模式
if (gDefaultServiceManager != NULL)
return gDefaultServiceManager;
{
AutoMutex_I(gDefaultServiceManagerLock);
if (gDefaultServiceManger == NULL) {
//真正的gDefaultServiceManger是在这里创建的。
gDefaultServiceManager = interface_cast<IServiceManager> {
Process::self() -> getContextObject(NULL));
}
}
return gDefaultServiceManager;
```

这里可以看到，gDefaultServiceManager是调用了ProcessState的getContextObject函数来赋值的，getContextObject函数在ProcessState.cpp文件中，如下所示：

```cpp
sp<IBinder> ProcessState::getContextObject(const sp<IBinder> &caller) {
/* caller的只为0，因为它传入的参数为NULL。
support函数根据openDriver函数是否可成功打开设备来判断它是否支持process。
真实设备肯定支持process。
*/
if (supportsProcesses()) {
//真实设备上肯定是支持进程的，所以会调用下面这个函数。
return getStrongProxyForHandle(0);
} else {
return getContextObject(String16("default"), caller);
}
}
```

getStrongProxyForHandle的函数实现如下：

```cpp
sp<IBinder> ProcessState::getStrongProxyForHandle(int32_t handle)
{
sp<IBinder> result;
AutoMutex_I(mLock);
/*
根据索引查找对应的资源。如果lookupHandleLocked发现没有对应的资源项，则会创建一个新的项并返沪。这个新项的内容需要填充。
*/
handle_entry *e = lookupHandleLocked(handle);
if (e != NULL) {
IBinder *b = e -> binder;
if (b == NULL || !e -> refs -> attemptIncWeak(this)) {
//对于新创建的资源项，它的binder为空，所以走这个分支。注意，handle的值为0
b = new BpBinder(handle); //创建一个bpBinder
e -> binder = b;//填充entry的内容
if (b) e -> refs = b -> getWeakRefs();
result = b; 
} else {
result.force_set(b);
e -> refs -> decWeak(this);
}
}
return result; //返回BpBinder(handle),注意，handle的值为0
```

上述代码中出现的BpBinder和它的孪生兄弟BBinder都是Android中与Binder通信相关的代表，他们都是从IBinder类中派生而来。

关于BpBinder和BBinder的关系可以这么理解：

* BpBinder是客户端用来与Server交互的代理类，p即Proxy的意思
* BBinder则是与proxy相对的一端，它是proxy交互的目的端，可以这么理解，BpBinder为客户端，那么BBinder则是对应的服务端，BpBinder和BBinder是一一对应的，某个BpBinder只能与对应的BBinder交互。

BpBinder是由Binder系统通过handler来标识对应的BBinder。

> 注意，我们给BpBinder构造函数传的参数handle的值是0，这个0在整个Binder系统中有重要含义--因为0代表的就是ServiceManager所对应的BBinder。

下面是BpBinder的代码，卸载BpBinder.cpp中：

```cpp
BpBinder::BpBinder(int32_t handle)
:mHandle(handle) //handle是0
,mAlive(1)
,mObitsSent(0)
,mObituaries(NULL)
{
extendObjectLifetime(OBJECT_LIFTTIME_WEAK);
//另一个重要对象是IPCThreadState，我们稍后会详细讲解。
IPCThreadState::self() -> incWeakHandle(handle);
}
```

可以看到，BpBinder和BBinder两个类没有任何地方操作ProcessState打开的那个/dev/binder设备

所以这段代码中

```cpp
gDefaultServiceManager = interface_cast<IServiceManager> {
Process::self() -> getContextObject(NULL));
}
```

这里的 *interface_cast*函数就显得十分重要

interface_cast的具体实现如下

```cpp
templaate<typename INTERFACE>>
intline sp<INTERFACE> interface_cast(const sp<IBinder> &obj)
{
return INTERFACE::asInterface(obj);
}
```

这里仅仅是一个模板函数，真实的实现其实是下面这样的。

```cpp
inline sp<IServiceManager> interface_cast(const sp<IBinder> &obj)
{
return IServiceManager::asInterface(obj);
}
```

所以这个函数真正的实现还是在IServiceManager中的的，IServiceManager定义了ServiceManager中所提供的服务。

那么interface_cast是如何把BpBinder指针转换成一个IServiceManager指针的呢？答案就是下面这段代码。

```cpp
intr = new BpServiceManager(obj);
```

由代码当中可以看出，interface_cast不是指针的转换，而是利用BpBinder对象作为参数新建了一个BpServiceManager对象。到这里我们已经看到了IServiceManager和BpServiceManager的身影，所有的类关系图谱如下：

![IServiceManager类图.PNG](https://i.loli.net/2019/09/01/Utr2SFfJudDsKZX.png)

从这张类图中我们可以看到BnServiceManager是同时继承了IServiceManager和BBinder，所以它可以直接地与Binder交互，但是BpServiceManager则没有直接继承关于Binder的类，它是通过BpRefBase与Binder进行交互的，因为BpRefBase中mRemote的值就是BpBinder。

再回到最开始的这段代码

```cpp
sp<IServiceManager> sm = defaultServiceManager();
```

通过defaultServiceManger函数，我们可以得到两个关键的对象：

* 一个BpBinder对象，它的handle值是0
* 有一个BpServiceManager对象，它的mRemote值是BpBinder