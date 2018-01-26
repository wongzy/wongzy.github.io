---
title: Builder模式的简单示例
date: 2018-1-19 12:02:04
categories: 设计模式
---
> Builder模式可以说是最简单的设计模式了，它的原理就是封装set方法，每一步都由Builder对象来完成，使构建过程和部件的表示隔离开来，这里就仿造Android中的AlterDialog中的Builder模式

#### 例如，用Builder模式来构造一个Person对象，对象如下：
```
public class Person {
    private String name;
    private String sex;
    private int height;

    private void setName(String name) {
        this.name = name;
    }

    private void setSex(String sex) {
        this.sex = sex;
    }

    private void setHeight(int height) {
        this.height = height;
    }
}

```
> 注意，这里的set函数全都是private的，因为属性应该由Builder对象进行设置，而不是直接使用Person对象设置，完整的代码如下：

```
public class Person {
    private String name;
    private String sex;
    private int height;

    private void setName(String name) {
        this.name = name;
    }

    private void setSex(String sex) {
        this.sex = sex;
    }

    private void setHeight(int height) {
        this.height = height;
    }

    public static class Builder{
        private Person person = null;
        public Builder() {
            person = new Person();
        }

        public Builder setName(String name) {
            person.name = name;
            return this;
        }

        public Builder setSex(String sex) {
            person.sex = sex;
            return this;
        }

        public Builder setHeight(int height) {
            person.height = height;
            return this;
        }

        public Person create() {
            return person;
        }
    }
}
```

#### 这样就是一个简单Builder模式的实现了，因为Builder模式比较简单，大致都差不多