---
title: Java项目构建：基础单项目
date: 2018-1-2 12:02:04
categories: gradle
---

> 构建一个Java项目其实十分地简单，只需在gradle中进行配置，然后执行就可以了

#### Java插件

要配置一个Java项目，首先我们地安装Java的插件，在gradle.build文件顶部写入以下代码
```
apply plugin: 'java'
```

再执行任务安装插件

![1.PNG](https://i.loli.net/2018/01/11/5a56cbdd03d25.png)

这样Java的插件就安装完毕了

#### Android插件

在Android开发中，我们在gradle.build文件中可以看到这样的代码

```
apply plugin: 'com.android.application'
```

这和刚刚示例的Java插件是同样的用法，不过Android studio在初始化项目的时候已经帮我们默认执行了动作，所以我们需要手动地执行

#### 依赖

##### 外部依赖
Java项目中的外部依赖其实和Android项目当中的外部依赖是一样的，都是添加maven库等操作，如下所示：

```
repositories {
        google()
        jcenter()
    }
```

##### 加入依赖

在Android项目中，这个一般在我们使用第三方库的时候用到很多，当然，即使我们不使用第三方库，Android studio在初始化时也会为我们配置很多默认的依赖项

```
dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'com.android.support:appcompat-v7:26.1.0'
    implementation 'com.android.support.constraint:constraint-layout:1.0.2'
    testImplementation 'junit:junit:4.12'
    androidTestImplementation 'com.android.support.test:runner:1.0.1'
    androidTestImplementation 'com.android.support.test.espresso:espresso-core:3.0.1'
    compile project(":openingstartanimation")
}
```
