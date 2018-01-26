---
title: 单例模式的使用
date: 2018-1-6 12:02:04
categories: 设计模式
---

> 单例模式适用于重新构造消耗大，又时常需要用到的类，一般又懒汉模式、饿汉模式、DCL模式和静态内部类模式这几种

#### 懒汉模式

```
public class Example  {
    private static Example example;
    private Example(){
    }

    public static synchronized Example getInstance() {
        if (example == null) {
            example = new Example();
        }
        return example;
    }
}
```

##### 懒汉模式在每次获得单例的时候都使用synchronized（加内部锁方式的同步）关键字进行同步，消耗较大

#### 饿汉模式
```
public class Example  {
    private static final Example example = new Example();
    private Example(){
    }
    public static Example getInstance() {
        return example;
    }
}
```

##### 饿汉模式没有同步的问题，每次获取到的都是同一单例，但不管有没有用到都会创建对象，浪费空间

#### DCL模式

```
public class Example  {
   private static volatile Example example = null;
   private Example(){
   }

    public static Example getInstance() {
        if (example == null) {
            synchronized (Example.class) {
                if (example == null) {
                    example = new Example();
                }
            }
        }
        return example;
    }
}
```

##### DCL方法有上面两种单例方法的优点，既保证了使用时才进行初始化，又保证了线程安全，但在某些情况下会有小概率出错，尽管如此，这仍然是用得最广泛的单例方法

#### 静态内部类模式

```
public class Example  {

   private Example(){
   }

   public static Example getInstance() {
       return ExampleHolder.example;
   }

   private static class ExampleHolder {
       private static final Example example = new Example();
   }
}
```

##### 既保证了线程安全，也达到了节省资源的目的，是推荐使用的单例模式

#### 枚举模式

```
public enum Example {
    INSTANCE;
    public void doSomething(){
        ...
    }
}
```

##### 枚举模式是实现单例最简单的模式，因为枚举本身就具有线程安全性，所以我们无需担心线程安全的问题，而且枚举安全也避免了序列化时重新生成对象的问题（当然，这个问题我们一般碰不到）

#### 总结，单例模式分成了上面几种，一般推荐使用静态内部类实现单例，DCL模式虽然是应用最为广泛的模式，但因为java的内存模型还存在着小概率的问题，而Google官方不推荐使用枚举模式

