---
title: 不用任何比较判断找出两个数中较大的数
date: 2018-02-07 15:20:12
categories: 算法
---

> 题目：给定两个32位整数a和b，返回a和b中较大的数，不用任何比较判断

##### 解法

我们使用位运算来解决这个问题，具体思路如下：

* a和b的符号不同，则有以下两种情况
1. a为0或正，那么b为负，返回a
2. 如果a为负，则b为正或0，返回b
* a和b的符号相同，a-b的值绝对不会溢出
1. 如果a-b为0或正，返回a
2. 如果a-b为负，返回b

具体算法如下：

```
public int flip(int n) {
        return n ^ 1;
    }
    public int sign(int n) {
        return flip((n >> 31) & 1);
    }
    public int getMax2(int a, int b) {
        int c = a - b;
        int sa = sign(a);
        int sb = sign(b);
        int sc = sign(c);
        int difSab = sa ^ sb;
        int sameSab = flip(difSab);
        int returnA = difSab * sa + sameSab * sc;
        int returnB = flip(returnA);
        return a * returnA + b * returnB;
    }
```

> 其中函数sign的作用是返回整数n的符号，正数和0返回1，负数则返回0。flip函数的功能是如果n为1，返回0，如果n为0，返回1。
