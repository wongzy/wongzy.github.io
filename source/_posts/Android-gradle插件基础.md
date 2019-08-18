---
title: Android gradle插件基础
date: 2019-08-18 14:21:51
categories: Android
---

在项目的build.gradle文件中，我们可以看到默认的插件是这样的。

```groovy
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply plugin: 'kotlin-android-extensions'
```

注意，本项目使用了kotlin，所以多用了两个插件，分别是*kotlin-android*和*kotlin-android-extensions*两个插件，如果我们需要自定义自己的插件，那么需要按照如下步骤创建

# 创建自定义插件

## 创建自定义插件项目

需要创建自定义gradle插件，第一步创建新module，但是需要注意，*我们需要在项目的setting.gradle中将它去掉*。

这里特别注意的是自定义插件项目的module名字是约定好的，必须为**buildSrc**

创建完module后目录如下：

![微信图片_20190818144514.png](https://i.loli.net/2019/08/18/KYch9pf7tiqILRM.png)

## 创建插件类

我这里是用Kotlin进行编写的，代码如下

```kotlin
package com.example.multilingual

import org.gradle.api.Plugin
import org.gradle.api.Project

class AutoMultilingualResourcePlugin : Plugin<Project> {
    
    override fun apply(project: Project) {
        
    }
    
}

```

其中的apply函数就是将插件引入到项目中的逻辑

## 自定义插件名字

我们的项目名是buildSrc无法自定义，但是插件的名字是我们自己定义的，定义的方法如下：

在项目的main目录下创建resources目录，再在resources目录下创建META-INF目录，META-INF目录下再创建gradle-plugins目录，再gradle-plugins目录下我们就能声明我们的自定义插件了，我们需要创建*自定义插件名.properties*

最后的目录结构如下

![微信图片_20190818151247.png](https://i.loli.net/2019/08/18/9RIeVQfOrLChaDl.png)

可以看到，我自定义插件名字为*cn.wongzhenyu.multilingual*，这里要取自己的名字。

再这个文件中，我们还需要指定插件的入口，我这里填的如下：

```
implementation-class=com.example.multilingual.AutoMultilingualResourcePlugin
```

这样，我们就指定了本插件的入口，我们可以在主项目中使用了，像这样

```groovy
apply plugin: 'cn.wongzhenyu.multilingual'
```

# 配置自定义插件

我们可以看到，Android插件需要配置很多东西，想这样

```groovy
android {
    compileSdkVersion 29
    buildToolsVersion "29.0.0"
    defaultConfig {
        applicationId "com.example.automultilingualresourceplugin"
        minSdkVersion 15
        targetSdkVersion 29
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

自定义插件也能够实现这样，在build.gradle中配置参数，然后我们在插件中可以读取到，实现方式如下

## 创建扩展类

```kotlin
package com.example.multilingual

open class MultilingualPluginExtension{
     var output:Boolean = true
}
```

可以看到，我们创建了一个类，只有一个布尔值变量值为true

## 在build.gradle中配置参数

```groovy
multilingual {
    output false
}
```

## 在自定义插件中创建扩展类并读取参数

```kotlin
package com.example.multilingual

import com.example.multilingual.utils.FileUtil
import org.gradle.api.Plugin
import org.gradle.api.Project

class AutoMultilingualResourcePlugin : Plugin<Project> {
    
    private lateinit var extension: MultilingualPluginExtension

    override fun apply(project: Project) {
        extension = project.extensions.create("multilingual", MultilingualPluginExtension::class.java)
        project.afterEvaluate {
            FileUtil.INSTANCE.setIsOutput(extension.output)
        }
    }
    
}
```

这里需要特别注意的是，我们读取在build.gradle中配置的参数必须是在gradle的evaluate声明周期之后，否则读取的参数还是默认的，而不是在build.gradle中配置的



