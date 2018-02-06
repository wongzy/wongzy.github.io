---
title: Java中的网络通信
date: 2018-02-06 14:54:54
categories: Android网络开发
---

> Java在编程开发中经常用来构建一些大型的web应用，网络通信是必不可少的，而网络通信就涉及到以下几个必备的知识点

### 网络通信预备知识点

#### TCP/IP协议

TCP/IP协议中文译名为传输控制协议/互联网协议，是Internet最基本的协议。
1. IP协议规定了数据传输时的基本单元和格式，还规定了数据包的提交方法和路由选择。
2. TCP协议则提供了可靠的面向对象的数据流传输服务的规则和约定，简单地说就是，当一方向另一方发送一个数据包时，收到数据包的一方需要发送一个确认数据包给发送数据包的一方。

#### URL

URL是Uniform Resource Locator的缩写，称为网页地址，是因特网上标准的资源的地址，Internet上的每一个网页都具有一个唯一的名称标识，通常称之为URL地址，这种地址可以是本地磁盘，也可以是局域网上的某一台计算机，更多的是Internet上的站点。

### Socket和ServerSocket

#### 概述

Socket又称套接字，应用程序通常通过套接字向网络发出请求或者应答网络请求。

在Java中，Socket和ServerSocket类库位于java.net包中，ServerSocket用于服务器端，Socket是建立网络连接时使用的。在连接成功时，应用程序俩端都会产生一个Socket实例，操作这个实例，完成所需的会话。两端所产生的Socket实例都是相等的，并没有差别。Socket的工作过程包括以下4个基本步骤：

1. 创建Socket
2. 打开连接到Socket的输入/输出流
3. 进行通信
4. 关闭Socket

Socket使用TCP协议，适用于建立长时间连接，通常应用于实时通信

#### 实例

这里举例一个客户端与服务器端相互通信的例子

##### 客户端

```
public class Client {
    public static final int port = 8080;
    public static final String host = "localhost";
    public static void main(String[] args) {
        System.out.println("Client Start...");
        while (true) {
            Socket socket = null;
            try {
                //创建一个流套接字并将其连接到指定主机上的指定端口号
                socket = new Socket(host,port);

                //读取服务器端数据
                BufferedReader input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                //向服务器端发送数据
                PrintStream out = new PrintStream(socket.getOutputStream());
                System.out.print("请输入: \t");
                String str = new BufferedReader(new InputStreamReader(System.in)).readLine();
                out.println(str);

                String ret = input.readLine();
                System.out.println("服务器端返回过来的是: " + ret);
                // 如接收到 "OK" 则断开连接
                if ("OK".equals(ret)) {
                    System.out.println("客户端将关闭连接");
                    Thread.sleep(500);
                    break;
                }

                out.close();
                input.close();
            } catch (Exception e) {
                System.out.println("客户端异常:" + e.getMessage());
            } finally {
                if (socket != null) {
                    try {
                        socket.close();
                    } catch (IOException e) {
                        socket = null;
                        System.out.println("客户端 finally 异常:" + e.getMessage());
                    }
                }
            }
        }
    }
}
```

##### 服务端

```
public class Server {
    public static final int port = 8080;//监听的端口号

    public static void main(String[] args) {
        System.out.println("Server...\n");
        Server server = new Server();
        server.init();
    }

    public void init() {
        try {
            //创建一个ServerSocket，这里可以指定连接请求的队列长度
            //new ServerSocket(port,3);意味着当队列中有3个连接请求是，如果Client再请求连接，就会被Server拒绝
            ServerSocket serverSocket = new ServerSocket(port);
            while (true) {
                //从请求队列中取出一个连接
                Socket client = serverSocket.accept();
                // 处理这次连接
                new HandlerThread(client);
            }
        } catch (Exception e) {
            System.out.println("服务器异常: " + e.getMessage());
        }
    }

    private class HandlerThread implements Runnable {
        private Socket socket;
        public HandlerThread(Socket client) {
            socket = client;
            new Thread(this).start();
        }

        public void run() {
            try {
                // 读取客户端数据
                BufferedReader input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                String clientInputStr = input.readLine();//这里要注意和客户端输出流的写方法对应,否则会抛 EOFException
                // 处理客户端数据
                System.out.println("客户端发过来的内容:" + clientInputStr);

                // 向客户端回复信息
                PrintStream out = new PrintStream(socket.getOutputStream());
                System.out.print("请输入:\t");
                // 发送键盘输入的一行
                String s = new BufferedReader(new InputStreamReader(System.in)).readLine();
                out.println(s);

                out.close();
                input.close();
            } catch (Exception e) {
                System.out.println("服务器 run 异常: " + e.getMessage());
            } finally {
                if (socket != null) {
                    try {
                        socket.close();
                    } catch (Exception e) {
                        socket = null;
                        System.out.println("服务端 finally 异常:" + e.getMessage());
                    }
                }
            }
        }
    }
}
```

