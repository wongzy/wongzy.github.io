---
title: ButterKnife在RecyclerView adapter中的使用
date: 2017-10-8 12:02:04
categories: Android第三方开源项目使用
---
#### ButterKnife是一个用起来十分方便的开源库，我们只需要用一个小小的插件ButterKnifeZenezny就免去了写一大袋findViewbyId的书写，不过在adapter中，插件自动生成的方式就步行了，我们一般都需要在ViewHolder中实现依赖注入,这时候我们需要像下面这样
```
public static class LocationViewHolder extends RecyclerView.ViewHolder {
        @BindView(R.id.location_show)
        TextView locationShow;
        @BindView(R.id.statement_show)
        TextView stateementShow;
        @BindView(R.id.time_show)
        TextView timeShow;
        @BindView(R.id.spend_money_show)
        TextView spendMoneyShow;
        @BindView(R.id.spend_time_show)
        TextView spendTimeShow;
        public LocationViewHolder(View itemView) {
            super(itemView);
            ButterKnife.bind(this, itemView);
        }
    }
```
#### 这种方式就可以实现用ButterKnife注入view，简化了我们的书写，当然，对项目中用了ButterKnife的强迫症患者来说，实在是很棒了。。
