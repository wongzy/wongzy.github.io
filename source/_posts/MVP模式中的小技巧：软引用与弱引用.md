---
title: MVP模式中的小技巧：软引用与弱引用
date: 2017-11-6 12:02:04
categories: 设计模式
---
> 在MVP当中，过多的类导致了内存控制十分困难，而强引用又很容易导致OOM（GC时不会回收被强引用持有的对象），在这个时候就轮到其他的两中对象引用的方式：软引用与弱引用登场了（虚引用几乎不会被用到）
#### 介绍
##### 软引用
>  在系统内存不够时，会回收被软引用持有的对象，引用方法如下
```
//T可代表任何对象
SoftReference<T> reference = new SoftReference<T>(t0);
T t1 = reference.get();
```
###### 这里表示t1持有t0的弱引用
##### 弱引用
> 每次系统运行垃圾清理（GC）时都会回收被弱引用持有的对象，引用方法如下，和软引用类似
```
WeakReference<T>  reference = new WeakReference<T>(t0);
T t1 = reference.get();
```
### 在MVP模式中，Presenter可能会需要引用Activity的引用，在这里我们就可以使用这两种方式来防止内存泄漏了，如在View层的接口定义了一个getACtivity（）函数，则在Activity中实现的时候可以这么写
```
@Override
    public Activity getActivity() {
WeakReference<Activity> weakReference = new WeakReference<Activity>(this);
return weakReference.get();
}
```
#### 我们也可以用一个ArrayList来控制weakReference，这样可以避免频繁地new WeakReference，具体代码如下
```
private List<WeakReference<Activity>> mWeakReferenceList = new ArrayList<WeakReference<Activity>>();
```
```
@Override
    public Activity getActivity() {
        if (mWeakReferenceList.size() == 0) {
            WeakReference<Activity> weakReference = new WeakReference<Activity>(this);
            mWeakReferenceList.add(weakReference);
            return weakReference.get();
        } else {
            WeakReference<Activity> weakReference = mWeakReferenceList.get(0);
            LogUtil.v(TAG, "list woeked!");
            return weakReference.get();
        }
    }
```
####运行时可看到打印日志
![这里写图片描述](http://img.blog.csdn.net/20171015205034526?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
##### 成功运行了
#### 如上，如有错误，恳请指出
