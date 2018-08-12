---
title: Lock接口实现解析：到底什么是非重入锁和可重入锁
date: 2018-08-12 13:37:45
categories: Java多线程
---

Java中接口的实现只给了ReentrantLock这一个默认的实现，也就是重入锁，它的概念是在获得锁后可以重复获得该资源的锁，但是这是一个听起来很绕的概念，重复获得该资源的锁是什么意思？如果不能获得，也就是这个锁是不可重入的，又会是怎么样的呢？请看下文

#### 重入锁与不可重入锁的区别

先给出结论：

> 重入锁是可重复获得资源的锁，已经获得锁的线程可以对当前的资源重入加锁而不会引起阻塞；不可重入锁是不可重复获得资源的锁，当已经获得锁的线程对当前资源再次加锁时，会把自己阻塞。

##### 重入锁与不可重入锁区别的本质：AQS(AbstractQueuedSynchronizer)的实现

Lock接口为我们提供了两个获取锁的方法，一个是tryLock()，另一个是Lock()方法，tryLock()方法是不会引起阻塞的，而Lock方法在无法获得锁的情况下，会将自己挂起。首先，我们来看看重入锁中Lock方法的实现。

```
final void lock() {
            acquire(1);
        }
```

在这里可以看到，他调用了acquire方法，这个方法的实现如下：

```
public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }
```

在这里可以看到，它首先进行了!tryAcquire(arg)的操作，然后再进行后续操作，但实际上在&&后面的判断是由AQS来完成的，意思就是将当前的线程包装成一个Node然后加入到同步队列中去。在这里我们只关心tryAcquire方法的实现。

```
protected final boolean tryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {
                if (!hasQueuedPredecessors() &&
                    compareAndSetState(0, acquires)) {
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            else if (current == getExclusiveOwnerThread()) {
                int nextc = c + acquires;
                if (nextc < 0)
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);
                return true;
            }
            return false;
        }
```

可以看到，在ReentrantLock中tryAcquire的方法如下，先获得当前AQS的state，当state为0时代表现在没有线程获得这个锁，当前线程就可以获得这个锁，并返回true表示锁是可获得的，*但是后面还有一个判断，就是当state不为0，但是是当前的线程获得的锁的话，也是返回true，这里其实就是重入锁实现的关键* 。如果我们自己重写Lock接口，在继承AQS并重写的时候不做这个判断，得到的就是一个不可重入锁。可以这样写：

```
protected final boolean tryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {
                if (!hasQueuedPredecessors() &&
                    compareAndSetState(0, acquires)) {
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            return false;
        }
```

这样就是一个不可重入锁的结构，因为已获得锁的线程再次尝试获得锁的话会返回false，在acquire方法中就会将自己阻塞。

##### 总结

不可重入锁与重入锁的区别实质其实就是在tryAcquire方法中，如果不对是否是当前的线程持有的锁进行判断，而直接返回false的话，它就是一个不可重入锁，反之，如果进行了判断，则是可重入锁。tryAcquire方法中返回true表示当前锁是可获得的，返回false则表示当前锁不可获得。
