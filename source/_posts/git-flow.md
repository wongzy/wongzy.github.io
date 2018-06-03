---
title: git flow
date: 2018-06-03 21:03:01
categories: Git
---

> git flow是产品进行迭代开发时流行的工作流，在公司当中很受欢迎

#### 组成

git flow包含了master、develop、feature、release、hotfix这五个分支，其中主要以master和develop进行分类

##### master

master是已发布的产品的代码分支，不能在这个分支上直接改动，如果出现了急需修复的问题，则新建hotfix分支进行修改，之后再merge到master分支上去

* hotfix分支

因为在增加新功能时开发代码都是在develop分支上进行的，修复时再到develop分支上开发显然是不合适的，所以我们一般都新建hotfix分支来对代码进行修复，修复完之后直接合并到主分支

> 此分支合并到master分支之后也需要被合并到develop分支

##### develop

develop分支衍生出的分支有feature和release，develop中存放的是新功能开发完毕的代码，develop中的代码不能直接合并到master分支，需要拉出release，经过测试之后再合并release到master分支上去，feature分支则是用来开发新功能的，新功能开发完毕后再合并到develop分支上去

* feature

开发新功能的分支，新功能开发完毕后被develop分支merge，feature分支可能有多个，用来并行开发不同到功能

* release

develop功能开发完毕之后的分支，经过测试之后被merge到master分支

#### 工作流程

如下图所示：

![git-workflow-release-cycle-4maintenance.png](https://i.loli.net/2018/06/03/5b13870a74d91.png)

> 图片来自网络

