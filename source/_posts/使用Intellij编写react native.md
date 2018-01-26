---
title: 使用intellij编写react native
date: 2017-12-30 12:02:04
categories: react native
---

> 今天看到react-native更新到了0.51版本，按照中文文档在原有Android项目引入react native发现运行不出来，莫名奇妙地崩溃，于是决定还是从零开始构建react-native app，网上一般推荐使用sublime来编辑项目，但是总感觉使用地十分不顺手，最后还是决定使用intellij来开发，意外地发现十分好用！

#### 首先，intellij的地址如下：

[intellij地址](https://www.jetbrains.com/idea/)

##### 社区版是免费的，平常开发也够用，如果想用Ultimate版本的建议购买正版，如果是学生的话可以看看破解教程（免费需要国际学生证）

#### 第二步，在intellij下创建空项目

[![1.png](https://i.loli.net/2017/12/22/5a3d0a4d9fb9b.png)](https://i.loli.net/2017/12/22/5a3d0a4d9fb9b.png)

##### 名字什么的就随意了

#### 然后，我们根据官方文档来创建项目

[react native中文文档](https://reactnative.cn/docs/0.51/getting-started.html#content)

##### 因为在terminal中直接创建项目实在是太爽了，这也是我放弃sublime的原因，只要这样就可以（注意先要把terminal切换到上一层目录）

[![2.png](https://i.loli.net/2017/12/22/5a3d0b8858b4a.png)](https://i.loli.net/2017/12/22/5a3d0b8858b4a.png)

> 最后需要注意的一点是，如果使用真机调试可以需要指定端口，这也可以在官方文档中直接找到

##### 最后，其实除了intellij，pythonCharm是直接支持react native的开发的，不过因为在intellij中调试java代码会更加方便，如果想使用原生模块的话还是更推荐使用intellij