---
title: gradle的执行顺序
date: 2018-1-12 12:02:04
categories: gradle
---

gradle执行顺序是理解gradle的重要一步，我们可以随便举一个多项目的例子

例如

![1.PNG](https://i.loli.net/2018/01/13/5a59bb766be7c.png)


其中Project为FancyView，由两个Module，app和OpingStartAnimation组成，还有配置文件seetings.gradle

#### 执行顺序为：

1. 解析settings.gardle
2. 配置模块
3. 执行project的afterEvaluate回调
4. 执行task
