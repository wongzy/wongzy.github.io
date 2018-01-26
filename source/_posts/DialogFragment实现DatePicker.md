---
title: DialogFragment实现DatePicker
date: 2017-10-05 12:02:04
categories: Android
---
> 先上效果图
![这里写图片描述](http://img.blog.csdn.net/20171022171615530?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 要实现这个效果，首先，我们得先创建一个Dialogfragment，注意我们只重写onCreateDialog函数，其他的函数就不用管了，在此之前我们先写好xml文件，很简单，只需要把datepicker作为根布局就可以了
> datepicker.xml
```
<?xml version="1.0" encoding="utf-8"?>
<DatePicker xmlns:android="http://schemas.android.com/apk/res/android"
            android:id="@+id/datePicker"
            android:layout_width="wrap_content"
            android:layout_height="match_parent"
            android:calendarViewShown="false">
</DatePicker>
```
#### 我们需要在onCreateDialog返回一个dialog，这个dialog我们一般都使用AlertDialog，现在官方已经不推荐使用Dialog了，具体代码如下：
```
View v = LayoutInflater.from(getActivity())
                .inflate(R.layout.datepicker, null);
        final DatePicker datePicker = (DatePicker)v;
        datePicker.setMinDate(TimeUtil.getDayLong());
        //设置可选择的最小日期，TimeUtil是我自己写的工具类，返回当前日期的long值
        AlertDialog.Builder dialogbuilder = new AlertDialog.Builder(getActivity())
                .setView(datePicker)
                .setTitle(R.string.datepicker_title)
                .setPositiveButton(R.string.button_sure, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {            //添加自己的代码
                        }
                    }
                })
                .setNegativeButton(R.string.button_cancel, null);
                 return dialogbuilder.create();
```
> alertdialog的构造用到了十分典型的Builder模式，这个模式可以使我们更容易组织alerdialog。
#### 写完了dialogfragment之后，就可以在活动中调用它了，代码十分简单
```
 FragmentManager manager = getSupportFragmentManager(); 
 DatePickerFragment datePickerFragment = new DatePickerFragment();
 //datePickerFragment即为我们写的继承dialogfragment的组件
 datePickerFragment.setActitityType(activityType);
 datePickerFragment.show(manager, "DatePickerFragment");
```
#### 不过这个dialogfragment显示的方式可能有些难看，这里给出我的一个动画的实现方式
```
if (dialog.getWindow() != null) {
            Window window=dialog.getWindow();
            window.setWindowAnimations(R.style.dialogAnim);
        }
```
动画的xml代码如下：
```
<style name="dialogAnim" mce_bogus="1" parent="android:Animation">
        <item name="android:windowEnterAnimation">@anim/dialog_push_in</item>
        <item name="android:windowExitAnimation">@anim/dialog_push_out</item>
    </style>
```
> dialog_push_in
```
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <scale
        android:duration="@android:integer/config_shortAnimTime"
        android:fromYScale="0.5"
        android:fromXScale="0.4"
        android:toXScale="1.0"
        android:toYScale="1.0"
        />

    <alpha
        android:duration="@android:integer/config_shortAnimTime"
        android:fromAlpha="0.0"
        android:toAlpha="1.0" />
</set>
```
> dialog_push_out
```
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <scale
        android:duration="@android:integer/config_shortAnimTime"
        android:fromYScale="1.0"
        android:fromXScale="1.0"
        android:toXScale="0.4"
        android:toYScale="0.5"
        />

    <alpha
        android:duration="@android:integer/config_shortAnimTime"
        android:fromAlpha="1.0"
        android:toAlpha="0.0" />
</set>
```