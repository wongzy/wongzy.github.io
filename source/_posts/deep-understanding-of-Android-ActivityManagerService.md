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

The code of AMS's setSystemProcess as follows:

```
public static void setSystemProcess() {
try{
ActivityManagerService m = mSelf;
//register several services to ServiceManager
ServiceManager.addService("activity", m);
//used to print memory message
ServiceManager.addService("meminfo", new MemBinder(m));
/*
the new service that android 4.0 added, used to output Applications Graphics Acceleration info. Reader can check details via command adb shell dumpsys gfxinfo.
*/
Servicemanager.addService("gfxinfo", new GraphicsBinder(m));
if (MONITOR_CPU_USAGE) //this value is default true, add cpuinfo service
ServiceManager.addService("couinfo", new CpuBinder(m));
//regist permission manager service PermissionController
ServiceManager.addService("permission", new PermissionController(m));
/* important explaination:
query ApplicationInfo whose package named android to PackagemanagerService.
attation this invoke, althought PKMS and AMS belong to same process, but the interaction between those still need Context.
actually, here they can invoke PKMS's function directly, why it takes a lot effort? we will explain it clearly.
*/
//use AMS's mContext object
Application info = mSelf.mContext.getPackageManager().getApplicationInfo("android", STOCK_PM_FLAFS);
//1. invoke ActivityThread's installSYstemApplication method
mSystemThread.installSystemApplicationInfo(info);
synchronized(mSelf){
//2. here refers to the processes's management of AMS, see the analysis as follows
ProcessRecord app = mSelf.newProcessRecordLocked(mSYstemThread.getApplicationThread(),info,info.processName);
//attation, the last parameter is a char sequence, its value is system
app.persistent = true;
app.pid = MY_PID;
app.maxAdj = ProcessList.SYSTEM_ADJ;
//3. save ProcessRecord object
mSelf.mProcessNames.put(app.processName, app.info.uid, app);
synchronized(mSelf.mPidsSelfLocked) {
mSelf.mPidsSelfLocked.put(app.pid, app);
}
//in the basis of system's current status, adjust process's dispatch priority  and OOM_Adj, we will analyze it after
mSelf.updateLruProcessLocked(app, true, true);
}
}...... //throw exception
}
```

we enumerate one important explanation and two important points:

* important explanation: AMS query ApplicationInfo named android to PKMS. In here, the interaction between AMS and PKMS was finished by Context, check the code invoked by a services of functions, we will find that AMS will request PKMS's query function via Binder.AMS and PKMS are belong to one process, they can totally interact without Context. Why here spend a lot ? the reason is sample, Android expect the services in system_server are also interacting by android environment, for example, the unify between components's interact interfaces and system's future expandability.

* important point one: ActivityThread's installSystemApplicationInfo method.

* important point two: ProcessRecord class, it is related with the management to process of AMS.

#### ActivityThread's installSystemApplication function

installSystemApplicationInfo function's parameter is a ApplicationInfo object, this object was derived by querying the package named android of PKMS via Context(based on the knowledge above, there is only framework-res.apk is declared its package name android at current).

see installSystemApplicationInfo's code, as follows:

```
public void installSystemApplicationInfo(Application info) {
synchronized(this){
//the ContextImpl object returned is the object which built in AMS's main method
ContextImpl context = getSystemContext();
//invoke init method again, is this a repetitive invoke?
context.init(new pk(this, "android", context, info, CompatibilityInfo.DEFAULT_COMPATIBILITY_INFO), null, this);
//create a Profiler object, used to performance statistics
mProfiler = new Profiler();
}
}
```

We can see the code which invoke context.init() method, reader may doubt that getSystemContext method would return mSystemContext, but there mSystemContext was initialized, why it initialized again?

check the code we can see:

* when first performed init, the fourth parameter in LoadedApk struct function represent ApplicationInfo is null.

* when second performed init, the fourth parameter in LoadedApk struct function is not null, means that this parameter was real referred to a actual ApplicationInfo, this ApplicationInfo was derived from framework-res.apk.

