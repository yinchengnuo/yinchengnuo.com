# 前端构建工具Vite入门

---

> *Webpack 生态充斥着大量名字类似 what-the-fuck-is-this-plugin 的插件，以及这个插件附带的一千种配置和一万种副作用，以至于每次出现打包的问题都会产生哲学三问：*
>
> - *这个插件干了什么？*
> - *我的配置有错误吗？*
> - *这个插件真的没有bug吗？*        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;           --来自网友吐槽

## 认识 Vite

### 什么是 Vite

打开 Vite 官网，你会发现首页正中间有这样几个字：

**下一代前端开发与构建工具**

就目前来说，以 Webpack/Rollup 等为主的**编译型**打包构建工具推动着往前端工程化、大型化发展，大大改进了前端开发者的开发体验。

但是随着项目越来越大，前端项目的编译时间也越来越长，甚至有些需要几分钟。即使开启了热更新，源码修改也需要几秒钟才能在浏览器中反映出来。缓慢的反馈会极大地影响开发人员的生产力和幸福感。

Vite 旨在利用生态系统中的新进展解决上述问题：浏览器支持原生模块，越来越多 JavaScript 工具使用编译型语言编写。

简单的说，**Vite 就是 快！！！**

### 为什要学 Vite

提到构建工具，自然绕不开 Webpack。而我们用的最多的 vue-cli 和 create-react-app 也都是基于 Webpack 开发而来。Webpack 功能非常强大，但仍存在配置繁琐、文档晦涩等问题，且使用周期较长，通常一次配置都是用一个项目周期，这就导致用时就学、学完就忘，下次要用还得学，同时社区各种骚操作飞起，动不动安装一大堆包，时不时出来一个大坑。

前端开发人员可能听过社区的一个吐槽：Webpack 生态充斥着大量名字类似 what-the-fuck-is-this-plugin 的插件，以及这个插件附带的一千种配置和一万种副作用，以至于每次出现打包的问题都会产生哲学三问：

- 这个插件干了什么？
- 我的配置有错误吗？
- 这个插件真的没有bug吗？

诸如此类。都使开发者心力交瘁，大多数都是直接躺平，vue-cli 和 create-react-app 开箱即用，随便搞搞，小问题不怎么有，大问题搞不了，长时间被困在各种 cli 里无法自拔。

相对来说 Vite 就对上面的问题就处理的很好：

**够快！**（编译速度不受项目规模影响，单次编译始终和首次编译时长一致，部分计算密集型功能使用编译型语言通过插件实现）

**够简单！**（尤雨溪团队全面维护的全中文文档，现代高级浏览器大都已经支持 Webpack 繁琐配置要实现的功能，因此 Vite 没有繁碎的配置，复杂的接口。）

**够强大！**（全面兼容 Rollup 插件，内置自身插件系统，充分利用现代高级浏览器能力）

### Vite 为什么快？

Vite 是尤雨溪在 2020 年发布 vue3 时同步发布的，当时的 v1.0 版本只是作为一个 vue3 构建工具而存在。但随着 2021 年 Vite v2 发布，Vite 已经可以同时支持原生、vue、react、preact等方式开发，严格意义上确实已经成为了前端构建工具。

Vite 本身没有编译功能，因此在启动时无需从项目入口文件开始编译依赖文件，表现就是启动速度极快。

和 Flutter 类似，Vite 构建分开发时和运行时。

开发时运行环境借助 浏览器对ESModule的支持、运行时解析模版/jsx 和 编译型语言（Go语言实现的 ESBuild）的必要时加持实现了极快的启动速度和优秀的开发体验。

运行时环境采用了原有的打包构建编译，只不过没有用 Webpack，而是用的 Rollup。

**为什么生产环境仍需打包（摘自 Vite 官网）**

> 尽管原生 ESM 现在得到了广泛支持，但由于嵌套导入会导致额外的网络往返，在生产环境中发布未打包的 ESM 仍然效率低下（即使使用 HTTP/2）。为了在生产环境中获得最佳的加载性能，最好还是将代码进行 tree-shaking、懒加载和 chunk 分割（以获得更好的缓存）。

