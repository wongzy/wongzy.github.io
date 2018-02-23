---
title: Android编译时注解
date: 2018-02-23 12:55:49
categories: Android
---

> 这个寒假用空闲时间做了一个基于编译时注解的RxBus，目前还没有做工程化处理，但是基本的功能已经写好，欢迎大家star和fork

[RxEventBus](https://github.com/JoshuaRogue/RxEventBus)

趁着寒假最后一天来写一下开发过程。

## 编译时注解总结

注解分为源码级注解、编译时注解与运行时注解，编译时注解和运行时注解时被经常用到的，但是运行时注解因为使用了反射机制，所以在性能上会有所降低，编译时注解就成了最受追捧的注解方式。

### annotation

既然说是编译时注解，第一步当然是写注解的模块了，步骤如下：

1. 新建java library（右键新建module）
2. 编写注解，可以参考下面的

```
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.CLASS)
public @interface Subscribe {
    /**
     * 订阅事件的线程
     * @return 订阅线程
     */
    ThreadMode threadMode() default ThreadMode.MAIN;
}
```

> 因为我们的注解是用在函数上的，所以Target就是ElementType.METHOD，还有下面几种值可以选择

![XEVS(FO[`F]I67G1ZB}@ZBI.png](https://i.loli.net/2018/02/23/5a8fa806478e1.png)

根据需要注解的元素的类型来选择值。

### 注解处理器

#### 准备

顾名思义，注解处理器就是用来处理注解的，而且是仅用来处理编译时注解的，要实现一个编译处理器，我们也要新建一个Java library来存放注解处理器，具体步骤如下：

1. 新建Java library
2. 在注解助力器的build.gradle中添加第一步所写的注解库，即

```
compile project(':rxeventbusannotation')
```

3. 除了导入注解库外，我们还需要导入auto-service和javapoet这两个库，如下：

```
implementation 'com.squareup:javapoet:1.10.0'
implementation 'com.google.auto.service:auto-service:1.0-rc4'
```

#### 编写注解处理器

在配置好依赖后，接下来就可以正式地来编写注解处理器了。

1. 新建一个processor.java文件，继承AbstractProcessor，如下：

```
public class RxEventBusProcessor extends AbstractProcessor{

}
```

2. 添加注解，标志该注解处理器所处理的注解和版本

```
@SupportedAnnotationTypes("site.gemus.rxeventbusannotation.Subscribe")
@SupportedSourceVersion(SourceVersion.RELEASE_7)
public class RxEventBusProcessor extends AbstractProcessor{

}
```

3. 还有注解auto-service为我们提供的服务，完成后如下：

```
@AutoService(Processor.class)
@SupportedAnnotationTypes("site.gemus.rxeventbusannotation.Subscribe")
@SupportedSourceVersion(SourceVersion.RELEASE_7)
public class RxEventBusProcessor extends AbstractProcessor{

}
```

4. 重写函数

我们一般只重写最主要的几个函数，如init和process，当然process是必须要重写的，而在init中我们可以获得必要的工具

像这样：

```
    private Messager mMessager;

    @Override
    public synchronized void init(ProcessingEnvironment processingEnvironment) {
        super.init(processingEnvironment);
        mMessager = processingEnvironment.getMessager();
    }
```

Messager可以帮助我们打印信息，因为在注解处理器库中，我们无法使用log来进行打印

可以这样使用：

```
mMessager.printMessage(Diagnostic.Kind.WARNING, "Elements is empty!");
```

> 注：不要轻易使用ERROR，会导致编译错误

#### Element

Element可以用来获得我们所注解的元素的信息，可以这样获得相应注解所标注的元素的信息

```
Set<? extends Element> elements = roundEnvironment.getElementsAnnotatedWith(Subscribe.class);
```

Element的子类有TypeElement、PackageElement和VariableElement等，我们在获取信息时可以将它转换成这些子类来获得更详细的信息，但是需要注意，并不是Element能转换到任意一个子类，譬如说我使用的注解是用来标记函数的，就能转换为ExecutableElement，而不能转换为TypeElement、PackageElement等。

##### Element的相关函数

* getEnclosingElement()

getEnclosingElement()这个函数的作用是获取上一个闭包元素，譬如说我的注解是在*site.gemus.app.firstFragment*这个类当中注解函数的，它的上一个闭包元素就是*site.gemus.app.firstFragment*，使用

```
element.getEnclosingElement().toString();
```

获取到的就是*site.gemus.app.firstFragment*这串字符

* asType()

asType()函数的作用是获得元素的类型，而不是变量的名字

#### javapoet的使用

javapoet最终的作用是生成一个.java文件，我们需要先设想好生成后的代码，然后再进行使用，网上关于javapoet的资料有很多，就不一一介绍了，可以参考

[javapoet基本使用](http://blog.csdn.net/crazy1235/article/details/51876192)

特别要注意的是，我们使用javapoet导入包（import）的时候，javapoet只提供了静态导入，如果想正常导入的话，就要有意识地使用 *$T* 来导入包，下面就是后来改正的例子。

```
ClassName eventMethodMessage = ClassName.get("site.gemus.rxeventbusannotation","EventMethodMessage");
ClassName proxyMessageMethod = ClassName.get("site.gemus.rxeventbusannotation","ProxyMessageMethod");
ClassName threadModeName = ClassName.get("site.gemus.rxeventbusannotation","ThreadMode");
MethodSpec.Builder methodSpecBuilder = MethodSpec.methodBuilder("addEventMethodMessage")
                .addStatement("$T import1", eventMethodMessage)
                .addStatement("$T import2", proxyMessageMethod)
                .addStatement("$T import3", threadModeName);
```

这样javapoet才会正常地导入我们自己所写的类。
