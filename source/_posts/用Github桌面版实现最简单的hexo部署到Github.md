---
title: 用Github桌面版实现最简单的hexo部署到Github.io
date: 2018-1-2 12:02:04
categories: Git
---

> 今天准备把hexo部署到github.io的时候参考了网上几篇文章，发现写的都十分地费劲，不是老是出错，就是步骤麻烦，特地写一篇来记录一下我的方法，当然，这篇文章是建立在在本地已经写好hexo的情况下的
#### 首先，下载github桌面版

##### 地址如下：
[GitHub桌面版](https://desktop.github.com/)
> 嗯

##### 做完这一步之后，再github上创建项目（这一步大家应该都已经做完了，没做完的话可以参考一下这里

[Github.io](https://pages.github.com/)

#### 第二步，用github桌面版（要登陆）把项目clone下来

![1.png](https://i.loli.net/2017/12/21/5a3bc0d14a9c4.png)

##### clone到一个空目录，之后就把hexo根目录下的文件全都复制黏贴到这个clone下来的目录下就好了，这样做不会有权限的冲突（哈哈哈哈）
#### 再后一步，安装hexo-deployer-git
##### 这一步很简单，在根目录执行如下命令

> npm install hexo-deployer-git --save

##### 然后修改hexo的配置文件（注意是hexo的不是theme的）

```
deploy:
  type: git
  repo: <repository url> //SSH
  branch: [branch] //当前的分支，一般是master
  message: [message] // 可不填
```

##### SSH可以在这里获得，HTTPS和SSH可用右上角切换
![2.png](https://i.loli.net/2017/12/21/5a3bc346436c0.png)

#### 最后一步，在hexo的根目录下执行如下命令

```
$ hexo clean
$ hexo g
$ hexo d
```

##### 成功的话就可以在github的项目setting里面看到自己的博客主页了！如果要自己的域名的话，可以这样做
[参考](https://jingyan.baidu.com/article/36d6ed1f5356f31bcf488314.html)

