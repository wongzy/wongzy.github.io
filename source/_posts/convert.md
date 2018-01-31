---
title: 将搜索二叉树转换成双向链表
date: 2018-01-31 09:44:09
categories: 算法
---

> 二叉树的节点有本身的值域，有指向左孩子和右孩子的两个指针；对双向链表来说，有本身的值域，有指向上一个节点和下一个节点的指针。在结构上，结构有相似性，现在有一颗搜索二叉树，将其转换成一个有序的双向链表有两种方法：第一种是使用队列收集遍历结果，另一种则是利用递归函数。

#### 方法一：用队列等容器收集二叉树中中序遍历结果的方法

思路如下：

1. 生成一个队列，记为queue，按照二叉树中中序遍历的顺序，将每个节点放入queue中
2. 从queue中依次弹出节点，并按照弹出的顺序重连所有的节点即可

代码如下：

```
public Node convert1(Node head) {
        Queue<Node> queue = new LinkedList<Node>();
        inOrderToQueue(head, queue);
        if (queue.isEmpty()) {
            return head;
        }
        head = queue.poll();
        Node pre = head;
        pre.left = null;
        Node cur = null;
        while (!queue.isEmpty()) {
            cur = queue.poll();
            pre.right = cur;
            cur.left = pre;
            pre = cur;
        }
        pre.right = null;
        return head;
    }

    public void inOrderToQueue(Node head, Queue<Node> queue) {
        if (head == null) {
            return;
        }
        inOrderToQueue(head.left, queue);
        queue.offer(head);
        inOrderToQueue(head.right, queue);
    }
```

#### 方法二：利用递归函数，除此之外不适用任何容器的方法

这个解法比方法一要复杂一些，过程如下：

1. 实现递归函数precess。precess的功能是将一棵搜索二叉树转换为一个结构有点特殊的有序双向链表，特殊结构是指这个双向链表尾节点的right指针指向该双向链表的头节点
2. 通过process过程得到的双向链表是尾节点的right指针连向头节点的结构，所以，最终需要将尾节点的right指着你设置为null

具体代码如下：

```
public Node convert2(Node head) {
        if (head == null) {
            return null;
        }
        Node last = process(head);
        head = last.right;
        last.right = null;
        return head;
    }

    public Node process(Node head) {
        if (head == null) {
            return null;
        }
        Node leftE = process(head.left);
        Node rightE = process(head.right);
        Node leftS = leftE != null ? leftE.right : null;
        Node rightS = rightE != null ? rightE.right : null;
        if (leftE != null && rightE != null) {
            leftE.right = head;
            head.right = rightE;
            head.left = leftE;
            rightS.left = head;
            rightE.right = leftS;
            return rightE;
        } else if (leftE != null){
            leftE.right = head;
            head.left = leftE;
            head.right = leftS;
            return head;
        } else if(rightE != null) {
            head.right = rightS;
            rightS.left = head;
            rightE.right = head;
            return rightE;
        } else {
            head.right = head;
            return head;
        }
    }
```
