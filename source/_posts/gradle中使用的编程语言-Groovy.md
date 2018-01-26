---
title: gradle中使用的编程语言-Groovy
date: 2018-1-13 12:02:04
categories: gradle
---

> 和Java一样，Groovy也是基于JVM虚拟机的一种动态语言，甚至Groovy完全兼容Java，当然，它也有很多Java没有的特性，比如支持闭包和DSL

 关于Groovy字符串、集合、方法的使用这里就不说了，即使是从来都没有接触过Groovy，我们见到的时候也能明白，网上也有大量的资料，这里就不赘述了

#### 闭包

> 闭包是Groovy的一个非常重要的特性，也是DSL的基础
##### 首先，举一个简单的闭包例子

自定义task如下：

```
task helloClosure << {
    //使用自定义闭包
    customEach {
        println it
    }
}

def customEach(closure) {
    for (int i in 1..10){
        closure(i)
    }
}
```

执行gradle helloClosure，我们得到

![1.PNG](https://i.loli.net/2018/01/06/5a504cded173c.png)

> 很容易看出，closure（i）中的i就是我们在helloClosure中的it了

##### 我们也可以使用map向闭包传递参数

```
task helloClosure << {
    eachMap{
        k,v ->
            println "${k} is ${v}"
    }
}

def eachMap(closure) {
    def map =["name":"张三","age":18]
    map.each {
        closure(it.key,it.value)
    }
}
```

结果是这样的

![2.PNG](https://i.loli.net/2018/01/06/5a5054a4add76.png)

##### 闭包委托

> 在软件开发中我们经常用到委托模式，而在Groovy中直接提供了闭包委托，把具体的实现方法放到task中实现

```


task configPerson << {
    person{
        personName = "张三"
        personAge = 20
        dumpPerson()
    }
}

class Person{
    String personName
    int personAge

    def dumpPerson() {
        println "name is ${personName}, age is ${personAge}"
    }
}

def person(closure) {
    Person p = new Person()
    closure.delegate = p
    closure(p)
}
```


![3.PNG](https://i.loli.net/2018/01/06/5a50590d91e65.png)

#### DSL

DSL指的是领域特定语言，在这里就是指的Gradle，是基于Groovy的，Gradle脚本就是按照Gradle DSL定义的
