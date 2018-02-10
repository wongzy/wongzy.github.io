---
title: 用一个栈来实现另一个栈的排序
date: 2018-02-10 15:48:13
categories: 算法
---

解法：

将要排序的栈记为stack，申请的辅助栈记为help。在stack上执行pop操作，获得的元素记为cur

1. 如果cur小于或等于help的栈顶元素，则将cur直接压入help
2. 如果cur大于help的栈顶元素，则将help的元素逐一弹出，直到cur小于或等于help的栈顶元素

一直执行以上操作，直到stack的全部元素都压入到help，最后将help中的元素逐一压入stack，即完成排序

```
public static void sortStackByStack(Stack<Integer> stack) {
        Stack<Integer> help = new Stack<>();
        while (!stack.isEmpty()) {
            int cur = stack.pop();
            while (!help.isEmpty() && help.peek() < cur) {
                stack.push(help.pop());
            }
            help.push(cur);
        }
        while (!help.isEmpty()) {
            stack.push(help.pop());
        }
    }
```
