# module.exports 与 exports 的区别

---

如果你去网上冲浪搜索 NodeJS 中 module.exports 与 exports 的区别，一定会有一大堆文章告诉你诸如 exports 是 module.exports 的引用，直接赋值 exports 会切断引用联系等诸如此类的答案。

乍一看是那么回事，但是仔细琢磨却疑点重重。好在最近在读朴灵先生的《深入浅出 NodeJS》，书中给出的答案解决了我多年的疑惑。这一切都要从 CommonJS 规范说起。

## CommonJS 规范

在 JavaScript 的发展历程中，它主要在浏览器前端发光发热。在实际应用中，JavaScript 的表现能力取决于宿主环境中的 API 支持程度。

在 Web 1.0 时代，只有对 DOM、BOM 等基本的支持。

随着 Web 2.0 的推进，HTML5 崭露头角，它将 Web 网页带进 Web 应用的时代，在浏览器中出现了更多、更强大的 API 供 JavaScript 调用。

但是，这些过程发生在前端，后端 JavaScript 的规范却远远落后。对于 JavaScript 自身而言，仍有许多缺陷，其中一个就是缺乏模块化支持。CommonJS 规范的提出就是为了解决这个问题。

CommonJS 对模块的定义十分简单，主要分为模块引用、模块定义和模块标识 3 个部分。

### 1．模块引用

模块引用的示例代码如下：

```js
var math = require("math");
```

在 CommonJS 规范中，存在 require()方法，这个方法接受模块标识，以此引入一个模块的 API 到当前上下文中。

### 2．模块定义

在模块中，上下文提供 require()方法来引入外部模块。对应引入的功能，上下文提供了 exports 对象用于导出当前模块的方法或者变量，并且它是唯一导出的出口。在模块中，还存在一个 module 对象，它代表模块自身，而 exports 是 module 的属性。

在 Node 中，一个文件就是一个模块，将方法挂载在 exports 对象上作为属性即可定义导出的方式：

```js
// math.js
exports.add = function () {
  var sum = 0,
    i = 0,
    args = arguments,
    l = args.length;
  while (i < l) {
    sum += args[i++];
  }
  return sum;
};
```

在另一个文件中，我们通过 require()方法引入模块后，就能调用定义的属性或方法了：

```js
// program.js
var math = require("math");
exports.increment = function (val) {
  return math.add(val, 1);
};
```

### 3．模块标识

模块标识其实就是传递给 require()方法的参数，它必须是符合小驼峰命名的字符串，或者以．、.．开头的相对路径，或者绝对路径。它可以没有文件名后缀．js。

模块的定义十分简单，接口也十分简洁。它的意义在于将类聚的方法和变量等限定在私有的作用域中，同时支持引入和导出功能以顺畅地连接上下游依赖。每个模块具有独立的空间，它们互不干扰，在引用时也显得干净利落。

CommonJS 构建的这套模块导出和引入机制使得用户完全不必考虑变量污染，命名空间等方案与之相比相形见绌。

## Node 模块编译

Node 在实现中并非完全按照 规范实现，而是对模块规范进行了一定的取舍，同时也增加了少许自身需要的特性。在 Node 中，每个文件模块都是一个对象，它的定义如下：

```js
function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  if (parent && parent.children) {
    parent.children.push(this);
  }

  this.filename = null;
  this.loaded = false;
  this.children = [];
}
```

编译和执行是引入文件模块的最后一个阶段。定位到具体的文件后，Node 会新建一个模块对象，然后根据路径载入并编译。

每一个编译成功的模块都会将其文件路径作为索引缓存在 Module.\_cache 对象上，以提高二次引入的性能。

## 模块包装

我们知道每个模块文件中存在着 require、exports、module 这 3 个变量，但是它们在模块文件中并没有定义，那么从何而来呢？

甚至在 Node 的 API 文档中，我们知道每个模块中还有 **filename、**dirname 这两个变量的存在，它们又是从何而来的呢？

如果我们把直接定义模块的过程放诸在浏览器端，会存在污染全局变量的情况。

事实上，在编译的过程中，Node 对获取的 JavaScript 文件内容进行了头尾包装。在头部添加了(function (exports, require, module, **filename, **dirname) {\n，在尾部添加了\n});。一个正常的 JavaScript 文件会被包装成如下的样子：

```js
(function (exports, require, module, __filename, __dirname) {
  var math = require("math");
  exports.area = function (radius) {
    return Math.PI * radius * radius;
  };
});
```

这样每个模块文件之间都进行了作用域隔离。

包装之后的代码会通过 vm 原生模块的 runInThisContext()方法执行（类似 eval，只是具有明确上下文，不污染全局），返回一个具体的 function 对象。

最后，将当前模块对象的 exports 属性、require()方法、module（模块对象自身），以及在文件定位中得到的完整文件路径和文件目录作为参数传递给这个 function()执行。

这就是这些变量并没有定义在每个模块文件中却存在的原因。在执行之后，模块的 exports 属性被返回给了调用方。exports 属性上的任何方法和属性都可以被外部调用到，但是模块中的其余变量或属性则不可直接被调用。至此，require、exports、module 的流程已经完整。这就是 Node 对 CommonJS 模块规范的实现。

此外，许多初学者都曾经纠结过为何存在 exports 的情况下，还存在 module.exports。理想情况下，只要赋值给 exports 即可：

```js
exports = function () {
  // My Class
};
```

但是通常都会得到一个失败的结果。其原因在于，exports 对象是通过形参的方式传入的，直接赋值形参会改变形参的引用，但并不能改变作用域外的值。测试代码如下：

```js
var change = function (a) {
  a = 100;
  console.log(a); // => 100
};

var a = 10;
change(a);
console.log(a); // => 10
```
