---
title: hashCode()和equals()
date: 2018-02-11 20:45:28
categories: Java
---

### equals

#### 作用

equals的作用时判断两个对象是否相等

#### 与"=="的比较

"=="的作用是判断两个对象是否是同一个对象，例如b和c都是a的引用，则我们对b和c用==进行比较

```
b == c;
```

所得到的结果为true，反之，如果两个并不是同一对象，即使两个对象是相等的，也会返回false

> 注意，在基本类型中，使用==即表示比较内容

#### 要求

Java对equals的要求为以下几点：

1. 对称性：如果x.equals(y)返回是true，那么y.equals(x)也应该返回是true
2. 自反性：x.equals(x)必须返回是true
3. 传递性：如果x.equals(y)返回是true，而且y.equals(z)返回是true，那么z.equals(x)也应该返回是true
4. 一致性：如果x.equals(y)返回是true，只要x和y内容一直不变，不管你重复x.equals(y)多少次，返回都是true
5. 非空性：x.equals(null)，永远返回是false；x.equals(和x不同类型的对象)永远返回是false

### HashCode

#### 作用

HashCode的作用是获得对象的Hash码，也叫做散列码，哈希码的作用是确定该对象在哈希表中的索引位置

> 也就是说，没有创建类对应的哈希表的情况下，HashCode并不起任何作用

#### 与equals的比较

HashCode与equals的比较仅仅在创建了类对应的哈希表的情况下才是有意义的，在这种情况下：

1. 如果两个对象相等，则HashCode一定相等
2. 如果两个对象的HashCode相等，则两个对象不一定相等

> 其中第二点就是发生了哈希冲突

#### 要求

1. 在一个Java应用的执行期间，如果一个对象提供给equals做比较的信息没有被修改的话，该对象多次调用hashCode()方法，该方法必须始终如一返回同一个integer。
2. 如果两个对象根据equals(Object)方法是相等的，那么调用二者各自的hashCode()方法必须产生同一个integer结果。
3. 并不要求根据equals(java.lang.Object)方法不相等的两个对象，调用二者各自的hashCode()方法必须产生不同的integer结果。然而，程序员应该意识到对于不同的对象产生不同的integer结果，有可能会提高hash table的性能。
