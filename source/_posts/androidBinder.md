---
title: Binder浅析
date: 2018-02-16 15:02:47
categories: Android
---

Android中讲到跨进程通信，就不得不说一下Binder了，Binder可以从多种角度来看，比如说：

* Android中的一个类，继承了IBinder接口
* Android中的一种跨进程通信方式
* 虚拟的物理设备，设备驱动是/dev/binder
* ServiceManager连接各种Manager和相应ManagerService的桥梁
* 客户端和服务端通信的媒介

对Binder的深入源码的解剖有很多篇文章，深入源码底层往往容易迷失，这里只是介绍一下Binder是如何进行跨进程通信的

1. 客户端请求服务端处理数据
2. Binder接收客户端所发来的数据，如果客户端和服务端处于不同进程，则调用transact方法，transact是使用了代理模式，具体的方法则是再另一个进程实现，使用transact将数据传递给处于另一个进程的服务端，若服务端在同一进程则不走跨进程的transact过程
3. 服务端处理后再把结果传递给Binder，由Binder再传递给客户端

图示如下：

![Binder 工作机制.png](https://i.loli.net/2018/02/16/5a8689ebc680d.png)