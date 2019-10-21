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

there are several vital number, respectively are type of Instrumentation class, Application class and Context class, there is their affects:

* Instrumentation: Instrumentation is a tool class.When it be used, system will build it first, then build other component via it.Otherwise, the interaction between system and components will be transmitted by Instrumentation, as thus, Instrumentation can monitor the interaction between system and those components.
 In actually use,we can build Instrumentation's derived class to process transact.
 
 * Application: Application class saved a overall application status.Application are declared by <application> label of AndroidManifest.xml.We need to define Application's derived class in actual use.
 
 * Context: Context is a interface that we can obtain and operate Application's corresponding resources, classes, even the four components via it.
 
 > Application  in here is a Android concept, we can realize it as a container which the four components included. otherwise, a process can run several Applications(a apk can include other apks)

Context is a abstract class, but what built by AMS was its subclass, ContextImpl.As above, Context supplied Application's contextual message, and how does those message transmitted to Context? This problem include two aspects:

1. What Context actually is ?
2. What are the contextual message in Context?

next step, we will analyze getSystemContext method, which be invoked above.

```
public ContextImpl getSystemContext()
{
synchronized(this) {
if(mSystemContext == null){ //singleton mode
ContextImpl context = ContextImpl.createSystemContext(this);
//LoadApk is a new class imported by android2.3, which represent a APK loaded to system
LoadApk info = new LoadedApk(this, "android", context, null,
CompatibiltyInfo.DEFAULT_COMPATIBILITY_INFO);
//init this ContextImpl object
context.init(info, null,this);
//init resource message
context.getResources().updateConfiguration(
getConfiguaration(),getDisplayMetrcsLocked(
Compatibility.DEFAULT_COMPATIBILITY_INFO,false));
mSystemContext = context;//save this special ContextImpl object
}
}
return mSystemContext;
```

why method's name is getSystemContext? because it use a LoadedApk object in the init flow path of ContextImpl. As the annotation, LoadedApk is a class imported by Android2.3，this class is used to save messages about APK(for example, resource file location, JNI library location, etc).The package which represented by LoadedApk that has the method getSystemContext to init ContextImpl, named "android", actually is framework-res.apk, because this APK was solely used by system_server process, so call it getSystemContext.

We can display those classes's relationship by this picture:


![image002.png](https://i.loli.net/2019/10/13/SKUbmkCwZPGQ35I.png)

form the chapter we can see:

* from the derive relationship, ApplicationContentResolver was derived by ContentResolver, it mainly used to interact with ContentProvider. ContextImpl and ContextWrapper are both derived by Context, but Application was derived by ContextWrapper.

* form involved aspect, the involved area of ContextImpl is most extensive. it refers Resources via mResources, refers LoadedApk via mPackageInfo, refers ActivityThread via mMainThread, and refers ApplicationContentResolver via mContentResolver.

* ActivityThread represent main thread, it refers Instrumentation via mInstrumentation. Otherwise, it also saved several Application object.

> be attention, some field number's type is its base type in the method, but we directly refers to its real object in the picture.

the summary of systemMain

after the invoke of systemMain method, we get those:

1. obtain a ActivityThread, it represent application process's main thread

2. obtain a Context object, the Application environment it slinkingly referred is related with framework-res.apk

In summary, systemMain Method will build a Android runtime environment which is same as application process for system_server process.This sentence include two concepts:

1. process: derived by operate system, is a running body in os, the code we coding must be running at a process

2. Android Runtime environment: Android build a runtime environment for itself. in this environment, the concept of process is blurred, component's running status and their interaction are all in this environment.

Android Runtime environment was built above process. Applications are only interact with android environment in a general way.As the same, system_server expect its inter services interact with Android environment, thus, it request to build a run environment for system_server.Because of the specialization of system_server, it invoke systemMain method, but general application invoke ActivityThread's main method to build android environment.

Otherwise, although ActivityThread was defined to represent process's main thread, but as a java class, which thread derive its instance ? In system_server we can see, Activity object was built by other thread, but in application process, ActivityThread was build by main thread.
 
#### the analysis to ActivityThread.getSystemContext

We have seen ActivityThread.getSystemContext Method in the previous session. After the invoke of this method, we will obtain a Context object which can represent System process.But what actually the Context is? We can see its family picture follows:


![context_family](https://i.loli.net/2019/10/17/QavJiGgsxnAP83l.png)


From this picture we can see:

* ContextWrapper is very interesting, ContextWrapper is a proxy class actually is ContextImpl, which indicated by number mBase.Its inter function's detail realization are totally achieved by mBase.The goal of this design is to hide ContextImpl.

* Application is derived by ContextWrapper, and realized ComponentCallBacks2 interface. There is a LoadedApk type number mLoadedApk in Application.LoadedApk represent a Apk file. Because a AndroidManifest.xml file can only declared a Application label, so a Application must be bound with a LoadedApk.

* Service are derived by ContextWrapper,  therein inter number mApplication indicate Application(in AndroidManifest.xml, Service can only as Application's sub label, so Service must be bound with a Application)

* ContextThemeWrapper override two methods which are related with Theme.This is related with interface, so Activity as UI container in Android system, must be derived by ContextThemeWrapper too.As same as Service, Activity indicated Application via number mApplication internally.


#### analysis to AMS's startRunning method

the code as follows:

```
public final void startRunning(String pkg, String cls, String action,String data) {
synchronized(this) {
if(mStartRunning)
return; //if has invoked this method, return
mStartRunning = true;
//mTopComponent eventually be signed to null
mTopComponent = pkg != pkg != null && cls != null ?
new ComponentName(pkg, cls):null;
mTopAction = action != null? action:Intent.ACTION_MAIN;
mTopData = data; //mTopData enentually be signed to null
if (!mSystemReady) return; //mSystemReady is false, so return directlly
}
systemReady(null); //this method is very important, but it's a pity it not be invoked in startRunning method
```

startRunning method is sample,so we do not write a lot to analyze it.

In here, we had analyzed all four acknowledge points, we can review what did AMS's main method do.

#### the summary of ActivityManagerService's main method

two goal of AMS's main method:

1. the first goal is easy to think out, build AMS object

2. the other goal is obscure but vital, is to apply a android environment to be used by system_server process.

On the basis of the code analyze before, Android run environment will include two class number: Activity Thread and ContextImpl(usually its base class Context).

Picture follows shows some number variables in those two class, we can see ActivityThread and ContextImpl's function via those.

![ActivityandContextImpl.PNG](https://i.loli.net/2019/10/21/6FKdcyGLweQmRlM.png)

from the picture we can see:

* there is a mLooper number in ActivityThread, it represent a message loop. It afraid is a direct evidence for ActivityThread be called "Thread".Otherwise, mServices is used to save Service, Activities is used to save ActivityClientRecord, and mAllApplications is used to save Application.We will introduce those variable's function when met it.

* for ContextImpl, its number variable represent thar it are related with resources and APK file.

now we will analyze the third method - setSystemProcess.

> actually, SettingsProvider.apk is run in system_server process too.

### the analysis to AMS's setSystemProcess