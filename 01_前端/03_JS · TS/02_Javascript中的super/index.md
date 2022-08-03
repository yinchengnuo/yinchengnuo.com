# Javascript中的super

----

提到 ES6，就绕不开 class，而作为 ES5 function 的语法糖，ES6 在语言标准层面实现了 Javascript 对象模版。

基本上，ES6 的 class 可以看作只是一个语法糖，它的绝大部分功能，ES5 都可以做到，新的 class 写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。

而提到面向对象，就绕不开继承。

而因为最近看 Typescript 遇到了大量的 class 及继承语法，因此我特意复习了 ES6 class 的相关使用，整体下来理解起来都没什么问题，但是只有 super 这块稍微有些绕，因此这里记录总结一下，方便后期快速捡起。所以这里就不再赘述 ES5 实现继承的种种和 ES6 class 的用法，这里所有的内容全部参考自：

[https://es6.ruanyifeng.com/#docs/class-extends](https://es6.ruanyifeng.com/#docs/class-extends)

有兴趣可以自行查阅，话不多说直接开始！

## super 继承

ES6 class 可以通过 extends 关键字实现继承，而同时子类必须在 constructor 方法中调用 super 方法，否则新建实例时会报错。

这是因为子类自己的 this 对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法。如果不调用 super 方法，子类就得不到 this 对象。

ES5 的继承的实质是先创造子类的实例对象 this，然后再将父类的方法添加到 this 上面（Parent.apply(this)）。ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到 this 上面（所以必须先调用 super 方法），然后再用子类的构造函数修改 this。

因此子类的构造函数中，只有调用 super 之后，才可以使用 this 关键字，否则会报错。这是因为子类实例的构建，基于父类实例，只有 super 方法才能调用父类实例。

同时子类没有定义 constructor 方法，super 方法会被默认添加。

> super 这个关键字，既可以当作函数使用，也可以当作对象使用。在这两种情况下，它的用法完全不同。

## super 方法

super 作为函数调用时，代表父类的构造函数。

ES6 要求，子类的构造函数必须执行一次 super 函数。子类 B 的构造函数之中的 super()，代表调用父类的构造函数。

注意，super 虽然代表了父类 A 的构造函数，但是返回的是子类 B 的实例，即 super 内部的 this 指的是 B 的实例，因此 super()在这里相当于 A.prototype.constructor.call(this)。

作为函数时，super()只能用在子类的构造函数之中，用在其他地方就会报错。

## super 对象

super 作为对象时，在普通方法中，指向父类的原型对象，在静态方法中，指向父类。

由于 super 指向父类的原型对象，所以定义在父类实例上的方法或属性，是无法通过 super 调用的。ES6 规定，在子类普通方法中通过 super 调用父类的方法时，方法内部的 this 指向当前的子类实例。由于 this 指向子类实例，所以如果通过 super 对某个属性赋值，这时 super 就是 this，赋值的属性会变成子类实例的属性。

如果 super 作为对象，用在静态方法之中，这时 super 将指向父类，而不是父类的原型对象。在子类的静态方法中通过 super 调用父类的方法时，方法内部的 this 指向当前的子类，而不是子类的实例。

## 注意

使用 super 的时候，必须显式指定是作为函数、还是作为对象使用，否则会报错。console.log(super)当中的 super，无法看出是作为函数使用，还是作为对象使用，所以 JavaScript 引擎解析代码的时候就会报错。这时，如果能清晰地表明 super 的数据类型，就不会报错。

最后，由于对象总是继承其他对象的，所以可以在任意一个对象中，使用 super 关键字。

```js
var obj = {
  toString() {
    return "MyObject: " + super.toString();
  },
};

obj.toString(); // MyObject: [object Object]
```
