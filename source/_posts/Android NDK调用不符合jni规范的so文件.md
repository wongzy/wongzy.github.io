---
title: Android NDK调用不符合jni规范的so文件
date: 2018-6-30 15:02:04
categories: Android
---

我们在使用Android静态加载so库的时候，一般都需要这个so库是符合jni命名规范的，像这样：

> Java_全类名_方法名

但是可能会遇到一些比较特殊的情况，同事只给了你一个so库，这个so库并不是用的jni命名，除此之外，他还给了你一个so库中函数的头文件，这时候我们就需要自己再次包装这个so库了。

#### 建立java文件

这里建立的java文件命名可以是自定义的，而不需要遵守某种规范，所在包名也没有讲究，因为这些都是我们需要自己包装的，所以可以随意些。

但是，需要注意的是，虽然说函数名字可以随意，但是我们一定得先想好函数的返回值，例如要头文件中函数返回的类型可能是int，但是我们希望在java中收到的是不是int，而是经过“二次加工”的其他值，这时候就应该把返回值设为其他类型，例如，在头文件中参数类型是char*， 如果我们使用java直接封装的话，返回值应该为char[],若我们还要二次封装，如要判断头文件中函数返回的char *是不是我们想要的字符，把判断结果返回，则可以自己任意定义返回值。

我们刚开始最需要关心的是头文件中定义的返回值并不是jni中已存在的类型，但是如果我们需要返回给java，则需要返回的是jni中定义的类型，这些类型有些是可以通过强制转换得到的，另一些则稍微麻烦，需要通过env提供的函数来进行转换。

具体可以参考下面的链接：

