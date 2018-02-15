---
title: AsyncTask解析
date: 2018-02-15 10:48:01
categories: Android
---

在Android AsyncTask中有以下几个主要的函数：

* onPreExecute()
* doInBackground(Params...)
* onProgressUpdate(Progress...)
* onPostExecute(Result)

### 函数的作用及解析

#### onPreExecute()

这个方法是在主线程中执行的，一般在任务执行前做准备工作。

#### doInBackground(Params...)

这个方法是在*onPreExecute()* 中执行的，运行在线程池中，用来执行较为耗时的操作，在执行过程中可以调用publishProgress(Progress...values)来更新进度信息。

#### onProgressUpdate(Progress...)

这个方法在主线程中执行，当调用publishProgress(Progress...value)时，此方法会将进度更新到UI组件上。

这个方法实际上是线程池执行任务过程中的回调，用来显示当前的进度。

#### onPostExecute(Result result)

在主线程中执行，当后台任务执行完成后，它会被执行。也就是在线程池完成任务后的回调。

### 其他：与设计模式相关

我们在使用AsyncTask执行后台任务的时候会这样：

```
new ConcreteAsyncTask().execute; //ConcreteAsyncTask即为我们定义的后台工作类
```

而实际上，execute方法其实是一次模板方法模式的使用，在execute规定好了各个函数的执行顺序。

