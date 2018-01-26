---
title: 在单链表和双链表中删除倒数第K个节点
date: 2018-1-10 12:02:04
categories: 算法
---

> 思路

1. 设要删除的为倒数第K个节点，第一遍遍历从头指针开始，每到下一个节点K就减1，若指针走到尽头K大于等于1，则链表长度不满足要求，若等于0则要删除的是头节点
2. 若K小于0，则开始第二次遍历，每到下一节点K就加1，K为0时所到的节点后一节点即为要删除的节点

#### 单链表算法

```
public Node removeLastKthNode(Node head, int lastKth) {
        if (head == null || lastKth < 1){
            return head;
        }
        Node cur = head;
        while (cur != null) {
            lastKth --;
            cur = cur.next;
        }
        if (lastKth == 0) {
            head = head.next;
        }
        if (lastKth < 0) {
            cur = head;
            while (++lastKth != 0) {
                cur = cur.next;
            }
            cur.next = cur.next.next;
        }
        return head;
    }
```

#### 双链表算法

```
public DoubleNode removeLastKthNode(DoubleNode head, int lastKth) {
        if (head == null || lastKth < 1){
            return head;
        }
        DoubleNode cur = head;
        while (cur != null) {
            lastKth --;
            cur = cur.next;
        }
        if (lastKth == 0) {
            head = head.next;
        }
        if (lastKth < 0) {
            cur = head;
            while (++lastKth != 0) {
                cur = cur.next;
            }
            DoubleNode newNext = cur.next.next;
            cur.next = newNext;
            if (newNext != null) {
                newNext.last = cur;
            }
        }
        return head;
    }
```
