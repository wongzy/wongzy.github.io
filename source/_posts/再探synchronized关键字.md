---
title: 再探synchronized关键字
date: 2018-08-19 15:36:35
categories: Java多线程
---

Synchronized关键字实现了两个线程对同一个Monitor的互斥，可以用这个例子看出来：

```
        private static final Object lock1 = new Object();
        private int i = 0;

        public static void main(String[] args) {
            Main main = new Main();
            main.test();
        }

        private void test() {
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    synchronized (lock1) {
                        for (int j = 0; j < 10; j++) {
                            i++;
                            System.out.print(i + " by Thread1\n");
                        }
                    }
                }
            });
            Thread thread1 = new Thread(new Runnable() {
                @Override
                public void run() {
                    synchronized (lock1) {
                        for (int j = 0; j < 10; j++) {
                            i++;
                            System.out.print(i + " by Thread2\n");
                        }
                    }
                }
            });
            thread.start();
            thread1.start();
        }
```

运行结果如下：

```
1 by Thread1
2 by Thread1
3 by Thread1
4 by Thread1
5 by Thread1
6 by Thread1
7 by Thread1
8 by Thread1
9 by Thread1
10 by Thread1
11 by Thread2
12 by Thread2
13 by Thread2
14 by Thread2
15 by Thread2
16 by Thread2
17 by Thread2
18 by Thread2
19 by Thread2
20 by Thread2
```

当两个线程竞争同一个monitor的时候（本文中为lock1）是互斥的，在本次运行中，monitor是先被第一个线程抢到的，这个结果也在意料之中，但是，如果他们竞争的不是同一个monitor，但是，在run方法中对同一个变量进行了改动，会发生什么呢？请看下面的例子：

```
private static final Object lock1 = new Object();
    private static final Object lock2 = new Object();
    private int i = 0;

    public static void main(String[] args) {
        Main main = new Main();
        main.test();
    }

    private void test() {
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                synchronized (lock1) {
                    for (int j = 0; j < 10000000; j++) {
                        System.out.print(++i+ " by Thread1\n");
                    }
                }
            }
        });
        Thread thread1 = new Thread(new Runnable() {
            @Override
            public void run() {
                synchronized (lock2) {
                    for (int j = 0; j < 10000000; j++) {
                        System.out.print(++ i + " by Thread2\n");
                    }
                }
            }
        });
        thread.start();
        thread1.start();
    }
```

因为本次加大了数据量，所以就不贴完整的运行结果了，最后变量i的值如下：

```
19999939 by Thread1
19999940 by Thread1
19999941 by Thread1
19999942 by Thread1
19999943 by Thread1
```

可以看到，这里并不是我们想要看到的结果，说明在不同的监视器下对于同一个变量的访问，并不是互斥地进行的，所以并不保证线程安全


