---
title: 策略模式：再见if-else
date: 2018-1-5 10:02:04
categories: 设计模式
---

> 在软件开发中，我们时常用到if-else来对进行条件判断，然后再进行相应的操作，但这样做会使得项目再日后的维护中出现困难，所以，当遇到比较复杂的if-else结构的时候，使用策略模式是很好的选择

#### 举一个简单的计算小例子，如对两个数进行加减乘除

##### 第一步，定义计算接口

```
public interface CalculateStrategy {
    int calculateComeout(int number1, int number2);
}
```

##### 第二步，实现策略类

1. 加法策略
```
public class PlusStrategy implements CalculateStrategy {
    @Override
    public int calculateComeout(int number1, int number2) {
        return number1 + number2;
    }
}
```
2. 减法策略
```
public class MinusStrategy implements CalculateStrategy {
    @Override
    public int calculateComeout(int number1, int number2) {
        return number1 - number2;
    }
}
```

##### 实例运行

```
public class Main {
    public static void main(String[] args) {
       int number1 = 20, number2 = 10;
       new PlusStrategy().calculateComeout(number1, number2);
       new MinusStrategy().calculateComeout(number1,number2);
    }
}
```

> 当然，这只是一个十分简单的实例，再实际应用中远没有这么“鸡肋”，比如我曾经开发过的一个小项目

#### 策略模式实战

> OpeningStartAnimation是一个开屏动画View，所以这里的策略模式是与绘画策略相关的

1. 绘画策略接口

```
public interface DrawStrategy {

    /**
     * 绘制app名称文字
     * @param canvas 画布
     * @param fraction 完成时间百分比
     * @param colorOfAppName 字体颜色
     * @param name 文字
     * @param widthAndHeightOfView view的宽和高
     */
    void drawAppName(Canvas canvas, float fraction, String name, int colorOfAppName,
                     WidthAndHeightOfView widthAndHeightOfView);

    /**
     * 绘制app图标
     * @param canvas 画布
     * @param fraction 完成时间百分比
     * @param colorOfIcon 绘制图标颜色
     * @param icon 图标
     * @param widthAndHeightOfView view的宽和高
     */
    void drawAppIcon(Canvas canvas, float fraction, Drawable icon, int colorOfIcon,
                     WidthAndHeightOfView widthAndHeightOfView);

    /**
     * 绘制app一句话描述
     * @param canvas 画布
     * @param fraction 完成时间百分比
     * @param statement 一句话描述
     * @param colorOfStatement 字体颜色
     * @param widthAndHeightOfView view的宽和高
     */
    void drawAppStatement(Canvas canvas, float fraction, String statement, int colorOfStatement,
                          WidthAndHeightOfView widthAndHeightOfView);
}

```

2. 其中的一个具体实现

