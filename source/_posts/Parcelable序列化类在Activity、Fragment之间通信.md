---
title: Parcelable序列化类在Activity、Fragment之间通信
date: 2017-11-27 12:02:04
categories: Android
---
#### 要让一个类的对象序列化，我们首先得让这个类实现Parcelable接口，我自己定义的一个类如下：
```
public class NewPlan implements Parcelable{
    private Long id;
    private String location;
    private long startTime;
    private long endTime;
    public(Long id, String location, long startTime, long endTime) {
    this.id = id;
    this.location = location;
    this.startTime = startTime;
    this.endTime = endTime;
    }
    
    public Long getId() {
        return this.id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getLocation() {
        return this.location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public long getStartTime() {
        return this.startTime;
    }
    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }
    public long getEndTime() {
        return this.endTime;
    }
    public void setEndTime(long endTime) {
        this.endTime = endTime;
    }
}
```
#### 这时Ide会提醒我们需要实现以下两个函数
```
@Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(location);
        dest.writeLong(startTime);
    }
```
#### describeContents()函数我们一般不需要对它进行操作，我们需要写的是writeToParcel函数，注意，我们如果需要通信但是不需要得到对象中所有的属性的话，可以少些几个属性，比如我这里就只写了两个属性，做完这一步就可以来写内部生成器了
```
public static final Parcelable.Creator<NewPlan> CREATOR = new Parcelable.Creator<NewPlan>() {
        @Override
        public NewPlan createFromParcel(Parcel source) {
            NewPlan newPlan = new NewPlan();
            newPlan.location = source.readString();
            newPlan.startTime = source.readLong();
            return newPlan;
        }

        @Override
        public NewPlan[] newArray(int size) {
            return new NewPlan[size];
        }
    };
```
#### 这里要严格按照我们刚刚写入的顺序来写，写入函数并没有给每个属性值都指定相应的Key，重写这两个函数之后，生成器就完成了。接下来我们就可以使用它通过Intent和Bundle在Activity和Fragment之间通信了
一.  Activity和Activity之间用Intent传递对象
##### 发送
```
Intent intent = new Intent(MainActivity.this, SecondActivity.class);
intent.putExtra("it", new NewPlan(0, "湖北武汉", 20171110,20171111);
startActivity(intent);
```
##### 接收
```
Intent intent = getIntent();
NewPlan mNewPlan = intent.getParcelableExtra()；
```
#### 当然，除了传输一个对象，我们也可以传递List集合，不过传递对象集合时一定要注意，集合的类型一定是ArrayList，声明为List接口也是不可以的
二. Activity与Fragment传递对象
#### 我们在fragment的构造参数中无法传入我们想要传递的数据，官方推荐是使用argument传递消息，用法如下
##### Activity给Fragment设置arguement
```
mScheduleDetailFragment = new ScheduleDetailFragment();//继承fragment的类
bundleDetail.putParcelableArrayList("newPlan",new NewPlan(0, "湖北武汉", 20171110,20171111); //将想要传递的对象放入Bundle
        mScheduleDetailFragment.setArguments(bundleDetail);//设置argument
```
##### fragment中获得Bundle中的对象
```
NewPlan m= this.getArguments().getParcelable("newPlan");
```
> 需要注意的是，只有在实现Parcelable接口时写入和读取的属性才能在被传递后被读取，没有这样做的属性在传递后为控制，比如说这里我只能得到location和StartTime这两个属性
> 
> 如有错误，恳请指出