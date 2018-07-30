---
title: Android事件分发机制总结
date: 2018-07-30 21:18:56
categories: Android
---

> Android中的事件分发机制是我们实现触摸反馈、拦截等等的基础，了解了事件分发机制，对于触摸反馈事件失灵、多点触控等等的实现和疑难解决，都有一个敏感的认知。

#### 一切的开始: Activity的处理

当我们的Android手机接收到手指的触摸动作的时候，手机会把这个动作包装成 *MotionEvent* ，之后这个 *MotionEvent* 事件会首先被Activity处理，源码如下：

![1.png](https://i.loli.net/2018/07/30/5b5f15e0bc0e6.png)

从这里可以看到，首先这个事件会被Activity的 *dispatchTouchEvent* 处理，如果这个 *dispatchTouchEvent* 返回了true，则代表事件被消费了，如果这个事件没有被消费，则会被Activity中的 *onTouchEvent* 处理。

#### ViewGroup与View的dispatchTouchEvent

在Activity中，事件是先被getWindow的superDispatchTouchEven方法处理掉的，那么这个superDispatchTouchEvent方法干了什么呢？其实就是把这个事件交给DecorView处理，然后DecorView再把这个事件通过自己的dispatch方法来进行传递，具体逻辑可用这段伪代码表示:

```
public boolean dispatchTouchEvent(MotionEvent ev) {
        if (onInterceptTouchEvent(ev)) {
            return super.dispatchTouchEvent(ev);
        }
        if (touchTargets == null) {
            return super.dispatchTouchEvent(ev);
        }  else {
            //遍历touchTargets，寻找能够处理这个事件的view
            if (view.dispatchTouchEvent(ev)) {
                return true;
            } else {
                return super.dispatchTouchEvent(ev);
            }
        }
    }
```

首先，*ViewGroup* 会使用自己的 *onInterceptTouchEvent* 方法来判断是否要拦截这个事件，如果要拦截（即方法返回true),则使用自己的 *super.onTouchEvent* 方法进行处理，如果不拦截，则查看这个点击事件是否落在了它包含的某个View上（这是用TouchTargets来记录的，TouchTargets我们可以认为是一个链表结构，用来记录每个view的被点击位置），遍历TouchTargets就可以得到被点击的具体是那个View，然后调用这个View的 *dispatchTouchEvent* 来对它进行处理，如果事件还是没有被消费或者没有被点击的view，则调用 *super.dispatchTouchEvent* 进行处理。

看到这里可能就有些懵了，view的dispatchTouchEvent和super.dispatchTouchEvent，看着就烦心，其实，这两个的具体实现是一样的，因为ViewGroup的父类就是View，而View的dispatchTouchEvent方法可用如下伪代码表示：

```
public boolean dispatchTouchEvent(MotionEvent ev) {
        if (null == onTouchListener) {
            return onTouchEvent(ev);
        } else {
            if (onTouchListener.onTouchEvent(ev)) {
                return true;
            }
        }
        return onTouchEvent(ev);
    }
```

首先View的dispatchTouchEvent方法会先检查有没有设置OnTouchListener，如果设置了，则先用OnTouchListener来对这个事件进行处理，处理后事件没有被消费，则再调用自己的onTouchEvent对事件进行处理，如果没有设置OnTouchListener，则直接调用OnTouchEvent进行处理。

如果ViewGroup里面包含的不是View而是ViewGroup呢？ 那就是相当于一个递归调用了，就是再把事件交给里面的ViewGroup处理的过程了。

#### 总结

事件分发概括为：

* Activity把事件传递给Window，Window再把事件交给包裹的ViewGroup
* ViewGroup通过DispatchTouchEvent方法对事件进行分发
    * 使用OnIntercept方法判断是否对事件进行拦截， 拦截则直接调用super.dispatchTouchEvent方法（即View的dispatchTouchEvent）
    * 不拦截则查看有没有包裹的view能处理这个事件，有则调用这个View的dispatchTouchEvent进行处理
    * 没有View对事件进行处理，则调用super.dispatchTouchEvent处理并返回
* 没有View或ViewGroup消费事件，事件最终由Activity.onTouchEvent处理
