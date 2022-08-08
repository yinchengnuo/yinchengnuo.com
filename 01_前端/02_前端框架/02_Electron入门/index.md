# 03-Electron入门

---

Electron 是一个使用 JavaScript、HTML 和 CSS 构建桌面应用程序的框架。 嵌入 Chromium 和 Node.js 到 二进制的 Electron 允许开发者用前端开发的方式创建在 Windows、macOS、Linux 等平台上运行的跨平台应用。

大家都知道我们前端开发工程师主要是和浏览器打交道。如果你了解 Nodejs 的话，还有可能会做一些后端的事情。同时基于 Nodejs，前端方面也出现了一些跨平台客户端的解决方案，比较知名有 React Native 用于构建移动端的跨平台应用，还有就是今天的主角 Electron 用户构建 PC 端的跨平台应用。

开头我们说到，整个 Electron 是基于 Chromium 和 Nodejs 这两套开源技术。我们用的最多的 Google Chrome 浏览器也是基于 Chromium 的。所以可以说整个 Electron 就是一个增强版的 chrome 浏览器。同时 Electron 还为我们提供了很多封装好的 api 模块，和一些和操作系统的交互的接口。做到了浏览器做不到的事情，并且呢它还有跨平台的特性，可以构建运行在多个主流操作系统上。

既然是浏览器，那么自然就是前端开发者的用武之地。我们可以使用 Electron 快速开发各种高度定制化的 UI 及无缝接入整个前端生态体系，而各种主流前端框架及可视化实现方案自然更是不在话下。同时我们也可以在 Electron 使用 Nodejs 操作文件、和操作系统交互、通过串口控制硬件等，在 NPM 生态的加持下，各类场景几乎都有相应的解决方案。

同时 Electron 由 GitHub 开源维护，背靠微软，技术实力不用多数。同时中文文档齐全、社区生态繁荣、官方持续维护都使 Electron 成为不可多得的 PC 开发框架。国外的 VSCode、GitHubDesktp、Atom 等，国内的 迅雷、微信 PC 版均使用 Electron 开发。

## 初识 Electron

electron-quick-start 是 Electron 官方推荐的 Electron 入门示例，通过这个示例，我们可以快速认识 Electron。

```sh
# 克隆示例项目的仓库
git clone https://github.com/electron/electron-quick-start

# 进入这个目录
cd electron-quick-start

# 添加 .npmrc
echo electron_mirror=http://cdn.npm.taobao.org/dist/electron/ >> .npmrc

# 安装依赖并运行
yarn && yarn start
```

此时，你就会看到一个带着 Hello World 的窗口，这就是 Electron:

<!-- <img src="/img/web/20211120105535.jpg"> -->

## 进入 Electron

下面开始认识 electron-quick-start 的代码。进入 electron-quick-start。

PS：本次课程仅做为 Electron 入门讲解。对于一些高级用法，本次不展开讲解，点到即止，后期会有相关培训。

为了让大家快速入门 Electron，这里采用删文件/代码的形式进行讲解，尽可能的去掉在阅读 electron-quick-start 代码中可能会对大家产生干扰的因素。在不断的抽丝剥茧中，认识到 Electron 启动一个应用的实相。

注：以下操作仅为讲解操作，实际项目请勿模仿

首先通过查看 package.json ，我们得到一下信息：

- 项目入口文件为为 main.js
- devDependencies 仅有一个 electron
- scripts start 为 electron .

首先，我们大概看一下项目目录，同时删除对 Electron 运行没有影响的文件，包括：

- .github
- .gitignore
- LICENSE.md
- README.md
- .git

至此，除了 node 包相关的文件，只剩下：

- index.html
- main.js
- preload.js
- renderer.js
- styles.css

下面，我们进入 main.js，即项目的入口文件，一探究竟。

```js
// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
```

让我们从上到下读代码：

首先：

```js
const { app, BrowserWindow } = require("electron");
const path = require("path");
```

可以看到首先从 electron require 了 app, BrowserWindow 两个对象。

这里先简单记住 app 是主进程，BrowserWindow 是渲染进程，稍后我们对这两个概念进行讲解。

继续往下是一个 createWindow 函数，先不管他，继续向下：

```js
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
```

结合代码和注释，我们基本能够知道。

在 app 主进程准备就绪后，执行了 createWindow 方法（最后再看这个），同时监听了 app 主进程的 activate 事件，结合注释我们基本能理解，activate 的回调是针对 macOS 平台特性的 Hack。如果只考虑 windows 平台开发，这段代码可以删掉。

最下面：

```js
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
```

这段代码的意思就是：在应用的所有窗口关闭后，退出 app 主进程。如果不执行这个，app 主进程会一直保持后台运行，消耗资源。

最后，来关注 createWindow 方法：

```js
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
```

