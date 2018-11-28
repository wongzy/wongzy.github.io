---
title: Socket
date: 2018-11-28 15:33:58
categories: Android网络开发
---

在Internet上，数据按有限大小的包传输，这些包称为数据报(datagram)。每个数据报包含一个首部（header)和一个有效载荷（payload）。首部包含包发送到的地址和端口、包来自的地址和端口、检测数据是否被破坏的校验和，以及用于保证可靠传输的各种其他管理信息。有效荷载包含数据本身。不过，由于数据报长度有限，通常必须将数据分解为多个包，再在目的地重新组合。也有可能一个包或多个包在传输中丢失或遭到破坏，需要重传。或者包乱序到达，需要重新排序。所有这些是很繁重的工作，需要大量复杂的代码。

Socket允许程序员将网络连接看作是另外一个可以读/写的字节流。Socket对程序员掩盖了网络的底层细节，如错误检测、包大小、包分解、包重传、网络地址等。

#### 使用Socket

Socket是两台主机之间的一个连接。它可以完成7个基本操作：

* 连接远程机器
* 发送数据
* 接收数据
* 关闭连接
> 客户端Socket

* 绑定端口
* 监听入站数据
* 在绑定端口上接受来自远程机器的连接
> 服务端ServerSocket

Java程序通常采用以下方式使用客户端Socket：

1. 程序用构造函数创建一个新的Socket

2. Socket尝试连接远程主机

一旦建立了连接，本地和远程主机就从这个Socket得到输入流和输出流，使用这两个流相互发送数据。连接是全双工的，两台主机都可以同时发送和接收数据。数据的含义取决于协议，发送给FTP服务器的命令与发送给HTTP服务器的命令就有所不同。一般会先完成某种协商握手，然后再具体传输数据。

当数据传输结束后，一端或两端将关闭连接。有些协议，如HTTP 1.0，要求每次请求得到服务后都要关闭连接。其他协议，如FTP和HTTP 1.1，则允许在一个连接上处理多个请求。

##### 构造和连接Socket

java.net.Socket类是Java完成客户端TCP操作的基础类。其他建立TCP网络连接的面向客户端的类（如URL、URLConnection、Applet和JEditorPane）最终都会调用这个类的方法。这个类本身使用原生代码与主机操作系统的本地TCP栈进行通信。

Socket的构造函数如下：

* public Socket()：无参构造函数，支持不同类型的socket
* public Socket(Proxy proxy)：可以使用某个特定的代理服务器
* public Socket(String host, int port) throws UnknownHostException, IOException
* public Socket(InetAddress address, int port) throws IOException
* public Socket(String host, int port, InetAddress localAddr, int localPort) throws IOException
* public Socket(InetAddress address, int port, InetAddress localAddr, int localPort) throws IOException

已不建议使用：
* public Socket(String host, int port, boolean stream) throws IOException
* public Socket(InetAddress host, int port, boolean stream) throws IOException

###### 设置Socket选项

Socket选项指定了Java Socket类所依赖的原生socket如何发送和接收数据。对于客户端Socket，Java支持9个选项：

1. TCP_NODELAY

设置TCP_NODELAY为true可确保包会尽可能快地发送，而无论包的大小。正常情况下，本地主机会有一个缓冲，而设置TCP_NODELAY为true可以打破这种缓冲模式，这样所有包一旦就绪就会发送

2. SO_LINGER

SO_LINGER选项指定了Socket关闭时如何处理尚未发送的数据报，将这个选项打开而且延迟时间设置为任意正数，close（）方法会阻塞，等待发送数据和接收确认。当过去相应秒数后，Socket关闭，所有剩余的数据都不会发送，也不会收到确认。

3. SO_TIMEOUT

正常情况下，尝试从Socket读取数据时，read（）调用会阻塞尽可能长的时间来得到足够的字节。设置SO_TIMEOUT可以确保这个调用阻塞的时间不会超过某个固定的毫秒数。

4. SO_REVBUF和SO_SNDBUF

SO_REVBUF选项用于控制用于网络输入的建议的接收缓冲区大小。SO_SNDBUF选项控制用于网络输入的建议的发送缓冲区的大小。

5. SO_KEEPALIVE

如果打开了SO_KEEPALIVE，客户端偶尔会通过一个空闲连接发送一个数据包，以确保服务器未崩溃。如果服务器没能响应这个包，客户端会持续尝试11分钟多的时间，直到接收到响应为止。如果在12分钟内未收到响应，客户端就关闭socket。

6. OOBINLNE

使用这个选项可以发送紧急数据。

7. SO_REUSEADDR

开启这个选项可以允许另一个SOcket绑定到这个之前Socket绑定的端口，即使此时仍有可能存在前一个SOcket未接收的数据。

8. IP_TOS

服务类型

