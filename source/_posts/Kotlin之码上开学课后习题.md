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

## 分别用 Array、IntArray、List 实现 「保存 1-100_000 的数字，并求出这些数字的平均值」，打印出这三种数据结构的执行时间。

代码如下：

```kotlin
import java.math.BigDecimal

fun main() {
    val maxNum = 1000_000;
    fun testArray() {
        val startTime = System.currentTimeMillis();
        val array: Array<Int> = Array(maxNum) {
            it.inc()
        }
        var sum = 0
        for (i in array) {
            sum += i
        }
        val avg = BigDecimal(sum).divide(BigDecimal(array.size))
        val duration = System.currentTimeMillis() - startTime
        println("Array: avg = $avg, duration = $duration ms")
    }
    fun testIntArray() {
        val startTime = System.currentTimeMillis()
        val intArray: IntArray = IntArray(maxNum) {
            it.inc()
        }
        var sum = 0
        intArray.forEach {
            sum += it
        }
        val avg = BigDecimal(sum).divide(BigDecimal(intArray.size))
        val duration = System.currentTimeMillis() - startTime
        println("IntArray: avg = $avg, duration = $duration ms")
    }
    fun testList() {
        val startTime = System.currentTimeMillis()
        val list : List<Int> = List(maxNum) {
            it.inc()
        }
        var sum = 0
        list.forEach {
            sum += it
        }
        val avg = BigDecimal(sum).divide(BigDecimal(list.size))
        val duration = System.currentTimeMillis() - startTime
        println("list: avg = $avg, duration = $duration ms")
    }
    testArray()
    testIntArray()
    testList()
}
```

结果如下所示

```
Array: avg = 1784.293664, duration = 29 ms
IntArray: avg = 1784.293664, duration = 9 ms
list: avg = 1784.293664, duration = 35 ms
```

# Kotlin 里那些「更方便的」

## 请按照以下要求实现一个 Student 类：
1. 写出三个构造器，其中一个必须是主构造器
2. 主构造器中的参数作为属性
3. 写一个普通函数 show，要求通过字符串模板输出类中的属性

```kotlin
fun main() {
    val student = Student(23, true)
    student.show()
}

class Student constructor(var age:Int, val sex:Boolean) {

    var hobby : String ? = null

    constructor(person: Person) : this(person.age, person.sex)
    constructor(age: Int, sex: Boolean,hobby: String?) : this(age, sex) {
        this.hobby = hobby
    }

    fun show() {
        println("age = $age, sex = $sex, hobby = $hobby")
    }

}

class Person constructor(var age: Int, val sex: Boolean)
```

## 编写程序，使用今天所讲的操作符，找出集合 {21, 40, 11, 33, 78} 中能够被 3 整除的所有元素，并输出。

```kotlin


fun main() {
    val array = intArrayOf(21, 40, 11, 33, 78)
     val result = array.filter {
        it % 3 == 0
    }
    result.forEach {
        print("$it ")
    }
}
```

