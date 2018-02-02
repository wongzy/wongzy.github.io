---
title: 在有序的环型单链表中插入新节点
date: 2018-02-02 10:25:40
categories: 算法
---

> 若一个环型链表从head开始不降序，同时由最后的节点返回头节点，将节点值为num的节点插入到有序链表中，插入后链表仍然有序

#### 解法

思路如下：

1. 生成节点值为num的节点，记为node
2. 如果链表为空，让node自己组成环型链表，然后直接返回node
3. 如果链表不为空，令变量pre=head，cur=head.next，然后令pre和next移动，如果遇到num的值正好在pre和next之间，就进行插入
4. 如果没有遇到3的情况，就插入到head节点的之前一个节点
5. 如果node节点的值大于头节点，则返回头节点，否则则返回node节点

具体算法如下：

```
public Node insertNOde(Node head, int num) {
        Node node = new Node(num);
        if (head == null) {
            node.next = node;
            return node;
        }
        Node pre = head;
        Node cur = head.next;
        while (cur != null) {
            if (pre.value <= num && cur.value >= num) {
                break;
            }
            pre = cur;
            cur = cur.next;
        }
        pre.next = node;
        node.next = cur;
        return head.value < num ? head : node;
    }
```
