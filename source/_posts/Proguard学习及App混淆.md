---
title: Proguard学习及App混淆
date: 2019-07-21 12:48:58
categories: Android
---

## proguard-android.txt与proguard-android-optimize.txt

当我们打Release的时候，Google会默认对我们的release包进行优化，这个优化是通过在modeule中build.gradle中的minifyEnabled来开启的。

```groovy
android {
    buildTypes {
        release {
            minifyEnabled true  //开启代码混淆
            proguardFiles getDefaultProguardFile('proguard-android.txt'),
                    'proguard-rules.pro'
        }
    }
}
```

但是如果我们将minifyEnabled置为false的话，那么在我们打release包的时候将不会对代码进行混淆，实际上这也是一种比较危险的做法，我们的代码经过反编译之后就会被别人清晰地看到。

我们还可以看到下面的这段代码

```groovy
proguardFiles getDefaultProguardFile('proguard-android.txt'),
                    'proguard-rules.pro'
```

其中的*proguard-android.txt*是默认的配置文件，Google已经为我们做好的最基本的配置，同时，如果我们想要进一步的对混淆配置进行优化的话，可以使用另一个配置，*proguard-android-optimize.txt*。

proguard-android-optimize.txt可以说是proguard-android.txt中的扩展版，它不仅仅包含了proguard-android.txt中已有的部分，也多了其他的优化部分，它会对字节码也进行分析优化，进一步缩小APK的体积，提高应用运行速度。

在**能编过**的情况下，，这两个文件已经能够满足我们对混淆的要求，但是如果我们引入了其他的一些库，需要对混淆配置进行改动的话，则需要自定义*proguard-rules.pro*这个文件，实际上，我们也可以自已创建文件，并替换掉*proguard-rules.pro*，只要和*proguard-rules.pro*文件在一个目录下就行。

## proguard-rules.pro与Proguard规则

引入proguard-rules.pro的原因主要是，google为我们配置了默认的混淆规则，但是在项目庞大，系统默认的规则还不够时，需要我们在给他增加一些规则，否则会产生错误，造成编译错误。

当因为混淆规则而发生错误时，我们可以通过gradle的输出文件来查看到底是哪里发生了错误。这个文件就是<module-name>/build/outputs/mapping/release/目录下的usage.txt文件，我们可以通过查看它来确定移除了哪些我们需要用到的代码。

造成我们所需要的代码被移除的原因主要是以下三点。

1. 当应用引用的类只来自 AndroidManifest.xml 文件时
2. 当应用调用的方法来自 Java 原生接口 (JNI) 时
3. 当应用在运行时（例如使用反射或自检）操作代码时

保留代码的规则主要有以下几种：

* 通过指定类的名称保留指定的类文件和类的成员

```proguard
-keep {Modiffier} {class_specification}
```

例子如下

```proguard
-keep public class com.google.vending.licensing.ILicensingService
```

* 通过指定类的成员名称保留指定类的成员

```proguard
-keepclassmembers {modifier} {class_specification}
```

例子如下

```proguard
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}
```

* 通过指定类成员名保留指定的类和类的成员

```proguard
-keepclasseswithmembers {class_specification}
```

例子如下

```proguard
-keepclasseswithmembers class * {
    @android.support.annotation.Keep <methods>;
}
```

* 通过指定类保留指定的类的成员名称

```proguard
-keepnames {class_specification}
```

* 通过指定类成员保护指定的类的成员名称

```proguard
-keepclasseswithmembernames {class_specification}
```

* 通过指定类成员保护指定的类和类的成员名称（这里类成员条件必须完全满足）

```proguard
-keepclasseswithmembernames {class_specification}
```

看过这些规则可能就会晕了，因为记起来十分的繁琐，但实际上，google也为我们提供了另一个方法来保留代码，就是使用注释的方式，我们可以看到在*proguard-android.txt*和*proguard-android-optimize.txt*中都写有这样的规则

```proguard
-keep class android.support.annotation.Keep

-keep @android.support.annotation.Keep class * {*;}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <methods>;
}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <fields>;
}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <init>(...);
}
```

也就是说，遇到我们想保存的类或者类对象的时候，只添加注释即可。

但是，这样用我们需要用到注解支持库，需要在gradle里加上。

```groovy
 dependencies { compile 'com.android.support:support-annotations:24.2.0' } 
```

## 资源压缩

上面讲的都是代码的混淆，但实际上*如果已经实现了代码混淆*，我们也可以对资源进行压缩，只需要再加上一句shrinkResources true即可。

```groovy
buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'),
                    'proguard-rules.pro'
        }
    }
```




