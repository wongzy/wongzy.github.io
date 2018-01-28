---
title: 设计模式的目标-面向对象的六大原则
date: 2018-01-28 12:24:09
categories: 设计模式
---

> 设计模式有六大原则，分别时单一职责原则、开放封闭原则、里氏替换原则、依赖倒置原则、迪米特原则和接口隔离原则，这些原则是设计模式的最终目标，不过并不是每一个设计模式都遵循了以上六个原则

#### 单一职责原则

##### 定义：就一个类而言，应该仅有一个引起它变化的原因

单一职责原则的划分界限并不是总是那么清晰，很多时候都需要依赖个人经验来界定，最大的问题就是对职责的定义，什么是类的职责，以及怎么划分类的职责。

一个类中应该是一组相关性很高的函数、数据的封装。

#### 开放封闭原则

##### 定义：类、模块、函数等应该是可以扩展的，但是不可修改

在软件开发过程中，最不会变化的就是变化本身，因为产品需要不断地升级、维护，而在这个过程中修改原来的代码就可能会引发其他的问题，所以，开闭原则的使用在这里就十分重要。

开闭原则主要是通过接口来实现，而不能是具体的类，下面举一个简单的例子。

1. 接口类
```
public interface ImageCache {
    Bitmap get(String url);
    void put(String url, Bitmap bitmap);
}
```

2. 接口实现类

```
public class StoreCache implements ImageCache {
    @Override
    public Bitmap get(String url) {
        return new Bitmap();
    }

    @Override
    public void put(String url, Bitmap bitmap) {
        System.out.println("put image");
    }
}
```

3. 依赖类

```
public class ImageLoader {
    ImageCache imageCache = new StoreCache();
}
```

> 在这个例子当中，ImageLoader类依赖于ImageCache接口，而不是依赖于具体的实现ImageCache接口的类，这样我们可以方便地进行扩展（继承ImageCache接口的类），而不是直接修改代码

#### 里氏替换原则

##### 定义：所有引用基类的地方必须能透明地使用其子类的对象

里氏替换原则简单来说就是父类出现的地方，替换成子类不会产生任何错误或异常，但是子类出现的地方，替换成父类就不一定能够适应，其实就是抽象的概念

可以举一个Android中View的例子

1. View：抽象父类

```
public abstract class View {
    public abstract void draw();
    public void measure(int width, int height){
    }
}
```

2. Button:具体子类

```
public class Button extends View{
    @Override
    public void draw() {
    }
}
```

3. 窗口类

```
public class Window{
   public void show(View child){
     child.draw();
    }
}
```

我们可以看到，窗口类中所使用的View类均可以无副作用地替换成Button子类
#### 依赖倒置原则

##### 定义：高层模块不应该依赖底层模块，两者都应该依赖于抽象。抽象不应该依赖于细节，细节应该依赖于抽象

依赖倒置原则就是在类中不应该依赖具体的类，而是应该依赖于抽象，具体的例子其实在开闭原则中已经有了，关键就在于以下代码

```
ImageCache imageCache = new StoreCache();
```

#### 迪米特原则

##### 定义：一个软件实体应当尽可能少地与其他实体发生相互作用

如果两个对象之间不必彼此直接通信，那么这两个对象就不应当发生任何直接的相互作用，如果其中的一个对象需要调用另一个对象的某一个方法，则可以通过第三者转发这个调用，简言之，就是引入一个合理的第三者来降低现有对象之间的耦合度

#### 接口隔离原则

##### 定义：一个类对另一个类的依赖应该建立在最小的接口上

接口原则说白了就是，客户端依赖的接口经可能地小，臃肿的接口拆分成更小的和更具体的接口，在实际的运用当中就是：将一个包含有多个函数的接口拆分成多个，将函数一分为几，被分到同一接口的函数职责更为单一。