```
public class LineDrawStrategy implements DrawStrategy {

    public LineDrawStrategy(){
    }

    @Override
    public void drawAppName(Canvas canvas, float fraction, String name, int colorOfAppName,
                            WidthAndHeightOfView widthAndHeightOfView) {
        canvas.save();
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(colorOfAppName);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(5);
        paint.setTextSize(50);
        paint.setStrokeJoin(Paint.Join.ROUND);
        paint.setTextAlign(Paint.Align.LEFT);
        float x = widthAndHeightOfView.getWidth() / 2;
        int centerY = widthAndHeightOfView.getHeight() / 2;
        float y = centerY - 275;
        Path path = new Path();
        path.moveTo(x, y);
        if (fraction <= 0.50) {
            path.lineTo(x, y + (25 + name.length() + 250) * (fraction / 0.50f));
            canvas.drawPath(path, paint);
        } else {
            path.lineTo(x, y + (25 + name.length() + 250) * ((1 - fraction)/ 0.50f));
            canvas.drawPath(path, paint);
            paint.setStyle(Paint.Style.FILL);
            canvas.drawText(name, x + 20, y + 150, paint);
        }
        canvas.restore();
    }

    @Override
    public void drawAppIcon(Canvas canvas, float fraction, Drawable icon, int colorOfIcon,
                            WidthAndHeightOfView widthAndHeightOfView) {
        int centerX = widthAndHeightOfView.getWidth() / 2;
        int centerY = widthAndHeightOfView.getHeight() / 2;
        Bitmap bitmap = ((BitmapDrawable) icon).getBitmap();
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(colorOfIcon);
        paint.setStrokeWidth(3);
        paint.setStrokeJoin(Paint.Join.ROUND);
        paint.setStyle(Paint.Style.STROKE);
        float bitmapLeft = centerX - 250;
        float bitmapRight = bitmapLeft + bitmap.getWidth() * 1.7f;
        float bitmapTop = centerY - 250;
        float bitmapBottom = bitmapTop + bitmap.getHeight() * 1.7f;
        canvas.save();
        if (fraction <= 0.75) {
            float newfraction = fraction / 0.75f;
            if (newfraction <= 0.25) {
                canvas.drawLine(bitmapLeft, bitmapBottom, bitmapLeft,
                        bitmapBottom - (bitmapBottom - bitmapTop) * (newfraction / 0.25f), paint);
              //  path.lineTo(bitmapLeft, bitmapBottom + (bitmapBottom - bitmapTop) * (newfraction / 0.25f));
            } else {
                canvas.drawLine(bitmapLeft, bitmapBottom, bitmapLeft, bitmapTop, paint);
              //  path.lineTo(bitmapLeft, bitmapTop);
            }
            if (newfraction > 0.25) {
                if (newfraction <= 0.50) {
                    canvas.drawLine(bitmapLeft, bitmapTop,
                            bitmapLeft + (bitmapRight - bitmapLeft) * ((newfraction - 0.25f)/0.25f),
                            bitmapTop, paint);
                  //  path.lineTo(bitmapLeft + (bitmapRight - bitmapLeft) * ((newfraction - 0.25f)/0.25f),
                   //         bitmapTop);
                } else {
                    canvas.drawLine(bitmapLeft, bitmapTop, bitmapRight, bitmapTop, paint);
                   // path.lineTo(bitmapRight, bitmapTop);
                }
            }
            if (newfraction > 0.50) {
                if (newfraction <= 0.75) {
                    canvas.drawLine(bitmapRight, bitmapTop, bitmapRight,
                            bitmapTop + (bitmapBottom - bitmapTop) * ((newfraction - 0.50f) / 0.25f),
                            paint);
                    //path.lineTo(bitmapRight, bitmapTop + (bitmapBottom - bitmapTop) * ((fraction - 0.50f) / 0.25f));
                } else {
                    canvas.drawLine(bitmapRight, bitmapTop, bitmapRight, bitmapBottom, paint);
                    //path.lineTo(bitmapRight, bitmapBottom);
                }
            }
            if (newfraction > 0.75) {
                if (newfraction <= 1) {
                    canvas.drawLine(bitmapRight, bitmapBottom, bitmapRight - (bitmapRight - bitmapLeft) * ((newfraction - 0.75f)/ 0.25f),
                                     bitmapBottom, paint);
                   // path.lineTo(bitmapLeft + (bitmapRight - bitmapLeft) * ((fraction - 0.75f)/ 0.25f),
                   //         bitmapBottom);
                } else {
                    canvas.drawLine(bitmapRight, bitmapBottom, bitmapLeft, bitmapBottom, paint);
                   // path.lineTo(bitmapLeft, bitmapBottom);
                }
            }
        }
        canvas.restore();
        canvas.save();
        if (fraction > 0.75) {
            canvas.clipRect(bitmapLeft + (bitmap.getWidth()/2f) * ((1 - fraction) /0.25f),
                    bitmapTop + (bitmap.getHeight()/2f)* ((1 - fraction) / 0.25f),
                    bitmapRight - (bitmap.getWidth()/2f) * ((1 - fraction) /0.25f),
                    bitmapBottom - (bitmap.getHeight()/2f)* ((1 - fraction) / 0.25f));
            Matrix matrix = new Matrix();
            matrix.postScale(1.7f, 1.7f, (bitmapLeft + bitmapRight) * 0.5f,
                    (bitmapTop + bitmapBottom) * 0.5f);
            canvas.concat(matrix);
            canvas.drawBitmap(bitmap, (bitmapLeft + bitmapRight) / 2 - bitmap.getWidth() / 2,
                    (bitmapTop + bitmapBottom) / 2 - bitmap.getHeight() / 2, paint);
        }
        canvas.restore();
    }

    @Override
    public void drawAppStatement(Canvas canvas, float fraction, String statement, int colorOfStatement,
                                 WidthAndHeightOfView widthAndHeightOfView) {
        canvas.save();
        int width = widthAndHeightOfView.getWidth();
        int height = widthAndHeightOfView.getHeight();
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(colorOfStatement);
        paint.setStyle(Paint.Style.STROKE);
        paint.setTextSize(45);
        paint.setTextSkewX(-0.2f);
        paint.setTextAlign(Paint.Align.CENTER);
        RectF rectF = new RectF(width / 4 - statement.length(), height * 7 / 8,
                width * 3, height);
        if (fraction <= 0.60f) {
            Path path = new Path();
            path.addArc(rectF,193,40 * fraction * 1.67f);
            canvas.drawPath(path, paint);
        } else {
            Path path = new Path();
            path.addArc(rectF, 193, 40);
            canvas.drawPath(path, paint);
            canvas.drawTextOnPath(statement, path, 0, 0, paint);
        }
        canvas.restore();
    }
}
```

3. 示例

> 这是选择策略的方法
```
/**
         * 开放绘制策略接口，可由用户自行定义
         * @param drawStrategy 绘制接口
         * @return Builder对象
         */
        public Builder setDrawStategy(DrawStrategy drawStrategy) {
            mOpeningStartAnimation.mDrawStrategy = drawStrategy;
            return this;
        }
```

> 策略的具体实现

```
 @Override
    protected void onDraw(Canvas canvas) {
        canvas.drawColor(colorOfBackground); //绘制背景色
        super.onDraw(canvas);
        mWidthAndHeightOfView.setHeight(getHeight());
        mWidthAndHeightOfView.setWidth(getWidth());
        mDrawStrategy.drawAppIcon(canvas, fraction, mDrawable, colorOfAppIcon,
                mWidthAndHeightOfView);
        mDrawStrategy.drawAppName(canvas, fraction, appName, colorOfAppName,
                mWidthAndHeightOfView);
        mDrawStrategy.drawAppStatement(canvas, fraction, appStatement, colorOfAppStatement,
                mWidthAndHeightOfView);
    }
```

具体项目可见

[项目地址](https://github.com/JoshuaRogue/FancyView)