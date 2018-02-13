---
title: Map的方方面面
date: 2018-02-13 13:44:32
categories: Java
---

#### 常见的Map实现类

Map类 | 特性
--- |  ---
HashTable | Map基于散列表的实现，HashTable继承自抽象类Dictionary（Dictionary是一个被废弃的接口），是线程安全的。
HashMap | Map基于散列表的实现（取代了HashTable）。继承自抽象类AbstractMap，插入和查询“键对值”的开销是固定的。
LinkedHashMap | 类似于HashMap，但是迭代遍历它时，取得“键对值”的顺序时其插入顺序，或者是LRU（最近最少使用）的次序，使用链表维护内部次序，所以迭代访问更快。
TreeMap | 基于红黑树（自平衡二叉查找树）的实现，查看“键”或者“键对值”时，它们会被排序。特点是得到的结果是经过排序的，TreeMap也是唯一的带有SubMap（）方法的Map，可以返回一个子树。
WeakHashMap | 弱键映射，允许释放映射所指向的对象，如果除映射之外没有引用指向某个“键”，那么此“键”可以被垃圾收集器回收。
ConcurrentHashMap | 一种线程安全的Map，它不涉及同步加锁。
IdentityHashMap | 使用==代替equals（）对“键”进行比较的散列映射。

#### HashMap与HashTable的比较

HashMap与HashTable推出的时间是不同的，HashTable是jdk1.1就被推出的类，现在已经被遗弃，而HashMap则是用来替换它的类，具体比较如下

比较点 | HashMap | HashTable
--- | ---| ---
性能 | 采用异步处理方式，性能更高 | 采用同步处理方式，性能较低
线程安全 | 非线程安全 | 线程安全
空键 | 允许将key设置为null | 不允许将key设置为null，否则将报空指针异常

> HashTable是使用synchronized关键字来实现线程互斥来达到线程同步的目的的

#### HashMap的实现

HashMap内部维护着一个散列表，当我们使用put函数的时候，会调用Hash方法对Key做Hash（即通过hashCode()的高16位异或低16位）得到bucket位置，然后再进行储存，HashMap会根据当前bucket的占用情况自动调整容量。使用get函数获取对象时，与put方法一样，先对Key做hash，得到Bucket的位置，再通过equals()方法来确定键对值。
当发生Hash冲突时，在JDK8之前，会使用一个链表将同一Bucket的元素组织起来，使用get方法时再进行遍历；在JDK8中，将链表改为了TreeMap，提高了查询效率。

#### 更高效的线程同步Map-ConcurrentHashMap

ConcurrentHashMap采用了分段锁的设计，只有在同一个分段内才存在竞态关系，不同的分段锁之间没有锁竞争。这个容器的实现是基于Java内存模型的。



