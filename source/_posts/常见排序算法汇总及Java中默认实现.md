---
title: 常见排序算法汇总及Java中默认实现
date: 2018-09-15 11:49:28
categories: 算法
---

### 基本排序算法的分类及比较

首先，上一张各种排序算法比较的图

排序方法 | 平均时间复杂度 | 最好情况下的时间复杂度 | 最坏情况下的时间复杂度 | 空间复杂度(辅助存储) | 稳定性
--- | --- | --- | --- | --- | ---
直接插入排序 | O(n^2) | O(n) | O(n^2) | O(1) | 稳定
希尔排序 | O（n^1.5) | O(n) | O(n^2) | O(1) | 不稳定
直接选择排序 | O（n^2) | O(n^2) | O(n^2) | O(1) | 不稳定
堆排序 | O(nlog2(n)) | O(nlog2(n)) | O(nlog2(n)) | O(1) | 不稳定
冒泡排序 | O(n^2) | O(n)| O(n^2) | O(1) | 稳定
快速排序 | O(nlog2(n)) | O(nlog2(n)) | O(nlog2(n)) | O(nlog2(n)) | 不稳定
归并排序 | O(nlog2(n)) | O(nlog2(n)) | O(nlog2(n)) | O(1) | 稳定

其中又可以分为四个大类，即插入排序、选择排序、交换排序与归并排序

分类 | 插入排序 | 选择排序 | 交换排序 | 归并排序
--- | --- | --- | --- | ---
代表排序方法 | 直接插入排序、希尔排序 | 选择排序、堆排序 | 冒泡排序、快速排序 | 归并排序

#### 插入排序

##### 直接插入排序

>  原理:它的工作原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。 插入排序在实现上，通常采用in-place排序，因而在从后向前扫描过程中，需要反复把已排序元素逐步向后挪位，为最新元素提供插入空间。

代码实现如下：

```
public static void sort(int[] numbers){
        for (int i = 1; i < numbers.length; i++) {
            int currentNumber = numbers[i];
            int j = i - 1;
            while (j >= 0 && numbers[j] > currentNumber) {
                numbers[j + 1] = numbers[j];
                j--;
            }
            numbers[j + 1] = currentNumber;
        }
    }
```

##### 希尔排序

> 原理：希尔排序实质是分组插入排序，基本思想是希尔排序是将待排序的数组元素 按下标的一定增量分组 ，分成多个子序列，然后对各个子序列进行直接插入排序算法排序；然后依次缩减增量再进行排序，直到增量为1时，进行最后一次直接插入排序，排序结束。

具体代码实现可参考以下链接

