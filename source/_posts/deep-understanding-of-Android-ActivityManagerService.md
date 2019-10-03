---
title: deep understand of Android ActivityManagerService
date: 2019-10-03 14:51:11
categories: Books of Deep UnderStand Android 
---

AndroidManagerService(abbreviation as AMS) is the most vital service of Android, it mainly in charge of four component's launching, switching、dispatching and manage the process of application, it plays a role as the manager process and dispatching module to the operating system. For this reason, it is very import to Android.

we will analyze AMS from these aspects as follow:

* as other service, we will analyze how ActivityManagerService start and trace it's invoking track.

* launch a Activity by a am command, analyze how the application build, start, and how they interact with AMS.

* use Broadcast and Service as samples, analyze the transaction track of Broadcast and Service in AMS. among this, we will give a flow chart for the transaction of Service .

* by starting with a Crash application process, analyze how AMS transact the "testament".

> except this four point, we will do a unified analysis to the dispatching of process and the managing of memory.

this is a class diagram about AMS's family, see the picture followed:

![AMSFamily.PNG](https://i.loli.net/2019/10/03/BMTE1SrhL2zetbc.png)

from the chart,we can know:

* AMS was derived by ActivityManagerNative, and it realize Watchdog.Monitor and BatteryStatsImpl.BatterCallback interface， and AMN was derived by  Binder, it realized IActivityManager interface.

* client use ActivityManager class, because of AMS is System's core service, lots of API can not be opened to use, so the designer did not add ActivityManager to AMS family directly. ActivityManager can obtain a ActivityManagerProxy object by invoking AMN's getDefault method, Activity Manager can interact with AMS by ActivityManagerProxy.