On the basis of the message above, readers may think: the goal for Context to perform init is only to create a Android environment, but this Context was not bound with actual ApplicationInfo.Before the second perform of init, obtain a real ApplicationInfo via the interaction between Context and PKMS,then bind this context with ApplicationInfo via init function.

But although we resolve the question that why init function performs twice, but a more difficult problem occurs: the Context obtained by the first time perform init was not bind with ApplicationInfo, but it is also useful, why it is necessary to bind with a ApplicationInfo ? The result is sample, because framework-res.apk(include SettingsProvider.apk we will introduced after) run in system_server. As same as all other Apk, its running need a Android environment which correctly init.

because framework-res.apk is a APK file, and as same as APK file, it should run in a process. AMS was used to the management and dispatch to process, so the process which run the APK should have a refer manage struct, so the next step of AMS is to match run environment and process manage struct to a unity, and manage it unified by AMS.

The process management struct of AMS is ProcessRecord.

#### ProcessRecord and IApplicationThread

before the analysis to ProcessRecord, we think a problem first: how AMS interact with application process ? For example, when AMS launch a activity in other process, because this activity is running in other process, so it is necessary to AMS to interact with this process. The answer is interacting via Binder. For this, Android apply a IApplicationThread interface, this interface defined the interact function between AMS and application process. Chart follows is the interface's family chart.

