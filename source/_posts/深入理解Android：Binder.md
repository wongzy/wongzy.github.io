---
title: 深入理解Android：Binder
date: 2019-08-27 21:43:25
categories: 深入理解Android系列丛书学习
---


Binder是Android提供给我们的一种跨进程通信方案，Android虽然说是基于Linux内核的，可以使用Linux的管道进行跨进程通信，也可以使用网络的方法（使用Socket）进行跨进程通信，但是这些方式都没有Binder方便和灵活。

从宏观的角度来看，Android可以看作是一个基于Binder通信的C/S架构。Binder在里面起到了一个网络的作用，它将Android系统的各个部分连接在了一起。

# Native Binder 总体架构

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
 MediaPlayerService::Instantiate();
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

defaultServiceManager()实际返回的对象是BpServiceManager

### 初始化多媒体系统的MediaPlayer服务：MediaPlayerService::Instantiate();

MediaPlayerService的代码如下所示：

```cpp
void MediaPlayerService::instance() {
defaultServiceManager()-> addService(
String16("media.player"),new MediaPlayerService());
}
```

因为defaultServiceManager实际返回的对象是BpServiceManager，所以实际的代码是这样的：

```cpp
vitual status_t addService(const String16 & name, const sp<IBinder> & service)
{
//Parcel：就把她当作是一个数据包
Parcel data，reply；
data.writeInterfaceToken(IServiceManager::getInterfaceDescripter());
data.writeString16(name);
data.writeStrongBinder(service);
//remote返回的是mRemote,也就是BpBinder对象
status_err err = remote()->transact(ADD_SERVICE_TRANSACTION,data, &reply);
return err = NO_ERROR?reply.readInt32():err;
```

很明显，addService函数就做了一件事情：*就是把请求数据打包成data后，传给了BpBinder的transact函数，把通信的工作交给了BpBinder去完成。*

BpBinder 的transact函数实现如下所示：

```cpp
status_t BpBinder::transact(uint32_t code, const Parcel & data, Parcel *reply, uint32_t flag)
{
if (mAlive) {
//BpBinder果然是道具，它把transact工作交给了IPCThreadState。
status_t status = IPCThreadState::self()->transact(
mHandle, code, data, reply, flag);//mHandle也是参数
if (status == DEAD_OBJECT) mAlive = 0;
return status;
}
return DEAD_OBJECT;
}
```

这里可以看出来，BpBinder把transact工作马上交给了IPCThreadState。现在我们来分析以下IPCThreadState与transact（）

1. IPCThreadState

IPCThreadState的实现代码如下：

```cpp
IPCThreadState *IPCThreadState::self() 
{
if (gHavaTLS) {//第一次进来为false
restart:
const pthread_key_t k = gTLS;
/*
TLS是Thread Local Strage（线程本地存储空间）的简称。相当于Java的ThreadLocal
通过pThread——getspecific/pthread_setspececific函数可以获取/设置这些空间中的内容。从线程本地存储空间中获取保存在其中的IPCThreadState对象。
有调用pthread_getspecific的地方，肯定也有pthread_setspecific的地方
*/
IPCThread State*st = （IPCThreadState*）pthread_getspectfic(k);
if (st) return st;
//new一个对象，构造函数中会调用pthread_setspecific.
return new IPCThreadState;
}
if(gShoutdown) return NULL;
pthread_mutex_lock(&gTLSMutex);
if (!gHaveTLS) {
if (pThread_key_create(&gTLS, threadDestructor)!=0) {
pthread_mutex_unlock(&gTLSMutex);
return NULL;
}
gHavaTLS = true;
}
pthread_mutex_unlock(&gTLSMutex);
return NULL;
}
gHavaTLS = true;
}
pthread_mutex_unlock(&gTLSMutex);
goto restart;
```

它的构造函数如下：

