---
title: Git基础命令汇总
date: 2018-02-14 15:50:09
categories: Git
---

> 汇总表如下所示

命令 | 作用 | 注意事项
--- | --- | ---
git clone | 把远程仓库取到本地 | 可能会需要输入GitHub的帐户名和密码，其中密码时不显示输入的
git log | 查看历史记录 | 加上后缀*-p*查看详细历史，*--stat*查看简要统计，查看完按q键退出
git status | 查看工作目录当前状态 |
git show | 查看具体的 commit | 查看当前的commit可以直接使用*git show*，看指定的commit需要加上这个commit的引用或者SHA-1码
git diff | 查看未提交的内容 | 直接使用查看工作目录和暂存区的不同，使用*git diff --staged*可以显示暂存区和上一条提交之间的不同，使用*git diff HEAD*可以显示工作目录和上一条提交之间的不同
git add | 把文件提交到暂存区 | 可以使用*git add .*来直接把工作目录下的所有改动全部放进暂存区，也可以*git add 文件名*放入单个文件
git commit |  把文件提交到本地仓库 | 一般还要通过*-m*参数提交描述信息，否则要进入编辑模式编辑提交信息,*commit --amend*可以修改已经提交到本地仓库的commit并生成新commit
git push | 把当前 branch 的位置上传到远端仓库 | 如果当前分支并不是默认分支，则使用*git push origin 分支名*提交到远程仓库，使用*-f*可以忽略冲突，强制push
git pull | 从远程仓库更新内容 |
git branch 分支名 | 创建新分支 | *git branch -d 名称*可以删除一个分支（默认分支不可删除）
git checkout 分支名 | 切换到分支 | 可以使用*git checkout -b 名称*来把创建分支和切换到分支的操作合并
git merge 分支名 | 把目标分支上的所有commit的内容与当前commit合并生成一个新的commit | 可能需要手动解决冲突，放弃解决冲突的话可以使用*git merge --abort*


