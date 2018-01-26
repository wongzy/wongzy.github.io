---
title: 使用git bash下载Android源码遇到的问题解决方法
date: 2017-1-25 12:02:04
categories: Git
---
#### 这几天准备用SI在windows环境下研究以下源码，看了网上的教程之后因为手头上有梯子，就准备使用git把源码都clone下来，但是在clone的时候出现了如下的问题
![这里写图片描述](http://img.blog.csdn.net/20171106150622519?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
> 即使vpn开了全局代理模式，git还是会无法连接，于是乎就去网上搜了下解决方案，然后就有了如下几个尝试
![这里写图片描述](http://img.blog.csdn.net/20171106150732044?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 还是以失败告终，然后在StackOverflow上看到了如下的一个问题
> https://stackoverflow.com/questions/18356502/github-failed-to-connect-to-github-443-windows-failed-to-connect-to-github
##### 回答中有一个解决方案是这样的，在git bash中输入以下配置语句
git config --global http.proxy 127.0.0.1:8087
#### 但是我们使用这个方案也是失败的
![这里写图片描述](http://img.blog.csdn.net/20171106151213478?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 原因就是这个解决方法是针对国外网络的，而我们需要配置的是vpn所使用的代理服务器端口，比如说我使用的latern，代理服务器端口如下所示：
![这里写图片描述](http://img.blog.csdn.net/20171106151426922?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 我应该配置的方法是这样的
![这里写图片描述](http://img.blog.csdn.net/20171106151510323?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 之后就可以连接上了，附一张连接成功的图
![这里写图片描述](http://img.blog.csdn.net/20171106151556459?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
##### 以上，如有错误，恳请指出