---
title: Android引入react native
date: 2017-12-17 12:02:04
categories: react native
---
#### 前几天看react native中文文档准备自己跑一下hello world，发现在中文文档里有几处小错误，为了让更多的小伙伴顺利地把react native引入Android项目，把这次烦心的经历分享出来
#### 首先，中文开发文档奉上
> http://reactnative.cn/docs/0.31/getting-started.html
#### 需要注意我们得手动调到最新的文档，写这篇博客时为0.50
问题出现在
```
.setBundleAssetName("index.android.bundle") .setJSMainModuleName("index.android")
```
#### 这里，笔者写时setJSMainModuleName这个方法已经不存在了，react native的迭代很快，我们只能用*setJSMainModulePath()* 这个方法替代，在这里文档中写的参数也并不正确，应该改为
```
.setBundleAssetName("index.bundle")
.setJSMainModulePath("index")
```
然后再在命令行中启用npm start就可以了，运行成功后如下：
![这里写图片描述](http://img.blog.csdn.net/20171119192903404?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)