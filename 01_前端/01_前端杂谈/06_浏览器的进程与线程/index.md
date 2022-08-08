# 浏览器的进程与线程

## 多进程的浏览器

浏览器是多进程的，有一个主控进程，以及每一个 tab 页面都会新开一个进程（某些情况下多个 tab 会合并进程）进程可能包括主控进程，插件进程，GPU，tab 页（浏览器内核）等等...主要有：

> - Browser 进程：浏览器的主进程（负责协调、主控），只有一个。
> - 第三方插件进程：每种类型的插件对应一个进程，仅当使用该插件时才创建。
> - GPU 进程：最多一个，用于 3D 绘制。
> - 浏览器渲染进程（内核（Renderer 进程））：默认每个 Tab 页面一个进程，互不影响，控制页面渲染，脚本执行，事件处理等（有时候会优化，如多个空白 tab 会合并成一个进程）。

如下图，大多数名字 QQ 浏览器的进程都是我打开的一个个 tab 页面。如果你在浏览器新打开一个页面，浏览器就会多一个进程，反之减少一个。

<div style="display: flex;justify-content: center;">
<img src="https://img-blog.csdnimg.cn/20190405232900698.png">
</div>

## 多线程的浏览器内核进程

因为所有的浏览器内容展示都离不开浏览器内核进程，所以先从浏览器内核进程开始说起，随后穿插其他各大进程。每一个 tab 页面可以看作是浏览器内核进程，也叫 Renderer 进程，然后这个进程是多线程的，它有几大类子线程：

### GUI 线程

- 负责渲染浏览器界面，解析 HTML，CSS，构建 DOM 树和 RenderObject 树，布局和绘制等。
- 当界面需要重绘（Repaint）或由于某种操作引发回流(reflow)时，该线程就会执行。
- 注意，GUI 渲染线程与 JS 引擎线程是互斥的。当 JS 引擎执行时 GUI 线程会被挂起（相当于被冻结了），GUI 更新会被保存在一个队列中等到 JS 引擎空闲时立即被执行。

### 事件触发线程

- 归属于浏览器而不是 JS 引擎，用来控制事件循环（可以理解，JS 引擎自己都忙不过来，需要浏览器另开线程协助）。
- 当 JS 引擎执行代码块如 setTimeOut 时（也可来自浏览器内核的其他线程,如鼠标点击、AJAX 异步请求等），会将对应任务添加到事件线程中
- 当对应的事件符合触发条件被触发时，该线程会把事件添加到待处理队列的队尾，等待 JS 引擎的处理。
- 注意，由于 JS 的单线程关系，所以这些待处理队列中的事件都得排队等待 JS 引擎处理（当 JS 引擎空闲时才会去执行）。

### 定时器线程

- 传说中的 setInterval 与 setTimeout 所在线程。
- 浏览器定时计数器并不是由 JavaScript 引擎计数的,（因为 JavaScript 引擎是单线程的, 如果处于阻塞线程状态就会影响记计时的准确）。
- 因此通过单独线程来计时并触发定时（计时完毕后，添加到事件队列中，等待 JS 引擎空闲后执行）。
- 注意，W3C 在 HTML 标准中规定，规定要求 setTimeout 中低于 4ms 的时间间隔算为 4ms。

### JS 引擎线程

- 也称为 JS 内核，负责处理 Javascript 脚本程序。（例如 V8 引擎）。
- JS 引擎线程负责解析 Javascript 脚本，运行代码。
- JS 引擎一直等待着任务队列中任务的到来，然后加以处理，一个 Tab 页（renderer 进程）中无论什么时候都只有一个 JS 线程在运行 JS 程序。
- 同样注意，GUI 渲染线程与 JS 引擎线程是互斥的，所以如果 JS 执行的时间过长，这样就会造成页面的渲染不连贯，导致页面渲染加载阻塞。

### 网络请求线程

- 在 XMLHttpRequest 在连接后是通过浏览器新开一个线程请求。
- 将检测到状态变更时，如果设置有回调函数，异步线程就产生状态变更事件，将这个回调再放入事件队列中。再由 JavaScript 引擎执行。

