---
title: Https连接建立过程
date: 2018-07-15 16:53:27
categories: Android网络开发
---

> Https的全称是Http over SSL，而SSL是在TCP协议之上的保密层，但是它也是属于传输层的，如果直接传输Http，报文的信息安全是无法被保障的，因为它在应用层的信息传输是明文传输的。

### 过程

Https传输建立的过程可以分为两个过程，信任建立的过程和连接建立的过程，如果再细分可以分为九个步骤，分别是：

1. Client Hello
2. Server Hello
3. 服务端向客户端发送CA证书
4. 客服端发送Pre-master Secret
5. 客户端发送消息：将使用加密通信
6. 客户端发送：Finished
7. 服务器发送消息：将使用加密通信
8. 服务端发送：Finished
9. 连接正式建立，发送正式报文

#### Client Hello

![https1.PNG](https://i.loli.net/2018/07/15/5b4b1028c325e.png)

客户端首先会给服务器发送Client Hello， Client Hello中主要包含了以下这几个消息：

* 客户端可以使用的SSL/TLS版本
* Ciper Suites
* 服务器名称
* *客户端随机数*

其中Ciper Suites其实就是Ciper Suite的集合，也就是说Ciper Suites包含了一个或多个Ciper Suite，那么Ciper Suite到底是什么呢？其实就是对称加密算法，非对称加密算法和Hash算法的一个组合，下面就是一个例子

Ciper Suite：*AES_RSA_SHA1*

Ciper Suites就是几个Ciper Suite的集合，像这样：

*AES_RSA_SHA1*、*DES_DSA_MD5*、*AES_RSA_MD5*


#### Server Hello

![https2.PNG](https://i.loli.net/2018/07/15/5b4b1028d5f2e.png)

客户端收到服务器收到的这一系列消息之后，它会从客户端发送的Ciper Suites中挑选出一个Ciper Suite和SSL/TLS版本，然后和自己生成的客户端随机数一起发送给客户端，就是这几个部分：

* 服务器挑选出的SSL/TLS版本
* 服务端挑选出的Ciper Suite
* *服务端随机数*

#### 服务端CA证书验证


![https3.PNG](https://i.loli.net/2018/07/15/5b4b1028d6371.png)


服务端得向客户端证明自己就是刚刚客户端发送消息的那个服务器，而CA证书里面就包含了这样的信息，需要注意的是，服务端发送给客户端的证书包含的信息并不只是证书本身，也包含了给它发证的签发机构的信息。证书包含的信息大概如下：

* 本身信息
   * 证书信息（域名等）
   * 证书公钥
   * 证书签名算法
   * 证书签名
* 签发机构证书信息
   * 证书信息
   * 签发机构公钥
   * 签发机构签名算法
   * 签发机构的签发机构

验证证书的过程是这样的：

1. 证书对自身的证书信息使用证书的签名算法做一个Hash
2. 利用签发机构的公钥去对步骤1得到的信息做一次验证，如果验证成功则说明CA证书本身的信息是可信赖的，但签发机构自身还需要验证自己是可信赖但
3. 用客户端自身的证书公钥去对2得到的信息做验证，验证成功则说明证书的签发机构是可信赖的，服务端与客户端的信任就建立起来了，如果验证失败则需要进行提示，如是否信任此证书等等

> 有些机构，如银行等，可能会对客户端也做一次验证，大致过程和服务端验证相似

#### 客户端发送Pre-master Secret


![https4.PNG](https://i.loli.net/2018/07/15/5b4b1028dabe6.png)

Pre-master Secret是由客户端通过自身信息算出来的，客户端将会把Pre-master Secret使用刚刚在证书中获得的证书公钥加密后发送给服务器，服务器收到Pre-master后，客户端和服务器都将协商出一个Master Secret, 因为客户端和服务器都拥有 *客户端随机数、服务器随机数、Pre-Master Secret*,如图所示


![https5.PNG](https://i.loli.net/2018/07/15/5b4b1028e8d11.png)

得到Master Secret之后客户端和服务器将使用 *Ciper Suite和Master Secret*一起计算出*客户端密钥和服务端密钥以及客户端MAC Secret和服务器MAC Secret*，如图：


![https6.PNG](https://i.loli.net/2018/07/15/5b4b1028e8da5.png)

做完这步之后客户端和服务器会继续建立通信

#### 客户端通知：将使用加密通信

这里其实仅仅只是发送了一个几字节的通知而已，客户端告诉服务器将使用加密通信


![https7.PNG](https://i.loli.net/2018/07/15/5b4b1028e92ae.png)

#### 客户端发送Finished消息


![https8.PNG](https://i.loli.net/2018/07/15/5b4b1028e9688.png)

在这里客户端将发送一个Finished消息，这个Finished消息实际上是对上述客户端与服务端发送的消息的一个汇总，用来使服务器来验证客户端是不是刚刚建立信任的客户端，Finished消息结果了两步加工：

1. 使用HMAC对消息进行HASH
2. 使用客户端密钥对消息进行加密



> HMAC是在获得了客户端MAC Secret和服务端MAC Secret后服务器和客户端都得到的HASH算法

服务端在收到客户端发送的Finished消息后将对消息进行验证，步骤如下：
1. 服务端对之前所有的消息也做一个HMAC
2. 服务端对客户端发送过来的Finished消息进行解密（因为服务端也有客户端密钥)
3. 服务端对1和2得到的消息进行比对，如果一样则说明发送消息的客户端是之前建立起信任的客户端，将进行之后步骤

#### 服务器发送将使用加密通信和Finished消息

这两个步骤其实跟前面客户端发送加密通信和Finished消息是一样的，所有这里就略过了

#### 客户端发送正式的报文

从这个步骤开始客户端和服务器就开始正式的通信了，从应用层看发送的报文的话只会得到这是一个应用层的消息，具体的消息只能看到类似与乱码，与Http明文通信对比十分鲜明。

### 总结


可以用一张图来概括

![https9.PNG](https://i.loli.net/2018/07/15/5b4b1029081d8.png)



