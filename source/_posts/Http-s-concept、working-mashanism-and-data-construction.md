---
title: Http's  concept、working mechanism  and data construction
date: 2020-04-13 21:15:30
categories: Network related
---

# Http's Concept

Http is a abbreviation of Hypertext Transfer Protocol, it runs in the application layer of network.

Hypertext means expanded text, we can put html content in it, and html content can provide a link refer to other text content(hyperlink).


# Http's Working Mechanism

the most common scene to use http in our life is browsing website on our computer and use application on  mobile phone, the work mechanism is this:

## computer browser

1. input url in computer browser
2. computer browser build http request message
3. http message send to goal server via DNS server
4. server return response message
5. computer browser analyze response message and rending content of response message via render engine

## mobile phone application

1. click or open user interface 
2. application build request message in code
3. send request message to server via DNS server
4. server return response message
5. application received response message and analyze it(in code) and do their own work.

the general flow of those two scenes is similar.


## the relationship between url and http

for example, this url:

```
https://github.com/wongzy
```

it can be divided to three parts, protocol type, host address and path

*https* is protocol type
*github.com* is host address
*/wongay* is path


# Message construction

## request message construction

![http1.png](https://i.loli.net/2020/04/18/zY4NpJZaXqtIQuK.png)

request message can be divided into three parts: Request Line、Headers and Body.

* Request Line: it must contains request method [POST], path [/wongzy] and protocol version [http/1.1]
* Header: it must contains host [github.com], and other header is optional
* body: different from other two parts(Request Line and Header), it can be empty

### request method

useful request methods includes several methods and their standard as follows:

1. GET: 1. for request resource 2. do not amend service resource 3. request message *do not have body*
2. POST: 1. used to *put or amend* resources in server 2. request message *has body* to put or amend resources
3. PUT: 1. used to *amend* resources in server 2. request message *has body* to amend resources
4. DELETE: 1. used to delete body 2. request message *do not have body*
5. HEAD: 1. to get resources' message 2. request message *do not have body* 3. response message *do not have body*


## response message construction

![http2.png](https://i.loli.net/2020/04/18/URIoutxTmYfV9kl.png)

response message can be divided into three parts: Status Line、 Header and Body.

* Status Line: it must contains protocol[http/1.1], status code [200], and response message [ok]
* Header: depend on server
* body: it can be empty

### status code

common code includes five types, and their sense as follows:

* 1XX: temporary message，for example : 100[continue sending], 101[changing protocol]
* 2XX: request successfully code, for example : 200[OK], 201[build successfully]
* 3XX: redirecting, for example: 301[moved forever], 302[moved temporary],304[content not change]
* 4XX: client error, for example: 400[client request error]、401[authentication fail]、403[forbidden]、404[resource not fund]
* 5XX: server error, for example: 500[internal error]