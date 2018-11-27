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

#### 与网站认证相关的类

很多流行的网站需要提供用户名和口令才能访问。有些网站（如W3C成员页面）通过HTTP认证来实现这一点。其他的网站，如New York Times网站，则通过cookie和HTML表单来实现。Java的URL类可以访问使用HTTP认证的网站，不过，当然需要提供用户名和口令。

对于使用基于cookie的非标准认证的网站，要提供支持会更有难度，很重要的一个原因是：不同网站的cookie认证有很大区别。实现cookie认证往往要实现一个完整的Web浏览器，而且需要提供充分的HTML表单和cookie支持。

##### Authenticator类

包java.net包括一个Authenticator类，可以用它为使用HTTP认证自我保护的网站提供用户名和口令，由于Authenticator是一个抽象类，所以必须派生子类，不同子类可以采用不同的方式获取信息。

> 需要注意的是，Authenticator类中没有抽象方法

为了让URL使用这个子类，要把它传递给Authenticator.setDefault()静态方法，将它安装为默认的认证程序（Authenticator）

```
Authenticator.setDefault(new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return super.getPasswordAuthentication();
            }

            @Override
            protected URL getRequestingURL() {
                return super.getRequestingURL();
            }

            @Override
            protected RequestorType getRequestorType() {
                return super.getRequestorType();
            }
        });
```

只需要安装一次。此后，当URL类需要用户名和口令时，它就会使用Authenticator.requestPasswordAuthentication()静态方法询问这个Authenticator类的子类,这个方法的源代码如下所示:

```
public static PasswordAuthentication requestPasswordAuthentication(
                                    String host,
                                    InetAddress addr,
                                    int port,
                                    String protocol,
                                    String prompt,
                                    String scheme,
                                    URL url,
                                    RequestorType reqType) {

        SecurityManager sm = System.getSecurityManager();
        if (sm != null) {
            NetPermission requestPermission
                = new NetPermission("requestPasswordAuthentication");
            sm.checkPermission(requestPermission);
        }

        Authenticator a = theAuthenticator;
        if (a == null) {
            return null;
        } else {
            synchronized(a) {
                a.reset();
                a.requestingHost = host;
                a.requestingSite = addr;
                a.requestingPort = port;
                a.requestingProtocol = protocol;
                a.requestingPrompt = prompt;
                a.requestingScheme = scheme;
                a.requestingURL = url;
                a.requestingAuthType = reqType;
                return a.getPasswordAuthentication();
            }
        }
    }
```

如源代码中所示,它使用了getPasswordAuthentication()方法,所以这个方法也是必须被重写的

requestPasswordAuthentication()函数中各个参数如下:

1. String host: 主机名

2. InetAddress addr: 需要认证的主机

3. int port: 该主机上的端口

4. String protocol: 访问网站的应用层协议

5. String prompt: 需要认证的域的域名

6. String scheme: 认证模式

7. URL url: 引发身份验证的请求URL

8. RequestorType reqType: 认证类型(请求认证的是服务器还是代理服务器)

##### PasswordAuthentication类

非常简单的final类,它支持两个只读属性:用户名和口令

##### JPasswordField类

Swing中的组件,能以稍安全的方式来询问用户口令。

