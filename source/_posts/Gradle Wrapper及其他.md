---
title: gradle Wapper及其他
date: 2018-1-15 12:02:04
categories: gradle
---

> Wrapper是对gradle的一层包装，是为了在开发过程中可以使用同样的gradle版本进行开发
r

#### 生成wrapper

想要为自己的项目引入gradle，我们只需要在Terminal下输入

```
gradle wrapper
```

接着就构建成功了

![1.PNG](https://i.loli.net/2018/01/05/5a4f63b7cd017.png)

可以看到，根目录下多了如下文件

![2.PNG](https://i.loli.net/2018/01/05/5a4f641a5fa58.png)

![3.PNG](https://i.loli.net/2018/01/05/5a4f641a60d21.png)

##### 我们可以指定一些参数来控制gradle的生成，如依赖的版本等等，方法如下：

```
-gradle-version //指定版本
-gradle-distribution-url //指定url地址用于下载gradle发行版
```

查看gradle-wrapper.properties，如下所示

![4.PNG](https://i.loli.net/2018/01/05/5a4f66663b2ef.png)

#### 除了使用gradle命令行生成wrapper以外，还可以通过自定义task的方式来生成wrapper

```
task wrapper(type:Wrapper) {
    gradleVersion = '4.4'
}
```

这时候再运行命令行gradle wrapper,在gradle-wrapper.properties中看到的时这样的


![5.PNG](https://i.loli.net/2018/01/05/5a4f685b63ba5.png)

> 当然我们也可以在自定义task中指定其他参数。

#### 和其他命令行的使用方式一样，gradle wrapper也提供了帮助的选项，我们可以使用

```
gradle wrapper -?
gradle wrapper -h
gradle wrapper --help
```

会得到如下输出

![7.PNG](https://i.loli.net/2018/01/05/5a4f6b0c23d9e.png)

> 注意！在Windows下我们必须使用gradle wrapper这个完整的命令，而在linux下可以使用./gradlew这个简写，很多书中并没有提到，这里特别提一下

##### 除此之外，我们还可以使用gradle wrapper tasks来查看可以执行的task

![6.PNG](https://i.loli.net/2018/01/05/5a4f6c9693d8b.png)

还有强制刷新依赖

```
gradle wrapper --refresh -dependencies assemble
```

对class文件进行清理

```
gradle wrapper clean jar
```

> 注意，如果单词比较长，我们也可以使用驼峰命名法的缩写来进行调用


