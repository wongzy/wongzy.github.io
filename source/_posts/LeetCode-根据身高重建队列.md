---
title: 'LeetCode:根据身高重建队列'
date: 2018-08-19 15:21:00
categories: 算法
---

#### 题目如下：

假设有打乱顺序的一群人站成一个队列。 每个人由一个整数对(h, k)表示，其中h是这个人的身高，k是排在这个人前面且身高大于或等于h的人数。 编写一个算法来重建这个队列。

> 注意：总人数少于1100人。

#### 示例

```
输入:
[[7,0], [4,4], [7,1], [5,0], [6,1], [5,2]]

输出:
[[5,0], [7,0], [5,2], [6,1], [4,4], [7,1]]
```

#### 思路

1. 首先对数组排序，根据身高从高到低，同等身高下，根据排在前面的人的人数从少到多排序。

2. 新建List存储结果，当List数量大于等于排在前面的人的人数时直接添加，否则添加到所对应的index

#### AC解法

```
class Solution {
    public int[][] reconstructQueue(int[][] people) {
        if (null == people || people.length == 0 || null == people[0] || people[0].length == 0) {
            return people;
        }
        List<int[]> list = new ArrayList<>();
        Collections.addAll(list, people);
        list.sort(new Comparator<int[]>() {
            @Override
            public int compare(int[] o1, int[] o2) {
                if (o1[0] != o2[0]) {
                    return o2[0] - o1[0];
                } else {
                    return o1[1] - o2[1];
                }
            }
        });
        List<int[]> res = new ArrayList<>();
        for (int[] ints : list) {
            int height = ints[0];
            int target = ints[1];
            if (target >= res.size()) {
                res.add(ints);
                continue;
            }
            res.add(target, ints);
        }
        int[][] resArray = new int[res.size()][2];
        for (int i = 0; i < res.size(); i ++) {
            resArray[i] = res.get(i);
        }
        return resArray;
    }
}
```