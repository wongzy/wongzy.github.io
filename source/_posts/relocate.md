---
title: 按照左右半区的方式重新组合单链表
date: 2018-02-06 10:36:32
categories: 算法
---

 > 这道题的题目有些复杂，是这样的：给定一个单链表的头部节点head，链表长度为N，如果N为偶数，那么前N/2个算作左半区，后N/2个节点算作右半区；如果N为奇数，那么前N/2个节点算作左半区，后N/2个节点算作右半区。左半区从左到右即为L1->L2->...，右半区从左到右记为R1->R2->...,将单链表调整为L1->R1->L2->R2->...的形式。

#### 解法

 解题思路如下：

 1. 如果链表为空或长度为1，不用调整，过程直接结束
 2. 链表长度大于1时，遍历一遍找到左半区的最后一个节点，记为mid
 3. 遍历一遍找到mid之后，将左半区与右半区分离成两个链表（mid.next=null),分别记为left(head)和right（原来的mid.next)
 4. 将两个链表按照题目要求合并起来

算法如下：
 ```
public void relocate(Node head) {
        if (head == null || head.next == null) {
            return;
        }
        Node mid = head;
        Node right = head.next;
        while (right.next != null && right.next.next != null) {
            mid = mid.next;
            right = right.next.next;
        }
        right = mid.next;
        mid.next = null;
        merge(head, right);
    }

    public void mergeLR(Node left, Node right) {
        Node next = null;
        while (left.next != null) {
            next = right.next;
            right.next = left.next;
            left.next = right;
            left = right.next;
            right = next;
        }
    }
 ```
