当 Brendan Eich 设计 JavaScript 的第一个版本时，他可能不知道他的这个设计在过去二十年中将如何发展。

目前已经有三种主要版本的语言规范（ES3 ES5 ES6），而其改进工作仍在继续。

说实话，JavaScript 从来就不是一个完美的编程语言。JavaScript 的弱点之一就是模块化的缺失。确实，将所有脚本语言仅用于页面上动画或表单验证，一切都可以在相同的全局范围内交互，在一开始确实不怎么需要模块化。

但是随着时间的推移，JavaScript 已经转变为通用语言，因为它开始用于在各种环境（浏览器、移动设备、服务器、物联网等）中构建复杂的应用程序。程序组件通过全局范围进行交互的旧方法变得不可靠，因为越来越多的代码往往会使应用程序过于脆弱，而能解决以上问题的关键在于模块化。

那么模块化具体解决了什么问题呢？简单的来说：

- 命名冲突
- 文件依赖
- 代码复用
- 多人协作
- 单元测试
- 性能提升
- ...

为了实现 JavaScript 模块化。从 ES3 时代开始，就有前端工程师进行了探索，从最开始的函数模块，到后来的命名空间，再到后来的使用立即执行函数（Immediately-Invoked Function Expression，IIFE）。但是到此，只是解决了命名冲突、不污染全局变量等部分问题。对于模块间的相互依赖即引入顺序并没有很好的解决，虽然也出现了如 放大模式 和 宽放大模式 的操作方式，但是社区中并没有统一的解决方案。

## CommonJS

2009 年，Nodejs 的出现标志着 javascript 从此可以用于服务器端编程。同时标志 Javascript 模块化编程正式诞生。因为在当时的浏览器环境下，没有模块也不是特别大的问题，毕竟网页程序的复杂性有限。但是在服务器端，一定要有模块，与操作系统和其他应用程序互动，否则根本没法编程。

node.js 的 模块系统，就是参照 [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1) 规范实现的。在 CommonJS 中，有一个全局性方法 require，用于加载模块。假定有一个数学模块 math.js，就可以像下面这样加载使用:

```js
var math = require("math");
math.add(2, 3); // 5
```

暴露模块也只需要：

```js
module.export = {
  add(a, b) {
    return a + b;
  },
};
```

CommonJS 实现了 JavaScript 模块化。很自然地，人们就想要在浏览器上也实现相应的功能。由于一个重大的局限，使得 CommonJS 规范不适用于浏览器环境。

还是上面的代码，在 Nodejs 中，require math.js 只需要从项目文件夹读取就好，简单的来说，就是我们只需要等待 math.js 从硬盘读取的时间就好。

但是在浏览器环境下，math.js 通常存储在服务器。等待时间取决于网速的快慢，可能要等很长时间，会使得浏览器处于"假死"状态。

因此，浏览器端的模块，不能采用"同步加载"（synchronous），只能采用"异步加载"（asynchronous）。这就是 AMD 规范诞生的背景。

## AMD

[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) 是 Asynchronous Module Definition 的缩写，意思就是"异步模块定义"。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。

实际上，AMD 是 RequireJS 在推广过程中对模块定义的规范化的产出。

主要解决了两个问题：

- 多个 js 文件可能有依赖关系，被依赖的文件需要早于依赖它的文件加载到浏览器
- js 加载的时候浏览器会停止页面渲染，加载文件越多，页面失去响应时间越长

AMD 也采用 require() 语句加载模块，但是不同于 CommonJS，它要求两个参数，还是上面那个例子：

```js
require(["math"], function (math) {
  math.add(2, 3);
});
```

暴露模块也只需要：

```js
define(function () {
  function add(a, b) {
    return a + b;
  }
  return {
    add: add,
  };
});
```

math.add() 与 math 模块加载不是同步的，浏览器不会发生假死。所以很显然，AMD 比较适合浏览器环境。

而解决模块相互依赖引用问题。require.js 通过分析 define 中的配置，会将各个模块所以来的模块通过 callback 的参数传递进去。下面定义一个要被别的模块依赖的公共模块：

```js
define("math", function () {
  function add(a, b) {
    return a + b;
  }
  return {
    add: add,
  };
});
```

其他模块使用时，只需要：

```js
define("other", ["math"], function (math) {
  console.log(math.add(1, 2));
});
```

关于 require.js 的详细使用方法，这里不再展开，有兴趣的可以去了解。讲真的，作为一名脚手架工程了，在 SPA 大行其道的时代，我在工作中从未使用过 require.js 。只是在研究 IIFE 时，有文章提到 AMD/CMD 就是基于 IIFE ，只是将其扩展为的更为强大便利，我对此感觉十分感兴趣，故此才来研究一下。

## CMD

