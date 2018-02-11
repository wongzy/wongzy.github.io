---
title: synchronized与volatile
date: 2018-02-11 21:35:01
categories: Java
---

### synchronized

#### 作用

synchronized关键字用来执行线程间的互斥操作，从而达到同步的目的

#### 原理

synchronized使用了内部锁来保证了同一代码块同一时间只能被一个线程访问，原理如下所示：

```
public synchronized void method() {
        ...
    }
```

相当于

```
 Lock lock = new ReentrantLock();
    public void method() {
        lock.lock();
        try {
            ...
        }finally {
            lock.unlock();
        }
    }
```

又相当于

```
public void method() {
        synchronized (this) {
            ...
        }
    }
```

每个实例都拥有一个单独的锁，两个实例中的synchronized方法可以同时运行（注：静态方法则只能由一个线程运行）

### volatile

#### 作用

使该修饰符修饰的变量发生变化时，变量的新值对其他线程时立即可见的

#### 特征

1. volatile关键字不保证原子性
2. volatile关键字保证有序性和可见性

#### 使用注意

1. 对变量的写操作不会依赖当前值
2. 该变量没有包含在具有其他变量的不变式中

