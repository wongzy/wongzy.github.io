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


## Activity的显示

一般来说，应用程序的外表是通过Activity来展示的。那么，Activity是如何完成界面绘制工作的呢？根据前面所讲的知识可知，应用程序的显示和Surface有关，那么具体到Activity上，它和Surface又是什么关系？

### Activity的创建

在收到创建Activity请求后，zygote进程在响应请求后会for一个子进程，这个子进程是App对应的进程，它的入口函数是ActivityThread类的main函数。

> main函数中也包括了初始化主线程（UI线程）Looper的逻辑

ActivityThread类中有一个handleLaunchActivity函数，它就是创建Activity的地方，代码如下所示：

```
private final void handleLaunchActivity(ActivityRecord r, Intent customIntent) {
//1.performLaunchActivity返回一个Activity
Activity a = perforLaunchActivity(r, customIntent);
if (a != null) {
r.createdConfig = new Configuaration(mConfigration);
Bundle oldState = r.state;
//2.调用handleResumeActivity
handleResumeActivity(r.token, false, r.isForward);
}
......
}
```

handleLaunchActivity函数中列出了两个关键点：

#### 创建Activity

第一个关键函数performLaunchActivity返回一个Activity，这个Activity就是App中的那个Activity（仅仅考虑App中只有一个Activity的情况），它的代码如下：

```
private final Activity performLaunchActivity(ActivityRecord r,Intent cusomIntent) {
Activity Info aInfo = r.activityInfo;
......//完成一些准备工作。
//Activity定义在Activity.java中
Activity activity = null;
try {
java.lang.ClassLoader cl = r.packageInfo.getClassLoader();
/*mInstrumentation为Instrumentation类型，
源文件为Instrumentation.java它在newActivity函数中根据Activity的类名通过Java反射机制来创建对应的Activity，
这个函数比较复杂*/
activity = mInstrumentation.newActivity(cl,component.getClassName(),r.intent);
r.intent.setExtrasClassLoader(cl);
if(r.state != null) {
r.state.setClassLoader(cl);
}
}catch(Exception e) {
......
}
try {
Application app = r.packageInfo.makeApplication(false, mInstrumentation);
if (activity != null) {
//在Activity中getContext函数返回的就是这个ContextImpl类型的对象
ComtextImpl appContext = new ContextImpl();
......
//下面这个函数会调用Activity的onCreate函数。
mInstrumentation.callActivityOnCreate(actvity, r.state);
......
return activity;
```

performLaunchActivity的作用有以下两点：

1. 根据类名以Java反射的方法创建一个Activity

2. 调用Activity的onCreate函数

在onCreate函数中，我们一般会调用setContentView函数，代码如下所示：

```
public void setContentView(View view) {
getWindow().setContentView(view);
}

public Window getWindow() {
return mWindow;//返回一个类型为Window的mWindow
}
```

下面来看一下window和view的两个概念：

* Window：Window是一个抽象基类，用于控制顶层窗口的外观和行为，它的作用是绘制背景和标题栏、默认的按键处理等。它将作为一个顶级的View加入到WindowManager中。

* View：View是一个基本的UI单元，占据屏幕的一块矩形区域，可用于绘制，并能处理事件。

那么Window是一个抽象类，它实际的对象是什么类型的？Window Manager究竟是什么？

Windows实际的创建在这段代码里面：

```
//利用PolicyManager来创建Window对象
mWindow = PolicyManager.makeNewWindow(this);
```

PolicyManager的代码如下：

```java
public final class PolicyManger{
private static final String POLICY_IMPL_CLASS_NAME = "com.android.internal.policy.impl.Policy";
private static final IPolicy sPolicy;
static {
//
try{
    Class policyClass = Class.forName(POLICY_IMPL_CLASS_NAME);
    //创建Policy对象。
    sPolicy = (IPolicy) policyClass.newInstace();
} catch (ClassNotFoundException e)  {

}
}
private PolicyManger() {
}
//通过Policy对象的makeNewWindow创建一个Window。
public static Window makeNewWindow(Context context) {
return sPolicy.makeNewWindw(context);
}
}
```

这里有一个单例的sPolicy对象，它是Policy类型的，定义如下：

```java
public class Policy implements  IPolicy {
private static final String TAG = "PhonePolicy";
private static final String[] preload_classes = new String[] {
"com.android.internal.policy.impl.PhoneLayoutInflater",
//......
};
//加载所有的类
static {
for (String s:preload_classes) {
    try{
        Class.forName(s);
    } catch (ClassNotFoundException ex) {
        ......
    }
}
}
public PhoneWindow makeNewWindow(Context context) {
//makeNewWindow返回的是PhoneWindow对象
return new PhoneWindow(context);
}
}
```

在这里就能确定了，mWindow对象实际上是一个PhoneWindow，而WindowManger的实际创建代码如下：

```
wm = WindowManager.getDefault();
mWindowManger = new LocalWindowManager(wm);
```

LocalWindowManager是在Window中定义的内部类，请看它的构造函数，定义如下：

```java
private class LocalWindowManager implements WindowManager {
LocalWindowManager(WindowManager wm) {
    mWindowManager = wm;
    mDefaultDisplay = mContext.getResources().getDefaultDisplay(
        mWindowManager.getDefaultDisplay());
}
}
```

wm的实际类型为WindowManagerImpl，他们的类关系如下：

