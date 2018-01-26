---
title: Dagger2实现MVP模式
date: 2017-10-22 12:02:04
categories: 设计模式
---
> MVP模式是为了实现View与Model完全解耦而生的模式，而配上Dagger2就能如虎添翼了
##### MVP模式的图解如下（网上盗的图）
![这里写图片描述](http://img.blog.csdn.net/20171015195037116?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzM0ODc0MTI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 而我们平常在实现MVP模式的时候，应该让View集成接口实现，这样比较容易实现调用，Presenter想要获得某个Activity中的成员的时候也显得更加容易，如下实例
> 接口
```
public interface MainView {
    /**
     * 获得当前的活动
     * @return 当前活动
     */
    Activity getActivity();
   } 
```
> Activity继承此接口
```
public class MainActivity extends AppCompatActivity implements MainView 
```
#### 这样在写Presenter时，我们就可以这样写
```
public class MainPresenterImpel {
    private final MainView mMainView;

    @Inject
    public MainPresenterImpel(MainView mainView) {
        mMainView = mainView;
    }
```
#### 这样我们就可以通过Presenter来调用Activity中写的函数，也可以用它来获得诸如Context等的上帝接口...
### 接下来就轮到用Dagger2实现注入的时候了
#### 首先，加入dagger2的依赖
```
compile 'com.google.dagger:dagger:2.11'
annotationProcessor 'com.google.dagger:dagger-compiler:2.11'
```
> 版本号可能不是最新的哦
#### 然后，我们应该实现两个类，Module和Component
##### Module这个类相当与构造出一个我们需要注入的对象，而Component则是一个注入的接口，它帮助我们把我们需要注入的对象注入到目标类当中去
#### Module类如下，这里我们需要注意，因为我们的Presenter类构造函数并不是无参的，我们需要到目标类当中获取到MainView才能将它构造出来，但我们可以先这样写
```
@Module
public class MainPresenterImpelModule {
    private MainView mMainView;
    public MainPresenterImpelModule(MainView mainView) {
        mMainView = mainView;
    }
    /**
     * 返回MainPresenterImpelModule
     * @param mainView constructor必需的参数
     * @return MainPresenterImpel实例
     */
    @Provides
    MainPresenterImpel provideImpel(MainView mainView) {
        return new MainPresenterImpel(mainView);
    }

    /**
     * 返回在活动中的MainView
     * @return 提供创建MainPresenterImpel的MainView
     */
    @Provides
    MainView provideMainView() {
        return mMainView;
    }
```
#### 在这里Presenter本身也是带构造函数的，这样做主要是为了获取到目标类中的MainView，两个Provides标签则表示了这个函数返回的成员可以帮我们构造Presenter，我们可以看到provideMainView()提供了provideImpel(MainView mainView)中所需的MainView，而它自身的MainView则需要到目标类中获取。
#### Component类如下所示
```
@Component(modules = MainPresenterImpelModule.class)
public interface MainActivityComponent {
    /**
     * 这里inject表示注入的意思，这个方法名可以随意更改，但建议就
     * 用inject即可。
     * @param activity 依赖注入的活动实例
     */
    void inject(Activity activity);
    MainPresenterImpel getMainPresenterImpel();
}
```
##### 这里就是把modules类生成的对象注入到Activity类中去，inject函数就是完成注入的方法，而getMainPresenterImpel()可以直接获得Presenter的实例，而不是new 一个出来，这里需要注意的是getMainPresenterImpel()方法是可以不写的，如果不写则需要在Activity用注释的方式获得Presenter实例，如下所示
```
@inject
MainPresenterImpel mMainPresenterImpel；
```
#### 最后一步，实现注入
```
MainActivityComponent mainActivityComponent = DaggerMainActivityComponent.builder()
                .mainPresenterImpelModule(new MainPresenterImpelModule(this))
                .build();
        mainActivityComponent.inject(this);
```
#### 我这样写主要是为了要获得Presenter 的实例，如下
```
mMainPresenterImpel = mainActivityComponent.getMainPresenterImpel();
```
#### 如果采用注释的方法获得实例的话直接注入就ok，像这样
```
DaggerMainActivityComponent.builder()
                .mainPresenterImpelModule(new MainPresenterImpelModule(this))
                .build()
                .inject(this);
```
#### 如有错误请指正