<div style="display: flex;justify-content: center;">
<img src="https://img-blog.csdnimg.cn/201904041911010.png">
</div>

可以看到，里面的 JS 引擎是内核进程中的一个线程，这也是为什么常说 JS 引擎是单线程的。

## 主进程和内核进程的通信过程

如果自己打开任务管理器，然后打开一个浏览器，就可以看到：任务管理器中出现了两个进程（一个是主控进程，一个则是打开 Tab 页的渲染进程），然后在这前提下，看下整个简化的过程：

> - Browser 进程收到用户请求，首先需要获取页面内容（譬如通过网络下载资源），随后将该任务通过 RendererHost 接口传递给 Render 进程。
> - Renderer 进程的 Renderer 接口收到消息，简单解释后，交给 GUI 渲染线程，然后开始渲染。
> - 渲染线程接收请求，加载网页并渲染网页，这其中可能需要 Browser 进程获取资源和需要 GPU 进程来帮助渲染。
> - 当然可能会有 JS 线程操作 DOM（这样可能会造成回流并重绘）。
> - 最后 Render 进程将结果传递给 Browser 进程。
> - Browser 进程接收到结果并将结果绘制出来

这里绘一张简单的图：（很简化）

<div style="display: flex;justify-content: center;">
<img src="https://img-blog.csdnimg.cn/20190404191314544.png">
</div>

看完这一整套流程，应该对浏览器的运作有了一定理解了，这样有了知识架构的基础后，后续就方便往上填充内容。

## 内核进程的 GUI 线程的渲染流程

根据上文我们可以知道，当我们输入 url 然后回车后：

> - 浏览器获取 url，浏览器主进程接管，开一个下载线程。
> - 然后进行 http 请求（略去 DNS 查询，IP 寻址等等操作），然后等待响应，获取内容。
> - 随后将内容通过 RendererHost 接口转交给 Renderer 进程，GUI 线程开始运行，浏览器渲染流程开始。

浏览器器内核的 Render 进程拿到内容后，渲染过程大概可以划分成以下几个步骤：

> - 解析 html 建立 dom 树。
> - 解析 css 构建 render 树（将 CSS 代码解析成树形的数据结构，然后结合 DOM 合并成 render 树）。
> - 布局 render 树（Layout/reflow），负责各元素尺寸、位置的计算。
> - 绘制 render 树（paint），绘制页面像素信息。
> - 浏览器会将各层的信息发送给 GPU，GPU 会将各层合成（composite），显示在屏幕上。

具体过程如下图：

<div style="display: flex;justify-content: center;">
<img src="https://img-blog.csdnimg.cn/20190404191512139.png">
</div>

所有详细步骤都已经略去，渲染完毕后就是 load 事件了，之后就是自己的 JS 逻辑处理了.既然略去了一些详细的步骤，那么就提一些可能需要注意的细节把。

- load 事件与 DOMContentLoaded 事件的先后

  > -当 DOMContentLoaded 事件触发时，仅当 DOM 加载完成，不包括样式表，图片。 -当 onload 事件触发时，页面上所有的 DOM，样式表，脚本，图片都已经加载完成了。

- css 加载是否会阻塞 dom 树渲染？

  > - css 是由单独的下载线程异步下载的，所以 css 加载不会阻塞 DOM 树解析（异步加载时 DOM 照常构建）
  > - 但会阻塞 render 树渲染（渲染时需等 css 加载完毕，因为 render 树需要 css 信息）。

## GPU 进程中的普通和复合图层

根据上文我们可以知道了 composite 概念。可以简单的这样理解，浏览器渲染的图层一般包含两大类：普通图层以及复合图层。

首先，普通文档流内可以理解为一个复合图层（这里称为默认复合层，里面不管添加多少元素，其实都是在同一个复合图层中）。 其次，absolute 布局（fixed 也一样），虽然可以脱离普通文档流，但它仍然属于默认复合层。然后，可以通过硬件加速的方式，声明一个新的复合图层，它会单独分配资源（当然也会脱离普通文档流，这样一来，不管这个复合图层中怎么变化，也不会影响默认复合层里的回流重绘）。