## 开始 Vite

```javascript
yarn create @vitejs/app
```

> PS：务必使用 yarn

1. 输入项目名称
2. 输入node包名
3. 选择 vue/vue-ts
4. cd package && yarn
5. yarn dev

## 使用 Vite

### 使用 css

Vite 的 css 使用和 vue-cli 类似，但是略有不同。

Vite 需要手动设置 vite.config.ts 为：

```javascript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src' // 配置 alias
    }
  }
})
```

即可使用：

```css
@import "@/xxx.css";
```

> PS：stylus 因为自身语法限制，不支持 alias 的方式引入模块

Vite 天然支持 postcss，如果项目包含有效的 PostCSS 配置 (任何受 postcss-load-config 支持的格式，例如 postcss.config.js)，它将会自动应用于所有已导入的 CSS。

任何以 .module.css 为后缀名的 CSS 文件都被认为是一个 CSS modules 文件。导入这样的文件会返回一个相应的模块对象。

Vite 也同时提供了对 .scss, .sass, .less, .styl 和 .stylus 文件的内置支持。没有必要为他们安装特定的 Vite 插件，但相应的预处理器依赖本身必须安装：

```javascript
// .scss and .sass
npm install -D sass

// .less
npm install -D less

// .styl and .stylus
npm install -D stylus
```

### 使用 TypeScript

Vite 天然支持引入 .ts 文件。

上面说过 Vite 编译分为 开发时 和 运行时。

开发时的 Vite 依赖 Go 语言开发的 ESBuild 将 TypeScript 编译为 javascript，编译效率是 TypeScript 官方工具 tsc 的 20~30 倍。

ESBuild 虽然效率高，但是不会对 TypeScript 进任何类型检查，同时不支持 TypeScript 的极个别特性。

因此对于不合法的 TypeScript 语法，Vite 开发时并不会报错，但是生产构建时会报错。

因此开发时要充分利用编辑器的 TypeScript 语法提示功能。否则，错误的 TypeScript 写法会使生产构建报错，同时对于 ESBuild 不支持的 TypeScript 特性，部分在开发时也会报错，但是编辑器不会提示。

虽然社区实现了插件可以实现开发时对 TypeScript 的类型检查。但是个人不推荐这样做：因为这插件都是基于 tsc 实现，随着项目越来越大，本地开发时 tsc 执行检查的时间会越来越长，这就和 vue-cli 没什么区别了，因此不推荐。

同时在 TypeScript 编译器选项： tsconfig.json 中 compilerOptions 下的一些配置项需要特别注意：

**isolatedModules：应该设置为 true。这主要是为了解决 ESBuild 和 TypeScript 冲突的一部分。**

isolatedModules 是什么？我们来看 TypeScript 官网如何解释：

> 将每个文件作为单独的模块（与“ts.transpileModule”类似）。

相信你和我一样，完全不懂这是什么意思。因此经过查找资料，以下是 isolatedModules 的三个主要作用：

1. Exports of Non-Value Identifiers
2. Non-modules Files
3. References to const enum members

为了开发时的编译体验，Vite 使用 ESBuild 作为 TypeScript 编译器，但是 ESBuild 对极少数的 TypeScript 不支持或者说不兼容。同时恰好 isolatedModules 配置额部分可以禁用掉 TypeScript 中 ESBuild 不支持的部分，使其可以在开发时和构建都时不会报错。

尽管这种做法会让我们无法使用一些 TypeScript 特性，但是好在这些特性都是相对来说比较偏门的，可有可无，相信 Vite 团队也是在经过一番权衡后才做此决定的。那让我们看下 isolatedModules 会使 TypeScript 发生哪些改变：

1. 类型声明（interface/type）不能二次导出，即一个 interface/type 只能 export 一次。在一个 ts 内先 inport，后 export 同一个 interface/type 会报错
2. ts 文件内必须至少包含一个 import 或 export
3. 不支持枚举

