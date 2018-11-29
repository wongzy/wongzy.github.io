---
title: Java Socket
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

##### 设置Socket选项

Socket选项指定了Java Socket类所依赖的原生socket如何发送和接收数据。对于客户端Socket，Java支持9个选项：

1. TCP_NODELAY

设置TCP_NODELAY为true可确保包会尽可能快地发送，而无论包的大小。正常情况下，本地主机会有一个缓冲，而设置TCP_NODELAY为true可以打破这种缓冲模式，这样所有包一旦就绪就会发送

2. SO_LINGER

SO_LINGER选项指定了Socket关闭时如何处理尚未发送的数据报，将这个选项打开而且延迟时间设置为任意正数，close（）方法会阻塞，等待发送数据和接收确认。当过去相应秒数后，Socket关闭，所有剩余的数据都不会发送，也不会收到确认。

3. SO_TIMEOUT

正常情况下，尝试从Socket读取数据时，read（）调用会阻塞尽可能长的时间来得到足够的字节。设置SO_TIMEOUT可以确保这个调用阻塞的时间不会超过某个固定的毫秒数。

4. SO_REVBUF和SO_SNDBUF

SO_REVBUF选项用于控制用于网络输入的 *建议的* 接收缓冲区大小。SO_SNDBUF选项控制用于网络输入的 *建议的* 发送缓冲区的大小。

尽管看起来应该能独立地设置发送和接收缓冲区，但实际上缓冲区通常会设置为二者中较小的一个。例如，如果将发送缓冲区设置为64KB，而接收缓冲区设置为128KB，那么发送和接收缓冲区的大小都将是64KB。Java会报告接收缓冲区为128KB，但底层TCP栈实际上会使用64KB。

> TCP的滑动窗口大小实际上就是socket的接收缓冲区（SO_RCVBUF）大小的字节数，拥塞窗口大小实际上就是socket的接收缓冲区（SO_SNDBUF）大小的字节数。

5. SO_KEEPALIVE

如果打开了SO_KEEPALIVE，客户端偶尔会通过一个空闲连接发送一个数据包，以确保服务器未崩溃。如果服务器没能响应这个包，客户端会持续尝试11分钟多的时间，直到接收到响应为止。如果在12分钟内未收到响应，客户端就关闭socket。

6. OOBINLNE

使用这个选项可以发送紧急数据。

7. SO_REUSEADDR

开启这个选项可以允许另一个SOcket绑定到这个之前Socket绑定的端口，即使此时仍有可能存在前一个SOcket未接收的数据。

8. IP_TOS

服务类型

#### 使用ServerSocket

ServerSocket类包含了使用Java编写服务器所需的全部内容。其中包括创建新ServerSocket对象的构造函数、在指定端口监听连接的方法、配置各个服务器Socket选项的方法，以及其他一些常见的方法。

在Java中，服务器程序的基本生命周期如下：

1. 使用一个ServerSocket构造函数在一个特定端口创建一个新的ServerSocket
2. ServerSocket使用其accept（）方法监听这个端口的入站连接。accept（）会一直阻塞，直到一个客户端尝试建立连接，此时accept（）将返回一个连接客户端和服务器的Socket对象。
3. 根据服务器的类型，会调用Socket的getInputStream（）方法或getOutputSteam（）方法，或者这两个方法都调用，以获得与客户端通信的输入和输出流
4. 服务器和客户端根据已协商的协议交互，直到要关闭连接
5. 服务器或客户端（或二者）关闭连接
6. 服务器返回步骤2，等待下一次连接

##### 构造ServerSocket

ServerSocket共有构造函数如下：

* public ServerSocket() throws IOException: 无参构造函数，会创建一个ServerSocket对象，但未将它绑定到某个端口，所以开始时它不能接收任何连接。以后可以使用bind（）来进行绑定。允许程序在绑定端口之前设置服务器socket选项。有些选项在服务器socket绑定后必须固定
* public ServerSocket(int port) throws IOException
* public ServerSocket(int port, int backlog) throws IOException
* public ServerSocket(int port, int backlog, InetAddress bindAddr) throws IOException

##### ServerSocket选项

Socket选项指定了ServerSocket类所依赖的原生Socket如何发送和接收数据。对于服务器Socket，Java支持以下3个选项：

1. SO_TIMEOUT

SO_TIMEOUT是accept（）在抛出java.io.InterruptedIOExption异常前等待入站连接的时间，以毫秒计。如果SO_TIMEOUT为0，accept（）就永远不会超时。

2. SO_REUSEADDR

服务器Socket的SO_REUSEADDR选项与客户端Socket的SO_REUSEDADDR选项非常类似。它确定了是否允许一个Socket绑定到之前使用过的一个端口，而此时可能还有一些发送到原Socket的数据正在网络上传输。

3. SO_REVBUF

SO_REVBUF选项设置了服务器Socket接收的客户端Socket默认接收缓冲区大小。设置一个服务器的SO_REVBUF就像在accept（）返回的各个Socket上调用setReceivedBufferSize()，这个选项给出了一个 *建议值* 。

###### 服务类型

public void setPerformancePreferences(int connectionTime,int latency,int bandwidth)方法描述了其连接时间，延迟和带宽所给定的相对优先级。但很多实现（包括Android）会完全忽略这些值。