因此，GPU 中，各个复合图层是单独绘制的，所以互不影响，这也是为什么某些场景硬件加速效果一级棒。可以 Chrome 源码调试 -> More Tools -> Rendering -> Layer borders 中看到，黄色的就是复合图层信息。

### 如何变成复合图层（硬件加速）：

> - 最常用的方式：translate3d、translateZ。
> - opacity 属性/过渡动画（需要动画执行的过程中才会创建合成层，动画没有开始或结束后元素还会回到之前的状态）。
> - video iframe canvas webgl 等元素
> - 其他，譬如以前的 flash 插件！

### absolute 和硬件加速的区别：

> - absolute 虽然可以脱离普通文档流，但是无法脱离默认复合层。所以，就算 absolute 中信息改变时不会改变普通文档流中 render 树。但是，浏览器最终绘制时，是整个复合层绘制的。所以 absolute 中信息的改变，仍然会影响整个复合层的绘制。（浏览器会重绘它，如果复合层中内容多，absolute 带来的绘制信息变化过大，资源消耗是非常严重的）。
> - 硬件加速直接就是在另一个复合层了（另起炉灶），所以它的信息改变不会影响默认复合层（当然了，内部肯定会影响属于自己的复合层），仅仅是引发最后的合成（输出视图）。一般一个元素开启硬件加速后会变成复合图层，可以独立于普通文档流中，改动后可以避免整个页面重绘，提升性能。但是尽量不要大量使用复合图层，否则由于资源消耗过度，页面反而会变的更卡。

### 硬件加速时使用 index 的原因：

> - 具体的原理时这样的： “webkit CSS3 中，如果这个元素添加了硬件加速，并且 index 层级比较低。那么在这个元素的后面其它元素（层级比这个元素高的，或者相同的，并且 releative 或 absolute 属性相同的），会默认变为复合层渲染。如果处理不当会极大的影响性能”。
> - 简单点理解，其实可以认为是一个隐式合成的概念：如果 a 是一个复合图层，而且 b 在 a 上面，那么 b 也会被隐式转为一个复合图层。

## 内核进程的事件触发线程

首先理解一些概念：

> - JS 分为同步任务和异步任务。
> - 同步任务都在主线程上执行，形成一个执行栈。
> - 主线程之外，事件触发线程管理着一个任务队列，只要异步任务有了运行结果，就在任务队列之中放置一个事件。
> - 一旦执行栈中的所有同步任务执行完毕（此时 JS 引擎空闲），系统就会读取任务队列，将可运行的异步任务添加到可执行栈中，开始执行。

如图：

<div style="display: flex;justify-content: center;">
<img src="https://img-blog.csdnimg.cn/20190404191937958.png">
</div>

事件循环机制进一步补充,如图：

<div style="display: flex;justify-content: center;">
<img src="https://img-blog.csdnimg.cn/20190404192009845.png">
</div>

上图大致描述就是：主线程运行时会产生执行栈，栈中的代码调用某些 api 时，它们会在事件队列中添加各种事件（当满足触发条件后，如 ajax 请求完毕）。而栈中的代码执行完毕，就会读取事件队列中的事件，去执行那些回调.如此循环。注意，总是要等待栈中的代码执行完毕后才会去读取事件队列中的事件。

## 内核进程的定时器线程

上述事件循环机制的核心是：JS 引擎线程和事件触发线程。但事件上，里面还有一些隐藏细节，譬如调用 setTimeout 后，是如何等待特定时间后才添加到事件队列中的？是 JS 引擎检测的么？当然不是了。它是由定时器线程控制（因为 JS 引擎自己都忙不过来，根本无暇分身）。为什么要单独的定时器线程？因为 JavaScript 引擎是单线程的, 如果处于阻塞线程状态就会影响记计时的准确，因此很有必要单独开一个线程用来计时。什么时候会用到定时器线程？当使用 setTimeout 或 setInterval 时，它需要定时器线程计时，计时完成后就会将特定的事件推入事件队列中。譬如：

