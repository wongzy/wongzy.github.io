---
title: Kotlin之码上开学课后习题（不时更新）
date: 2019-08-21 21:07:03
categories: Kotlin
---

马上开学地址为[链接](https://kaixue.io/)

# Kotlin 的变量、函数和类型

## 使用 Android Studio 创建一个基于 Kotlin 的新项目（Empty Activity），添加一个新的属性（类型是非空的 View），在 onCreate 函数中初始化它。

kotlin如果需要创建非空的属性，我们需要用到*lateinit*关键字，代码如下：

```kotlin
package com.example.kotlinkaixue

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View

class MainActivity : AppCompatActivity() {

    private lateinit var view : View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        view = findViewById(R.id.view)
    }
}
```

## 声明一个参数为 View? 类型的方法，传入刚才的 View 类型属性，并在该方法中打印出该 View? 的 id。

代码如下：

```kotlin
package com.example.kotlinkaixue

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View

class MainActivity : AppCompatActivity() {

    private var view : View? =  null
    private val TAG = MainActivity::class.java.name

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        view = findViewById(R.id.view)
        Log.i(TAG, view?.id.toString())
    }
}
```

打印出的日志如下：

```
2019-08-23 21:14:49.736 6126-6126/com.example.kotlinkaixue I/com.example.kotlinkaixue.MainActivity: 2131165328
```

# Kotlin 里那些「不是那么写的」

## 创建一个 Kotlin 类，这个类需要禁止外部通过构造器创建实例，并提供至少一种实例化方式。

```kotlin
class kotlinKaixue private constructor() {
    companion object {
        private val instance = kotlinKaixue()
        fun getInstance() : kotlinKaixue {
            return instance
        }
    }
}
```

> 这实际上是一种饿汉式单例的写法，但是它保证了线程安全