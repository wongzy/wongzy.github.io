---
title: 深入理解Android：Looper、Handler及MessageQueue
date: 2019-09-16 21:00:38
categories: 深入理解Android系列丛书学习
---

# Looper与Handler

就应用程序而言，Android程序的应用程序和其他系统上先相同，都是靠消息驱动来工作的，它们大致的工作原理如下：

1. 有一个消息队列，可以往这个消息队列中投递消息。

2. 有一个消息队列，不断从消息队列中取出消息，然后处理

我们用下图来展示这个工作过程：

![线程和消息处理.PNG](https://i.loli.net/2019/09/16/rV2hZpR1Lv3A9OJ.png)

从图中可以看出：

1. 事件源把待处理的消息加入到消息队列中，一般是加至队列头。事件源提交的消息可以是案件、触摸屏等物理事件产生的消息，也可以是系统或应用程序本身发出的请求消息。

2. 处理线程不断从消息队列头中取出消息并处理，事件源可以把优先级高的消息放到队列头，这样，优先级高的消息就会首先被处理。

在Android系统中，这些工作主要由Looper和Handler实现。

## Looper类

Looper类用于封装消息循环，并且有一个消息队列

Looper类的创建最关键的就是两行代码，Looper.prepare()和Looper.loop()

### Looper.prepare()

这个函数所做的其实就是构造一个Looper对象，然后设置到ThreadLocal中，在Looper的构造函数中构造了一个消息队列（MessageQueue）

### Looper.loop()

这个函数所做的就是取出Looper与相应的消息队列，从消息队列（MessageQueue）中取出消息，并调用该消息的Handler，交给Handler的dispatchMessage函数处理（dispatchMessage定义了一套消息处理的优先级机制，可见下文）。

## Handler类

Handler类有点像辅助类，它封装了消息投递、消息处理等接口。

Handler在构造函数中其实就应用了当前线程的Looper，如果没有Looper没有将会报错，Handler的MessageQueue实际上也是Looper所创建的MessageQueue。Handler对于消息的处理大概分为这三种优先级：

1. Message如果自带了callback处理，则交给callback处理，最常见的就是Handler.post(Runnable r)函数,r就是在callback

2. Handler如果设置了全局的mCallback,则交给mCallback处理,这个mCallback需要返回true表示消息已经被处理

3. 如果上述都没有(1中消息没有自带的callback切2返回false),则交给Handler子类实现的handleMessage来处理,这里要求重写handleMessage函数

## Looper和Handler的结合：HandlerThread

Looper和Handler会有什么同步关系呢？它们之间确实有同步关系，同步关系肯定与多线程有关，这种错误一般发生在Looper在初始化在不同的线程，可能发生Looper为空的情况，所以Android为我们提供了HandlerThread来避免类似的问题。

HandlerThread中使用了一个getLooper函数，当Looper还没被创建时，如果需要调用Looper则需要等待（wait()），创建后则notifyAll()，那么调用Looper的线程就会被唤醒。

# 心系两界的MessageQueue

MessageQueue类封装了与消息队列有关的操作，在一个以消息驱动的系统中，最重要的两部分就是消息队列和消息处理循环。在Android2.3以前，只有Java层有资格向MessageQueue添加消息，但从Android2.3开始，MessageQueue的核心部分下移至Native层，让Native层也能通过消息循环处理任务。

## MessageQueue的创建

在Java中，MessageQueue的构造函数是这样的：

```java
MessageQueue() {
nativeInit();//构造函数调用nativeInit,该函数由Native层实现
}
```

nativeInit()方法真正实现为android_os_message_nativeInit()函数，其代码如下：

```cpp
static void android_os_MessageQueue_nativeInit(JNIEnv * env,jobject obj) {
//NativeMessageQueue是MessageQueue在Native层的代表
NativeMessageQueue * nativeMessageQueue = new NativeMessageQueue();
......
//将这个NativeMessageQueue对象设置到Java层保存
android_os_MessageQueue_setNativeMessageQueue(env,obj,nativeMessageQueue);
}
```

nativeInit函数在Native层创建了一个与MessageQueue对应的NativeMessageQueue对象，其构造函数如下：

```cpp
NativeMessageQueue::NativeMessageQueue() {
/* 代表消息循环的Looper也在Native层中呈现了，根据消息驱动的知识，一个线程会有一个Looper来处理消息队列中的消息。下面一行的调用就是取得保存在线程本地存储空间
(Thread Local Storage)中的Looper对象*/
mLooper = Looper::getForThread();
if (mLooper == NULL) {
/*如果是第一次进来，则该线程没有设置本地存储，需要新创建一个Looper，然后再将其保存到TLS中，这是很常见的一种以线程为单位的单例模式*/
mLooper = new Looper(false);
Looper::setForThread(mLooper);
}
}
```

Native的Looper是Native世界中参会消息循坏的一位重要角色。虽然它的类名和Java层的Looper类一样，但此二者其实并无任何关系。

## 提取消息

当一切准备就绪后，Java层的消息循环处理，也就是Looper会在一个循环中提取并处理消息。消息的提取就是调用MessageQueue的next()方法。当消息队列为空时，next就会阻塞。MessageQueue同时支持Java层和Native层的事件，那么其next()方法该如何实现呢？具体代码如下：

```cpp
final Message next() {
int pendingIdleHandlerCount = -1;
int nextPoollTImeoutMills = 0;
for (;;) {
......
//mPtr保存了NativeMessageQueue的指针，调用nativePoolOnce进行等待
nativePoollOnce(mPtr, nextPollTimeoutMills);
sychronized(this) {
final long now = SystemClock.uptimeMills();
//mMessages用来存储消息，这里从其中取一个消息进行处理
final Message msg = mMessages;
if (msg != null) {
final long when = msg.when;
if (now >= when) {
mBlocked = false;
mMessages = msg.next;
msg.next = null;
msg.markInUse();
return msg;
//返回一个Message用于给Looper进行派发和处理
} else {
nextPoolTimeoutMillis = (int) Math.min(when - now, Integer.MAX_VALUE);
}
} else {
nextPoolTimeoutMillis = -1;
}
......
/*处理注册的IdleHandler，当MessageQueue中没有Message时，Looper会调用IdleHandler做一些工作，例如垃圾回收等*/
......
pendingIdleHandlerCount = 0;
nextPollTimeoutMills = 0;
}
}
}
```

从上面的代码我们可以得到，进行消息处理的流程是从nativePollOnce开始的，那么这个nativePollOnce什么时候才会返回呢？我们可以从投递Message入手


MessageQueue的enqueueMessage函数完成将一个Message投递到MessageQueue的工作，大概是如下过程：

1. 将Message按执行时间排序，并加入消息队列

2. 根据情况调用nativeWake函数，以触发nativePollOnce函数，结束等待

nativeWake函数则会调用native Looper的wake函数，向通道（Pipe）的写端写入一个字符“W”，这样管道的读端就会因为有数据可读而从等待状态中醒来。

当写端被唤醒之后，nativePollOnce就会返回，从而Message就会被处理。

```
在Windows上，线程间通知无外乎就是使用Event，在Linux上，使用POSIX的condition+mutex，也能完成同样的操作，但是这种方式在linux中用得相对较少，而是大量使用pipe，创建两个fd。当线程1想唤醒线程2的时候，就可以往writeFD中写数据，这样线程2阻塞在readFD中就能返回。我之前及其没搞明白为何要使用pipe，后来突然想明白了。因为Linux上阻塞的方法就是用select,poll和epoll，其中等待的都是FD，那么采用FD这种方式，能够统一调用方法。 
```