```js
setTimeout(() => {
  consle.log("hello");
}, 1000);
```

这段代码的作用是当 1000 毫秒计时完毕后（由定时器线程计时），将回调函数推入事件队列中，等待主线程执行。

```js
setTimeout(() => {
  consle.log("hello");
}, 1000);

console.log("begin");
```

这段代码的效果是最快的时间内将回调函数推入事件队列中，等待主线程执行。

注意：

> - 执行结果是：先 begin 后 hello!
> - 虽然代码的本意是 0 毫秒后就推入事件队列，但是 W3C 在 HTML 标准中规定，规定要求 setTimeout 中低于 4ms 的时间间隔算为 4ms。(不过也有一说是不同浏览器有不同的最小时间设定)。
> - 所以就算不等待 4ms，就算假设 0 毫秒就推入事件队列，也会先执行 begin（因为只有可执行栈内空了后才会主动读取事件队列）。

用 setTimeout 模拟定期计时和直接用 setInterval 是有区别的。

> - 因为每次 setTimeout 计时到后就会去执行，然后执行一段时间后才会继续 setTimeout，中间就多了误差（误差多少与代码执行时间有关）!
> - 而 setInterval 则是每次都精确的隔一段时间推入一个事件（但是，事件的实际执行时间不一定就准确，还有可能是这个事件还没执行完毕，下一个事件就来了）(不过也有一说是不同浏览器有不同的最小时间设定)。
> - 而且 setInterval 有一些比较致命的问题就是：累计效应（上面提到的），如果 setInterval 代码在（setInterval）再次添加到队列之前还没有完成执行，就会导致定时器代码连续运行好几次，而之间没有间隔。就算> 正常间隔执行，多个 setInterval 的代码执行时间可能会比预期小（因为代码执行需要一定时间）。

所以，鉴于这么多但问题，目前一般认为的最佳方案是：用 setTimeout 模拟 setInterval，或者特殊场合直接用 requestAnimationFrame。

## JS 引擎线程的运行机制

看到这里，基本上已经对基本的 js 运行机制有所了解了。在 ES5 的情况是够用了，但是在 ES6 盛行的现在，仍然会遇到一些问题，譬如下面这题：

```js
console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("promise1");
  })
  .then(() => {
    console.log("promise2");
  });

console.log("script end");
```

它的正确执行顺序是这样子的：

- script start
- script end
- promise1
- promise2
- setTimeout

为什么呢？因为 Promise 里有了一个一个新的概念： microtask 或者，进一步，JS 中分为两种任务类型： macrotask 和 microtask 。在 ECMAScript 中， microtask 称为 jobs ， macrotask 可称为 task 它们的定义？区别？简单点可以按如下理解：

- macrotask（又称之为宏任务），可以理解是每次执行栈执行的代码就是一个宏任务（包括每次从事件队列中获取一个事件回调并放到执行栈中执行）。

  > - 每一个 task 会从头到尾将这个任务执行完毕，不会执行其它。
  > - 浏览器为了能够使得 JS 内部 task 与 DOM 任务能够有序的执行，会在一个 task 执行结束后，在下一个 task 执行开始前，对页面进行重新渲染。

- microtask（又称为微任务），可以理解是在当前 task 执行结束后立即执行的任务。

  > - 也就是说，在当前 task 任务后，下一个 task 之前，在渲染之前。
  > - 所以它的响应速度相比 setTimeout（setTimeout 是 task）会更快，因为无需等渲染。
  > - 也就是说，在某一个 macrotask 执行完后，就会将在它执行期间产生的所有 microtask 都执行完毕（在渲染前）。

分别很么样的场景会形成 macrotask 和 microtask 呢？

> - macrotask：主代码块，setTimeout，setInterval 等（可以看到，事件队列中的每一个事件都是一个 macrotask）。
> - microtask：Promise，process.nextTick 等。

