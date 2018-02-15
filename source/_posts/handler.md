---
title: handler与UI更新
date: 2018-02-15 14:14:18
categories: Android
---

> Android规定更新UI的操作只能在主线程进行，因为UI是在主线程创建的，所以只能在主线程更新，当然，我们也可以使用另一种说法，UI只能在它被创建的线程进行更新。

在这样的情况下，我们只能在子线程进行完耗时操作之后再由主线程进行更新，而Handler正是我们寻找的用于解决这个问题的关键。

#### 组成

Android的异步消息处理主要有四个部分组成，分别为：Message、Handler、MessageQueue和Looper

##### Message

Message是在线程之间传递的消息，它可以携带少量的数据，用于在不同线程之间交换数据

##### Handler

Handler是用于发送消息和处理消息的，发送消息一般是使用Handler的sendMessage（）方法发送到MessageQueue等待取出，而发出的消息经过一系列地辗转后，又会传递到Handler的handleMessage（）方法中，handleMessage方法运行的线程是handler被创建的线程，一般为主线程。

##### MessageQueue

MessageQueue是消息队列的意思，它主要用于存放需要通过Handler发送的消息，等待被Looper取出处理(Looper会回调dispatchMessage()方法将消息发送给Handle)，每个线程只会有一个MessageQueue对象

##### Looper

Looper是每个线程中的MessageQueue的管家，每个线程的MessageQueue只会对应有一个Looper对象，调用Looper的loop()方法后，Looper就会无限循环地检查MessageQueue中是否存在消息，每当发现MessageQueue中存在一条消息，就会将它取出，并使用dispatchMessage()方法传递到Handler的handleMessage()方法中。

#### 示意图

![20130817090611984.png](https://i.loli.net/2018/02/15/5a852c421ceda.png)

> 图片来源于[链接](http://blog.csdn.net/guolin_blog/article/details/9991569)

