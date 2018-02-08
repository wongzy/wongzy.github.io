---
title: 设计一个有getMin功能的栈
date: 2018-02-08 10:20:38
categories: 算法
---

> 题目为：实现一个特殊功能的栈，在实现栈的基本功能的基础上，再实现返回栈中最小元素的操作

这个题目我们可以用两个栈来实现，有两种不同的解法

##### 解法一

* 压入规则

假设当前数据为newNum，先将其压入stackData。然后判断stackMin是否为空：

1. 如果为空，则newNum也压入stackMin
2. 如果不为空，则比较newNum和stackMin的栈顶元素哪一个更小，如果相等或更小，则newNum也压入stackMin；如果stackMin中的栈顶元素小，则stackMin不压入任何内容

* 弹出规则

记stackMin的栈顶元素为value，当value等于stackMin的栈顶元素时，stackMin弹出栈顶元素；当value大于stackMin时，stackMin不弹出栈顶元素；返回value。

具体算法如下：

```
public class MyStack1 {
    private Stack<Integer> stackData;
    private Stack<Integer> stackMin;

    public MyStack1() {
        stackData = new Stack<>();
        stackMin = new Stack<>();
    }

    public void push(int newNum) {
        if (stackMin.isEmpty()) {
            stackMin.push(newNum);
        } else if (newNum <= getMin()) {
            stackMin.push(newNum);
        }
        stackData.push(newNum);
    }

    public int pop() {
        if (stackData.isEmpty()) {
            throw new RuntimeException("Your stack is empty");
        }
        int value = stackData.pop();
        if (value == getMin()) {
            stackMin.pop();
        }
        return value;
    }

    public Integer getMin() {
        if (stackMin.isEmpty()) {
            throw new RuntimeException("Your stack is empty");
        }
        return stackMin.peek();
    }
}
```


##### 解法二：

解法二与解法一不同的就是再压入时，如果newNum的值大于当前的最小值，则将最小值重复压入，弹出时同步弹出即可，不需要进行判断

具体算法如下：

```
public class MyStack2 {
    private Stack<Integer> stackData;
    private Stack<Integer> stackMin;

    public MyStack1() {
        stackData = new Stack<>();
        stackMin = new Stack<>();
    }

    public void push(int newNum) {
        if (stackMin.isEmpty()) {
            stackMin.push(newNum);
        } else if (newNum < getMin()) {
            stackMin.push(newNum);
        } else {
            int newMin = stackMin.peek();
            stackMin.push(newMin);
        }
        stackData.push(newNum);
    }

    public int pop() {
        if (stackData.isEmpty()) {
            throw new RuntimeException("Your stack is empty");
        }
        stackMin.pop();
        return stackData.pop();
    }

    public Integer getMin() {
        if (stackMin.isEmpty()) {
            throw new RuntimeException("Your stack is empty");
        }
        return stackMin.peek();
    }
}
```