**补充：在 node 环境下，process.nextTick 的优先级高于 Promise**，也就是可以简单理解为：在宏任务结束后会先执行微任务队列中的 nextTickQueue 部分，然后才会执行微任务中的 Promise 部分。

再根据线程来理解下：

> - macrotask 中的事件都是放在一个事件队列中的，而这个队列由事件触发线程维护。
> - microtask 中的所有微任务都是添加到微任务队列（Job Queues）中，等待当前 macrotask 执行完毕后执行，而这个队列由 JS 引擎线程维护。（这点由自己理解+推测得出，因为它是在主线程下无缝执行的）。

所以，总结下运行机制：

> - 执行一个宏任务（栈中没有就从事件队列中获取）。
> - 执行过程中如果遇到微任务，就将它添加到微任务的任务队列中。
> - 宏任务执行完毕后，立即执行当前微任务队列中的所有微任务（依次执行）。
> - 当前宏任务执行完毕，开始检查渲染，然后 GUI 线程接管渲染。
> - 渲染完毕后，JS 线程继续接管，开始下一个宏任务（从事件队列中获取）。

如图：

<div style="display: flex;justify-content: center;">
<img src="https://img-blog.csdnimg.cn/20190404193633211.png">
</div>

另外，请注意 Promise 的 polyfill 与官方版本的区别：

- 官方版本中，是标准的 microtask 形式。
- polyfill，一般都是通过 setTimeout 模拟的，所以是 macrotask 形式。

\_\_补充：以上关于 macrotask 和 microtask 的总结，有一些浏览器执行结果不一样（因为它们可能把 microtask 当成 macrotask 来执行了），但是为了简单，这里不描述一些不标准的浏览器下的场景（但记住，有些浏览器可能并不标准）。

\_\_补充：使用 MutationObserver 实现 microtask

MutationObserver 可以用来实现 microtask（它属于 microtask，优先级小于 Promise，一般是 Promise 不支持时才会这样做）。它是 HTML5 中的新特性，作用是：监听一个 DOM 变动，当 DOM 对象树发生任何变动时，Mutation Observer 会得到通知。像以前的 Vue 源码中就是利用它来模拟 nextTick 的，具体原理是，创建一个 TextNode 并监听内容变化，然后要 nextTick 的时候去改一下这个节点的文本内容，如下：（Vue 的源码）:

```js
var counter = 1;
var observer = new MutationObserver(nextTickHandler);
var textNode = document.crateTextNode(String(counter));

observer.observer(textNode, {
  chracterData: true,
});

timerFnunc = () => {
  counter = (counter + 1) % 2;
  textNode.data = String(counter);
};
```

不过，Vue（2.5+）的 nextTick 实现移除了 MutationObserver 的方式（据说是兼容性原因），取而代之的是使用 MessageChannel。（当然，默认情况仍然是 Promise，不支持才兼容的）。MessageChannel 属于宏任务，优先级是：MessageChannel->setTimeout，所以 Vue（2.5+）内部的 nextTick 与 2.4 及之前的实现是不一样的，需要注意下。

看到这里，不知道对 JS 的运行机制是不是更加理解了。从头到尾梳理，而不是就某一个碎片化知识应该是会更清晰的吧？同时，也应该注意到了 JS 根本就没有想象的那么简单，前端的知识也是无穷无尽，层出不穷的概念、N 多易忘的知识点、各式各样的框架、底层原理方面也是可以无限的往下深挖，然后你就会发现，你知道的太少了！

## 解析 URL 与网络请求线程

输入 URL 后，会进行解析（URL 的本质就是统一资源定位符）

URL 一般包括几大部分：

- protocol，协议头，譬如有 http，ftp 等。
- host，主机域名或 IP 地址。
- port，端口号。
- path，目录路径。
- query，即查询参数。
- fragment，即  #  后的  hash  值，一般用来定位到某个位置。

