---
title: Rxjava2和Retrofit2实现解析bing每日一图JSON
date: 2017-10-12 12:02:04
categories: Android第三方开源项目使用
---
> 一直想学习一下Rxjava和Retrofit实现网络请求，正好这几天准备实现一个下载bing每日一图的功能，就实践了一下
##### 网上找的带有每日一图链接的资源如下
> https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1
##### 打开之后会得到一长串JSON格式的数据
```
{"images":[{"startdate":"20171006","fullstartdate":"201710061600","enddate":"20171007","url":"/az/hprichbg/rb/VallesMarineris_ZH-CN10598461085_1920x1080.jpg","urlbase":"/az/hprichbg/rb/VallesMarineris_ZH-CN10598461085","copyright":"火星上的峡谷系统-水手号峡谷地区上的小行星 (© Detlev van Ravenswaay/Getty Images)","copyrightlink":"http://www.bing.com/search?q=%E7%81%AB%E6%98%9F%E5%B3%A1%E8%B0%B7&form=hpcapt&mkt=zh-cn","quiz":"/search?q=Bing+homepage+quiz&filters=WQOskey:%22HPQuiz_20171006_VallesMarineris%22&FORM=HPQUIZ","wp":true,"hsh":"5b69b96f1ea30eb5ec187173de25ef3c","drk":1,"top":1,"bot":1,"hs":[]}],"tooltips":{"loading":"正在加载...","previous":"上一个图像","next":"下一个图像","walle":"此图片不能下载用作壁纸。","walls":"下载今日美图。仅限用作桌面壁纸。"}}
```
##### 带有bing每日一图的链接显而易见了，就是
> "urlbase":"/az/hprichbg/rb/VallesMarineris_ZH-CN10598461085"
#####当然 这仅仅是我写这篇文章时候的链接，每天数据都会不同
### 接下来我们来开始实现Rxjava2和Retrofit2解析JSON了，添加依赖如下
>  compile 'com.squareup.retrofit2:retrofit:2.3.0'
    compile 'io.reactivex.rxjava2:rxandroid:2.0.1'
    compile 'io.reactivex.rxjava2:rxjava:2.1.3'
    compile 'com.squareup.retrofit2:converter-gson:2.3.0'
    compile 'com.squareup.retrofit2:adapter-rxjava2:2.3.0'
##### 因为okhttp已经集成在retrofit中了，所有这里不需要再加入okhttp的依赖
#### 一步一步来，首先，我们先根据返回的数据写一个实体类，这里有一个很方便的工具GsonFormat，可以直接根据网页中的信息生成gettter setter及内部类，还没有安装此插件的同学可以参考这一篇博文
> http://blog.csdn.net/dakaring/article/details/46300963
##### 我们也可以添加自己的函数，这样可以很方便地得到想要的数据，如下
```
String getURL() {
        return images.get(0).getUrl();
 }
String getDate() {
        return images.get(0).getEnddate();
}
```
##### 这里就是我自己添加的函数
#### 完成实体类之后就可以来定义接口了
```
interface ImageAPI {
    /**
     * 网络请求
     * @return 实体类
     */
    @GET("HPImageArchive.aspx?format=js&idx=0&n=1")
    Flowable<ImageBean> getImage();
}
```
##### 这里需要注意的是，在@GET后面添加的是上面的链接https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1的后半部分，这也是retrofit 的用法很重要的一点，当然，在我们这里并没有体现出来这种方式的优点，但在其他地方，可以起到很好的解耦作用。我们这里定义的接口直接就返回了ImageBean类，在后面就可以直接提取数据了。Flowable则是Rxjava2新引入的东西，它可以更好地处理同步异步的关系。
#### 最后一步就是实现了，我们在上一步只给出了链接的下半部分，在这里我们将将上半部分封装进retrofit，这样完整的链接就给出了
```
private static final String BASE_URL = "https://cn.bing.com";
```
```
Retrofit retrofit = new Retrofit.Builder()
                .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
                .addConverterFactory(GsonConverterFactory.create())
                .baseUrl("https://cn.bing.com/")
                .build();
```
##### 在这里我们实现了Retrofit 的初始化，以及将JSON转化，其中addCallAdapterFactory(RxJava2CallAdapterFactory.create())表示添加Rxjava2与Retrofit2的适配器，addConverterFactory(GsonConverterFactory.create())则表示添加Json转化工具。
#### 最后一步 实现接口
```
final ImageAPI imageAPI = retrofit.create(ImageAPI.class);
        LogUtil.v(TAG, "downloadUrl");
        imageAPI.getImage()
                .subscribeOn(Schedulers.io())
                .observeOn(Schedulers.newThread())
                .subscribe(new Subscriber<ImageBean>() {
                    @Override
                    public void onSubscribe(Subscription s) {
                        s.request(Long.MAX_VALUE);
                    }

                    @Override
                    public void onNext(ImageBean imageBean) {
                        LogUtil.v(TAG, "next");
                        LogUtil.d(TAG, BASE_URL + imageBean.getURL());
                        LogUtil.d(TAG, imageBean.getDate());
                    }

                    @Override
                    public void onError(Throwable t) {
                        t.printStackTrace();
                        LogUtil.v(TAG, "error");
                    }

                    @Override
                    public void onComplete() {
                        LogUtil.v(TAG, "complete");
                    }
                });
```
##### 这里需要注意onSubscribe函数中必须对s进行处理，这里表示一次性处理几次数据，若不处理，则onNext不生效！
#### 到这里就结束了，可以得到完整的每日一图链接，如有差错恳请指出！