---
title: Collection的方方面面
date: 2018-02-13 15:43:07
categories: Java
---

Collection的主要子接口有List、Set和Queue。

### List

#### ArrayList与LinkedList

List两个主要的实现类为ArrayList和LinkedList，区别如下：

List类 | 原理 | 特点
--- | --- | ---
ArrayList | 采用数组形式来保存对象，将对象放在连续的位置中 | 长于随机访问元素，但是中间插入和移除元素较慢，非线程安全的
LinkedList | 将对象存放在独立的空间中，而且在每个空间还保存下一个链接的索引 | 查询较慢，插入和删除较快，非线程安全的

#### Vector

Vector与ArrayList一样，也是通过数组实现的，不同的是它支持线程的同步，即某一时刻只有一个线程能够写Vector，避免多线程同时写而引起的不一致性，但实现同步需要很高的花费，因此，访问它比访问ArrayList慢。

> Vector是一个古老的类，一般不使用它

### Set

Set的主要实现类有HashSet、LinkedHashSet、TreeSet。三者的比较如下：

Set类 | 原理 | 特点
--- | --- | ---
HashSet | HashSet的底层是一个HashMap，当向HashSet插入元素时，实际上是向HashMap插入元素，插入的元素是作为Key储存的，键对值为一个特定值PRESENT | 排列顺序不定，线程不安全
LinkedHashSet | LinkedHashSet继承于HashSet，但与HashSet不同的是，它在内部维护着一个双向链表，这个链表保持着元素的次序 | 插入的性能弱于HashMap，但是迭代的性能好于HashMap，线程不安全
TreeSet | TreeSet实现的是Set的子接口SortSet保证了添加的元素按照元素的自然顺序(递增或其他顺序)在集合中进行存储,需要实现Comparator接口，是基于TreeMap来实现的 | 需要比较，性能较差，线程不安全

> 注：以上三个类都可以通过Collections.synchronizedSet(？ extend Set)来实现线程安全

### Queue

Queue接口的实现类比较少，我们平常使用到的就是PriorityQueue和LinkedList，其中LinkedList是既实现了List接口又实现了Queue接口的。

#### PriorityQueue

##### 原理

PriorityQueue是基于最小堆实现的，继承了AbstractQueue没有实现BlockingQueue接口，所以没有take阻塞方法。


#### 整体关系图如下

![java-collection-hierarchy1.jpg](https://i.loli.net/2018/02/13/5a82bfdfae246.jpg)

> 图片来源于 [链接](https://www.bysocket.com/?p=195)