![WindowManager.PNG](https://i.loli.net/2019/09/22/92akqKvLtngONM4.png)

从这个图可以得出以下结论：

* Activity的mWindow成员变量其真实类型是PhoneWindow，而mWindowManager成员变量的真实类型是LocalWindowManager。

* LocalWindowManager和WindowManagerImpl都实现了WindowManager接口。这里采用的是Proxy模式，表明LocalWindowManager将把它的工作委托给WindowManagerImpl来完成。

Activity的setContent函数实际上调用的是PhoneWindow的setContent函数，PhoneWindow的setContent函数如下所示：

```
public void setContentView(View view) {
//调用另一个setContentView
setContentView(view, new ViewLayoutParams(MATCH_PARENT,MATCH_PAENT));
}
public void setContentView(View view,ViewGroup.LayoutParams params) {
//mContentParaent为ViewGroup类型，它的初值为null
if（mContentParent == null {
installDecor();
} else {
mContentParent.removeAllViews();
}
//把view加入到ViewGroup中。
mContentParent.addView(view, params);
......
}
```

installDecor函数如下：

```
private void installDecor() {
if (mDeocr == null) {
//创建mDecor,它为DecorView类型，从FrameLayout派生
mDecor = generateDecor();
......
}
if (mContentParent == null) {
//得到这个mContentParent
mContentParent = generateLayout(mDecor);
//创建标题栏
mTitleView (TextView)findViewById(com.android.internal.R.id.title);
```

而generateLayout的作用就是获取对应的标题栏，然后将它加入到ViewGroup中，最后将ViewGroup返回。

PhoneWindow、WindowManager、DecorView的关系如下：

![window、phonewindow关系.PNG](https://i.loli.net/2019/09/22/N5E4Rz2diKeL3Hq.png)

从上图可以看出，在Activity的onCreate函数中，通过setContentView设置的View，其实只是DecorView的子View。DecorView还处理了标题栏显示等一系列的工作。


#### handleResumeActivity分析

```
final void handleResumeActivity(IBinder token, boolean clearHide, boolean isForward) {
boolean willBeVisible = !a.mStartedActivity;
if (r.window == null && !a.mFinished && willBeVisible) {
r.window = r.activity.getWindow();
//1.获得一个View对象
View decor = r.window.getDecorView();
decor.setVisibility(View.INVISIBLE);
//2.获得ViewManager对象。
ViewManager wm = a.getWindowManager();
......
//3.把刚才的decor对象加入到ViewManager中。
wm.addView(decor,I);
}
......//其他处理
}
```

在上文中，我们分析了DecorView和ViewManager等对象，那么最后的wm.addView（decor， I）是什么呢？实际上，这里创建了一个ViewRoot对象，并把刚刚的View设置到这个ViewRoot对象中。

* ViewRoot是什么？

ViewRoot实现了ViewParent接口，但是它不处理绘画，因为它没有onDraw函数。

ViewRoot的定义如下：

```java
public final class ViewRoot extends Handler implements ViewParent,View.Attachinfo.Callbacks {
private final Surface mSurface = new Surface();//这里创建了一个Surface对象
final W mWindow;//这个是什么？
View mView;
}
```

这个定义表达了三点：

1. ViewRoot继承了Handler类，看来它能处理消息。ViewRoot重写了handleMessage函数。

2. ViewRoot有一个成员变量叫mSurface，它是Surface类型

3. ViewRoot还有W类型的mWindow和一个View类型的mView变量

其中，W是ViewRoot定义的一个静态内部类：

```
static class W extends IWindow.Stub
```

这个类将参与Binder的通信。

其中，Surface是Android真正的画布，它包含了以下几点：

1. 有一块Raw buffer，至于是内存还是显存，不必管它。

2. Surface操作这块Raw buffer

3. Screen compositor（其实就是SurfaceFlinger）管理这块Raw buffer

Surface和SF、ViewRoot的关系图如下：

![画布工作原理.PNG](https://i.loli.net/2019/09/23/WVzh1ujvUMKAYe4.png)

这张图表达了以下几点：

1. ViewRoot有一个成员变量mSurface，它是Surface类型，它和一块RawBuffer有关联。

2. ViewRoot是一个ViewParent，它的子View的绘画操作，是在画布Surface上展开的。

3. Surface和SurfaceFlinger有交互

ViewRoot的构造如下：

```
public ViewRoot(Context context) {
super();
....
getWindowSession(context.getMainLooper());
......//ViewRoot的mWindow是一个W类型，注意它不是Window类型，而是IWindow类型
mWindow = new W(this, context);
```

getWindowsession函数，将建立Activity的ViewRoot和WindowManagerService的关系。代码如下所示：

```
ublic static IWindowSession getWindowSession(Looper mainLooper) {
synchronized(mStaticInit) {
if (!mInitialized) {
try {
InputMethodManager imm = InputMethodManager.getInstance(mainLooper);
//下面这个函数先得到WindowManagerService的Binder代理，然后调用它的OpenSession。
sWindowSession = IWindowManager.Stub.asInterface{
ServiceManager.getService("window")).openSession(imm.getClient(),imm.getInputContext());
mInitalized = true;
} catch (RemoteException e) {
}
}
return sWindowSession;
}
}
```

WindowManagerService由System_Server进程启动，SurfaceFligner也在这个进程中，Activity的显示还需要与WMS建立联系。