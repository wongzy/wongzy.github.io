---
title: gradle的安装和Hello World
date: 2018-1-7 12:02:04
categories: gradle
---

> gradle是Android的自动化构建工具，开发Android有很多地方在跟gradle打交道，而因为gradle所采用的Groovy也是一个很庞大的体系，如果希望学习Groovy来提升Android的技术能力的话可能有些不值，所以最好的方法还是直接学习gradle

#### gradle安装

gradle的下载地址如下：

[gradle官网](gradle.org)

安装官网的步骤一步步来就可以了，官网中提倡使用包管理器进行下载，即使是在windows下，也推荐使用choco来进行下载管理，当然，网上也有很多教程是下载好之后自己配置环境的

#### 安装好之后在intellij下新建一个Goovy项目（注意是Goovy而不是gradle），选择gradle的话会帮我们配置很多东西，最初并不需要它

在新建完项目之后，我们在项目根目录下创建一个build.gradle文件，输入以下代码：

```
task hello{
    doLast{
        println'hello world!'
    }
}
```

> 这里我们定义了一个hello任务，doLast则代表了在Task执行之后的回调

#### 使用gradle运行代码

只需要在Terminal下执行

> gradle -q hello

 其中-q代表了日志级别，hello则是任务名，结果如下：

[![1.PNG](https://i.loli.net/2018/01/04/5a4e11ff32a23.png)](https://i.loli.net/2018/01/04/5a4e11ff32a23.png)
