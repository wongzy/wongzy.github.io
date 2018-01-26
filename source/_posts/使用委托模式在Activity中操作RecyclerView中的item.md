---
title: 使用委托模式在Activity中操作RecyclerView中的item
date: 2017-11-2 12:02:04
categories: 设计模式
---
> RecyclerView与ListView不同，无法直接通过setItemClicklistener来获得单个item的点击时间，这个时候，我们可以通过在adapter中定义接口，并在Activity中实现相应接口来获得每个Item的点击事件，也就是标准的委托模式。
#### 具体做法如下：
#### 第一步 在Adapter类中定义内部接口，我自己定义的如下：
```
 /**
     * 在活动中实现的接口
     */
    public interface SelectItem {
        /**
         * 在活动中定义的方法
         * @param view view对象
         * @param position item的位置
         */
        void select(View view, int position);
    }
```
#### 第二步 在onBindViewHolder方法中定义定义点击事件，并在点击事件中执行该接口的逻辑
```
holder.mainView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (null != mSelectItem) {
                    mSelectItem.select(v, i);
                }
            }
        });
```
##### 这样我们就得到了在回调函数中的view和position，这样就能在Activity中对相应的数据进行操作了
#### 第四步 在adapter中定义定义设置委托对象的函数
```
public void setSelectItem(SelectItem selectItem) {
        mSelectItem = selectItem;
    }
```
#### 做好这一步，我们就可以通过在Activity中重写接口中的方法来获得当前点击类的位置和view对象了
#### 最后一步，在Activity中重写接口函数
```
pickItemAdapter.setSelectItem(new PickItemAdapter.SelectItem() {
            @Override
            public void select(View view, int position) {
                selectItem(position); //对数据进行操作的函数，自己定义的
            }
        });
```
#### 这样我们就能很方便地获取当前item的位置，对数据进行操作了！
