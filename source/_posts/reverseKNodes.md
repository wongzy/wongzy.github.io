---
title: 将单链表的每K个节点之间逆序
date: 2018-01-28 09:52:55
categories: 算法
---

> 这道题也有两种解法，一种是使用了栈结构，而另一种则不需要

#### 方法一：使用栈结构

使用栈结构的方法思路如下：

1. 从左到右遍历链表，如果栈的大小不等于K，就将接地啊年不断压入栈中
2. 当栈的大小第一次到达K时，说明第一次凑齐了K个节点进行逆序，从栈中一次弹出这些节点，并根据弹出的顺序重新连接，这一组逆序完成后，需要记录一下新的头部，同时第一组的最后一个节点应该连接下一个节点
3. 步骤2之后，当栈的大小每次到达K时，说明又凑齐了一组应该进行逆序的节点，从栈中一次弹出这些节点，并根据弹出的顺序重新连接，这一组逆序完成后，该组的第一个节点应该被上一组的最后一个节点连接上，这一组的最后一个节点应该连接下一个节点，然后继续去凑下一组，知道链表都被遍历完
4. 最后应该返回newHead，作为链表新的头节点

具体算法如下：

```
public Node reverseKNodes1(Node head, int K) {
        if (K < 2) {
            return head;
        }
        Stack<Node> stack = new Stack<>();
        Node newHead = head;
        Node cur = head;
        Node pre = null;
        Node next = null;
        while (cur != null) {
            next = cur.next;
            stack.push(cur);
            if (stack.size() == K) {
                pre = resign1(stack, pre, next);
                newHead = newHead == head ? cur :newHead;
            }
            cur = next;
        }
        return newHead;
    }
    public Node resign1(Stack<Node> stack, Node left, Node right) {
        Node cur = stack.pop();
        if (left != null) {
            left.next = cur;
        }
        Node next = null;
        while (!stack.isEmpty()) {
            next = stack.pop();
            cur.next = next;
            cur = next;
        }
        cur.next = right;
        return cur;
    }
```

#### 方法二：不需要栈结构，在原链表中直接调整

思路如下：用变量记录每一组的第一个节点和最后一个节点，然后直接逆序调整，把这一组的节点都逆序。和方法一一样，同样需要注意第一组节点的特殊处理，以及之后的每一个组在逆序重连之后，需要让该组的第一个节点被之前组的最后一个节点连接上，将该组的最后一个节点连接下一个节点

具体算法如下：

```
public Node reverseKNodes2(Node head, int K) {
        if (K < 2) {
            return head;
        }
        Node cur = head;
        Node start = null;
        Node pre = null;
        Node next = null;
        int count = 1;
        while (cur != null) {
            next = cur.next;
            if (count == K) {
                start = pre == null ? head :pre.next;
                head = pre == null ? cur : head;
                resign2(pre, start, cur, next);
                pre = start;
                count = 0;
            }
            count ++;
            cur = next;
        }
        return head;
    }

    public void resign2(Node left, Node start, Node end, Node right) {
        Node pre = start;
        Node cur = start.next;
        Node next = null;
        while (cur != right) {
            next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
        if (left != null) {
            left.next = end;
        }
        start.next = right;
    }
```

