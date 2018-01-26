---
title: gradle中的Setting文件与Build文件
date: 2018-1-8 12:02:04
categories: gradle
---

#### Setting文件

Setting文件可以说是子项目（也可以说是Module）的配置文件，大多数setting.gradle的作用是为了配置子工程，再Gradle多工程是通过工程树表示的，如在Android studio中我们指定相应的module能在主工程当中使用，需要这样

```
include ':example'
```

#### Build文件

Build是Project的配置文件，我们可以配置版本，插件，依赖库等等的信息，比较常见的就是Jcenter仓库的配置
```
buildscript {

    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.0.1'
        classpath 'com.github.dcendents:android-maven-gradle-plugin:1.4.1'
        classpath 'com.jfrog.bintray.gradle:gradle-bintray-plugin:1.7.2'
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

