---
title: 合并两个有序的单链表
date: 2018-02-04 16:04:05
categories: 算法
---

> 给定两个有序单链表的头节点head1和head2，合并两个有序链表，合并后的链表依然有序，并放回头节点

#### 解法

本题比较简单，但思路需要理顺的，具体如下：

1. 如果两个链表中有一个为空，说明无须合并过程，返回另一个链表的头节点即可
2. 比较head1和head2的值，小的节点也是链表合并后的第一个节点，记为head
3. 设head节点所在的链表为链表1，另一个链表为链表2。链表1和链表2都从头部开始一起遍历，比较每次遍历到的两个节点的值，记为cur1和cur2，然后根据大小关系做出不同的调整，同时用一个变量pre表示上次比较时值较小的节点。
4. 如果链表1先走完，此时cur1=null，pre为链表1的最后一个节点，那么就把pre的next指针指向链表2当前的节点，表示把链表2没遍历到的有序部分直接拼接到最后，调整结束。如果链表2先走完，说明链表2的所有节点都已经插入到链表1中，调整结束
5. 返回合并后链表的头节点head

具体算法如下：

```
public Node merge(Node head1, Node head2) {
        if (head1 == null || head2 == null) {
            return head1 != null ? head1 : head2;
        }
        Node head = head1.value < head2.value ? head1 : head2;
        Node cur1 = head == head1 ? head1 : head2;
        Node cur2 = head == head1 ? head2 : head1;
        Node pre = null;
        Node next = null;
        while (cur1 != null && cur2 != null) {
            if (cur1.value <= cur2.value) {
                pre = cur1;
                cur1 = cur1.next;
            } else {
                next = cur2.next;
                pre.next = cur2;
                cur2.next = cur1;
                pre = cur2;
                cur2 = next;
            }
        }
        pre.next = cur1 == null ? cur2 : cur1;
        return head;
    }
```