```cpp
IPCThreadState::IPCthreadState()
:mProcess(ProcessState::self()),mMyThreadId(androidGetTid())
{
//在构造函数中，把自己设置到线程本地存储当中去。
pthread_setspectfic(gTLS,this);
clearCaller();
//mIn和mOut是两个Parcel。把它看成是发送和接收命令的两个缓冲区即可。
mIn.setDataCapacity(256);
mOut.setDataCapacity(256);
}
```

每个线程都有一个IPCThreadState，每个IPCThreadState中都有一个mIn，一个mOut，其中，mIn是用来接收来自Binder设备的数据的，而mOut则是用来存储发往Binder设备的数据的。

2. transact（）

这个函数实际完成了与Binder通信的工作，如下代码所示：

```cpp
//注意，handle的值为0，代表通信的目的端
status_t IPCThreadState::transact(int32_t handle,uint32_t code,const Parcel & data, Parcel *reply,uint32_t flags)
{
status_t err = data.errorCheck();
flag |= TF_ACCEPT_FPS;
......
/*
注意这里的第一个参数BC_TRANSACTION,它是应用程序向binder设备发送消息的消息码，而binder设备向应用程序回复消息的消息码以BR_开头。消息码的定义在binder_module.h中，请求消息码和回应消息码的对应关系，需要查看Binder驱动的实现才能将其理清楚，我们这里暂时用不上。
*/
err = writeTransactionData(BC_TRNASACTION,flags,handle,code, data, NULL);
......
err = waitForResponse(reply);
......
return err;
```

这个流程很简单：先发数据，然后等结果。

writeTransaction函数的作用是把请求命令写在mOut中了，handle的值为0，用来标识目的端，其中0是ServiceManager的标志。

waitForResponse函数的作用是发送请求和接收回复。收到回复后，就会调用talkWithDriver函数，在talkWithDriver函数中就会调用ioctl方式与Binder交互。

>  ioctl是设备驱动程序中对设备的I/O通道进行管理的函数。

### ProcessState::self()->startThreadPool():创建线程池

startThread的实现如下面代码所示：

````cpp
void PeocessState::startThreadPool()
{
AutoMutex_I(mLock);
//如果已经startThreadPool的话，这个函数就没有什么实质作用了。
if (!mThreadPoolStarted){
mThreadPoolStarted = true;
spawnPooledThread(true);//注意，传进去的参数是true。
}
}
````

上面的spawnPooledThread函数的实现如下所示：

```cpp
void PeocessState::spawnPooledThread(bool isMain)
{
//注意，isMain参数是true
if(mThreadPoolStarted) {
int32_t s = android_atomic_add(1,&mThreadPoolSeq);
char buf[32];
spritf(buf, "Binder Thread#%d",s);
sp<Thread> t = new PoolThread(isMain);
t -> run(buf);
}
}
```

可以看到，这里又新建了一个线程并运行，而这个新创建的线程（PoolThread）也调用了joinThreadPool这个函数。

### IPCThreadState::self()->joinThreadPool();

具体实现如下：

```cpp
void IPCThreadState::joinThreadPool(bool isMain) 
{
//注意，如果isMain为true，我们则需要循环处理。把请求信息写到mOut中，待会儿则一起发出去
mOut.writeInt32(isMain?BC_ENTER_LOOPER:BC_REGISTER_LOOPER);
androidSetSchedulingGroup(mMyThreadId,ANDROID_TGROUP_DEFAULT);
status_t result:
do{
int32_t cmd;
if(mIn.dataPosition()>=mIn.dataSize())
{
size_t numPending = mPendingWeakDerefs.size();
if (numPending > 0) {
for(size_t i = 0; i < numPending;i ++) {
RefBase::weakref_type*refs = mPendingWeakDeref[i];
refs->decWeak(mProcess.get());
}
mPendingStrongDerefs.clear();
}
}
//发送命令，读取请求
result = talkWithDriver();
if (result >= NO_ERROR){
size_t IN = mIn.dataAvail();
if (IN < sizeof(int32_t)) continue;
cmd = mIn.readInt32();
result = executeCommand(cmd);//处理消息
}
......
} while(result != -ECONNREFUSED && result != -EBADF);
mOut.writeInt32(BC_EXIT_LOOPER);
talkWithDriver(false);
}
```

