---
title: 深入理解Android：Binder
date: 2019-08-27 21:43:25
categories: 深入理解Android系列丛书学习
---


Binder是Android提供给我们的一种跨进程通信方案，Android虽然说是基于Linux内核的，可以使用Linux的管道进行跨进程通信，也可以使用网络的方法（使用Socket）进行跨进程通信，但是这些方式都没有Binder方便和灵活。

从宏观的角度来看，Android可以看作是一个基于Binder通信的C/S架构。Binder在里面起到了一个网络的作用，它将Android系统的各个部分连接在了一起。

## 总体架构

在基于Binder通信的C/S架构体系中，除了C/S架构所包括的Client端和Server端外，Android还有一个全局的ServiceManager端，它的作用是管理系统中的各种服务（Service）。这三者之间的关系如下图所示：

![Client_SM_S.PNG](https://i.loli.net/2019/08/28/e95E8zTGXZrgm4i.png)


> 注意，一个Server进程可以注册多个Service

上图中三者的先后关系是这样的：

1. Server进程要先注册一些Service到ServiceManager中，所以Server是ServiceManager的客户端，两者之间的C/S关系为，Server对应客户端（Client），ServiceManager对应服务端（Server）
2. 如果某个Client进程要使用某个Service，必须先到ServiceManager中获取该Service的相关信息，所以Client是ServiceManager的客户端，两者之间的C/S关系为，Client对应客户端（Client），ServiceManager对应服务端（Server）
3. Client根据得到的Service信息与Service所在的Server建立通信，然后就可以直接与Service交互了，所以Client也是Service的客户端，两者之间的C/S关系为，Client对应客户端（Client），Server对应服务端（Server）

这三者之间交互全部都是基于Binder通信的。

> Binder只是为这种C/S架构提供了一种通信方式，我们也完全可以次啊用其他IPC方式进行通信，实际上，系统中有很多其他的程序就是采用Socket或者Pipe（管道）方法进行进程间通信。ServiceManager并没有使用BpXXX和BnXXX
