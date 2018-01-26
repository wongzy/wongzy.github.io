---
title: Android中设置界面PreferenceFragment的用法
date: 2017-10-19 12:02:04
categories: Android
---
> 发现Android虽然为我们提供了很好的设置界面的东西（也就是这个PreferenceFragment），但是网上的资料还真是少之又少，可能大家的需求都是自己做设置界面，不稀罕Google为我们做好的，不过既然用到了这个东西，还是拿出来做下笔记
#### 第一步，我们现在res中写一个preferences.xml文件，当然你也可以命名成其他的名字
文件目录如下：
![这里写图片描述](http://img.blog.csdn.net/20171016170343679?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
##### 根文件布局是PreferenceScreen,定义了一个设置界面，PreferenceCategory则为设置的不同分类，可供选择的Preference有Preference，SwitchPreference，ListPreference以及CheckboxPreference达到，这些都可以放到PreferenceCategory中去，我自己写的界面如下
```
<PreferenceScreen xmlns:android="http://schemas.android.com/apk/res/android">
    <PreferenceCategory android:title="@string/warning_setting">
        <SwitchPreference android:key="weather_warn"
                          android:title="@string/weather_warn"
                          android:summaryOff="开启后在日程开始前会弹出通知栏"
                          android:summaryOn="会提醒日程"
                          android:defaultValue="false"/>
        <ListPreference android:key="warning_time"
                        android:dependency="weather_warn"
                        android:title="@string/waring_time_select"
                        android:summary="开启提醒则需要设置这项,默认为15分钟"
                        android:entries="@array/time"
                        android:entryValues="@array/time"
                        android:defaultValue="@string/time_default"
                        android:dialogTitle="请选择提前时间"/>
    </PreferenceCategory>
    </PreferenceScreen>
```
显示的效果是这样的
![这里写图片描述](http://img.blog.csdn.net/20171016170914634?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
> 这里的颜色跟定义的style有关系

在这里我使用了一个android:dependency="weather_warn"属性，这个属性的意思是只有当key为weather_warn的preference值为true时，它才是可以被选择的，我们在preference中可以定义默认的值，summary属性则是选项下面的小字，summaryon和summaryoff可以控制打开开关后显示的小字
#### 第二步，写我们的Java类，继承PreferenceFragment

在这里我们需要注意，这个Fragment和普通的Fragment有很大的不同，我们只需要在onCreate中执行addPreferencesFromResource(R.xml.preferences);就可以了，不需要写onCreateView函数，下面是我写的一个示例
```
@Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        addPreferencesFromResource(R.xml.preferences);
        useDefault = (SwitchPreference) findPreference("use_default_image");
        warnDuration = (ListPreference) findPreference("warning_time");
        updateDuration = (ListPreference) findPreference("update_duration");
        useDefault.setOnPreferenceClickListener(this);
        updateDuration.setOnPreferenceChangeListener(this);
```
> 注意我这里用到的ListPreference和SwitchPreference并不是刚刚我给出来的Preferces.xml中的内容哦，不过用法都是一样的，我们可以发现在这里，获得Preferences的方法很像在Activity中findviewbyid的用法，只不过这里使用的不是id，而是我们刚刚定义的key

这里我们还定义了点击事件，如果像我这样使用的话还需要继承Preference.OnPreferenceClickListener, Preference.OnPreferenceChangeListener这两个接口，然后重写两个方法，这也跟setOnClicklistener的用法十分相似，我们需要注意ListPreference的用法和想CheckPreference和SwitchPreference的方法都不一样，对SwitchPreference、CheckboxPreference应该设置点击事件，而对ListPreference则设置Chane事件。
> ListPreference的参考此文
> http://www.jb51.net/article/75874.htm
#### 以上，如有错误，恳请指出