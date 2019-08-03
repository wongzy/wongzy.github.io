---
title: Android依赖的多种关键字用法
date: 2019-07-28 14:26:26
categories: Android
---

## 引入依赖

Android是基于gradle进行构建的，我们也通过gradle来引入依赖项，当我们使用Android studio为我们自动得导入依赖时，我们可能会看到在本module的build.gradle中出现了这样的代码

```groovy
implementation 'com.squareup.okhttp:okhttp:+'
```

这样，Android studio会自动使用最新的okhttp库，但是这样做是十分危险的，因为可能某些API更新之后会导致App无法运行。
同理，下面这样使用会使用在某大版本前提下的最新版本库。

```groovy
implementation 'com.squareup.okhttp:okhttp:2.+'
```

> Android Studio查看依赖的快捷键为Shift+Ctrl+Alt+s

## Android Gradle Plugin 3.0.0与之前gradle配置比较

在Android Gradle Plugin 3.0.0之前，gradle引入依赖的关键字为*compile*，但是在3.0之后，关键字就变得多样化了。具体的对比如下：

新配置 |已弃用配置 |行为
---| --- | ---
implementation |	compile	 | Gradle 会将依赖项添加到编译类路径，并将依赖项打包到构建输出。但是，当您的模块配置 implementation 依赖项时，会告知 Gradle 您不想模块在编译时将依赖项泄露给其他模块。也就是说，依赖项只能在运行时供其他模块使用。使用此依赖项配置而不是 api 或 compile（已弃用），可以显著缩短构建时间，因为它可以减少构建系统需要重新编译的模块数量。例如，如果 implementation 依赖项更改了其 API，Gradle 只会重新编译该依赖项和直接依赖它的模块。大多数应用和测试模块都应使用此配置。|
api	| compile| Gradle 会将依赖项添加到编译类路径，并构建输出。当模块包括 api 依赖项时，会告知 Gradle 模块想将该依赖项间接导出至其他模块，以使这些模块在运行时和编译时均可使用该依赖项。此配置的行为类似于 compile （现已弃用），但您应仅对需要间接导出至其他上游消费者的依赖项慎重使用它。 这是因为，如果 api 依赖项更改了其外部 API，Gradle 会重新编译可以在编译时访问该依赖项的所有模块。 因此，拥有大量 api 依赖项会显著增加构建时间。 如果不想向不同的模块公开依赖项的 API，库模块应改用 implementation 依赖项。
compileOnly |	provided |	Gradle 只会将依赖项添加到编译类路径（即不会将其添加到构建输出）。如果是创建 Android 模块且在编译期间需要使用该依赖项，在运行时可选择呈现该依赖项，则此配置会很有用。如果使用此配置，则您的库模块必须包含运行时条件，以便检查是否提供该依赖项，然后妥善更改其行为，以便模块在未提供依赖项的情况下仍可正常工作。这样做不会添加不重要的瞬时依赖项，有助于缩减最终 APK 的大小。 此配置的行为类似于 provided （现已弃用）。
runtimeOnly | 	apk |	Gradle 只会将依赖项添加到构建输出，供运行时使用。也就是说，不会将其添加到编译类路径。 此配置的行为类似于 apk（现已弃用）。
annotationProcessor	| compile |	要在库中添加注解处理器依赖项，则必须使用 annotationProcessor 配置将其添加到注解处理器类路径。这是因为使用此配置可分离编译类路径与注解处理器类路径，从而提升构建性能。如果 Gradle 在编译类路径上找到注解处理器，则会停用 避免编译功能，这样会增加构建时间（Gradle 5.0 和更高版本会忽略编译类路径上的注解处理器）。如果 JAR 文件包含以下文件，则 Android Gradle Plugin 会假定依赖项是注解处理器：META-INF/services/javax.annotation.processing.Processor。 如果插件检测到编译类路径上包含注解处理器，则会生成构建错误。

我们可以看到，implementation和api的区别主要是是否是传递性依赖。
举个例子，如果我们的Android项目采取了组件化方案，有app与common_library两个module，app模块依赖于common_library模块，在common_library中的依赖是这样的；

```groovy
api 'com.facebook.fresco:fresco:0.12.0'
```

那么app模块也可以使用freso，但是如果用的不是api关键字而是implementation关键字，像这样：

```groovy
implementation 'com.facebook.fresco:fresco:0.12.0'
```

那么app模块将无法使用freso

## 依赖冲突的解决方法

依赖冲突的原因主要是引入了不同版本的相同库，例如引入了两个库，一个库中包含了okhttp3.2。1版本，而另一个库中则包含了okhttp3.2.2版本，那么就会产生冲突，导致编译不过，解决这种冲突的方法有两种：一种是使用相同版本的okhttp库，另一种则是屏蔽传递性依赖，从而达到解决冲突的效果。

### 屏蔽传递性依赖

#### exclude

```groovy
dependencies {
    implementation('some-library') {
        exclude group: 'com.example.imgtools', module: 'native'
    }
}
```

这里我们在映入some-library的同时将*com.example.imgtools：native*这个库剔除掉了，这样进行引入，我们的module就不会传递性地引入*com.example.imgtools：native*这个库了，除了使用exclude来屏蔽传递性依赖，实际上我们还有一个更一了百了的方法，如下：

#### transitive

```groovy
api ('com.facebook.fresco:fresco:0.13.0'){
        transitive = false
    }
```

这样，通过*com.facebook.fresco:fresco*这个库传递的所有依赖都被我们屏蔽了

#### force

通过force关键字可以强制指定某个模块的版本

```groovy
configurations.all {
   resolutionStrategy {
       force 'org.hamcrest:hamcrest-core:1.3'
   }
}
```

> 使用configurations.all可以指定全局设置

