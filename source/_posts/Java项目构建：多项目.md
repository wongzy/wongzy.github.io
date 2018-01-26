---
title: Java项目构建：多项目
date: 2017-12-21 12:02:04
categories: gradle
---

#### 多项目构建
 其实构建Java多项目和单项目差不多，唯一需要改变的就是在setting.gradle中加上如下代码
```
include ':app', ':openingstartanimation'
```

其中app是我构建的主项目，而openingstartanimation则是依赖项目

#### 项目之间的依赖关系

例如，在上一个项目中app与openingstartanimation这两个项目，app项目是依赖于openingstartanimation项目的，也就是说，app中需要用到openingstartanimation中的类和函数，我们应该这样

```
ependencies {
    compile project(":openingstartanimation")
}
```

在app项目的build.gradle中加入以上代码，app就依赖于openingstartanimation了