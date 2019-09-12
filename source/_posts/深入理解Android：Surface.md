---
title: 深入理解Android：Surface
date: 2019-09-12 21:06:15
categories: 深入理解Android系列丛书学习
---

# 总体关系

Surface是Android中的图像系统，我们将通过以下两点来对它进行学习：

1. 应用程序和Surface的关系

2. Surface和SurfaceFlinger之间的关系

两个图表明了这两点：

![surface系统两个关系.PNG](https://i.loli.net/2019/09/12/QvyimP9dO4Xw1NI.png)

左图表示了应用程序和Surface之间的关系，可以发现，不论是使用Skia绘制二维图像，还是用OpenGL绘制三维图像，最终Application都要和Surface交互。Surface就像是UI的画布。而App则像是在Surface上作画。

右图表示了Surface和SurfaceFlinger的关系。Surface向SurfaceFlinger提供数据，而SurfaceFlinger则混合数据。
