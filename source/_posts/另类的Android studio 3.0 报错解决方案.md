---
title: 另类的Android studio 3.0 报错解决方案
date: 2017-11-25 12:02:04
categories: Android studio
---
#### 前几天手贱升级了3.0，结果第二天就报出了奇怪的错误，类似于下面这种
>Error:too many padding sections on bottom border.

> Error:com.android.tools.aapt2.Aapt2Exception: AAPT2 error: check logs for details
####  按照网上给的解决方案，在*gradle.properties* 中把*android.enableAapt2=false* 加进去，发现还是报错，这次换成了aapt报错
> Execution failed for task ':app:mergeDebugResources'. > Error: Some file crunching failed, see logs for details
####最后终于找到了问题的根源，就是9path图片的错误，Android studio对图片的要求很高，如果这里错了，很容易就报错了，把图片换掉之后aapt2也不会报错了