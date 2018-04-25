---
title: 类与示例的初始化顺序
date: 2018-04-25 09:34:08
categories: Java
---

> 在Java中，static修饰符一直都是很重要的知识点，特别是当它修饰为一个静态代码块的时候，还有它被用来修饰变量的时候，当发生继承关系或者是内部类关系的时候，我们这里分几种情况进行讨论

#### 当发生继承关系的时候

如：

```
public  class SuperClass {
    private static int superInt = 12345;
    static {
        System.out.println("Super Class init! superInt = " + superInt);
    }

    {
        System.out.println("Super Class non-static init!");
    }

    public SuperClass() {
        System.out.println("SuperClass Build Method work!");
    }

    public static final void show() {
        System.out.println("SuperClass show()");
    }

    public void doIt() {
        System.out.println("SuperClass do it!");
    }
}
```

```
public final class SonClass extends SuperClass {
    private static  int sonInt = 987654321;
    static {
        System.out.println("Son Class static init! sonInt = " + sonInt);
    }

    {
        System.out.println("Son Class non-static init!");
    }

    public SonClass() {
        System.out.println("SonClass Build Method work!");
    }

    public static final void showT() {
        System.out.println("SonClass show()");
    }

    @Override
    public void doIt() {
        System.out.println("SonClass do it!");
    }
}
```

在这里定义了一个静态函数，而静态函数是属于类的，而并不属于示例，我们可以通过一下两个方式验证
1. 当使用静态函数的时候

```
public static void main(String[] args) {
        SonClass.showT();
    }
```

结果为

![捕获0.PNG](https://i.loli.net/2018/04/25/5adfe2da8ad3c.png)

2. 当new对象的时候

```
public static void main(String[] args) {
        SonClass sonClass = new SonClass();
        sonClass.doIt();
    }
```

结果为

![捕获1.PNG](https://i.loli.net/2018/04/25/5adfe3e1d37c2.png)

3. 两种情况全部存在的时候

```
public static void main(String[] args) {
        SonClass.showT();
        SonClass sonClass = new SonClass();
        sonClass.doIt();
    }
```

结果为

![捕获2.PNG](https://i.loli.net/2018/04/25/5adfe5ca17d7b.png)

##### 结论

当使用静态函数的时候，先初始化父类的静态变量，然后执行父类的静态代码块，然后再是子类的静态变量，静态代码块。当我们构造出一个对象的时候，也是先进行类的初始化，同上，在初始化完静态变量后，先是执行父类的非静态变量，然后是非静态代码块，最后才是父类的构造函数，然后是子类的这个过程，具体如下：

1. 父类的静态变量及静态代码块
2. 子类的静态变量及静态代码块
3. 父类的非静态变量、非静态代码块、构造函数
4. 子类的非静态变量、非静态代码块、构造函数

这里我们还可以得出的结论有

> 类的初始化只有一次，若实例化对象的时候，类已经进行了初始化，则不需要再重复进行

还有静态常量等在程序初始化的时候就已经初始化了，这是必须知道的。

#### 静态内部类与非静态内部类

静态内部类如下：

```
public static final class SonInner {
        private static int sonInnerInt = 5;
        static {
            System.out.println("SonInner Class init! sonInnerInt = " + sonInnerInt);
        }

        public static final void showI() {
            System.out.println("SonInner Class show()");
        }
    }
```

这个类是在SonClass中的，我们可以实验一下

```
public static void main(String[] args) {
        SonClass.SonInner.showI();
    }
```

结果为：

![捕获3.PNG](https://i.loli.net/2018/04/25/5adfea1778035.png)

##### 结论

静态内部类的初始化不依赖外围类的初始化。

若是非静态内部类，则会发现在内部类中不能使用静态代码块与静态函数，只能先创建外围类再创建内部类

这时的初始化过程如下：

1. 先按照父类子类的顺序初始化外围类
2. 初始化内部类的非静态变量、非静态代码块、非静态函数

> 最后还需要注意的是，我们在静态函数中只需要定义函数是static的，不需要再加final关键字修饰

