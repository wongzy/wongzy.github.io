---
title: DialogFragment实现自定义布局的小技巧
date: 2017-10-13 12:02:04
categories: Android
---
> DialogFragment可以说是用起来很方便，也很容易上手的一个类了，上次博客写了一篇关于将DatePicker放入DialogFragment中的文章，之后又遇到了将一整个布局放入DialogFragment中的情况，写着来记录一下
#### 一般来说，我们在DialogFragment中放入一个View只需要像这样写
```
View v = LayoutInflater.from(getActivity().getApplication())
                .inflate(R.layout.datepicker, null);
```
#### 但是如果我们需要把一整个布局都传入，而且还需要获得布局内控件的引用时，我们就需要一个ViewGroup传入，那这怎么才能在DialogFragment中实现呢？其实还是很简单的，只需要在onCreateView函数中将ViewGroup取出就可以了，具体代码如下：
```
 @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,@Nullable Bundle savedInstanceState) {
        mViewGroup = container;
        return super.onCreateView(inflater, container, savedInstanceState);
    }
```
然后再使用提取出的mViewGroup来获得整个布局
```
@NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        View view = LayoutInflater.from(getContext())
                .inflate(R.layout.location_dialog_fragment, mViewGroup, false);
      ...... }
```
这样就能轻松把自己写的布局再DialogFragment中展示了，获得布局中的控件就轻而易举了
```
 mEditLocation = (Button) view.findViewById(R.id.edit_location);
  mThingStatement=(EditText)view.findViewById(R.id.thing_statement);
        mSpendMoney = (EditText) view.findViewById(R.id.spend_money);
        mStartTime = (TextView) view.findViewById(R.id.start_time);
        mSpendTime = (EditText) view.findViewById(R.id.spend_time);
```
##### 以上，如有错误，恳请指出