---
title: android图片状态栏实现沉浸式状态栏
date: 2017-10-18 12:02:04
categories: Android
---
> 沉浸式状态栏实现起来的文章网上有很多了，不过再MD中有一个图片和toolbar一起使用，还会产生过度效果的沉浸式状态栏，像下面这样
![这里写图片描述](http://img.blog.csdn.net/20171022162924742?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
> 标题栏XML代码如下
```
<android.support.design.widget.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="192dp"
        android:fitsSystemWindows="true">

        <android.support.design.widget.CollapsingToolbarLayout
            android:id="@+id/notification_background"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            app:contentScrim="?attr/colorPrimary"
            app:layout_scrollFlags="scroll|enterAlways|enterAlwaysCollapsed"
            android:fitsSystemWindows="true"
            app:layout_scrollInterpolator="@android:anim/decelerate_interpolator"
            app:toolbarId="@+id/toolbar">

            <ImageView
                android:id="@+id/app_bar_image"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:contentDescription="@string/background"
                android:scaleType="centerCrop"
                />

            <android.support.v7.widget.Toolbar
                android:id="@+id/toolbar"
                android:layout_width="match_parent"
                android:layout_height="?attr/actionBarSize"
                />
        </android.support.design.widget.CollapsingToolbarLayout>
    </android.support.design.widget.AppBarLayout>
```
####如果我们一直使用的是默认图片的画不需要担心，但如果图片是动态改变的，上面状态栏的颜色与下面图片的颜色就有可能会出现很不搭的情况，这个时候就应该动态改变状态栏的颜色了
##### 像下面的图片
![这里写图片描述](http://img.blog.csdn.net/20171022163410832?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 这个效果就是用Android supportV7包Graphics中的Palette实现的，它的作用就是将图片中存在的颜色提取出来，我们可以选择其中的任意一种颜色，具体代码如下
```
Palette.from(resource).generate(new Palette.PaletteAsyncListener() {
   @Override
   public void onGenerated(Palette palette) {
   Palette.Swatch swatch = palette.getMutedSwatch();
   int color;
   if (swatch != null) {
      color = swatch.getRgb(); //获取样本颜色
  } else {
      color = primaryColor; //提取样本失败则使用默认颜色
      }                                                                                                                                                         setThemeColor(color); //设置状态栏颜色，下文中会有具体实现
                        }
       });
```
#### 代码中resource是图片的Bitmap对象，swatch则为提取出来的色彩样本，我们这里getMutedSwatch()提取出的是柔和的色彩，当然，还有其他色彩可以选择，可以参考以下的文章
> http://www.jianshu.com/p/9fcf316031ba
#### 提取完颜色之后，我们就可以用它来设置状态栏的颜色的，改变状态栏颜色可以参考以下代码
```
package com.zhy.colorfulstatusbar;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.ViewGroup;

/**
 * Created by zhy on 15/9/21.
 */
public class StatusBarCompat
{
    private static final int INVALID_VAL = -1;
    private static final int COLOR_DEFAULT = Color.parseColor("#20000000");

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public static void compat(Activity activity, int statusColor)
    {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP)
        {
            if (statusColor != INVALID_VAL)
            {
                activity.getWindow().setStatusBarColor(statusColor);
            }
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP)
        {
            int color = COLOR_DEFAULT;
            ViewGroup contentView = (ViewGroup) activity.findViewById(android.R.id.content);
            if (statusColor != INVALID_VAL)
            {
                color = statusColor;
            }
            View statusBarView = new View(activity);
            ViewGroup.LayoutParams lp = new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                    getStatusBarHeight(activity));
            statusBarView.setBackgroundColor(color);
            contentView.addView(statusBarView, lp);
        }

    }

    public static void compat(Activity activity)
    {
        compat(activity, INVALID_VAL);
    }


    public static int getStatusBarHeight(Context context)
    {
        int result = 0;
        int resourceId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0)
        {
            result = context.getResources().getDimensionPixelSize(resourceId);
        }
        return result;
    }
}
```
> 注： 转载自 http://blog.csdn.net/lmj623565791/article/details/48649563
有了这个帮助类来帮助我们改变状态栏的颜色，实现起来就很简单了，实现如下
```
    private void setThemeColor(int mColor) {
        mNotificationBackground.setContentScrimColor(mColor);
        StatusBarCompat.compat(MainActivity.this, mColor);
    }
```
##### 注意， mNotificationBackground即为xml代码布局中CollapsingToolbarLayout的实例，这个设置是改变过渡时的颜色。