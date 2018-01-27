---
title: 两个单链表生成相加链表
date: 2018-01-27 09:59:45
categories: 算法
---

#### 题目

这道题的题目时这样的，两个链表都代表一个整数，如9->3->7代表整数937，6->3代表整数63，则两个链表相加则为1->0->0->0

#### 方法一：利用栈求解

思路如下：

1. 将两个链表分别从头到尾进行遍历，遍历过程中将值压栈，这样就生成了两个逆序栈s1和s2
2. 将s1和s2同步弹出，这样就相当于两个链表从低位到高位依次弹出，在这个过程中生成相加链表即可，同时需要关注每一步是否有进位，用ca表示
3. 当s1和s2都为空时，还要关注一下进位信息是否为1，如果为1，则表示还要生成一个节点值为1的新节点
4. 返回新生成的结果

具体算法如下

```
public Node addLists1(Node head1, Node head2) {
        Stack<Integer> s1 = new Stack<>();
        Stack<Integer> s2 = new Stack<>();
        while (head1 != null) {
            s1.push(head1.value);
            head1 = head1.next;
        }
        while (head2 != null) {
            s2.push(head2.value);
            head2 = head2.next;
        }
        int ca = 0;
        int n1 = 0;
        int n2 = 0;
        int n = 0;
        Node node = null;
        Node pre = null;
        while (!s1.isEmpty() || !s2.isEmpty()) {
            n1 = s1.isEmpty()? 0 : s1.pop();
            n2 = s2.isEmpty()? 0 : s2.pop();
            n = n1 + n2 + ca;
            pre = node;
            node = new Node(n % 10);
            node.next = pre;
            ca = n /10;
        }
        if (ca == 1) {
            pre = node;
            node = new Node(1);
            node.next = pre;
        }
        return node;
    }
```

#### 方法二：利用链表的逆序求解

这个方法比方法1省去了用栈的空间，具体思路如下：

1. 将两个链表逆序，这样就可以依次得到从低位到高位的数字
2. 同步遍历两个逆序后的链表，这样就依次得到两个链表从低位到高位的数字，在这个过程中生成相加链表即可，同时需要关注每一步是否有进位，用ca表示
3. 两个链表都遍历完成后，还要关注进位信息是否为1，如果为1，还要生成一个节点值为1的新节点
4. 将两个逆序的链表再逆序一次，即调整成原来的样子
5. 返回新生成的结果链表

算法如下：

```
public Node addLists2(Node head1, Node head2) {
        head1 = reverse(head1);
        head2 = reverse(head2);
        int ca = 0;
        int n1 = 0;
        int n2 = 0;
        int n = 0;
        Node c1 = head1;
        Node c2 = head2;
        Node node = null;
        Node pre = null;
        while (c1 != null || c2 != null) {
            n1 = c1 != null ? c1.value : 0;
            n2 = c2 != null ? c2.value : 0;
            n = n1 + n2 + ca;
            pre = node;
            node = new Node(n % 10);
            node.next = pre;
            ca = n / 10;
            c1 = c1 != null ? c1.next :null;
            c2 = c2 != null ? c2.next :null;
        }
        if (ca == 1) {
            pre = node;
            node = new Node(1);
            node.next = pre;
        }
        reverse(head1);
        reverse(head2);
        return pre;
    }

    public Node reverse(Node head) {
        Node pre = null;
        Node next = null;
        while (head != null) {
            next = head.next;
            head.next = pre;
            pre = head;
            head = next;
        }
        return pre;
    }
```
