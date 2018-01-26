---
title: 发布Android开源项目到Jcenter库
date: 2017-12-10 12:02:04
categories: Android开源
---
#### 我们在使用Android studio时，导入一个第三方开源库很方便，如果整个库已经被发布到Maven库时，我们只需要在MainActivity所在的build.gradle（注意不是最外层的）中添加依赖即可，像这样
```
implementation 'com.android.support:appcompat-v7:26.1.0'
implementation 'com.android.support.constraint:constraint-layout:1.0.2'
```
> 这里只是举个例子，实际上这两个都是官方的库，在Android studio 3.0中不再默认使用compile而是使用implementation来引入，这里注意一下
#### 如果我们想要把自己做的一个库发布到Maven库上，让其他人也能这么方便地使用的话， 我们应该把库中的文件独立出来成一个Android library，这样在后续打包的时候你就能把整个库独立打包，而不是和项目中其他的一些文件一起打包（比如说与库的实现无关的Activity和它的布局文件，还有一些其他的配置文件），像下面这样
1. ![这里写图片描述](http://img.blog.csdn.net/20171218101159513?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
2. ![这里写图片描述](http://img.blog.csdn.net/20171218101219101?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
3.  ![这里写图片描述](http://img.blog.csdn.net/20171218101314644?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
> 在这里库的名字（红圈圈出来的）需要注意了，这个就是在将来引入库的时候，两个‘：’之间的库名称，像**com.squareup.okhttp:okhttp:2.0.0**，':'后面的okhttp就是库的名字，这关系到将来发布之后时怎么个样子，所以特地拿出来说一下。
####  接下来就是把去完成这个库了，完成之后你会发现在主应用(就是app文件夹中的)，比如说在MainActivity中，是无法使用这个库的，因为我们还少了一步，在主应用的依赖里加入这个库，因为加入的是本地库，所以只需要这么写
```
 compile project(":openingstartanimation")
```
> openingstartanimation是我自己写的库名称，在这里填入你自己的
#### 已经做好这一步的话（其实如果不需要app使用这个库的话上一步可以不做，不过我们总得测试一下自己的库哈哈哈哈），就可以做一些把库发布到Jcenter上了。
#### 再Jcenter上注册账号，地址如下：
> https://bintray.com/signup/oss （这个是开源项目的注册）
##### 我在注册的时候遇到了个小坑，使用国内的qq邮箱注册无法被识别，使用谷歌邮箱注册也老是出错，建议大家直接使用边上的 **sign up with google** 或者直接使用 **sign in with google** ,这样的出错几率比较小。
#### 注册成功之后进入个人中心，点左上角的edit进入个人配置，找到apikey，这个**等等会用到**。之后再回退到上一个页面，先 **add new Repository** 创建自己的maven库，这里的**name一栏填的名字需要注意一下，这在后面也会用到，建议直接填maven**，然后type的类型也是maven，开源协议则一般选择**Apache2.0**，创建完成之后再回到Android studio配置一下文件。
### 第一步，在**最外层的build.gradle**中加入依赖，如下
```
buildscript {
    
    repositories {
        google()
        jcenter()
    }
    dependencies {
    classpath 'com.android.tools.build:gradle:3.0.1'
    classpath 'com.github.dcendents:android-maven-gradle-plugin:1.4.1' //新添加的
    classpath 'com.jfrog.bintray.gradle:gradle-bintray-plugin:1.7.2'   //新添加的
    }
}
```
### 第二步，在**库中的build.gradle** 中填写maven库的配置，下面是我的build.gradle的完整的内容
```
apply plugin: 'com.android.library'
apply plugin: 'com.github.dcendents.android-maven'
apply plugin: 'com.jfrog.bintray'
// This is the library version used when deploying the artifact
version = "1.0.0"

def siteUrl = ''      // 项目的主页
def gitUrl = 'https://github.com/JoshuaRogue/FancyView.git'   // Git仓库的url
group = ""      // Maven Group ID for the artifact，一般填你唯一的包名
install {
    repositories.mavenInstaller {
        // This generates POM.xml with proper parameters
        pom {
            project {
                packaging 'aar'
                // Add your description here
                name 'maven'
                url siteUrl
                // Set your license
                licenses {
                    license {
                        name 'The Apache Software License, Version 2.0'
                        url 'http://www.apache.org/licenses/LICENSE-2.0.txt'
                    }
                }
                developers {
                    developer {
                        id ''     //填写的一些基本信息
                        name ''
                        email ''
                    }
                }
                scm {
                    connection gitUrl
                    developerConnection gitUrl
                    url siteUrl
                }
            }
        }
    }
}
task sourcesJar(type: Jar) {
    from android.sourceSets.main.java.srcDirs
    classifier = 'sources'
}
task javadoc(type: Javadoc) {
    source = android.sourceSets.main.java.srcDirs
}
task javadocJar(type: Jar, dependsOn: javadoc) {
    classifier = 'javadoc'
    from javadoc.destinationDir
}
artifacts {
    archives javadocJar
    archives sourcesJar
}
Properties properties = new Properties()
properties.load(project.rootProject.file('local.properties').newDataInputStream())
bintray {
    user = properties.getProperty("bintray.user")
    key = properties.getProperty("bintray.apikey")
    configurations = ['archives']
    pkg {
        repo = ""    //这是刚刚在创建maven库时的name
        name = ""   //发布到JCenter上的项目名字
        websiteUrl = siteUrl
        vcsUrl = gitUrl
        licenses = ["Apache-2.0"]
        publish = true
    }
}
javadoc { //jav doc采用utf-8编码否则会报“GBK的不可映射字符”错误
    options{
        encoding "UTF-8"
        charSet 'UTF-8'
    }
}
android {
    compileSdkVersion 26



    defaultConfig {
        minSdkVersion 16
        targetSdkVersion 26
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"

    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }

}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])

    implementation 'com.android.support:appcompat-v7:26.1.0'
    testImplementation 'junit:junit:4.12'
    androidTestImplementation 'com.android.support.test:runner:1.0.1'
    androidTestImplementation 'com.android.support.test.espresso:espresso-core:3.0.1'
}

```
#### 还有一步别忘了，在最外层的local.propersitory中加入你的用户名和密码信息，如下:
```
#bintray
bintray.user=your user
bintray.apikey=your apikey
```
最后，在terminal（Android studio 下面直接有，不需要打开cmd）中运行
```
gradlew bintrayUpload
```
#### build成功之后就可以在你的主页中看到这个项目了
##### 以上，如有错误，恳请指出