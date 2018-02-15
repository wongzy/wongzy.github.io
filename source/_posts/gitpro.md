---
title: Git高级命令
date: 2018-02-15 10:48:42
categories: Git
---

#### 汇总

> git中比较复杂的命令如下表所示：

命令 | 作用
--- | ---
git rebase | 在新位置重新提交
git revert | 撤销commit
git reset | 丢弃提交
git stash | 临时存放工作目录的改动
git reflog | 找回分支

#### git rebase

##### 作用

rebase的意思是，给你的commit序列重新设置基础点（也就是父commit）。展开来说就是，把你指定的commit以及它所在的 commit 串，以指定的目标commit为基础，依次重新提交一次。这和merge的不同点在于merge会发生分支散开又合并的情况，而用rebase则不会。

> 注意：当使用rebase时，必须先checkout到分支，不能在默认分支（master）上直接使用rebase，它会时主分支上新的commit消失。在使用rebase后，可以使用merge来移动到最新的提交。

#### git revert

##### 作用

revert的作用时撤销提交上去的commit，希望撤销哪个commit，就把哪个填在后面，用法为：git revert 提交名

> 注意：使用revert并不会修改提交历史，而是生成新的commit，所以是一种安全的方法

#### git reset

##### 作用

git reset的作用与git revert的作用比较相似，不同点在于git reset撤销的是还没有被push的提交，git revert撤销的则是已经被push的提交，因为git revert不会修改提交历史，而reset则会修改。

reset可加三种修饰，有着三种不同的作用，如下

修饰 | 作用 | 说明
--- | --- | ---
-- mixed | 保留工作目录，并清空暂存区 | 重置位置的同时，保留工作目录的内容，也就是修改为新commit已完成，但是还没提交到本地仓库的样子
-- hard | 重置工作目录 | 重置位置的同时，清空工作目录的所有改动,恢复成目前head所值的commit的样子
-- soft | 保留工作目录 | 把后面修改的内容都放进暂存区

#### git stash

##### 作用

stash的作用就是把当前工作目录先隐藏起来，等到需要的时候再拿出来，拿出来时就使用*git stash pop*

#### git reflog

##### 作用

reflog可以查看head的移动历史，如果我们刚刚删除了一个分支，可以通过reflog查看分支，再通过checkout切换到那个分支