[希尔排序](https://blog.csdn.net/MoreWindows/article/details/6668714)

当希尔排序的增量为1时，它就退化成了直接插入排序。

#### 选择排序

##### 直接选择排序

> 原理：对于给定的一组记录，经过第一轮比较后得到最小的记录，然后将该记录的位置与第一个记录的位置交换；接着对不包括第一个记录以外的其他记录进行第二次比较，得到最小记录并与第二个位置记录交换；重复该过程，知道进行比较的记录只剩下一个为止。

具体实现代码如下：

```
public static void selectSort(int[] a) {
        if (a == null || a.length <= 0) {
            return;
        }
        for (int i = 0; i < a.length; i++) {
            int temp = a[i];
            int flag = i; // 将当前下标定义为最小值下标
            for (int j = i + 1; j < a.length; j++) {
                if (a[j] < temp) {// a[j] < temp 从小到大排序；a[j] > temp 从大到小排序
                    temp = a[j];
                    flag = j; // 如果有小于当前最小值的关键字将此关键字的下标赋值给flag
                }
            }
            if (flag != i) {
                a[flag] = a[i];
                a[i] = temp;
            }
        }
    }
```

##### 堆排序

> 原理：堆排序就是利用堆（假设利用大顶堆）进行排序的方法。它的基本思想是，将待排序的序列构造成一个大顶堆。此时，整个序列的最大值就是堆顶的根节点。将它移走（其实就是将其与堆数组的末尾元素交换，此时末尾元素就是最大值），然后将剩余的 n-1 个序列重新构造成一个堆，这样就会得到 n 个元素中次大的值。如此反复执行，便能得到一个有序序列了。 堆排序的实现需要解决的两个关键问题：
1. 将一个无序序列构成一个堆。
2. 输出堆顶元素后，调整剩余元素成为一个新堆。

具体实现可参考如下链接

[堆排序](https://blog.csdn.net/jianyuerensheng/article/details/51263453)

#### 交换排序

##### 冒泡排序

> 原理：依次比较相邻的两个数，将小数放在前面，大数放在后面。即在第一趟：首先比较第1个和第2个数，将小数放前，大数放后。然后比较第2个数和第3个数，将小数放前，大数放后，如此继续，直至比较最后两个数，将小数放前，大数放后。重复第一趟步骤，直至全部排序完成。

具体代码实现：

```
public static void BubbleSort(int[] arr) {
        int temp;//定义一个临时变量
        for(int i=0;i<arr.length-1;i++){//冒泡趟数
            for(int j=0;j<arr.length-i-1;j++){
                if(arr[j+1]<arr[j]){
                    temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
    }
```

##### 快速排序

> 原理：快速排序也是分治法思想的一种实现，他的思路是使数组中的每个元素与基准值（Pivot，通常是数组的首个值，A[0]）比较，数组中比基准值小的放在基准值的左边，形成左部；大的放在右边，形成右部；接下来将左部和右部分别递归地执行上面的过程：选基准值，小的放在左边，大的放在右边。直到排序结束。

具体实现代码如下：

```
public void quickSort(int[] nums, int low, int height) {
        if (low > height) {
            return;
        }
        int i = low;
        int j = height;
        int key = nums[low];
        while (i < j) {
            while (i < j && nums[j] > key) {
                j --;
            }
            while (i < j && nums[i] <= key) {
                i ++;
            }
            if (i < j) {
                int temp = nums[i];
                nums[i] = nums[j];
                nums[j] = temp;
            }
        }
        int temp = nums[low];
        nums[low] = nums[i];
        nums[i] = temp;
        quickSort(nums, low, i - 1);
        quickSort(nums, i + 1, height);
    }
```

在整个数组已经完成排序或已经完全倒序的情况下，快速排序会退化成冒泡排序，这时每次选取的划界元素为最小值或最大值。

#### 归并排序

> 归并排序的原理大致可分为三步：
1. 分解：把待排序的 n 个元素的序列分解成两个子序列, 每个子序列包括 n/2 个元素
2. 治理：对每个子序列分别调用归并排序MergeSort, 进行递归操作
3. 合并：合并两个排好序的子序列,生成排序结果

具体实现代码如下：

```
public void sort(int[] nums, int low, int height) {
        int mid = (low + height) / 2;
        if (low < height) {
            sort(nums, low, mid);
            sort(nums, mid + 1, height);
            merge(nums, low, mid, height);
        }
    }

    private void merge(int[] nums, int low, int mid, int height) {
        int[] temp = new int[height - low + 1];
        int i = low;
        int j = mid + 1;
        int index = 0;
        while (i <= mid && j <= height) {
            if(nums[i] < nums[j]) {
                temp[index ++] = nums[i ++];
            } else {
                temp[index ++] = nums[j ++];
            }
        }
        while (i <= mid) {
            temp[index ++] = nums[i ++];
        }
        while (j <= height) {
            temp[index ++] = nums[j ++];
        }
        for (int n = 0; n < temp.length; n ++) {
            nums[low + n] = temp[n];
        }
    }
```


### Java中排序算法的默认实现

#### Arrays.sort

当我们调用了这个方法的时候，实际上这个方法会根据当前传入的参数是基本类型的数组还是对象数据来选择不同的排序策略

##### 当为基本类型的数组时

判断数组当中的元素是否超过了使用插入排序的阙值，若超过了，则使用双轴快排进行排序，否则则使用插入排序。

> 双轴快排对普通的快速排序进行了优化，每次选取两个划界元素，且会把与划界元素相近的指放在它附近

##### 当为Object数组时

采用归并排序