每次网络请求时都需要开辟单独的线程进行，譬如如果 URL 解析到 http 协议，就会新建一个网络线程去处理资源下载因此浏览器会根据解析出得协议，开辟一个网络线程，前往请求资源。

## 内核进程中线程之间的关系

### GUI 渲染线程与 JS 引擎线程互斥

- 由于 JavaScript 是可操纵 DOM 的，如果在修改这些元素属性同时渲染界面（即 JS 线程和 UI 线程同时运行），那么渲染线程前后获得的元素数据就可能不一致了。
- 因此为了防止渲染出现不可预期的结果，浏览器设置 GUI 渲染线程与 JS 引擎为互斥的关系，当 JS 引擎执行时 GUI 线程会被挂起，GUI 更新则会被保存在一个队列中等到 JS 引擎线程空闲时立即被执行。
- 注意，GUI 渲染线程与 JS 引擎线程是互斥的。当 JS 引擎执行时 GUI 线程会被挂起（相当于被冻结了），GUI 更新会被保存在一个队列中等到 JS 引擎空闲时立即被执行。

### JS 阻塞页面加载

- 从上述的互斥关系，可以推导出，JS 如果执行时间过长就会阻塞页面。
- 譬如，假设 JS 引擎正在进行巨量的计算，此时就算 GUI 有更新，也会被保存到队列中，等待 JS 引擎空闲后执行。然后，由于巨量计算，所以 JS 引擎很可能很久很久后才能空闲，自然会感觉到巨卡无比。
- JS 引擎一直等待着任务队列中任务的到来，然后加以处理，一个 Tab 页（renderer 进程）中无论什么时候都只有一个 JS 线程在运行 JS 程序。
- 所以，要尽量避免 JS 执行时间过长，这样就会造成页面的渲染不连贯，导致页面渲染加载阻塞的感觉。

### WebWorker，JS 的多线程？

- HTML5 中支持了 Web Worker。MDN 的官方解释是：“Web Worker 为代码在后台线程中运行脚本提供了一种简单方法，线程可以执行任务而不干扰用户界面。一个 worker 是使用一个构造函数创建的一个对象(e.g. Worker()) 运行一个命名的 JavaScript 文件。这个文件包含将在工作线程中运行的代码; workers 运行在另一个全局上下文中,不同于当前的 window。因此，使用 window 快捷方式获取当前全局的范围 (而不是 self) 在一个 Worker 内将返回错误。”。
- 可以这样理解：“创建 Worker 时，JS 引擎向浏览器申请开一个子线程（子线程是浏览器开的，完全受主线程控制，而且不能操作 DOM）。JS 引擎线程与 worker 线程间通过特定的方式通信（postMessage API，需要通过序列化对象来与线程交互特定的数据）。”。
- 所以，如果有非常耗时的工作，请单独开一个 Worker 线程，这样里面不管如何翻天覆地都不会影响 JS 引擎主线程，只待计算出结果后，将结果通信给主线程即可。
- 而且，JS 引擎是单线程的，这一点的本质仍然未改变，Worker 可以理解是浏览器给 JS 引擎开的外挂，专门用来解决那些大量计算问题。

### WebWorker 与 SharedWorker 的区别？

- WebWorker 只属于某个页面，不会和其他页面的 Render 进程（浏览器内核进程）共享。所以 Chrome 在 Render 进程中（每一个 Tab 页就是一个 render 进程）创建一个新的线程来运行 Worker 中的 JavaScript 程序。
- SharedWorker 是浏览器所有页面共享的，不能采用与 Worker 同样的方式实现，因为它不隶属于某个 Render 进程，可以为多个 Render 进程共享使用。所以 Chrome 浏览器为 SharedWorker 单独创建一个进程来运行 JavaScript 程序，在浏览器中每个相同的 JavaScript 只存在一个 SharedWorker 进程，不管它被创建多少次。
- 所以 WebWorker 与 SharedWorker 的区别本质上就是进程和线程的区别。SharedWorker 由独立的进程管理，WebWorker 只是属于 render 进程下的一个线程。
