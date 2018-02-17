---
title: Messenger浅析
date: 2018-02-17 09:07:27
categories: Android
---

#### 概述

Android中IPC方式的跨进程通信，我们可以使用AIDL实现Binder的子类，也可以不使用AIDL来实现Binder，当然，这两种方式都略显麻烦，我们也有一种更简单的方法，那就是使用Messenger来实现跨进程通信。

使用Messenger跨进程通信有以下几个特点：

* 基于我们熟悉的Message
* 支持回调，服务端处理完长任务可以和服务端交互
* 不需要编写AIDL文件
* 可以实现一对多通信

其实Messenger就是一个结果包装的Binder，他们之间交互的方式如下所示：

![295205-38731edd1d756b09.png](https://i.loli.net/2018/02/17/5a87bcdc8c52a.png)

> 图片来源于[链接](https://www.jianshu.com/p/af8991c83fcb)

既然是通过AIDL实现的包装Binder，其实Messenger实现的方法也就跟AIDL实现Binder一样了

1. 在服务端实现AIDL，接收一个Binder
2. 在客户端中也通过AIDL实现一个Binder，通过ServiceConnection获取到服务端的Binder，调用接收Binder的方法，传入客户端生成的Binder
3. 客户端与服务端通信，只需调用生成的Binder发送消息