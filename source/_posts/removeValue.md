---
title: 在单链表中删除指定值的节点
date: 2018-01-30 17:53:41
categories: 算法
---

这个题也有两种解法，一种是利用栈结构，另一种则是直接调整

#### 方法一：利用栈结构或其他容器收集节点

思路：将值不等于num的节点用栈收集起来，收集完成后重新连接即可。最后将栈底的节点作为新的头节点返回

算法如下：

```
public Node removeValue1(Node head, int num) {
        Stack<Node> stack = new Stack<>();
        while (head != null) {
            if (head.value != num) {
                stack.push(head);
            }
            head = head.next;
        }
        while (!stack.isEmpty()) {
            stack.peek().next = head;
            head = stack.pop();
        }
        return head;
    }
```

#### 方法二：不用任何容器而直接调整的方法

思路：首先从链表头开始，找到第一个值不等于num的节点，作为新的头节点，这个节点是肯定不用删除的，记为newHead，继续往后遍历，假设当前节点为cur，如果cur节点值等于num，就将cur节点删除，删除的方法是将之前最近一个值不等于num的节点pre连接到cur的下一个节点，即pre.next=cur.next；如果cur节点的值不等于num，就令pre=cur，即更新最近一个值不等于num的节点

算法如下：

```
public Node removeValue1(Node head, int num) {
        Stack<Node> stack = new Stack<>();
        while (head != null) {
            if (head.value != num) {
                stack.push(head);
            }
            head = head.next;
        }
        while (!stack.isEmpty()) {
            stack.peek().next = head;
            head = stack.pop();
        }
        return head;
    }
```
