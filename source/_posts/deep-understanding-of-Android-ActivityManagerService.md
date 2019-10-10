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

```
public static final Context main(int factoryTest) {
AThread thr = new AThread(); //1.build a AThread Object
thr.start();
......//wait until build thr success
ActivityManagerService m = thr.mService;
mSelf = m;
//2.invoke ActivityThread's systemMain Method
ActivityThread at = ActivityThread.systemMain();
mSystemThread = at;
//3.obtain a Context Object, attenation, the method be invoked named getSystemContext, what is SystemContext?
Context context = at.getSystemContext();
context.setTheme(android.R.style.Theme_Holo);
m.mContext = context;
m.mfactoryTest = factoryTest;
//ActivityStack is the vital class for AMS to manage Activity's launch and dispatch, we will analyze it in the future
m.mMainStack = new ActivityStack(m, context, true);
//invoke BSS's publish method, this knowledge point we are introduced before.
m.mBatteryStatsService.publish(context);
// another service: UsageStatsService.
m.mUsageStatsService.publish(context);
synchronized(thr) {
thr.mReady = true;
thr.notifyAll();//inform thr thread that this thread's mission finished
}
//4.invoke AMS's startRunning method
m.startRunning(null, null, null, null);
return context;
}
```

in Main method, we enumerated four viral method, they are:

* build AThread thread. Although AMS's main method was invoked by ServerThread, but AMS's own job did not put to ServerThread to finish, it create a new thread - AThread thread.

* ActivityThread.systemMain method. init ActivityThread object.

* ActivityThread.getSystemContext method. to acquire a Context object, from this method name we can see, this Context represent System's context environment.

* AMS's startRunning method.

attention! in main method, there is a "wait" and a "notifyAll", because:

1. main method need wait for AThread's thread launch and finish a part of mission.

2. after AThread finishing a part of job, it will wait for the finish of main method.

> this situation of two thread waiting for each other, is rare in Android code 

### analysis to AThread

in essence, AThread is a thread which supports message loop and transact, its main job is to build AMS object, then notify AMS's main method. so, this AMS object is what the main method waited.

#### the construct method of AMS

there are several mission which AMS has done:

* build BSS, USS, mProcessStat(type of ProcessState), mProcessStatsThread thread, those are all related to system's running status statistics.

* build /data/system catalog,  assign to mCompatModePackage (type of CompatModePackage) and mConfiguration (type of Configuration)'s fields.

#### analysis to ActivityThread.systemMain

ActivityThread is a vital class in Android framework, it represent the main thread in a application's process(for application process, Activity Thread's main method was certainly invoked by process's main thread). its responsibility is dispatch and transact the four component which runs in this thread.

attention! Application process are indicate those process which runs APK, they are derived(fork) by Zyote, relatively, there are system process(include Zygote and system_server).

the code of ActivityThread.systemMain

```
public static final ActivityThread systemMain(){
HardwareRender.disable(true);//forbid hardware render accelerate
// build a ActivityThread object, its construct method is very simple
ActivityThread thread = new ActivityThread();
thread.attach(true); //invoke its attach method, its params is true
return thrad;
```

as see above, ActivityThread represent its application process(which runs APK) main thread,but system_server was not a application process. so why here need ActivityThread?

remember framework-res.apk? which mentioned in the analysis of PackageManagerService. this APK does not only includes resource file, but also includes some Activity(for example, power-off dialog), these Activity are actually runs at system_server process. From ths perspective, can regard system_server as a special application process.

the code of ActivityThread's attach method


```
private void attach(boolean system) {
sThreadLocal.set(this);
mSystemThread = system; //judge whether it is system process
if (!system) {
......//application process's transact flow
} else { //system process's transact flow, this situation can only be transactted in system_server 
//when set DDMS, we can see that system_server process named system_process
android.ddm.DdmHandleAppName.setAppName("system_process");
try {
//there are serveral vital role appear, see the analysis followed
mInstrumentation = new Instrumentation();
ContextImpl context = new ContextImpl();
//init context, notice  the first parameter is getSystemContext
context.init(getSystemContext(),mPackageInfo, null, this);
//use Instrumentation to construct a Application object
Application app = Instrumentation.newApplication(Application.class, context);
//a process support several Application, mAllApplication are saved in its process's Application object
mAllApplications.add(app);
mInitialApplication = app; //set mInitialApplication
app.onCreate(); //invoke Application's onCreate method
} ......// try/catch end
} //if (!system) to judge if end
//register Configuration change's callback notification 
ViewRootImpl.addConfigCallback(new ComponentCallbacks2(){
public void onConfiguarationChanged(Configuaration newConfig){
.......//when system configuaration change(for example, language change), need invoke this callback
}
public void onLowMemory(){}
public void onTrimMemory(int level){}
});
}
```