可以看到，通过一些配置项 new 出的 BrowserWindow 对象通过 loadFile 方法，加载了一个 HTML。

这里你可以理解为我们在浏览器 window 中掉用 window.open 同时配置了一些启动参数，比如宽高啥的，这都很容易理解。

不过下面的 webPreferences.preload 配置项是什么意思呢？这里先按下不表，往下就是 loadFile('index.html') 了。

那我们就打开 index.html 一探究竟：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <link href="./styles.css" rel="stylesheet" />
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using Node.js <span id="node-version"></span>, Chromium
    <span id="chrome-version"></span>, and Electron
    <span id="electron-version"></span>.

    <!-- You can also require other files to run in this process -->
    <script src="./renderer.js"></script>
  </body>
</html>
```

看来这个就是我们执行 electron . 后看到的页面了。

html 中除了一些 h1 span，还引入了 styles.css 和 renderer.js 不过这俩文件都是空的，那就删除吧：

删除：

- styles.css
- renderer.js

以及它们在 index.html 中的引入。

如果你足够细心，你会发发现。刚刚执行 electron . 后弹出的页面上有这么一段话：

> We are using Node.js 16.9.1, Chromium 96.0.4664.45, and Electron 16.0.1.

但是实际上 index.html 的 body 中只有：

```html
<h1>Hello World!</h1>
We are using Node.js <span id="node-version"></span>, Chromium
<span id="chrome-version"></span>, and Electron
<span id="electron-version"></span>.
```

这就是上面说到的 webPreferences.preload 的作用。

**webPreferences.preload 加载的 JS 会在 loadFile('index.html') 加载完成后被插入 index.html 的顶部，作为 index.html 渲染过程中被最先执行的 script。**

我们打开 preload.js 一看便知：

```js
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
```

是不是熟悉的味道？preload.js 在文档加载完成后将 chrome、node、electron 的版本插入到了 index.html 的 DOM 中。

如果我们把 webPreferences.preload 注释掉，此时页面文字便显示为：

> We are using Node.js , Chromium , and Electron .

我们可以通过 preload 获取到 BrowserWindow 实例的 window 对象，往上面挂载数据实现数据共享。

就目前来说，部分对我们没什么用处，大家记得就好，这里删除掉 webPreferences.preload 和 preload.js

到目前为止，我们已经把 项目里所有的业务文件都过了一遍了，虽然大部分都没删除了，但是同时也更加精简了，只剩下：

- main.js
- index.html

我们再对代码进行精简，去除注释和 mac Hack 就得到了：

- main.js

```js
const { app, BrowserWindow } = require("electron");
app.whenReady().then(() => {
  const mainWindow = new BrowserWindow();
  mainWindow.loadFile("index.html");
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
```

不到十行了！

- index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

运行：

```sh
yarn start
```

看到：

> Hello World

通过上面的学习，我们已经对 Electron 运行有了一个基本的认识。

下面就来点深入的。

## Electron 的进程

上面我们说到：

```js
const { app, BrowserWindow } = require("electron");
```

**app 是主进程，BrowserWindow 是渲染进程。**

通过上面的代码示例，我们知道最后渲染到页面上都是通过 BrowserWindow 对象加载的 html 实现的。BrowserWindow 就可以理解为一个浏览器窗口，那么 app 是什么？

我们不妨以浏览器带入理解，关于浏览器进程相关的知识，我在 **浏览器的进程与线程** 一文中已经做了详细阐述：

> 浏览器是多进程的，有一个主控进程，以及每一个 tab 页面都会新开一个进程（某些情况下多个 tab 会合并进程）进程可能包括主控进程，插件进程，GPU，tab 页（浏览器内核）等等...主要有：
>
> - Browser 进程：浏览器的主进程（负责协调、主控），只有一个。
> - 第三方插件进程：每种类型的插件对应一个进程，仅当使用该插件时才创建。
> - GPU 进程：最多一个，用于 3D 绘制。
> - 浏览器渲染进程（内核（Renderer 进程））：默认每个 Tab 页面一个进程，互不影响，控制页面渲染，脚本执行，事件处理等（有时候会优化，如多个空白 tab 会合并成一个进程）。

这里不讲进程是什么，而是结合实践，让我们对 GoogleChrome 的进程做简单的认识。

我们可以通过 PC 上的进程管理器查看 GoogleChrome 的进程。

kill GoogleChrome 正在运行的进程会导致部分页面崩溃或者浏览器整个退出。

现在我们可以确认，浏览器主进程是一个进程，浏览器打开的每一个 TAB 页也是一个个进程。主进程负责统筹调度所有进程及做一些应用层面的处理，一个个 TAB 进程负责各自页面的渲染。

同时我们可以理解为 Electron 是对 GoogleChrome 的抽象。

Electron 封装了 Chromium，自然不会把 Chrome 的导航栏、URL 输入框、书签栏等 Chrome 的 UI 原封不动的搬过来。

当我们启动一个 Electron 应用，Electron 就会启动 Chrome 主进程，同时将这个主进程封装为 app 对象抛进 main.js 供开发者掉用。

当然启动一个 Chrome 主进程，看起来一定是什么效果都没有的。我们需要一个 TAB 展示页面，同时这个 TAB 不带任何 Chrome 外观特征（导航栏、URL 输入框、书签栏等），只有一个渲染区。这个 TAB 就是 BrowserWindow 对象。

这就是 app 和 BrowserWindow 的关系。

既然 BrowserWindow 是 TAB，那么一个 app 自然可以有多个 BrowserWindow。

app 主进程的特征：

- 可以使用和系统对接的 Electron API - 创建菜单，上传文件等
- 创建渲染进程
- 全面支持 NodeJS
- 只有一个作为程序的入口点

BrowserWindow 渲染进程的特征：

- 可以有多个，每个对应一个窗口
- 每一个都是单独的进程
- 全面支持 NodeJS 和 DOM API
- 可以使用一部分 Electron API

app 主进程 和 BrowserWindow 进程的不同：

<!-- <img src="/img/web/20211120150246.jpg"> -->

上面我们说到一个 app 可以有多个 BrowserWindow。但是实际上我们很少用到有多个 BrowserWindow 的场景。

因为目前前端大型项目开发方案几乎都是基于 SPA，一般都内置了单页面路由系统。但是通过上面的示例，我们看到。BrowserWindow 只是加载了一个 html 启动渲染，刚好 SPA 打包后基本上也都是只有一个 html，这个问题不大。但是如何能够在开发中时时看到页面编写结果，达到和 Web 项目开发一样的效果呢？

使用 BrowserWindow.prototype.loadURL 即可。

如：

```js
mainWindow.loadURL("https://localhost:3000");
```

下面我们尝试着把一个 vite 项目集成到 electron 并打包。

## 开发环境配置

这里使用 [yapiresponsetransformtotypescriptinterface](http://10.106.11.64/yinchengnuo/yapiresponsetransformtotypescriptinterface) 作为基础集成 Electron 开发环境。

vite 项目启动时在 `https://localhost:3000` ，构建后在 dist 目录下生成静态资源。

在开发环境使用：

```js
mainWindow.loadURL("https://localhost:3000");
```

生产环境使用：

```js
mainWindow.loadFile("/dist/index.html");
```

那么如今区分开发环境和生产环境呢？

app 主进程的 isPackaged 属性可以帮助我们区分应用是打包前还是打包后，用于区分开发环境和生产环境。

我们就使用这个方法：

```json
{
  "scripts": {
    "start": "electron ."
  }
}
```

```js
// main.js

const { app, BrowserWindow } = require("electron");

const dev = app.isPackaged
console.log("env: dev is" + dev); // env: dev is true
```

此时执行：start，就能在控制台看到 env: dev is true。

同时我们对 main.js 进行改造：

```js
const { app, BrowserWindow } = require("electron");

const dev = app.isPackaged;

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow();
  dev
    ? mainWindow.loadURL("http://localhost:3000")
    : mainWindow.loadFile("dist/index.html");
});
// ...
```

最后我们希望 vite devServer 和 Electron 同时启动，只需添加：

```json
{
  "scripts": {
    "dev:electron": "npm run dev & electron ."
  }
}
```

即可。

但是实际上上面的 dev:electron 只在 mac 上生效。因为 windows 默认终端不能识别 & ，因此我们还需要做最近一步处理。这里需要用到两个 Node 包，分别是：

- concurrently 跨平台并行执行多条 npm script
- wait-on 跨平台阻塞 npm script

我们需要先启动 vite devServer，然后等 localhost:3000 可以 ping 通之后，再执行 electron .

```json
{
  "scripts": {
    "dev:electron": "concurrently \"vite --host\" \"wait-on tcp:3000 && electron .\""
  }
}
```

## 构建发布

打包这块使用 electron-builder，这个也是官方推荐的 electron 打包工具之一。同时相对于其他两个具有包体积更小、支持热更新等优势，因此这里使用 electron-builder。

在 package.json 添加：

```json
{
  "scripts": {
    "build:electron": "npm run build && electron-builder"
  },
  "build": {
    "appId": "YAPI",
    "files": ["dist/**/*", "index.js"],
    "win": {
      "icon": "src/assets/my.png"
    },
    "mac": {
      "icon": "src/assets/my.png"
    }
  },
  "electronDownload": {
    "mirror": "https://npm.taobao.org/mirrors/electron/"
  }
}
```

执行：npm run build:electron 即可。

## 示例代码

[http://10.106.11.64/yinchengnuo/yapiresponsetransformtotypescriptinterface](http://10.106.11.64/yinchengnuo/yapiresponsetransformtotypescriptinterface)