![接口的家族图谱.PNG](https://i.loli.net/2019/10/27/8gyVjeQOxUoNK5C.png)

From the chart we can see:
 
 * ApplicationThreadNative realized IApplicationThread interface. From the method name the interface defined we can see, AMS interact with application via it. For example, when launch a Activity it invoke its interface's scheduleLaunchActivity method.
 
 * ApplicationThread refers its intern class ApplicationThread via number variable mAppThread, and Application derived from ApplicationThreadNative.
 
 now there is IApplicationThread interface, with it, AMS can interact with application process via it. For example, for a sample method follows:
 
```
public final void scheduleStopActivity(IBinder token, boolean showWindow, int configChanges) {
queueOrSendMessage(// this method will send message to a Handle intern
showWindow? H.STOP_ACTIVITY_SHOW:H.STOP_ACTIVITY_HIDE, token, 0, configChanges);
}
```

When AMS want to stop a Activity, it will invoke corresponding process IApplicationThread Binder client's scheduleStopActivity method. What the function realized is send a message to the process which ActivityThread is in.In application process, ActivityThread runs in main thread, os this message will be transacted in main thread.

> tips：Activity's onStop function will be invoked in main thread.

IApplication is rarely a interface for interacting between AMS and another process, except this, AMS need more message about this process.In AMS, process's massage saved in ProcessRecord data struct.So, what is ProcessRecord? We need see newProcessRecordLocked function before answer the method, its codes as follows:

```
final ProcessRecord newProcessReoordLocked(IApplicationThread thread, ApplicationInfo info, String customProcess) {
String proc = customProcess != null ? customProcess:info.processName;
BatteryStatsImpl.Uid.Proc ps = null;
BatteryStatsImpl stats = mBatteryStatsService.getActiveStatistics();
synchronized(stats) {
//BSImpl will build a battery statics item for this process
ps = stats.getProcessStatsLocked(info.uid, proc);
}
//build a ProcessRecord object represent corresponding process. AMS and its process's object is the second parameter thread.
return new ProcessRecord(ps, thread, info, proc);
```

There are a lot of number variable in ProcessRecord, we see which number variable init in its construct function:

```
ProcessRecord(BatteryStatsImpl.Uid.Proc_BatteryStats, IApplicationThread_thread.ApplicationInfo_info, String_processName) {
batteryStats = _batteryStats; //used to statics for battery
info = _info; //save ApplicationInfo
processName = _processName; //save process name
//a process can run several package, pkgList used to store package name
pkgList.add(_info.packageName);
thread = _thread; //save IApplicationThread, can interact with application process via it
//variables below here are related with process priority, OOM_adj. We will analyze their function later.
maxAdj = ProcessList.EMPTY_APP_ADJ;
hiddenAdj = ProcessList.HIDDEN_APP_MIN_ADJ;
curRawAdj = setRawAdj = -100;
curAdj = setAdj = -100;
//used to controll whether this process process is always standed in memory(it will be rebotted by system even be killed), only vital process have this priority.
persistent = false;
removed = false;
}
```

Except saving IApplicationThread which interacted with application process, ProcessRecord also saved process name, different state corresponding Oom_adj value and a ApplicationInfo. Although a process can run several Application, but ProcessRecord usually saved the ApplicationInfo whose Application run in advance.

For now, a ProcessRecord object was built, different from other application processes, the process it corresponded is system_server.To represent it specialization, AMS signed specific value for some number variable:

```
app.persistent = true; //sign value to true
app.pid = MY_PID; //sign pid to system_server's process number
app.maxAdj = ProcessList.SYSTEM_ADJ; //set max OOM_Adj, system process's default value is -16
//In addition, app's processName was signed to "system"
```

Now, a ProcessRecord object which indicate system_server was built.After that AMS put it in its sphere of influence.

There are two number variables used to save ProcessRecord, one is mProcessNames, the other is mPidsSelfLocked.Chapter follows is the struct of two number variables.

![数据结构示意图.PNG](https://i.loli.net/2019/10/29/BMsAYCJQFLfSpbh.png)

#### summary of AMS's setSystemProcess

Now we review what job setSystemProcess do:

* Register AMS, meminfo, gfxinfo and other services to ServiceManager.

* On the basis of ApplicationInfo which from PKMS init Android running environment, and build a ProcessRecord which represents system_server process, from now, system_server was included in AMS's sphere of manage.

# the summary of ActivityManagerService

there are four vital and complicated method in ActivityManagerService, the knowledge point summary as follows:

* AMS's main function : build a instance of AMS, the most important work is to build Android runtime environment, obtain a ActivityThread and a Context object.

* AMS's setSystemProcess function: this function register AMS and meminfo services to ServiceManager, otherwise, it build a ProcessRecord object for system_server object.Because AMS is the process manage and dispatch center in java world, to treat equally without discrimination to java processes, although system_server is a system process, it will be included in AMS's manage scope.

* AMS's installSystemProviders function: load SettingProvider for system_server

* AMS's systemReady function: do ending task before finishing launch. After invoking function, Home Activity will display in user.

the analysis to AMS invoke trace is the first line we  crack AMS.

# the analysis of startActivity

We will spend a lot on the launch flow of Activity in this section, it is the most difficult way of five ways, believe read can realize it if work hard.

## start with am

am is the same as pm, it is a script, it used to interact with AMS, for example, launch Activity, launch Service, send Broadcast.When we use am script to launch a activity, it eventually will invoke AMS's startActivityAnd Wait function to deal with this launch request, it is a sample way to analyze Activity's launch via am.

## analysis to AMS's startActivityAndWait

startActivityAndWait method has lots of parameters, we acquaint with them first.

```
public final WaitResult startActivityAndWait{
/*
in most situaction, a launch of Activity is called by a application process, IApplicationThread is a channel which application interact with application process, it is a mark to invoke process, in this example, am is not a application process, so the caller transfer is null
*/
IApplicationThread caller,
//Intent and resolvedType, in this example,resolvedType is null
Intent intent,String resolvedType,
//grantedUriPermissions and granteMode are relatived with perimission
Uri[] grantedUriPermissions, //in this example, is null
int grantedMode, //in this example, is null, used to received startActivityForResult's result
String resultWho, //in this example, is null
//requestCode, in this example, is 0,its value's  significance was defined by its invoker,if its value equal or bigger than zero, AMS will save it by itself,and return it by onActivityResult method.
int requestCode,
boolean onlyIfNeeded, // in this example, is false
boolean debug, //is a debug process
//those three parameters are relatvied with performance statistics
String profileFile,
ParceIFileDescriptor profileFd, boolean autoStopProfiler)
```

the code of startActivityAndWait as follows:

```
public final WaitResult startActivityAndWait(IApplicationThread caller, Intent intent,String resolvedType, Uri[] grantedUriPermissions,int grantedMode, IBinder resultTo, String resultWho, int requestCode, boolean onlyifNeeded, boolean debug, String profileFile, ParcelFileDescriptor profileFd, boolean autoStopProfiler) {
// create a WaitResult object to save transact result
WaitResult res = new WaitResult();
//mMainStack is ActivityStack type, invoke its startActivityMayWait function
mMainStack.startActivityMayWait(caller, -1, intent, resolvedType, grantedUriPermissions, grantedMode, resultTo, resultWho,requestCode, onlyIfNeeded, debug, profileFile, profileFd, autoStopProfiler, res, null);//last parameter is Configuration,in this example ,is null
return res;
```

mMainStack is AMS's member variable, type is ActivityStack, this class is Activity dispatch's core role,we will introduce base knowledge first.

### Task, Back Stack, ActivityStack and Launch mode

#### introduce for Task and Back Stack

Task is a gather of activities. Why call it Activity? Activity is an organizational unit for performing a specific function.

We can see a picture to distinguish task and activity, as follows:

![stack3.PNG](https://i.loli.net/2019/12/05/OZJi4cqz8DSTGrW.png)

from this picture,A、B those two task uses different Activity to accomplish mission.Take a attention, there is no reuse in A and B task.

see C task again, it can subdivide to four Activities, in C task there are two activities, one use task A's A1, task B's B2, why task C do not create its own Activity, but use other task's activity? Because although the thing user want to do is different, when subdivide task, it is possible to appear situation that functions of Activity is similar with other.As A1, B2 are meet requirements, it is not necessary to create activity. 

When there are several tasks in the system, system only support task in foreground, so the activity user see is foreground, other tasks are in background, the order in background tasks is not changed.User can move the whole task to background or foreground.

> tips: readers who had used android system should know, when you long pressed Home key, system would show recent task list, users can switch in several task.

Content above introduce what is Task and how Android divide Task and manage Activity in a abstract way, but in real code, how it designed?

#### introduce to ActivityStack

There are two point we should consider:

1. The way to organize Activity in Task.We know that Android organize Activity by first in, last out way, as same as Stack in data struct.

2. The way to organize and manage several Task.

Android designed a ActivityStack class to take responsibility to those mission, the struct as picture follows:

![ActivityStack.PNG](https://i.loli.net/2019/12/06/NYxtLlcM65HBfGF.png)


From this picture we can see:

* Activity is shown by ActivityRecord, Task is shown by TaskRecord. ActivityRecord's task member refers to the Task which its Activity in. state variable used to represent the state the Activity stand(including INITIALIZING, RESUMED, PAUSED).

* ActivityStack use ArrayList mHistory to save ActivityRecord, to our surprise, this mHistory saved all Task's ActivityRecord in System, not just for a certain Task.

* ActivityStack's mMainStack member is interesting, it represent whether this ActivityStack is main ActivityStack. Where there is a Lord, there is a servant, but current System only has a ActivityStack, and its mMainStack is true.From the name of ActivityStack we can guess, in the initialize process Android developer want to use ActivityStack to manage single Task's ActivityRecord(this class is "State and management of a single stack of activities"), but do not know why in current code it put all Task's ActivityRecord to mHistory, and remained mMainStack.

* There are no member in ActivityStack to save TaskRecord.

from content above, ActivityStack use array way to save all Task's ActivityRecord, and no member used to save TaskRecord. But this way has its advantage and disadvantage.

* the advantage is cut the manage of TaskRecord level, directly use ActivityRecord as manage unit, this method can reduce the spend of manage.

* the disadvantage is weak the concept of Task, its struct is not clearly enough.   