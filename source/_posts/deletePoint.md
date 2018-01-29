---
title: 删除无序单链表中重复出现的节点
date: 2018-01-29 10:37:52
categories: 算法
---

此题目要求的是将重复值的节点删去，也就是说在链表中，同一个值只能有一个节点，这道题有两种解法，一种是利用哈希表，另一种则是先选择排序，然后再进行删除

#### 方法一：利用哈希表

具体过程如下：

1. 生成一个哈希表，因为头节点是不用删除的节点，所以将头节点的值放入哈希表
2. 从头节点的下一个节点开始往后遍历节点，假设当前遍历到cur节点，先检查cur的值是否再哈希表中，如果再，则说明cur节点的值是之前出现过的，就将cur节点删除，删除的方式是将最近一个没有被删除的节点pre连接到cur的下一个节点，即pre.next=cur.next。如果不在，将cur节点的值放入哈希表，同时令pre=cur，即更新最近一个没有被删除的节点

算法如下：

```
public void removeRep1(Node head) {
        if (head == null) {
            return;
        }
        HashSet<Integer> set = new HashSet<>();
        Node pre = head;
        Node cur = head.next;
        set.add(head.value);
        while (cur != null) {
            if (set.contains(cur.value)) {
                pre.next = cur.next;
            } else {
                set.add(cur.value);
                pre = cur;
            }
            cur = cur.next;
        }
    }
```

#### 方法二：类似选择排序的过程

> 注意：这道题是基于已排序好的链表上的

具体思路为：获得第一个新值，然后往后检查所有值为此值的节点全部删除

```
public void removeRep2(Node head) {
        Node cur = head;
        Node pre = null;
        Node next = null;
        while (cur != null) {
            pre = cur;
            next = cur.next;
            while (next != null) {
                if (cur.value == next.value) {
                    pre.next = next.next;
                } else {
                    pre = next;
                }
                next = next.next;
            }
            cur = cur.next;
        }
    }
```