[Jni中本地类型和java类型对应表](https://blog.csdn.net/Chuekup/article/details/8030038)

当然这之中也有可能会有特殊的情况，例如，若在cpp中返回的数据类型为void *，我们应该使用jlong返回给java。具体例子如下：

我在 *com.example.jnitest.jnicontact* 文件夹下建立了.java文件，具体代码如下：

```
package com.example.jnitest.jnicontact;
public class JniDefine {
    public native int p2ptest(String localId);
    public native long getp2psession(String remoteId);
}

```

#### 根据编写的.java文件生成.h头文件

因为我们需要使用命令行来生成，我们需要把打开终端，进入到com.example.jnitest的上层目录，在Android studio中目录名一般为java。

> 使用Android studio的话别忘了把目录切换为Project

进入到上层目录后执行以下语句

```
javah -jni com.example.jnitest.jnicontact.JniDefine
```

这里的格式很简单，*javah -jni 全类名* 即可。

之后我们会在执行javah命令的目录下找到头文件,比如我这里生成的头文件名就是 *com_example_jnitest_jnicontact_JniDefine.h*，这个文件名是可以修改的，比如我这里就修改成了*jni_typ2p.h*，在下文可以看到。

#### 编写cpp文件，关联so库

上一步我们已经得到了一个头文件，这时我们就需要关联so库，以及so库提供的头文件，还有刚刚我们得到的头文件了。

首先，我们得在main目录下新建名为cpp的目录，并将so库，so库头文件，刚刚编译得到的头文件全都放入，我的目录是这样的

![fadf.png](https://i.loli.net/2018/06/30/5b3728da0f680.png)

> 注意：我在cpp文件夹下新建了一个文件夹（文件夹命名与后面写的cpp文件名一致），这个文件夹又包含了两个自文件夹，include包含的是so库的头文件，lib里放的是so库，jni_typ2p.h是刚刚编译出来的头文件，Android.mk和jni_typ2p.cpp这两个文件则是我们需要新建的文件。

1. 编写cpp文件

添加cpp文件位置与图中位置一致即可，添加完后在cpp文件首行加上包含头文件的名字，如例子中就是：

```
#include "jni_typ2p.h"
extern "C"
{
#include "typ2p/include/typ2p.h"
}
```

这两个头文件都是我们必须在cpp文件中包含进去的，我这里添加so库的头文件使用了

```
extern "C"
{
    
}
```

是因为提供的so库是使用c语言写的，在此处可以和提供so库的同事确认下，如果是用cpp写的，则不需要这样写，直接包含即可。

昨晚这一步因为代码还没有与so库关联，所以我们看到的代码是没有代码提示的，所以我们在这里先不对编译出的头文件中的函数进行实现，而是先编写Android.mk文件

2. 根据所在文件目录，编写Android.mk文件

```
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
cmd-strip:=
LOCAL_MODULE    := typ2p 
LOCAL_SRC_FILES := typ2p/lib/libtyp2p.so
LOCAL_CFLAGS := -g -gdwarf-2
LOCAL_CPPFLAGS := -g -gdwarf-2
LOCAL_LDFLAGS := -Wl,--build-id
LOCAL_LDLIBS += -landroid #动态链接库
LOCAL_LDLIBS += -L$(SYSROOT)/usr/lib
LOCAL_EXPORT_C_INCLUDES:=$(LOCAL_PATH)/typ2p/include #so库头文件所在文件夹
include $(PREBUILT_SHARED_LIBRARY) #预构建库

include $(CLEAR_VARS)
cmd-strip:=
LOCAL_MODULE:=jni_typ2p #生成的库文件名，与文件夹名一致
LOCAL_SRC_FILES:=jni_typ2p.cpp #我们编写的cpp文件
LOCAL_SHARED_LIBRARIES := typ2p 
LOCAL_CFLAGS := -g
LOCAL_LDLIBS := -llog
LOCAL_LDLIBS += -landroid 
LOCAL_LDLIBS += -L$(SYSROOT)/usr/lib
LOCAL_LDFLAGS := -Wl,--build-id
include $(BUILD_SHARED_LIBRARY)
```

这里是本项目中的Android.mk文件，Android.mk文件的具体编写可查看官方文档

[Android.mk官方文档](https://developer.android.com/ndk/guides/android_mk)

编写完Android.mk文件之后，我们就可以把so库关联起来了。

#### 关联so库

关联so库的步骤比较奇怪，我们需要先把目录切换到Android,然后在项目上点击右键Link C++ Project with Gradle,操作图示如下：

![屏幕快照 2018-06-30 下午3.18.22.png](https://i.loli.net/2018/06/30/5b372f661d13a.png)

之后添加刚刚编写的Android.mk文件即可

![屏幕快照 2018-06-30 下午3.18.34.png](https://i.loli.net/2018/06/30/5b372f9ea4d1a.png)

> 当然是选择ndk-build了

做完这步之后，我们就可以在编写的cpp代码中看到提示了。

#### gradle

我们还需要在本模块的gradle中增加一些配置

```
 android {
    compileSdkVersion 27
    defaultConfig {
        applicationId "com.example.jackdow.testv1demo"
        minSdkVersion 15
        targetSdkVersion 27
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters "armeabi-v7a" //so库平台，一定要同事给的so库平台一致
        }
    }
    buildTypes { //这里包含的是调试cpp代码的选项
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            debuggable true
            jniDebuggable true
        }
        debug {
            jniDebuggable true
            debuggable true
            packagingOptions {
                doNotStrip "**/*/*.so"
            }
        }
    }
    externalNativeBuild {
        ndkBuild {
            path 'src/main/cpp/Android.mk' // 此处是刚刚关联so库生成的
        }
    }
}

```

#### 实现cpp的小例子

```
JNIEXPORT jlong JNICALL Java_com_example_jackdow_testv1demo_jni_JniDefine_typ2popen
  (JNIEnv *env, jobject obj, jstring arr) {
    const char * array = env->GetStringUTFChars(arr, JNI_FALSE); //上方的参考链接中有此方法
  jint *sesson = (int *)typ2p_open((char *) array); //typ2p_open函数是so库中的函数
  env->ReleaseStringChars(arr, (jchar *)array);
    if (sesson == NULL) {
        return 0;
    }
    jlong result = (jlong)sesson; //void *与jlong之间可强制互转
  return result;
  }
```

#### 在java代码中加载库

很简单，一行代码即可，注意加载库的.java文件和我们声明jni函数的文件是同一个。

```
static {
        System.loadLibrary("jni_typ2p");
    }
```

这样我们就能像java函数一样调用之前声明的native函数了。
    