原来，这里也使用了talkWithDriver,两个调用了joinThreadPool的线程看看从Binder设备那里能不能找点可做的事情。

### MediaPlayerService总结

目前看来MediaPlayerService调用了两个线程为Service服务，分别是：

* startThreadPool中新启动的线程（即第四步：ProcessState::self()->startThreadPool()）通过joinThreadPool读取binder设备，查看是否有请求。

* 主线程也调用joinThreadPool读取binder设备，查看是否有请求。看来，binder设备是支持多线程操作的。

MediaPlayerService总共注册了四个服务。

Binder体系中通信层和业务层的交互关系可以通过这个图来表示：

![Binder业务层通信层关系.PNG](https://i.loli.net/2019/09/03/FRxbt4ywqJjSE3r.png)

## 服务总管ServiceManager

### ServiceManager的原理

defaultServiceManager返回的是一个BpServiceManager，通过它可以把命令请求发送给handle值为0的目的端。而这些请求都被ServiceManger处理了。

#### ServiceManger的入口函数

ServiceManager的入口函数如下所示。

```cpp
int main(int argc, char **argv) 
{
//BINDER_SERVICE_MANAGER的值为NULL,是一个magic number
void *svcmgr = BINDER_SERVICE_MANAGER;
//1.应该是打开binder设备吧？
bs = binder_open(128*1024);
//2.成为manager，是不是把自己的handle置为0？
binder_become_context_manager(bs);
svcmgr_handle = scvmgr;
//3.处理客户端发过来的请求
binder_loop(bs,svcmgr_handler);
```

1. 打开binder设备:binder_open

binder_open函数用于打开binder设备，它的实现如下所示：

```c
/*
这里的binder_open应该与我们之前在ProcessState中看到的一样：
1）打开binder设备
2）内存映射
*/
struct binder_state*binder_open(unsigned mapsize)
{
struct binder_state *bs;
bs = malloc(sizeof(*bs));
.......
bs->fd=open("/dev/binder",O_RDWR);
......
bs->mapsize = mapsize;
bs->mapped = mmap(NULL, mapsize,PROT_READ,MAP+PRIVATE,bs->fd,0);
}
```

2. 成为manager:binder_become_context_manager(bs)

manager的实现如下面代码所示：

```c
int binder_become_context_manager(struct binder_state *bs)
{
return ioctl(bs->fd,BINDER_SET_CONTEXT_MGR,0);
```

3. 处理客户端发过来的请求:binder_loop

binder_loop函数代码如下所示：

```c
/*
注意binder_handler参数，它是一个函数指针，binder_loop读取请求后将解析这些请求，最后调用binder_handler完成最终的处理
*/
void binder_loop(struct binder_state *bs,binder_handler func)
{
int res;
struct binder_write_read bwr;
readbuf[0]=BC_ENTER_LOOPER;
binder_write(bs,readbuf,sizeof(unsigned));
for(;;){ //死循环
bwr.read_size=sizeof(readbuf);
bwr.read_consumed=0;
bwr=read_buffer = (unsigned)readbuf;
res = ioctl(bs->fd,BINDER_WRITE_READ,&bwr);
//接收到请求，交给binder_parse,最终会调用func来处理这些请求。
res=binder_parse(bs,0,readbuf,bwr.read_consumed,func);
}
```

binder_handler指针func实际上就是svcmgr_handler,svcmgr_handler会使用一个switch/case语句调用对应的IServiceManagerManager中定义的各个业务函数，其中有一个业务函数为addService，这个函数主要的作用是判断注册服务的进程是否有权限，如果进程的用户组是root用户或system用户才允许注册，如果达不到root或system权限的进程，则需要在allowed结构数据中添加相应的项目。它的定义大概像下面这样：

```cpp
static struct{
unsigned uid;
const char*name;
}allowed[]={ //如果达不到root或system权限的进程，则需要在allowed结构数据中添加相应的项目
#ifdef LVMX
{AID_MEDIA,"com.lifevibes.mx.ipc"},
#endif
{AID_MEDIA,"media.audio_flinger"},
....
};
```

总结一下，ServiceManager不过就是保存了一些服务的信息。

### ServiceManager存在的意义

* ServiceManager能集中管理系统内的所有服务，它能施加权限控制，并不是任何进程都能注册服务的。

* ServiceManager支持通过字符串名称来查找对应的Service。这个功能很像DNS。

* 由于各种原因的影响，Service进程可能生死无常，如果让每个Client都去检测，压力实在太大了。现在有了统一的管理机构，Client只需要查询ServiceManager，就能把我动向，得到最新信息。

## MediaPlayerService和它的Client

前面一直讨论ServiceManager和它的Client，现在我们以MediaPlayerService的Client来进行分析。由于ServiceManager不是从BnServiceManager中派生的，所以之前没有讲数据请求是如何从通信层传递到业务层并进行处理的。我们以MediaPlayerService和它的Client作为分析对象，试着解决这些遗留问题。

### 查询ServiceManager

一个Client想要得到某个Service的信息，就必须先和ServiceManager打交道，通过调用getService函数来获取对应Service的信息。getService函数的代码如下：

```cpp
/*
这个函数通过与ServiceManager通信，获得一个能够与MediaPlayerService通信的BpBinder，然后再通过障眼法interface_cast，转换成一个BpMediaPlayerService。
*/
IMediaDeathNotifier::getMediaPlayerService() 
{
sp <IServiceManager> sm = defaultServiceManager();
sp<IBinder>binder;
do {
//向ServiceManager查询对应服务的信息，返回BpBinder。
binder = sm->getService(String16("media.player"));
if(binder!=0){
break;
}
//如果ServiceManager上还没有注册对应的服务，则需要等待，直到对应服务注册
//到ServiceManager中为止。
usleep(500000);
}while(true);
/*
通过interface_casr,将这个binder转化成BpMediaPlayer，binder中handle标识的一定是目的端MediaPlayerService。
*/
sMediaPlayerService=interface_cast<IMediaPlayerService>(binder);
}
return sMediaPlayerService;
}
```

有了BpMediaPlayerService，就能够使用任何IMediaPlayerService提供的业务逻辑函数了。

调用这些函数都能够把请求数据打包发送给Binder驱动，并由BpBinder的handle值找到对应端的处理者来处理，这中间的过程如下所示：

1. 通信层接收到请求。
2. 提交给业务层处理

### MediaPlayerService细节

在上文中我们可以看到，MediaPlayerService驻留在MediaPlayer进程中，这个进程有两个线程在talkWithDriver,假设其中有一个线程收到了请求消息，它最终通过executeCommand调用来处理这个请求，实现代码如下所示：

```cpp
status_t IPCThreadState::executeCommand(int32_t cmd)
{
BBinder *obj;
RefBase::weakref_type*refs;
status_t result = NO_ERROR;
switch(cmd) {
case BR_ERROR:
result = mIn.readInt32();
break;
......
case BR_TRANSACTION:
{
binder_transaction_data tr;
result = mIn.read(&tr, sizeof(tr));
if(result != NO_ERROR)break;
Parcel buffer;
Parcel reply;
if(tr.target.ptr) {
/*
看到BBinder想起图6-3了吗？BnServiceXXX从BBinder派生，这里的b实际就是实现BnServiceXXX的那个对象，这样就直接定位到了业务层的对象。
*/
sp<BBinder> b ((BBinder*)tr.cookie);
const status_T error = b -> transact(tr.code,buffer,&reply,0);
if (error < NO_ERROR)reply.setError(error);
} else{
/*
the_context_object是IPCThreadState.cpp中定义的一个全局变量。可通过setTheContextObject函数设置。
*/
const status_t error = the_context_object->transact(tr.code,buffer,&reply,0);
if (error < NO_ERROR) reply.setError(error);
}
break;
......
```

BBinder与业务层的关系我们可以通过这张图来梳理一下：

![BBinder_MediaPlayerService.PNG](https://i.loli.net/2019/09/06/h2D7ucwqQFpXHti.png)

BnMediaPlayerService实现了onTransact函数，它将根据消息码调用对应的业务逻辑函数，这些业务逻辑函数由MediaPlayerService来实现，这些过程写在了Binder.cpp和IMediaPlayerService.cpp中，如下所示：

```cpp
status_t BBinder::transact(
uint32_t code,const Parcel & data,Parcel*reply,uint32_t flags)
{
data.setDataPosition(0);
status_t err = NO_ERROR;
switch(code) {
case PING_TRANSACTION:
break;
default:
//调用子类的onTransact,这是一个虚函数
err = onTransact(code, data, reply, flags);
break;
}
if(reply != NULL) {
reply->setDataPosision(0);
}
return err;
}
```

```cpp
status_t BnMediaPlayerService::onTransact(uint32_t code,const Parcel & data,Parcel *reply,uint32_t flags)
{
switch(code) {
......
case CREATE_MEDIA_RECORDED:{
CHECK_INTERFACE(IMediaPlayerService,data,reply);
//从请求数据中解析对应的参数
pid_t pid = data.readInt32();
//子类要实现createMediaRecorder函数
sp<IMediaRecorder> recorder = createMediaRecorder(pid);
reply -> writeStrongBinder(recorder->asBinder());
return NO_ERROR;
}break;
case CREATE_METADATA_RETRIEVER:{
CHECK_INTERFACE(IMediaPlayerService,data,reply);
pid_t pid = data.readInt32();
//子类要实现createMetadataRetriever函数
sp<IMediaMetadataRetriever> retriever = createMetadataRetriever(pid);
reply -> writeStrongBinder(retriever->asBinder());
return NO_ERROR;
}break;
default:
return BBinder::onTransact(code,data,reply,flags);
}
}
```

## Binder的实现


Binder的驱动代码在kernel/drivers/staing/android/binder.c中，另外该目录下还有一个binder.h头文件。/proc/binder目录下的内容可用来查看Binder设备的运行状态。

### Binder和线程的关系

以MS（MediaPlayerService）为例，如果现在程序运行正常，那么MS在进行两个动作：

1. 通过startThreadPool启动一个线程，这个线程在talkWithDriver.

2. 主线程通过joinThreadPool也在talkWithDriver.

如果在业务逻辑上需要与ServiceManager交互，比如说要调用listServices打印所有服务的名字，假设这是MS中的第三个线程，按照之前的分析，它最终会调用IPCThreadState的transact函数，这个函数会talkWithDriver并把请求发到ServiceManager进程，然后等待来自Binder设备的回复。现在有三个进程在talkWithDriver。

ServiceManager处理完了listServices，把回复结果写回Binder驱动，调用listServices的那个线程就会得到这个结果，一一对应。

### Binder消息通知

在Binder系统中，如果对应的BnXXX被终止了，那么我们可以通过一些方式收到这个通知

注册对应的监听需要做以下两件事：

1. 从IBinder::DeathRecipient派生一个类，并实现其中的通知函数binderDied。这个函数会在BnXXX被终止时调用。

2. 把这个类注册到系统中，告诉它你关系哪一个BnXXX的生死

这个消息是这么被收到的呢？其实也在executeCommand中，通过Proxy（对应着已经死亡的BBinder）发送消息

如果注册监听的进程率先被终止了，那么可以通过调用unlinkToDeath取消对对应的BnXXX死亡的监听

### 匿名Service

匿名Service就是没有注册的Service，包含了以下两个意思：

1. 没有注册Service意味着这个Service没有在ServiceManager上注册
2. 它是一个Service又表示它确实是一个基于Binder通信的C/S结构

可以通过下面这个例子来了解：

```cpp
status_t BnMediaPlayerService::onTransact(uint32_t code, const Parcel & data,Parcel *reply,uint32_t flags)
{
switch(code) {
case CREATE_URL: {
CHECK_INTERFACE(IMediaPlayerService,data,reply);
...
//player是一个IMediaPlayer类型的对象。
sp<IMediaPlayer> player = create(pid,client,url,numHeaders>0?&headers:NULL);
//下面这句话也很重要
reply->writeStrongBinder（player->asBinder());
return NO_ERROR;
} break;
```

当MediaPlayerClient调用create函数时，MediaPlayerService会返回一个IMediaPlayer对象，此后，MediaPlayerClient即可直接使用这个IMediaPlayer来进行跨进程的函数调用了。

BpMediaPlayer实际上是通过这个方法来得到BnMediaPlayer的handle的值的。

```cpp
reply->writeStrongBinder（player->asBinder());
```

当这个reply写到Binder驱动中时，驱动可能会特殊处理这种IBinder类型的数据，例如为这个BBinder建立一个独一无二的handle，这其实相当于在Binder驱动中注册了一项服务。

通过这种方式，MS输出了大量的Service，例如IMediaPlayer和IMediaRecorder等。

### Service的实现实例（Native层）

纯Native的Service表示代码都在Native层。Native层有有很多Service，前面的MediaPlayerService就是一个例子。

如果我们要新建实现一个Service，也完全可以模仿MS，代码示例如下：

```cpp
int main() 
{
sp<ProcessState> proc(ProcessState::self());
sp<IServiceManager> sm = defaultServiceManager();
//记住注册你的服务，否则谁也找不到你
sm->addService("service.name",new Test());
//如果压力不大，可以不用单独搞一个线程
ProcessState::self()->startThreadPool();
//这个是必须的，否则主线程退出了，你也完了
IPCThreadState::self()->joinThread();
}
```

Test是这么定义的呢？我们是跨进程的C/S,所以本地需要一个BnTest，对端需要提供一个代理BpTest。为了不暴露Bp的身份，Bp的定义和实现都放在BnTest.cpp中了。

ITest接口表明了它所能提供的服务，例如getTest和setTest等，这个与业务逻辑相关，代码如下所示：

```cpp
//需要从IInterface派生
class ITest:public IInterface。
{
public:
//神奇的宏 DECLEAR_MATA_INTERFACE。
DECLEAR_META_INTERFACE(Test);
virtual void getTest() = 0;
virtual void setTest() = 0;
}//ITest是一个接口类
```

为了把ITest融入到Binder系统，需要定义BnTest和对客户端透明的BpTest。BnTest定义既可以与上面的Test定义放在一块，也可以分开，如下所示：

```cpp
class BnTest:public BnInterface<ITest>
{
public:
//由于ITest是个纯虚类，而BnTest只实现了onTransact函数，所以BnTest依然是一个纯虚类
virtual status_t onTransact(uint32_T code, const Parcel & data,Parcel *reply, uint32_t flags = 0);
};
```

另外，我们还要使用IMPLEMENT宏。参考BnMediaPlayerService的方法，把BnTest和BpTest的实现都放在ITest.cpp中，如下所示：

```cpp
IMPLEMENT_META_INTERFACE(Test,"android.Test.ITest");//IMPLEMENT宏
status_t BnTest::onTransact(
uint32_t code, const Parcel & data,Parcel *reply,uint32_t flags)
{
switch(code) {
case GET_Test:{
CHECK_INTERFACE(ITest,data,reply);
getTest();//子承父业，由Test完成
return NO_ERROR;
}break;//SET_XXX类似
```

BpTest示例如下：

```cpp
class BpTest:public BpInterface<ITest>
{
public:
BpXXX(const sp<IBinder> & impl)
:BpInterface<ITest>(Impl)
{
}
vitural getTest()
{
Parcel data,reply;
data.writeInterfaceToken(ITest::getInterfaceDescriptor());
data.writeInt32(pid);
//打包请求数据，然后交给BpBinder通信层处理。
remote()->transact(GET_Test,data, &reply);
return;
?
//setTest类似
......
```

这样C/S的框架就写好了。

### Service的实现实例（Java层）

在Java层中，如果想要利用Binder进行跨进程的通信，也得定义一个类似ITest的接口，不过，这是一个aidl文件，假设服务端程序都在com.test.service包中。

ITest.aidl文件内容如下：

```aidl
package com.test.service;
import com.test.complicatedDataStructure;
interface ITest{
//complicatedDataStructure类是自己定义的复杂数据结构，in表示输入参数，out表示输出参数。
//in和out的表示一定要准备却。切记！
int getTest(out complicateddataStructure c);
int setTest(in String name, in boolean reStartServer);
}
```

编译之后，会在gen目录下生成一个com.test.ITest.java文件，它实现了类似BnTest的一个东西，具体的业务实现还需要从ITest.Stub派生，实现代码如下所示：

```java
/* 
ITest.Stub是在aidl生成的那个Java文件中定义的，非常类似Native层的BnTest。
ITestImpl必须从ITest.Stub中派生，用来实现具体的业务函数。
package com.test.service;
class ITestImpl extends ITest.Stub{
public void getTest(complicatedData Structure cds) throws RemoteException {
//在这里实现具体的getTest
}
public void setTest(in String name, in boolean reStartServer) throws RemoteException {
//在这里实现具体的setTest
}
}
```

此时根目录下有这两个目录：

* src下有一个com.test.service包结构目录

* gen下也有一个com.test.service包结构目录


实现代理端：代理端往往在另一个程序中使用，假设是com.test.client包，把刚才com.test.service工程中gen下的com.test.service目录全部复制到com.test.client中，这样，client工程也就有两个包结构目录了：

* com.test.client

* com.test.service。不过这个目录中仅有aidl生成的Java文件

服务端一般驻留于Service进程，所以可以在Client端的onServiceConnected函数中获得代理对象，实现代码如下所示：

```
//不一定是在onServiceConnected中，但它是比较合适的。
private ServiceConnection serviceConnection = new ServiceConnection() {
@override
public void onServiceConnected(ConponentName name, IBinder service) {
if (ITestProxy == null) {
ITestProxy = ITest.Stub.asInterface(service);
}
}
}
```

AIDL支持简单数据结构与Java中String类型的数据进行跨进程传递，如果想做到跨进程传递复杂的数据结构，还须另做一些工作。

以ITest.aidl文件中使用的complicatedDataStructure为例：

* 它必须实现implementsParcelable接口

* 内部必须有一个静态的CREATOR类

* 定义一个complicatedDataStructure文件。

在实现了Java文件后，我们还需要实现aidl类，如下：

```aidl
package com.test.service;
parcelable complicatedDataStructure;
```

然后在使用它的aidl文件中添加这行代码即可：

```aidl
import com.test.complicatedDataStrucrure;
```

> Android提供AIDL语言以及AIDL解释器自动生成一个服务器的Bn端，即Bp端用于处理Binder通信的代码，当我们写好ITest.aidl文件之后，我们使用aidl工具将其解析为一个实现了Bn端及Bp端通过Binder进行通信的Java代码，当完成aidl解析之后，开发者需要继承XXX.Stub类并实现其抽象方法。

# Java Binder整体架构

Java层的Binder其实也是一个C/S架构，而且在类的命名上尽量保持与Native层一致，因此也可认为，Java层的Binder架构是Native层Binder架构的一个镜像。Java Binder中的成员如下图所示：

![JavaBinder.PNG](https://i.loli.net/2019/09/14/w8AjvftVremi5BT.png)

其中：

* Binder和BinderProxy类分别实现了IBinder接口。其中Binder类作为服务端的Bn的代表，而BinderProxy作为客户端的Bp的代表（由linkToDeath（）函数也可见一斑，native层中Bp正是由这个函数来实现消息通知）

* BinderInternal类是一个仅供Binder框架使用的类。它内部有一个GcWatcher类，该类专门用于处理和Binder相关的垃圾回收

> IBinder接口类中定义了一个叫FLAG_ONEWAY的整型变量，在调用Binder函数时，在指明了FLAG_ONEWAY标志后，函数就变成了非阻塞式调用（类似于回调）

Java层Binder需要借助Native层Binder系统来开展工作，即镜像和Native有着千丝万缕的关系，一定要在Java层Binder正式工作之前建立这种关系，Java层Binder框架的初始化顺序如下：

Java初创初期，系统会提前注册一些JNI函数，其中有一个register_android_os_Binder函数来专门搭建Java Binder和Native交互关系，在register_android_os_Binder函数中，完成了JavaBinder架构中最重要的三个类的初始化工作，顺序如下：

1. Binder类的初始化：使用gBinderOffsets对象保存了和Binder类相关的某些在JNI层使用的信息，用来在JNI层对Java层的Binder对象进行操作

2. BinderInternal类的初始化：获取一些有用的methodID和fieldID，表明JNI层一定会向上调用Java层的函数，以及注册相关类中native函数的实现。

3. BinderProxy类的初始化：获取WeakReference类和ERROR类的一些信息，BinderProxy对象的生命周期会委托WeakReference来管理，所以JNI层会获取该类get函数的MethodID

> 框架的初始化其实就是提前获取一些JNI层的使用信息，如类成员的MethodID、类成员变量的fieldID等。它能节省每次使用时获取这些信息的时间。当Binder调用频繁时，这些时间的积累也不容小觑。同时，这个过程中所创建的几个全局静态对象为JNI层访问Java层的对象提供了依据。每个初始化函数中所执行的registerNativeMethods（）方法则为Java层访问JNI层打通了道路。换句话说，Binder初始化的工作就是通过JNI建立起Native Binder与Java Binder之间互相通信的桥梁。

## ActivityManagerService

与native中MediaServer的例子一样，这里我们也使用一个具体的例子来解释Java层Binder的工作原理

### AMS如何将自己注册到ServiceManager

AMS通过addService函数将一个叫做JavaBBinder的对象添加到Parcel中，而最终传递到Binder驱动的正是这个JavaBBinder对象。Java层中所有的Binder对应的都是这个JavaBBinder对象，不同的Binder对象对应不同的JavaBBinder对象。

> JavaBBinder是从BBinder（native）派生的

### ActivityManagerService相应请求

JavaBBinder仅仅是一个传声筒，它本身不实现任何业务函数，其工作是：

1. 当它收到请求时，只是简单地调用它所绑定的Java层的Binder对象的exeTransact

2. 该Binder对象的exeTransact调用其子类实现的onTransact函数

3. 子类的onTransact函数将业务又派给其子类来完成

通过这种方式，来自客户端的请求就能传递到正确的Java Binder对象了，下图展示了AMS相应请求的整个流程。

![AMS响应过程.PNG](https://i.loli.net/2019/09/15/ng2K67ZuPajXBOd.png)


# 总结

在本章的学习中，我们学习了native中的Binder和Java中的Binder，总结分别如下：

## native层Binder

1. Binder体系的总体架构，Client、Server和ServiceManager三者之间的关系（包括交互的先后关系）、

2. MediaPlayerService注册服务解析，通过handle=0找到ServiceManager注册，最后MediaPlayerService有两个线程处理请求

3. ServiceManager解析，ServiceManager成为manager需要将自己的handle置为0，它的作用是对需要注册的服务进行管理，包括权限控制等，同时帮助Client找到对应的Server

4. Client通过字符串（Service的名称）来得到对应的服务，这里以MediaPlayerService为例，展示了Client与MediaPlayerService交互的细节，哪个线程发起请求，答复就会送回到哪个请求

5. Binder对于匿名Service的管理，匿名Service可以通过在Binder驱动中的操作来注册自己（其实就是给自己一个独一无二的handle），以及对死亡进程的监听，native层与Java层Service的实现

## native层Binder

Java层的Binder可以用一张图来总结，因为Java层的Binder十分依赖native层的Binder。

![Java层Binder架构.PNG](https://i.loli.net/2019/09/15/VbfDFe5L8pTMUro.png)







