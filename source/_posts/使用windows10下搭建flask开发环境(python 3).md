---
title: 使用windows10下搭建flask开发环境(python 3)
date: 2017-10-28 12:02:04
categories: Flask
---
> 前几周在windows10下搭建flask环境的时候遇到了几个小问题，拿出来分享一下
#### 首先，安装python3，地址如下：
https://www.python.org/downloads/windows/
##### 安装的时候要注意选中add path选项，让安装程序自动设置好环境变量和路径，这样就免去了我们手动设置的麻烦。
#### 安装好python之后我们就可以来安装flask 了，但是一般建议在虚拟环境中安装flask，但是这里有一点需要注意了，windows10下安装虚拟环境比较麻烦，而且easy_install目前已经过期，实际上我们直接运行
>  pip install virtualenv
#### 就可以了，这时候需要注意，cmd转移到你想要存放的项目目录下再执行这条语句。
#### 安装好虚拟环境，进入之后就可以开启虚拟环境了
> virtualenv env
### 这一步在windows下好像没啥用，不知道为什么，我们需要在句子前面再加上python -m后才生效，像这样
> python -m virtualenv env
####激活虚拟环境后我们就可以再虚拟环境中安装flask了
> pip install flask
#### 到这里就结束了，但是你有没有发现这样做实在是太麻烦了？每次需要运行都要激活虚拟环境后才能运行，cmd用起来也不是很顺手，用windows不就是图个方便嘛！！
### 这时候就该IDE登场了...我用的是pycharm，不过社区版不支持flask，pycharm下载地址如下
https://www.jetbrains.com/pycharm/download/#section=windows
#### 安装激活运行后我们可以看到有个flask的选项
![这里写图片描述](http://img.blog.csdn.net/20171210185809531?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 我们可以看到有个Project Interpreter:New Virtualenv environment的选项，打开可以看到
![这里写图片描述](http://img.blog.csdn.net/20171210185957419?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 没错，只要选择这里我们就能用IDE帮我们自动设置好虚拟环境也，也不需要手动激活了，创建之后可以看到项目默认是运行再虚拟环境之中的
![这里写图片描述](http://img.blog.csdn.net/20171210190143526?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
> 不用在意虚拟环境的名字，这是可以自定义的
##### 如上，如有错误，恳请指出