---
title: Java中内置的设计模式-观察者模式
date: 2018-1-17 12:02:04
categories: 设计模式
---

> 观察者模式是jdk中内置的模式，也是使用频率最为广泛的设计模式之一，著名的开源项目如RxJava、EventBus中都能够看到它的影子，甚至在跨进程通信中，我们也经常用到观察者模式

这里只举例一个使用jdk中内置观察者模式的例子：公众号发推送的例子，公众号发文章后，每个订阅该公众号的用户都会得到推送

#### 观察者

```
public class User implements Observer {
    private String Name;
    public User(String Name) {
        this.Name = Name;
    }
    @Override
    public void update(Observable o, Object arg) {
        System.out.println( Name + " 收到新推送：" + arg);
    }
}
```

注意，update函数中的arg即为被观察者发送出的消息，在这个例子中就是公众号发出来的消息

#### 被观察者：推送消息

```
public class GongZhongHao extends Observable {
    public void push(String content) {
        setChanged();
        notifyObservers(content);
    }
}
```
setChanged和notifyObservers两个函数要一起使用

#### 具体使用

```
public class Main {
    public static void main(String[] args) {
        User user1 = new User("User1");
        User user2 = new User("User2");
        User user3 = new User("User3");
        GongZhongHao gongZhongHao = new GongZhongHao();
        gongZhongHao.addObserver(user1);
        gongZhongHao.addObserver(user2);
        gongZhongHao.addObserver(user3);
        gongZhongHao.push("比特币大跌");
    }
}
```

结果如下：

![1.PNG](https://i.loli.net/2018/01/14/5a5ab91bc778d.png)


