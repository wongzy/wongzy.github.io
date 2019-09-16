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

