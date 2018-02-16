---
title: Android中的生命周期
date: 2018-02-16 10:28:05
categories: Android
---

在Android中的所谓生命周期，实际上就是对模板方法模式的一种使用，Android中常见的使用生命周期的部分有Activity、Fragment和Service。

### Activity

Activity的生命周期函数为依次为：onCreate(),onStart(),onResume(),onPause(),onStop()和onDestroy()，还有一个不在正常周期中的restart()

#### Activity的生命周期函数

> 函数及对应的作用如下图所示

方法 | 调用时机
--- | ---
onCreate() | 在活动第一次被创建的时候调用
onStart() | 在活动由不可见变为可见的时候调用
onResume() | 在活动准备和用户进行交互的时候调用
onPause() | 在系统准备去启动或恢复另一个活动的时候调用
onStop() | 在活动完全不可见的时候调用
onDestroy | 在活动被销毁之前调用
onRestart | 在活动由停止状态变为运行状态之前调用

具体活动状态和函数之前的关系如下：

![518096-2d77a59fd191a49d.png](https://i.loli.net/2018/02/16/5a865fda3bc49.png)

#### Activity的启动模式

Activity启动模式是与Activity生命周期息息相关的，生命周期决定了当启动一个Activity时需要调用的函数，而启动模式也决定了在Activity切换时启动的是哪一个Activity

启动模式分为standard、singleTop、singleTask和singleInstance四种，均在AndroidManifest文件中定义。

> 四种模式的特点如下：

模式 | 特点
--- | ---
standard（标准） | 每次启动Activity都创建该Activity的一个新的实例，即每次都从onCreate()开始
singleTop（栈顶复用）| 在启动Activity时发现该活动已经在栈顶时，直接使用它，否则创建新实例
singleTask（栈内复用| 检查整个栈中是否存在要启动的Activity的实例，存在则直接使用，并把在它之上的元素全都pop出栈，整个栈中都不存在则创建新实例
singleInstance（全局唯一）| Activity会单独占用一个栈,在整个系统中都是单例的，而不仅仅在一个应用中

### Fragment

Fragment中的生命周期函数和Activity中的生命周期函数有很大的重合，额外的有：onAttach(),onCreateView(),onActivityCreated(),onDestroyView()和onDetach()

> 额外的生命周期和调用时机如下

生命周期 | 调用时机
--- | ---
onAttach() | 当碎片和活动建立关联的时候调用
onCreateView() | 为碎片创建视图（加载布局）时调用
onActivityCreated() | 确保与碎片相关联的活动一定已经创建完毕的时候调用
onDestroyView() | 当与碎片关联的视图被移除的时候调用
onDetach() | 当碎片和活动接触关联的时候调用

Fragment的生命周期图如下所示：

![1354170699_6619.png](https://i.loli.net/2018/02/16/5a866de466476.png)

与Activity状态的比较

![1354170682_3824.png](https://i.loli.net/2018/02/16/5a866f22e6af8.png)

> Fragment生命周期中与Activity相同名字的函数就是在相关联的Activity调用相同名字函数后再执行的

### Service

Service生命周期函数有：onCreate(),onStartCommand(),onDestroy(),onBind()和onUnBind()

#### Service的生命周期函数

> 方法及作用如下

方法 | 作用
--- | ---
onCreate() | 创建服务
onStartCommand() | 开始服务
onDestroy() | 销毁服务
onBind() | 绑定服务
onUnbind() | 解绑服务

> 注意，这里只是介绍了以下各个方法，顺序并不代表活动生命周期的调用

Service的生命周期与调用什么方法启动的相关，具体如下：

![944365-cf5c1a9d2dddaaca.png](https://i.loli.net/2018/02/16/5a86763c0fc1b.png)

> 使用bindService方法可以与服务进行通信

#### IntentService

IntentService可以简单地创建一个异步的、会自动停止的服务