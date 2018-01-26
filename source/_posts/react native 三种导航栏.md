---
title: react native的navigation实现
date: 2017-12-27 12:02:04
categories: react native
---

> 在react native的开发中，我们不需要像在原生开发一样使用intent来切换各个Activity，也能很方便地实现viewpager和抽屉式导航栏的效果，facebook官方提供了三种导航栏样式

#### 第一种:StackNavigator,这个导航栏和我们在原生开发中使用intent启动另一个全屏的Activity是差不多的效果，当然动画效果可能并不怎么一样

 实现代码如下：

```
const RootNavigator = StackNavigator({
  first: {
    screen: first,
    navigationOptions: {
      headerTitle: 'first', // 设置页面的header
    },
  },
  second: {
    screen: second,
    navigationOptions: {
      headerTitle: 'second',  // 设置页面的header
    },
  },
});
```

> first和second就是两个class了..

##### 如果需要在两个页面之间跳转，我们只需要在设置一个按钮，把按钮的点击事件设置为跳向下一个页面就可以了，如下：

```
<Button
      onPress={() => navigation.navigate('second')}
      title="to second"
    />
```

> 这样点击按钮就会跳转到second页面了，同理也可以在second页面中设置按钮跳转

#### 第二种：TabNavigator，这就是和viewpager同样效果的导航栏了

只需要把第一种的StackNavigator换成TabNavigator就可以，像这样：

```
const RootNavigator = StackNavigator({
  first: {
    screen: first,
    navigationOptions: {
      headerTitle: 'first', // 设置页面的header
    },
  },
  second: {
    screen: second,
    navigationOptions: {
      headerTitle: 'second',  // 设置页面的header
    },
  },
});
```

> 效果图如下：

![2.png](https://i.loli.net/2017/12/24/5a3f6304b03d2.png)

#### 第三种：DrawerNavigator，抽屉式导航栏

和上面一样，只需要替换成DrawerNavigator就可以了，代码就不放出来了，效果如下：

![1.jpg](https://i.loli.net/2017/12/24/5a3f5ce35c908.jpg)


