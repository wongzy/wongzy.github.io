---
title: URL、URI和代理
date: 2018-11-20 15:57:02
categories: Android网络开发
---

#### URL类

java.net.URL类是对统一资源定位符的抽象。它扩展了java.lang.Object，是一个final类，不能对其派生子类。它不依赖于继承来配置不同类型URL的实例，而使用了策略设计模式。*协议处理器* 就是策略，URL类构成上下文，通过它来选择不同的策略。

URL类支持的协议取决于虚拟机支持哪些协议，如下所示，可以用来确定一个虚拟机支持哪些协议。

```
import java.net.MalformedURLException;
import java.net.URL;

public class Main {

    public static void main(String[] args) {
        testProtocol("http://www.abc.org");
        testProtocol("https://www.baidu.com");
        testProtocol("jdbc:mysql://luna.ibiblio.org:3306/NEWS");
    }

    private static void testProtocol(String url) {
        try {
            URL url1 = new URL(url);
            System.out.print(url1.getProtocol() + " is Supported\n");
        } catch (MalformedURLException e) {
            String protocol = url.substring(0, url.indexOf(':'));
            System.out.print(protocol + " is not supported\n");
        }
    }
}
```

输出如下：

```
http is Supported
https is Supported
jdbc is not supported
```


#### URI类

URI是对URL的抽象，不仅包括URL，还包括URN（统一资源名）。这个类与java.net.URL类的区别表现在3个重要的方面：

1. URI类完全有关于资源的标识和URI的解析。它没有提供方法来获取URI所标识资源的表示。
2. 相比URL类，URI类与相关的规范更一致。
3. URI对象可以表示相对URI。URL类在存储URI之前会将其绝对化。

#### 代理

许多系统通过代理服务器访问Web，有时还会访问Internet的其他非HTTP部分。代理服务器接收到从本地客户端到远程服务器的请求。代理服务器向远程服务器发出请求，再将结果转发回本地客户端。有时这样做是出于安全原因，如防止远程主机了解关于本地网络配置的秘密细节。

基于URL类的Java程序可以使用大多数常见的代理服务器和协议。

##### Proxy类

Proxy类允许从Java程序中对代理服务器进行更细粒度的控制。确切地讲，它允许你为不同的远程主机选择不同的代理服务器。代理本身用java.net.Proxy类的实例来表示。仍然只有三种代理：HTTP、SOCKS、和直接连接（即没有代理），分别用Proxy.Type枚举中的三个常量来表示：

* Proxy.Type.DIRECT
* Proxy.Type.HTTP
* Proxy.Type.SOCKS

除了类型之外，关于代理的其他重要信息包括它的地址和端口，用SocketAddress对象表示。例如，下面的代码段创建了一个Proxy对象，表示proxy.example.com的端口80上的一个HTTP
代理服务器：

```
SocketAddress address = new InetSocketAddress("proxy.example.com", 80);
Proxy proxy = new Proxy(Proxy.Type.HTTP, address);
```

虽然只有三种代理对象，但是对于不同主机上的不同代理服务器，可以有相同类型的多个不同代理。