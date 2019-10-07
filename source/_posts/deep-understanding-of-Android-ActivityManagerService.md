---
title: deep understand of Android ActivityManagerService
date: 2019-10-03 14:51:11
categories: Books of Deep UnderStand Android 
---

# overview

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

# be familiar with ActivityManagerService

AMS was built by system_server's ServerThread thread, extract its invoke track, codes as follows:

```
//1.invoke main method,obtain a Context object
context = ActivityManagerService.main(factoryTest);
//2.setSystemProcess: so system_server process can add to AMS and be managed by it
ActivityManagerService.setProecss();
//3.installSystem: put SettingProvider to work in system_server process
ActivityManagerService.installSystemProviders();
//4.save WindowManagerService in inside (call it WMS later)
ActivityManagerService.self().setWindowManager(wm);
//5. interact with WMS, display "start progrress" dialog
ActivityManagerNative.getDefault().showBootMessage(
context.getResources().getText(
//this string means: launching application program
com.android.internal.R.string.android_upgrading_starting_apps), false);
//6. AMS is the core in system, other service's systemReady can only be invoked by AMS after AMS ready
//attention! there are a little Service be ready before AMS systemReady, it did not influence analysis in here
ActivityManagerService.self().systemReady(new Runnable() {
public void run() {
startSystemUI(contextF); //launch systemUI, so, status bar was ready
if (batteryF != null ) batteryF.systemReady();
if (networkManagementF != null ) networkManagementF.systemReady();
......
Watchdog.getInstance().start(); // launch Watchdog 
...... //invoke other service's systemReady method
```

in the codes above, listed six significant point and sample explain about these invoke, in this session we all analyze interaction with WindowManagerService(AMS) except 4,5 point.

## analysis to ActivityManagerService's main method 

AMS's Main method would return a Context object, what can be slather used by other services. With this context, we can do many things(for example, obtain the resources in environment and java class message). but what a context does AMS's main method returned?see the code followed:
