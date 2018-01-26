---
title: 自定义ViewGroup之扩展FloatingActionButton
date: 2017-10-02 21:19:08
categories: Android
---
> 本文主要是实现一个ViewGroup容器，并实现在内部自由放置FloatingActionButton，与各种FloatingActionButton开源库不同的是只侧重基础的实现，但实际效果还算美观。

#### 效果图如下所示
![效果图](http://img.blog.csdn.net/20171015184457415?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

#### 首先，我们先实现一个类似于竖直排布的线性布局的ViewGroup，创建一个FloatingActionButtonMenu类集成ViewGroup
##### 第一步 获得父类的arginLayoutParams，这里直接使用系统自带attrs就可以了，要注意的是方法返回值必须为ViewGroup.LayoutParams，否则在运行时会报错，这与我们直接按ctrl+o选择的结果不一样。

```
@Override
public ViewGroup.LayoutParams generateLayoutParams(AttributeSet attrs) {
        Log.d(tag, "generateLayoutParams");
        return new MarginLayoutParams(getContext(), attrs);
  }
```
##### 第二步，重写onMeasure方法，这一步主要时得到我们实现的ViewGroup最后所占的空间，属性中match_parent与wrap_parent所对应的分别是MeasureSpec.EXACTLY和MeasureSpec.AT_MOST
```
@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // 获得此ViewGroup上级容器为其推荐的宽和高，以及计算模式
        // 所得既为设置match_parent时的大小
        Log.d(tag, "onMeasure");
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);
        int sizeWidth = MeasureSpec.getSize(widthMeasureSpec);
        int sizeHeight = MeasureSpec.getSize(heightMeasureSpec);
        // 计算出所有的childView的宽和高
        measureChildren(widthMeasureSpec, heightMeasureSpec);
        // 记录如果是wrap_content是设置的宽和高
        int childCount = getChildCount();
        MarginLayoutParams layoutParms = null;
        //宽为各个子View的最大值，高为总和
        int width = 0, height = 0;
        for (int i = 0; i < childCount; i++) {
            View childView = getChildAt(i);
            layoutParms = (MarginLayoutParams) childView.getLayoutParams();
            int cWidth = childView.getMeasuredWidth() + layoutParms.rightMargin + layoutParms.leftMargin;
            int cHeight = childView.getMeasuredHeight();
            if (cWidth > width) {
                width = cWidth;
            }
            height += cHeight + layoutParms.bottomMargin + layoutParms.topMargin;
        }
        /**
         * 若为match_parent则将宽高设置为上级推荐的大小
         * 否则则设置为计算出的大小，即为wrap_parent
         */
        setMeasuredDimension((widthMode == MeasureSpec.EXACTLY)
                ? sizeWidth : width, (heightMode == MeasureSpec.EXACTLY)
                ? sizeHeight : height);
    }
```
##### 第三步，重写onLayout函数，这个函数主要是制定容器中各个view相对于容器的位置，这里需要注意的是在进行计算时尽量使用子view的属性，用容器的属性进行计算可能会得到无法显示的结果
> 四个点坐标的位置如下图所示
![这里写图片描述](http://img.blog.csdn.net/20171002210536111?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
##### 我们这里所实现的布局类似于叠罗汉，在xml文件中最下面的控件，在容器中就是在最底部，在这里我还使除了控制按钮之外的所有view变为透明状态同时不可点击，这样做主要是使动画更容易实现
```
@Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        Log.d(tag, "onLayout");
        int cCount = getChildCount();
        MarginLayoutParams layoutParams;
        /**
         * 遍历所有childView根据其宽和高
         * 指定相应位置
         */
        int height = 0;
        for (int i = 0; i < cCount; i++) {
            View childView = getChildAt(i);
            layoutParams = (MarginLayoutParams) childView.getLayoutParams();
            int cl = layoutParams.leftMargin;
            int cr = cl + childView.getMeasuredWidth();
            int ct = layoutParams.topMargin + height;
            int cb = ct + childView.getMeasuredHeight();
            childView.layout(cl, ct, cr, cb);
            height += childView.getMeasuredHeight() + layoutParams.bottomMargin;
            //使上面的子view全都不可见
            if (i != cCount- 1){
                childView.setAlpha(0f);
                childView.setClickable(false);
            }
        }
        state = HIDE;
        setClick(getChildAt(cCount- 1));
    }
```
> 在最后面实现的函数是把最底部的view作为一个开关，由它来控制其他子view是否可见
##### 点击事件函数如下
```
 public void setClick(final View view){
        view.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                if (state == HIDE) {
                    //当状态为不可见时，点击按钮弹出所有隐藏view
                    ObjectAnimator animator = ObjectAnimator.ofFloat(view, "rotation", 0f, rotation);
                    animator.setDuration(duration);
                    animator.start();
                    for (int i = 0; i< getChildCount() - 1; i++){
                        View childView = getChildAt(i);
                        //实现淡入效果
                        ObjectAnimator chlidanimator = ObjectAnimator.ofFloat(childView, "alpha", 0f, 1f);
                        //实现拉伸效果
                        ObjectAnimator otheranimator = ObjectAnimator.ofFloat(childView, "scaleX", 1.0f, 1.2f, 1.0f);
                        otheranimator.setDuration(400);
                        chlidanimator.setDuration(400);
                        otheranimator.start();
                        chlidanimator.start();
                        childView.setClickable(true);
                        state = SHOW;
                    }
                } else {
                    //当状态为可见时，点击按钮隐藏所有view
                    ObjectAnimator animator = ObjectAnimator.ofFloat(view, "rotation", rotation, 0f);
                    animator.setDuration(duration);
                    animator.start();
                    for (int i = 0; i< getChildCount() - 1; i++){
                        View childView = getChildAt(i);
                        ObjectAnimator chlidanimator = ObjectAnimator.ofFloat(childView, "alpha", 1f, 0f);
                        chlidanimator.setDuration(400);
                        chlidanimator.start();
                        childView.setClickable(false);
                        state = HIDE;
                    }
                }
            }
        });
    }
```
#### XML代码如下
```
<com.android.betterway.myview.FloatingActionButtonMenu
        xmlns:android="http://schemas.android.com/apk/res/android"
        android:layout_width="wrap_content"
        android:layout_height="172dp"
        android:layout_gravity="bottom|right"
        android:background="#00000000"
        android:layout_margin="15dp"
      >

        <android.support.design.widget.FloatingActionButton
            android:id="@+id/floatingActionButton7"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_margin="10dp"
            android:clickable="true"
            android:elevation="4dp"
            app:fabSize="mini"
            app:srcCompat="@drawable/ic_action_addsmart"
            fab:backgroundTint="@color/primary_light"/>

        <android.support.design.widget.FloatingActionButton
            android:id="@+id/floatingActionButton6"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_margin="10dp"
            android:clickable="true"
            app:fabSize="mini"
            app:srcCompat="@drawable/ic_action_addnormal"
            fab:backgroundTint="@color/primary_light"
            fab:elevation="4dp"/>
        <android.support.design.widget.FloatingActionButton
            android:id="@+id/floatingActionButton5"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_margin="4dp"
            android:clickable="true"
            app:fabSize="normal"
            fab:elevation="5dp"
            app:srcCompat="@drawable/ic_action_add"
            fab:backgroundTint="@color/accent"/>
    </com.android.betterway.myview.FloatingActionButtonMenu>
```