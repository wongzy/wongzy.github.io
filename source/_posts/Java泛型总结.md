---
title: Java泛型总结
date: 2019-07-14 14:25:30
categories: Java
---

## 从HashMap看泛型

泛型其实在我们编写代码的时候会经常用到，但是我们一般不会想到这原来就是在使用泛型，例如下面这个例子。

```
Map<String, Integer> map = new HashMap<>();
```

其实就就是很典型的一个泛型的使用，我们使用的Map接口如下：

```
public interface Map<K,V> {
....
}
```

而HashMap类是这样的。

```
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {
    }
```

HaspMap继承了AbstractMap和Map，同时也让泛型的类型得以保留。泛型的具体写法见后续章节。

## 泛型类和泛型接口的创建

```
public class Store<T> {

    public Store() {
    }
    
    public T buy() {
        return (T)(new Object());
    }
    
    public float re(T object) {
        return object.hashCode();
    }
}
```

我们可以看到，创建的Store类里面有两个方法，一个Buy方法可以返回泛型的类型，而re方法可以返回的是float类型，我们可以这样创建这个类

```
Store<String> store = new Store<>();
```

可以看到，其实我们在Store的构造方法当中并没有指定*T*到底是哪个参数类型，但是在创建的时候，可以通过等号左边的变量来确定*T*到底是哪个参数。

泛型接口的写法可以参考下，其实和类的写法没有什么不同。

```
public interface IStore<T> {
    public T bug();
    float re(T object);
}
```

我们也可以把两个结合一下，写成下面这样。

```
public class Store<T> implements IStore<T> {
    @Override
    public T bug() {
        return null;
    }

    @Override
    public float re(T object) {
        return 0;
    }
}
```

注意，泛型不一定要用*T*声明，也可以用其他的字母进行声明，而且继承接口字母不一定要与接口中的写的一样，也能够进行泛型的继承。如下：

比如说像下面这样写也是可以的。

```
public class Store<E> implements IStore<E> {
    @Override
    public E bug() {
        return null;
    }

    @Override
    public float re(E object) {
        return 0;
    }
}
```

> 注意，E也可以是一个具体的类型，不一定非要继承泛型。

上面阐述的是单泛型类的写法，如果遇到多泛型的，我们可以这样写。

```
public class Store<E, F> implements IStore<E> {
    @Override
    public E bug() {
        return null;
    }

    @Override
    public float re(E object) {
        return 0;
    }
    
    public F buy2() {
        return null;
    }
}
```

这样，我们的Store类就比IStore又多了一个泛型参数F。


## extends与super的用法

### extends

extends在类中声明，可以对泛型参数进行约束，表述此泛型必须为extends后类型的子类

```
public class Store<E, F extends String> implements IStore<E> {
    @Override
    public E bug() {
        return null;
    }

    @Override
    public float re(E object) {
        return 0;
    }
}
```


```
Store<Integer, String> store = new Store<>();
```

在此处代码左边我们可以看到，我声明的数据类型是String，满足了条件，但是如果我们用其他不是String子类的类型的话，编译器就会报错。

同时，extends也可以用在方法参数中。例如;


```
public float said(List<? extends String> list) {
        float num = 0;
        for (String s : list) {
            num += s.hashCode();
        }
        return num;
    }
```

但是尤其需要注意的是，extends不能在初始化泛型的时候使用，像这样。

```
List<? extends String> list = new ArrayList<>();
```

如果像这样使用，会发现add方法根本无法使用，因为编译器不能确定到底是哪个类型，所以这个方法就被**废掉了**。

## super

super关键字与extends关键字很像，也是代表了一种约束。但是与extends关键字不同的是，它只能与 *?* 关键字一起使用，而且不能在类的声明中使用。

## 泛型方法

示例如下：

```
public  <T>  T get(T e) {
        return e;
    }
```

可以看到，前面必须用一个前括号对泛型进行声明。

两个参数的写法

```
public  <K, V>  float get(K key, V value) {
        return key.hashCode() * value.hashCode();
    }
```

在Android中最经典的使用泛型方法的例子就是我们最常用的findViewById了

```
<T extends View> T findViewById(@IdRes int id) {  return getWindow().findViewById(id); }
```

## 总结

泛型其实最主要的用处是方便使用者，如果我们是一般的业务开发的话，需要我们自己写泛型的情况是很少的，但是如果我们是要写一个类的话，泛型就能帮上很大的忙。





