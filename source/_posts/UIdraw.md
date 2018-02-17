---
title: Android编译流程总结
date: 2018-02-17 09:08:10
categories: Android
---

如图，是谷歌官方给出的apk编译流程

![2839011-58310b412bae9a01.png](https://i.loli.net/2018/02/17/5a87c39c3e2a6.png)

主要分为两个流程，编译和打包

#### 编译

编译过程是把工程自身的源代码、资源文件（图片等）和AIDL文件还有依赖库中的Library、aar和jar文件编译为dex文件和编译后的文件

其中编译成.dex文件（虚拟机可执行的）的具体细节如下：

1. 编译器对工程中的Java代码进行编译，生成.class文件
2. .class文件和第三方库文件通过dex工具生成.dex文件

#### 打包

打包的过程分为两步，分别为

1. apkbuilder将第一步生成的.dex文件和编译后的资源文件生成未经签名的apk文件
2. 配合keystore对未签名的apk文件进行签名和对齐

#### 总结

两步的详细过程可由整个图来概括

![2839011-28f3fb0ca3af7d9a.png](https://i.loli.net/2018/02/17/5a87c924abf9c.png)