尽管我们无法在开发时强制对不规范的 TypeScript 语法做处理，但是我们仍然可以通过 Git pre-commit 钩子在代码提交前对 项目中的 ts 用 tsc 做校验，从而实现禁止将有问题的 TypeScript 代码推送至远程仓库。

### 使用 eslint/prettire

Vite 没有内置 eslint。因此我们需要手动配置，具体实现见：[前端代码规范之道[最佳实践]](http://10.106.16.87:50001/pages/f48ddb/#%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)。

和 TypeScript 一样，这里不推荐通过插件在开发时对代码进行时时校验，这样随着项目越来越大，HMR 速度会越来越慢。建议对代码格式的校验也放在 Git pre-commit 钩子中。

### 使用 JSX

Vite 为 Vue 提供第一优先级支持。

同时 Vite 也支持 React，并通过官方实现的 @vitejs/plugin-react-refresh 插件实现了 React 项目的 HRM。

.jsx 和 .tsx 文件同样开箱即用，JSX 的转译同样是通过 ESBuild，默认为 React 16 风格。

如果不是在 React 或 Vue 中使用 JSX，自定义的 jsxFactory 和 jsxFragment 可以使用 esbuild 选项 进行配置。例如对 Preact：

```ts
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})
```
### 处理静态资源

导入一个静态资源会返回解析后的 URL：

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

添加一些特殊的查询参数可以更改资源被引入的方式：

```js
// 显式加载资源为一个 URL
import assetAsURL from './asset.js?url'
```

```js
// 以字符串形式加载资源
import assetAsString from './shader.glsl?raw'
```

```js
// 加载为 Web Worker
import Worker from './worker.js?worker'
```

```js
// 在构建时 Web Worker 内联为 base64 字符串
import InlineWorker from './worker.js?worker&inline'
```

Vite 建议将代码中所需的静态资源放置于 src 目录中，如 src/assets，不建议放置于 public 中。

Vite 中 JSON 可以被直接导入 —— 同样支持具名导入：

```js
// 导入整个对象
import json from './example.json'
// 对一个根字段使用具名导入 —— 有效帮助 treeshaking！
import { field } from './example.json'
```

Vite 支持使用特殊的 import.meta.glob 函数从文件系统导入多个模块：

```js
const modules = import.meta.glob('./dir/*.js')
```

以上将会被转译为下面的样子：

```js
// vite 生成的代码
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js')
}
```

你可以遍历 modules 对象的 key 值来访问相应的模块：

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

匹配到的文件默认是懒加载的，通过动态导入实现，并会在构建时分离为独立的 chunk。如果你倾向于直接引入所有的模块（例如依赖于这些模块中的副作用首先被应用），你可以使用 import.meta.globEager 代替：

```js
const modules = import.meta.globEager('./dir/*.js')
```

以上会被转译为下面的样子：

```js
// vite 生成的代码
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

请注意：

- 这只是一个 Vite 独有的功能而不是一个 Web 或 ES 标准
- 该 Glob 模式会被当成导入标识符：必须是相对路径（以 ./ 开头）或绝对路径（以 / 开头，相对于项目根目录解析）。
- Glob 匹配是使用 fast-glob 来实现的 —— 阅读它的文档来查阅 支持的 Glob 模式。

### 环境变量

Vite 通过 import.meta.env 可以获取到当前运行环境的环境变量。

和 VueCli 一样，Vite 通过项目根目录下的 .env 文件配置环境变量。

为了防止意外地将一些环境变量泄漏到客户端，只有以 VITE_ 为前缀的变量才会暴露给经过 Vite 处理的代码。

默认情况下，Vite 为 import.meta.env 提供了类型定义。随着在 .env[mode] 文件中自定义了越来越多的环境变量，你可能想要在代码中获取这些以 VITE_ 为前缀的用户自定义环境变量的 TypeScript 智能提示。

```ts
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_APP_TITLE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```


以上为前端构建工具 Vite 入门知识，详细内容可同时参考官方文档。更多关于 Vite 的高级用法敬请期待。
