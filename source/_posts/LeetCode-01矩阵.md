---
title: 'LeetCode:01矩阵'
date: 2018-08-30 10:53:55
categories: 算法
---

#### 题目如下：

给定一个由 0 和 1 组成的矩阵，找出每个元素到最近的 0 的距离。

两个相邻元素间的距离为 1 。

##### 示例 1:

输入:

```
0 0 0
0 1 0
0 0 0
```

输出：

```
0 0 0
0 1 0
0 0 0
```

##### 示例 2：

输入：

```
0 0 0
0 1 0
1 1 1
```

输出：

```
0 0 0
0 1 0
1 2 1
```

注意：

1.给定矩阵的元素个数不超过 10000。
2.给定矩阵中至少有一个元素是 0。
3.矩阵中的元素只在四个方向上相邻: 上、下、左、右。

思路：这道题使用广度优先遍历可以很快做出来，深度优先遍历的话会出现超时等各种问题。。具体思路如下：

1. 创建队列，遍历矩阵，将值为0的坐标入列，值不为0的坐标设置为MAX
2. 遍历队列，查看队列中取出的坐标四周是否有未被赋值的节点，压入队列
3. 如果当前坐标元素的值小于队列遍历的值，则赋值

AC代码如下：

```
class Solution {
    public int[][] updateMatrix(int[][] matrix) {
        if (null == matrix || matrix.length == 0 || null == matrix[0] || matrix[0].length == 0) {
            return matrix;
        }
        Queue<int[]> queue = new LinkedList<>();
        for (int i = 0; i < matrix.length; i ++) {
            for (int j = 0; j < matrix[0].length; j ++) {
                if (matrix[i][j] == 0) {
                    queue.offer(new int[]{i, j});
                } else {
                    matrix[i][j] = Integer.MAX_VALUE;
                }
            }
        }
        int count = 0;
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i ++) {
                int[] point = queue.poll();
                if (matrix[point[0]][point[1]] > count) {
                    matrix[point[0]][point[1]] = count;
                }
                offerOther(matrix, point, queue);
            }
            count++;
        }
        return matrix;
    }

    private void offerOther(int[][] matrix, int[] point, Queue<int[]> queue) {
        int x = point[0], y = point[1];
        if (x - 1 >= 0 && x - 1 < matrix.length && matrix[x - 1][y] == Integer.MAX_VALUE) {
            queue.offer(new int[]{x - 1, y});
        }
        if (x + 1 >= 0 && x + 1 <matrix.length && matrix[x + 1][y] == Integer.MAX_VALUE) {
            queue.offer(new int[]{x + 1, y});
        }
        if (y - 1 >= 0 && y - 1 <matrix[0].length && matrix[x][y - 1] == Integer.MAX_VALUE) {
            queue.offer(new int[]{x, y -1});
        }
        if (y + 1 >= 0 && y + 1 < matrix[0].length && matrix[x][y + 1] == Integer.MAX_VALUE) {
            queue.offer(new int[]{x, y + 1});
        }
    }
}
```