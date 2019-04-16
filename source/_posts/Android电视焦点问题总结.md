---
title: Android电视焦点问题总结及按钮事件分发
date: 2019-04-16 15:09:01
categories: Android
---

# 焦点的获取

在Android的电视上，操作与手机很不相同，手机上我们可以用手指来选择自己想要点击的控件，但是在Android电视上，我们只能通过焦点来选择自己想要选择的控件，而且必须做一些工作来让选择变得更加明显。

控件如果想要获得焦点，则要在xml文件中加上这句：

```
android:focusable="true"
```

> 注意，一些控件，例如imageView必须设置这个属性，因为默认的属性为false

电视上最让人抓狂的就是控件抢焦点的问题，如果不想让控件获得焦点，一定得在该控件的属性里加上

```
android:focusable="false"
```

## RecyclerView中子控件获取不到焦点的问题

在RecyclerView中，如果不进行设置，焦点可能永远都会被RecyclerView抢占，解决方法只需要在控件中加入这句：

```
android:descendantFocusability="afterDescendants"
```

这个属性值总共有三种，分别是

* beforeDescendants：viewgroup会优先其子类控件而获取到焦点
* afterDescendants：viewgroup只有当其子类控件不需要获取焦点时才获取焦点
* blocksDescendants：viewgroup会覆盖子类控件而直接获得焦点

可根据需要自己设置，例如在最顶层的控件中用使用blocksDescendants，那么所有只有顶层布局才能获得焦点。

# 按钮事件分发

当控件获得焦点时，我们可以通过重写onKeyDown方法来对事件进行处理，这个处理与onTouchEvent类似。但与手机上事件分发不同的是，电视上ViewGroup没有拦截事件的函数，因为电视上的操作没有像手机上那么复杂，需要处理滑动等等。

当该控件处理完事件时，返回true，代表该事件被消费掉了，返回false则将这个事件交给其他的控件处理。