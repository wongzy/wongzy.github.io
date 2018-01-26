---
title: OpeningStartAnimation - Android开屏动画view
date: 2017-12-26 12:02:04
categories: Android开源
---
#### 项目地址
https://github.com/JoshuaRogue/FancyView
#### 使用后效果如下：
![这里写图片描述](http://img.blog.csdn.net/20171218134614196?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![这里写图片描述](http://img.blog.csdn.net/20171218134631999?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![这里写图片描述](http://img.blog.csdn.net/20171218134644097?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![这里写图片描述](http://img.blog.csdn.net/20171218134705691?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
使用方法：
1.  在项目中添加依赖
```
compile 'site.gemus:openingstartanimation:1.0.0' //在gradle中导入项目
```
2.  使用
> OpeningStartAnimation.Builder(Context context)  //context为当前活动的baseContext

> OpeningStartAnimation.show(Activity mactivity) //mactivity为当前显示的activity
```
OpeningStartAnimation openingStartAnimation = new OpeningStartAnimation.Builder(this)
                        .create();
                openingStartAnimation.show(this);
```
##### 默认的效果为图1，可使用**Builder.setDrawStategy()** 方法指定其他三种效果，图2、3、4分别对应了RedYellowBlueDrawStrategy，LineDrawStrategy和RotationDrawStrategy三种动画效果，也可以自定义接口实现动画，如下所示
```
OpeningStartAnimation openingStartAnimation = new OpeningStartAnimation.Builder(this)
                .setDrawStategy(new DrawStrategy() {
                    @Override
                    public void drawAppName(Canvas canvas, float fraction, String name, int colorOfAppName, WidthAndHeightOfView widthAndHeightOfView) {
                        
                    }

                    @Override
                    public void drawAppIcon(Canvas canvas, float fraction, Drawable icon, int colorOfIcon, WidthAndHeightOfView widthAndHeightOfView) {

                    }

                    @Override
                    public void drawAppStatement(Canvas canvas, float fraction, String statement, int colorOfStatement, WidthAndHeightOfView widthAndHeightOfView) {

                    }
                }).create();
```
#### 也可以通过其他set函数指定图标，应用名，应用一句话描述等等，如下所示
```
 OpeningStartAnimation openingStartAnimation = new OpeningStartAnimation.Builder(this)
                .setAppIcon() //设置图标
                .setColorOfAppIcon() //设置绘制图标线条的颜色
                .setAppName() //设置app名称
                .setColorOfAppName() //设置app名称颜色
                .setAppStatement() //设置一句话描述
                .setColorOfAppStatement() // 设置一句话描述的颜色
                .setAnimationInterval() // 设置动画时间间隔
                .setAnimationFinishTime() // 设置动画的消失时长
                .create();
```
##### 觉得好用的话别忘了赏个star哦，github地址如下
> https://github.com/JoshuaRogue/FancyView