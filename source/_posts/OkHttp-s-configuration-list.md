---
title: OkHttp's configuration list
date: 2020-04-25 14:28:23
categories: Network related
---

OkHttp is the most useful Http library in Android develop，it will help us build a http request and send it to server, bring us responses from server, its main work mechanism is [Interceptor Chain]([https://wongzhenyu.cn/2018/09/10/OkHttp%E4%B8%AD%E6%8B%A6%E6%88%AA%E5%99%A8%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/](https://wongzhenyu.cn/2018/09/10/OkHttp中拦截器流程解析/))

But in the process of http request, OkHttp read OkHttpClient's configuration list and add it to transact process. There are main member attributes in OkHttpClient.

# main member in OkHttpClient 

```kotlin
internal var dispatcher: Dispatcher = Dispatcher()
internal var protocols: List<Protocol> = DEFAULT_PROTOCOLS
internal var connectionSpecs: List<ConnectionSpec> = DEFAULT_CONNECTION_SPECS
internal val interceptors: MutableList<Interceptor> = mutableListOf()
internal val networkInterceptors: MutableList<Interceptor> = mutableListOf()
internal var cookieJar: CookieJar = CookieJar.NO_COOKIES
internal var cache: Cache? = null
internal var hostnameVerifier: HostnameVerifier = OkHostnameVerifier
internal var certificatePinner: CertificatePinner = CertificatePinner.DEFAULT
internal var authenticator: Authenticator = Authenticator.NONE
internal var followRedirects = true
internal var followSslRedirects = true
internal var retryOnConnectionFailure = true
internal var connectTimeout = 10_000
internal var readTimeout = 10_000
internal var writeTimeout = 10_000
```

And their main responsibilities as follows:

## dispatcher

Dispatcher will switch thread when we send a request, as we know, it will make ANR(Android Not Responding) if we do network request in UI thread.

## protocols

Protocols that OkHttpClient supports, default include Http/1.1 and Http/2.

```kotlin
internal val DEFAULT_PROTOCOLS = immutableListOf(HTTP_2, HTTP_1_1)
```

## connectionSpecs

Socket's settings OkHttpClient supports, it default include modern TSL(Https) and clear text(http).

```kotlin
internal val DEFAULT_CONNECTION_SPECS = immutableListOf(
        ConnectionSpec.MODERN_TLS, ConnectionSpec.CLEARTEXT)
``` 

## interceptors

Interceptors before real interaction with serve, we can add it by ourself it will work before cache interceptor, can see details at [Interceptor Chain]([https://wongzhenyu.cn/2018/09/10/OkHttp%E4%B8%AD%E6%8B%A6%E6%88%AA%E5%99%A8%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/](https://wongzhenyu.cn/2018/09/10/OkHttp中拦截器流程解析/)).

## networkInterceptors

NetworkInterceptors after interacting with serve, we also need add it by ourself, but it may not work if data is cached, can see details at [Interceptor Chain]([https://wongzhenyu.cn/2018/09/10/OkHttp%E4%B8%AD%E6%8B%A6%E6%88%AA%E5%99%A8%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/](https://wongzhenyu.cn/2018/09/10/OkHttp中拦截器流程解析/)).


## cookieJar

CookieJar used to save cookies in our application, but it do not have default implement, so if we need save cookies, we should implement it by ourself in OkHttpClient.

```kotlin
val client = OkHttpClient.Builder().cookieJar(object : CookieJar{
            override fun loadForRequest(url: HttpUrl): List<Cookie> {
                TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
            }

            override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
            }
        }).build()
``` 

## cache

Similar with cookJar, it also have default implement, we can implement it by ourself.We should define cache file and maxSize.

```kotlin
/** Create a cache of at most [maxSize] bytes in [directory]. */
 constructor(directory: File, maxSize: Long) : this(directory, maxSize, FileSystem.SYSTEM)
```

## hostnameVerifier

HostnameVerifier used to verify whether hostname is valid.


## certificatePinner

CertificatePinner used to verify certificate, it has default implement, but if we need to self certificate, we can add it by ourself, example as follows:

```kotlin
val client = OkHttpClient.Builder()
            .certificatePinner(CertificatePinner.Builder().add("XXXXXX").add("XXXXXX").build())
            .build()
```

## authenticator

Authenticator used to add authenticator header after received service response code 401(authorize fail). Examples as follows

```kotlin
val client = OkHttpClient.Builder().authenticator(object : Authenticator{
            override fun authenticate(route: Route?, response: Response): Request? {
                val request = Request.Builder().addHeader("Authorization", " Bearer <XXXXXXX>")
                return request.build()
            }
        }).build()
```


## followRedirects

FollowRedirects can set whether follow url when received response 3XX(redirect).



## followSslRedirects

FollowSslRedirects can set whether follow url when received response 3XX(redirect) and current url is a http link, follow url is a https link.

## connectTimeout

Set connect socket time limit.

## readTimeout

Set read socket data time limit.

## writeTimeout

Set write time limit in write data to socket.

# other

Can see https's connection build process at [Https build process]([https://wongzhenyu.cn/2018/07/15/Https%E8%BF%9E%E6%8E%A5%E5%BB%BA%E7%AB%8B%E8%BF%87%E7%A8%8B/](https://wongzhenyu.cn/2018/07/15/Https连接建立过程/)) and OkHttp's interceptors chain at [Interceptor Chain]([https://wongzhenyu.cn/2018/09/10/OkHttp%E4%B8%AD%E6%8B%A6%E6%88%AA%E5%99%A8%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/](https://wongzhenyu.cn/2018/09/10/OkHttp中拦截器流程解析/)).