---
title: 如何仅用递归函数逆序一个栈
date: 2018-02-09 09:23:28
categories: 算法
---

> 使用递归函数逆序一个栈需要用到两次递归

#### 解法

##### 递归函数一：将栈stack的栈底元素返回并移除

```
public static int getAndRemoveLastElement(Stack<Integer> stack) {
        int result = stack.pop();
        if (stack.isEmpty()) {
            return result;
        } else {
            int last = getAndRemoveLastElement(stack);
            stack.push(result);
            return last;
        }
    }
```

##### 递归函数二：逆序一个栈

```
public static void reverse(Stack<Integer> stack) {
        if (stack.isEmpty()) {
            return;
        }
        int i = getAndRemoveLastElement(stack);
        reverse(stack);
        stack.push(i);
    }
```
