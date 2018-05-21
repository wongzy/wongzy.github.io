---
title: Java中的同步器（一）：倒计时门闩（countdown latch）
date: 2018-05-21 20:00:31
categories: Java多线程
---

Java提供了很多的同步机制，像我们熟悉的synchronized关键字，但是基于synchronized的关键字很难编写出细粒度的同步代码，并发工具类提供了高级的同步器，如门闩（countdown latch）等。

#### 作用

门闩（countdown latch）会导致一条或多条在“门闩”前一直等待，直到另一条线程打开这扇门，线程才会继续运行。

#### 组成

门闩（countdown latch）是由一个计数变量和两个操作数组成的，这两个操作数分别是“导致一条线程等待知道计数变为0”以及“递减计数变量”。

#### 方法

* 构造方法

CountDownLatch（int count）：count为计数个数，当count为负数时，抛出Exception

* 等待方法

void await（）：除非线程被中断，否则强制调用线程一直等到计数倒数到0。线程被中断时会抛出Exception，当count（即构造方法中的）为0时，立即返回

* 带返回值的等待方法

boolean await（long timeout，TimeUnit unit）：当count为时，立即返回true；当超过等待时间时，返回false。其他同上

* 递减计数方法

void countDown（）：递减计数，当计数为0时，释放所有等待线程。当该方法调用时count以及为0，那么什么也不会发生

* 返回计数方法

long getCount（）：返回当前计数

* 字符串方法

String toString（）：返回一条标志门闩及它的状态的字符串，具体为字符串常量“Count = ”拼接上当前的计数

#### 示例

```
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CountDownLatchDemo {
    private final static int NTHREADS = 3;

    public static void main(String[] args) {
        final CountDownLatch startSignal = new CountDownLatch(1);
        final CountDownLatch doneSignal = new CountDownLatch(NTHREADS);
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                try {
                    report("entered run()");
                    startSignal.await();
                    report("doing work");
                    Thread.sleep((int)(Math.random() * 1000));
                    doneSignal.countDown();
                } catch (InterruptedException e) {
                    System.err.println(e);
                }
            }
            void report(String s) {
                System.out.println(System.currentTimeMillis() + ":" + Thread.currentThread() + ":" + s);
            }
        };
        ExecutorService executorService = Executors.newFixedThreadPool(NTHREADS);
        for (int i = 0; i < NTHREADS; i ++)
            executorService.execute(runnable);
        try {
            System.out.println("main thread doing something");
            Thread.sleep(1000);
            startSignal.countDown();
            System.out.println("main thread doing something else");
            doneSignal.await();
            executorService.shutdown();
        } catch (InterruptedException e) {
            System.err.println(e);
        }
    }
}
```

##### 结果

```
main thread doing something
1526907473582:Thread[pool-1-thread-1,5,main]:entered run()
1526907473583:Thread[pool-1-thread-2,5,main]:entered run()
1526907473583:Thread[pool-1-thread-3,5,main]:entered run()
main thread doing something else
1526907474583:Thread[pool-1-thread-1,5,main]:doing work
1526907474583:Thread[pool-1-thread-2,5,main]:doing work
1526907474583:Thread[pool-1-thread-3,5,main]:doing work
```