---
title: Gradle Task
date: 2018-1-16 12:02:04
categories: gradle
---

#### task 的创建方式

##### 快捷方式
我们一般使用最快捷的方式来创建任务，像这样

```
task hello << {
    println 'Hello world!'
}
```


##### 动态方式

我们可以使用groovy动态地创建任务，像这样

```
3.times { counter ->
    task "task$counter" << {
        println "this is task$counter"
    }
}
```

这里会生成task1、task2、task3这三个任务，我们可以运行其中的任何一个

![2.PNG](https://i.loli.net/2018/01/10/5a55fe3ca4357.png)

> 这里之所以不介绍其他的方式，是因为gradle的版本迭代十分迅速，一些方法已经不适用了，所以这里只介绍这一种

##### task的行为周期

gradle中的task有First、本身（这里暂时这么称呼）、Last以及后添加的行为，这里举个例子
```
task hello << {
    println "this is main"
}

hello.doFirst{
    println "this is first"
}

hello.doLast{
    println "this is Last"
}

hello<< {
    println "this is add"
}
```

运行后结果如下：

![4.PNG](https://i.loli.net/2018/01/10/5a560254a627d.png)

从中我们可以得出，task行为的执行次序是：doFirst，task本身，doLast，后来添加的任务

#### task间的依赖

比较奇特的是，task之间也可以存在依赖，如下

```
task one<< {
    println 'one'
}

task two(dependsOn:one) <<{
    println 'two'
}
```

![1.PNG](https://i.loli.net/2018/01/10/5a55fb8ff2139.png)

> task间存在的依赖很像类的构造函数，比如这里two依赖于one，如果我们看成two继承于one的话，就很容易理解了，这样two创建之间必须先实行one的构造函数，这里就是先执行one函数

##### task动态任务与task依赖结合使用

除了上述的一种定义方法之外，我们也可以使用另一种方法来定义依赖
```
task1.dependsOn task2
```

这样执行task1之前就会先执行task2了，我们也可以使用动态生成的方式来看一下

```
3.times { counter ->
    task "task$counter" << {
        println "this is task$counter"
    }
}

task1.dependsOn task0, task2
```

运行结果如下

![3.PNG](https://i.loli.net/2018/01/10/5a55ffd648173.png)

#### 默认任务

> 在使用gradle中我们要执行一个任务，通常是这样
```
grale 任务名
```

但其实我们可以指定一个或多个任务作为默认任务，这样直接用gradle即可，例如
```
defaultTasks 'hello'

task hello << {
    println "this is main"
}
```

结果如下

![5.PNG](https://i.loli.net/2018/01/10/5a56055cd4be9.png)

