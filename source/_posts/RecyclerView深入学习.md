---
title: RecyclerView深入学习
date: 2019-06-30 11:19:59
categories: Android
---

> RecyclerView是Google用来替换ListView的组件，实际上它很早就被推出了，但是在旧项目中，我们还是能够经常看到ListView的身影，RecyclerView相比较与ListView，增加了默认的ViewHolder，能够减少findViewById调用的次数，而且有四级缓存，相比较于ListView的两层缓存，做了比较大的改进。

## 写法

在开始编写RecyclerView之前，我们需要在项目中的gradle中应用RecyclerView

```
implementation 'androidx.recyclerview:recyclerview:1.0.0'
```

> AndroidX是google将很多组件抽离出来组成的一个库，当然很多地方都用的是另一种写法，通过Support库来引入RecyclerView

RecyclerViewAdapter的写法很多人都需要通过查阅文档才能够记起来，实际上它的写法大概分为两个部分。一部分是Adapter，另一部分是ViewHolder。这两部分如下：

最开始我们先写Adapter的部分

代码如下：

```
public class RecyclerViewAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private List<String> list = null;
    private Context context = null;

    public RecyclerViewAdapter(List<String> stringList, Context context) {
        this.list = stringList;
        this.context = context;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.layout_recyclerview_item, parent, false);
        return new RecyclerView.ViewHolder(view) {
            @Override
            public String toString() {
                return super.toString();
            }
        };
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        
    }

    @Override
    public int getItemCount() {
        return list.size();
    }
}

```

这里可以看到我们使用了默认的ViewHolder，此时我们并没有进行自定义，ViewHolder可以在指定为默认的RecyclerView.ViewHolder，但是必须实现它的抽象方法，而且在绑定的时候如果我们没有进行自定义，绑定也十分不方面，所以我们一般自定义ViewHolder，如下。

```
public class RecyclerViewAdapter extends RecyclerView.Adapter<RecyclerViewAdapter.ItemViewHolder> {

    private List<String> list = null;
    private Context context = null;

    public RecyclerViewAdapter(List<String> stringList, Context context) {
        this.list = stringList;
        this.context = context;
    }

    @NonNull
    @Override
    public RecyclerViewAdapter.ItemViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.layout_recyclerview_item, parent, false);
        return new ItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerViewAdapter.ItemViewHolder holder, int position) {
        String s = list.get(position);
        holder.tvItem.setText(s);
    }

    @Override
    public int getItemCount() {
        return list.size();
    }
    
    class ItemViewHolder extends RecyclerView.ViewHolder {
        
        private ImageView ivItem;
        private TextView tvItem;
        
         ItemViewHolder(@NonNull View itemView) {
            super(itemView);
            ivItem = itemView.findViewById(R.id.iv_item);
            tvItem = itemView.findViewById(R.id.tv_item);
        }
    }
}
```

可以看到，在自定义ViewHolder之后，我们需要把之前的RecyclerView.ViewHolder改为我们自己的ViewHolder，包括两个方法onCreateViewHolder和onBindViewHolder。

## RecyclerView的四级缓存

先上图，四级缓存的过程如下

![四层缓存.png](https://i.loli.net/2019/06/30/5d18649e657bb96136.png)

其中mAttachedScrap是指在屏幕外，但是未与列表进行分离的item，如果我们可以找到我们想要现实的item，就直接返回，如果没有找到，我们则继续向下一级寻找item，依次为mCachedViews和mViewCacheExtension，最后是mRecyclerPool，如果到最后都没有找到的话，则调用onCreateViewHolder创建ViewHolder，我们这里需要记住的是，如果在mRecyclerPool缓存前就找到了我们所需的ViewHolder的话，就不需要再调用onBindViewHolder对ViewHolder进行绑定了，可以这么理解，mAttachedScrap、mCachedViews和mViewCacheExtension是根据item的位置（position）来进行缓存的，而mRecyclerPool仅仅对ViewType进行了记忆，需要重新进行绑定才可。

## RecyclerView性能优化

### 设置OnClickListener

我们一般习惯在OnBindViewHolder的时候进行OnClickListener的绑定，但是根据四级缓存，如果最后是在mRecyclerPool里面找到的ViewHolder，那么OnBindViewHolder将会重新创建，所以我们需要尽可能的在onCreateViewHolder的时候就将OnClickListener进行绑定。

### LinearLayoutManager。setInitialPrefetchItemCount(int itemCount) 

在多个RecyclerView进行嵌套时，例如竖向滑动的RecyclerView中嵌套了几个横向滑动的RecyclerView，那么这个方法将会减少页面的卡顿，可以通过这个方法来设置横向列表初次可见的item个数

### RecyclerView.setHasFixedSize

这个方法可以在列表内容进行变化时对性能进行优化，如果列表中Item个数是一定的话，那么我们就可以通过这个函数将mHasFixedSize设置为true，它可以减少RequestLayout的调用。

### 共用mRecyclerPool

当多个RecyclerView一起出现在同一个页面时，可以通过setRecycledViewPool来使用同一个mRecyclerPool进行缓存

### DiffUtil

DiffUtil能很方便的对两个数据集之间进行比对，然后计算出变动情况，配合RecyclerView.Adapter ，可以自动根据变动情况，调用 adapter 的对应方法。

使用代码如下：

```
DiffUtil.DiffResult diffResult = DiffUtil.calculateDiff(new DiffCallBack(oldDatas, newDatas), true);
diffResult.dispatchUpdatesTo(mAdapter);
```





