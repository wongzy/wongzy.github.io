---
title: synchronized关键字与volatile原理浅析
date: 2018-08-05 16:06:50
categories: Java多线程
---

synchronized关键字与volatile关键字可以说是Java多线程的基础，无论是各种同步锁，还是我们所遇到的线程安全问题，都与这两个关键字有联系。

#### Synchronized

Synchronized关键字我们经常用来执行线程间的互斥操作，使用示例如下：

```
    int x;
    public synchronized void setX(int x) {
        this.x = x;
    }
```

示例十分地简单，如果两个线程访问这个函数，他们是互斥的访问的，Synchronized关键字在这里对函数进行了类似原子操作的包装，在JMM（Java memory model）里面，Synchronized操作是这样的，当线程允许到使用Synchronized关键字修饰的代码时，它会先获取到Synchronized函数所对应的Monitor对象，如果两个线程获取到的需要获取同一个Monitor对象时，他们之间就会互斥。示例如下：

```
    int x;
    int y;
    public synchronized void setX(int x) {
        this.x = x;
    }

    public synchronized void setY(int y) {
        this.y = y;
    }
```

在这个示例中，如果线程A在执行setX函数，而线程B在执行setY函数，他们之间也是互斥地进行的，因为他们所需要获取到的Monitor是同一个。

那有没有办法让两条线程不互斥地进行呢？因为两个函数当中资源并没有抢占的情况，所以，我们可以这样解决:

```
    int x;
    int y;

    private final Object object1 = new Object();
    private final Object object2 = new Object();

    public void setX(int x) {
        synchronized (object1) {
            this.x = x;
        }
    }

    public synchronized void setY(int y) {
        synchronized (object2) {
            this.y = y;
        }
    }
```

这样A线程访问setX与B线程访问setY是不会互斥的，因为他们所需要获得的Monitor不是同一个。

#### Synchronize关键字与工作内存和共享内存

从线程角度来说，内存可分为两种，一种是线程内的工作内存，另一种是线程间的共享内存，当使用Synchronized的时候，它主要做了三件事

1. 在执行之前，到共享内存读取到所需变量
2. 读取变量之后，其他线程无法再对此变量进行操作（其他线程将采取自旋或阻塞的方式等待）
3. 函数结束之后，将该变量的值刷新并解除锁定

##### 锁的四种状态

在Synchronizationd中的锁是隐式锁，在Java对它进行优化之后，它是会进行自动升级的，升级的阶段有四个，分别如下：

* 无锁
* 偏向锁
* 轻量级锁
* 重量级锁

其中偏向锁是Synchronizationd关键字所做的优化，它将获取锁的代价降到了最低，但是只适合单线程使用，当发生竞争时，偏向锁会升级成轻量级锁，这时如果锁已经被持有，则线程就会采取自旋的方式等待（自旋其实就是循环），如果竞争再升级，就会升级成重量级锁，这时如果再要获取锁，就会采取阻塞的方式等待。

#### volatile

volatile关键字所做的事情其实就是在改变volatile所修饰的变量时，它是会强制刷新到共享内存的，我们可以这样理解，volatile的每一步操作都和包裹在synchronized代码块中一样，但是！特别需要注意的是，这里的每一步并不是指的一行代码，而是指的每一步原子操作。
