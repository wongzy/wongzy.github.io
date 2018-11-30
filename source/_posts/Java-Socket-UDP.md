---
title: Java Socket(UDP)
date: 2018-11-30 11:55:29
categories: Android网络开发
---

UDP是在IP之上发送数据的另一种传输层协议，速度很快，但不可靠。当发送UDP数据时，无法知道数据是否会到达，也不知道数据的各个部分是否会以发送时的顺序到达。不过，确实能到达的部分一般都会很快到达。

Java中UDP的实现分为两个类：DatagramPacket和DatagramSocket。DatagramPacket类将数据填充到UDP包中，这称为数据报。为发送数据，将要数据报放到DatagramPacket中，使用DatagramSocket来发哦是那个这个包。要接收数据，可以从DatagramSocket中接收一个DatagramPacket对象，然后检查该包的内容。

##### DatagramPacket类

在Java中，UDP数据报用DatagramPacket类的实例表示，这个类提供了一些方法来获取和设置IP首部中的源或目标地址、获取和设置源或目标端口、获取和设置数据，以及获取和设置数据长度。其余首部字段无法通过纯Java代码访问。

###### 构造函数

取决于数据报用于发送数据还是接收数据，DatagramPacket会使用不同的构造函数。希望接收数据报时，只需要提供保存数据报数据的byte数据和该数据用于数据报数据的字节数这两个参数。当socket从网络接收数据时，它将数据报的数据存储在DatagramPacket对象的缓冲区数据中，直到达到你指定的长度。希望发送数据报时，这些构造函数需要一个缓冲区和一个长度，另外还需要指定数据报发往的地址和端口。

DatagramSocket从DatagramPacket中读取目标地址和端口，地址和端口不存储在Socket中。

接收数据报的构造函数：

* public DatagramPacket(byte buf[], int length)
* public DatagramPacket(byte buf[], int offset, int length)

发送数据报的构造函数：

* public DatagramPacket(byte buf[], int offset, int length,InetAddress address, int port)
* public DatagramPacket(byte buf[], int offset, int length, SocketAddress address)
* public DatagramPacket(byte buf[], int length,InetAddress address, int port)
* public DatagramPacket(byte buf[], int length, SocketAddress address)

其中InetAddress或SocketAddress对象的destination指向包发往的目标主机，int参数port是该主机上的端口。

> 在一个包中填充多少数据才合适，这取决于实际情况。有些协议规定了包大小。要选择最佳的包大小，涉及很多因素。如果网络非常不可靠，如分组无线电网络，则要选择较小的包，因为这样可以减少在传输中被破坏的可能。另一方面，非常快速而可靠的LAN应当使用尽可能大的包。对于很多类型的网络，*8KB字节（即8192字节）* 往往是一个很好的折中方案。

##### DatagramSocket类

所有数据报Socket都绑定到一个本地端口，在这个端口上监听入站数据，这个端口也会放置在数据报的首部中。如果要编写一个客户端，不需要关心本地端口，可以调用一个构造函数，让系统来分配一个未使用的端口。这个端口号放置在所有出站数据报中，服务器将用它来确定响应数据报的发送地址。因此，当服务器构造DatagramSocket时，要指定它监听的本地端口。不过，客户端和服务器使用的Socket是一样的：区别只在于使用匿名端口还是已知端口。客户端Socket和服务器Socket没有区别。

###### 构造函数

* public DatagramSocket() throws SocketException

这个构造函数创建一个绑定到匿名端口的Socket。 *在发起与服务器对话的客户端中可能要使用这个构造函数。*

* public DatagramSocket(int port) throws SocketException

这个构造函数创建一个在指定端口监听入站数据报的Socket。 *可以使用这个构造函数编写在已知端口监听的服务器。*

* public DatagramSocket(int port, InetAddress laddr) throws SocketException

这个构造函数主要用于多宿主主机，它会创建在指定端口和网络接口监听入站数据报的Socket

* public DatagramSocket(SocketAddress bindaddr) throws SocketException

与前一个相似，只是网络接口和端口由SocketAddress读取

* protected DatagramSocket(DatagramSocketImpl impl)

这个构造函数允许子类提供自己的UDP实现，而不是接收默认实现。与其他4个构造函数创建的Socket不同，这个Socket一开始没有与端口绑定。使用前必须通过bind（）方法绑定到一个SocketAddress

###### 发送和接收数据报

DatagramSocket类的首要任务是发送和接收UDP数据报。一个Socket既可以发送又接收数据报。

发送数据报：

public void send(DatagramPacket p) throws IOException

接收数据报：

public synchronized void receive(DatagramPacket p) throws IOException

> 这个方法会阻塞调用线程，直到数据报到达

###### Socket选项

Java支持6个UDP Socket选项：

* SO_TIMEOUT

SO_TIMEOUT是receive()在抛出异常前等待入站数据报的时间，以毫秒计

* SO_RECBUF

确定了用于网络I/O的缓冲区大小

* SO_SNDBUF

获取和设置建议用于网络输出的发送缓冲区大小

* SO_REUSEDADDR

可以控制是否允许多个数据报Socket同时绑定到相同的端口和地址

* SO_BROADCAST

控制是否允许一个Socket向广播地址收发包

* IP_POS

业务流类型

##### 组播Socket类(MulticastSocket)

在Java中，要使用java.net.MulticastSocket类来组播数据，这是java.net.DatagramSocket的一个子类。

MulticastSocket与DatagramSocket十分相似:将数据放在DatagramPacket中，然后通过MulticastSocket收发。

MulticastSocket可以完成以下4种关键操作：

1. 加入组播组
2. 向组中成员发送数据
3. 接收组中的数据
4. 离开组播组