[CMD](https://github.com/seajs/seajs/issues/242) 即 Common Module Definition 通用模块定义。CMD 规范是国内发展出来的，就像 AMD 有个 requireJS。CMD 有个浏览器的实现 SeaJS。SeaJS 要解决的问题和 requireJS 一样。只不过在模块定义方式和模块加载（可以说运行、解析）时机上有所不同。

和 AMD 采用 require()不同，CMD 使用 use 方法：

```js
seajs.use(["math.js"], function (math) {
  console.log(math.add(1, 2));
});
```

但是实际上 CMD 中也有 require 方法。用在 define 定义模块中：

```js
// math.js
define(function (require, exports, module) {
  exports.add = function (a, b) {
    return a + b;
  };
});
```

这里定义了一个模块，define 接受的参数中有 require。但是只有在需要调用其他模块时，才能用到：

```js
// other.js
define(function (require, exports, module) {
  console.log(require("math").add(1, 2));
});
```

进行到这里，虽然 CMD 的用法和 AMD 不仅相同。但是能够明显的感觉到他们做的事情是一样的。

虽然实现的过程不尽相同，理念也不同。

**但是这并不妨碍他们都已经过时的事实。**

从语法上来看，CMD 更接近 CommonJS。甚至连 exports => module.exports 都和 CommonJS。但是实际上无论是 AMD 和 CMD ，在插件和工具的加持下，都可以运行到 Node 端，关于插件和 Node 这里不展开，有兴趣的同学可以研究下。

## AMD&CMD

AMD 与 CMD 最明显的区别就是在模块定义时对依赖的处理不同。

**AMD 推崇依赖前置，在定义模块的时候就要声明其依赖的模块。**

**CMD 推崇就近依赖，只有在用到某个模块的时候再去 require。**

看到很多网站说 AMD 是异步加载，CMD 是同步加载，肯定是不准确的，**他们都是异步加载模块。**

通俗来说：

AMD 在加载完成定义（define）好的模块就会立即执行，所有执行完成后，遇到 require 才会执行主逻辑。（提前加载）

CMD 在加载完成定义（define）好的模块，仅仅是下载不执行，在遇到 require 才会执行对应的模块。（按需加载）

AMD 用户体验好，因为没有延迟，CMD 性能好，因为只有用户需要的时候才执行。

CMD 为什么会出现，因为对 node.js 的书写者友好，因为符合写法习惯，就像为何 vue 会受人欢迎的一个道理。

## UMD

是一种规范，就是一种兼容 CommonJS/AMD/CMD 的兼容写法。它是为了让模块同时兼容 CommonJS/AMD/CMD 规范而出现的，多被一些需要同时支持浏览器端和服务端引用的第三方库所使用。通过 define.amd/define.cmd/module 等判断当前支持什么方式，都不行就挂载到 window 全局对象上面去。

**UMD 是一个时代的产物，当各种环境最终实现 ES harmony 的统一的规范后，它也将退出历史舞台。**

```js
(function (root, factory) {
  if (typeof define === "function" && (define.amd || define.cmd)) {
    //AMD,CMD
    define(["b"], function (b) {
      return (root.returnExportsGlobal = factory(b));
    });
  } else if (typeof module === "object" && module.exports) {
    //Node, CommonJS之类的
    module.exports = factory(require("b"));
  } else {
    //公开暴露给全局对象
    root.returnExports = factory(root.b);
  }
})(this, function (b) {
  return {};
});
```

## ES6Module

ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代 CommonJS/AMD/CMD 规范，成为浏览器和服务器通用的模块解决方案。

ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。比如，CommonJS 模块就是对象，输入时必须查找对象属性。

```js
// CommonJS模块
let { stat, exists, readfile } = require("fs");

// 等同于
let _fs = require("fs");
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

上面代码的实质是整体加载 fs 模块（即加载 fs 的所有方法），生成一个对象（\_fs），然后再从这个对象上面读取 3 个方法。这种加载称为“运行时加载”，因为只有运行时才能得到这个对象，导致完全没办法在编译时做“静态优化”。

ES6 模块不是对象，而是通过 export 命令显式指定输出的代码，再通过 import 命令输入。

```js
// ES6模块
import { stat, exists, readFile } from "fs";
```

上面代码的实质是从 fs 模块加载 3 个方法，其他方法不加载。这种加载称为“编译时加载”或者静态加载，即 ES6 可以在编译时就完成模块加载，效率要比 CommonJS 模块的加载方式高。当然，这也导致了没法引用 ES6 模块本身，因为它不是对象。

由于 ES6 模块是编译时加载，使得静态分析成为可能。有了它，就能进一步拓宽 JavaScript 的语法，比如引入宏（macro）和类型检验（type system）这些只能靠静态分析实现的功能。

除了静态加载带来的各种好处，ES6 模块还有以下好处。

- 不再需要 UMD 模块格式了，将来服务器和浏览器都会支持 ES6 模块格式。目前，通过各种工具库，其实已经做到了这一点。
- 将来浏览器的新 API 就能用模块格式提供，不再必须做成全局变量或者 navigator 对象的属性。
- 不再需要对象作为命名空间（比如 Math 对象），未来这些功能可以通过模块提供。

虽然 ES6 引入了 Module 从语法层面实现了模块化。但是，实际上市面上大部分浏览器都尚未支持。我们在 cli 中打包后生成的代码其实也就是打包成了 AMD 的样子。

好在 Nodejs 已经支持 ESModule。几大主流浏览器都在积极推进支持原生 ES6 Modules 的工作，部分浏览器的技术预览版也已经初步完成了这一使命。可以通过 http://caniuse.com 查看目前浏览器的支持情况。

相信在不远的将来，JavaScript 终能摆脱模块化这段不堪回首的过去。
