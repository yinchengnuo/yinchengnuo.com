# 前端项目处理用户设备缩放

## 背景

1. 用户设备以笔记本电脑为主
2. 笔记本电脑设备宽度窄
3. 笔记本电脑系统自带缩放（通常是 125%）
4. 缩放会使的浏览器可用 css 逻辑像素宽度进一步变小
5. UI 标准设计稿宽度是 1920
6. 前端开发以 1920 设计稿为准

**验证代码：**（在不同的缩放情况下在 chrome 开发者工具输入如下代码）

```javascript
// 屏幕宽（固定值）
console.log("屏幕宽（固定值）：", window.screen.width);
// 浏览器可用 css 逻辑像素宽度
console.log("浏览器可用 css 逻辑像素宽度：", document.body.offsetWidth);

// 使样式缩放和UI保持一致
document.body.style.zoom = String(document.body.offsetWidth / 1920);
```

## 现状

**产品在部分用户电脑上出现布局变形、元素留白、过大等，严重影响用户体验**

## 解决思路

计算用户浏览器可用 css 逻辑像素宽度与 UI 标准设计稿宽度（1920）的值，并将其设置到 document.body.style.zoom 使所有样式缩放达到效果。

如：用户 window.screen.width 为 1920，正常情况下 document.body.offsetWidth 也为 1920。

此时浏览器缩放 150% 后，document.body.offsetWidth 变为 1280。缩放比例为 1280 / 1920，此时设置 document.body.style.zoom 为 1280 / 1920 即可。

```javascript
// main.ts/js
document.body.style.zoom = String(document.body.offsetWidth / 1920);
```

## 兼容问题

目前仅 webkit/blink 内核浏览器支持，Gecko（火狐）等浏览器不支持

## 副作用

**会使项目中使用 vh/vw 单位的元素缩放。**

**使用 document.body.style.zoom 后会使 vh/vw 实际效果 缩放为 document.body.style.zoom。**

## 解决方案

**利用 css calc() 函数 使 vh/vw / document.body.style.zoom 达到恢复 vw/vh 效果。**

```css
// 如 document.body.style.zoom = 0.5
// css
.xxx {
  height: calc(100vh / 0.5);
}
```

**用户缩放不同，如何获取 zoom 值？**

**通过 CSS 变量**

**在 main.ts/js 加入代码：**

```javascript
// main.ts/js
document.body.style.setProperty('--zoom', (document.body.offsetWidth / 1920) as unknown as string)
document.body.style.zoom = String(document.body.offsetWidth / 1920)
```

**注意：document.body.style.setProperty 必须放在 document.body.style.zoom 之前。**

**CSS 直接使用变量即可：**

```css
.xxx {
  width: calc(100vw / var(--zoom));
  height: calc(100vh / var(--zoom));
}
```

## 更好的解决方案

从上面上面的思路可以看出，解决缩放问题主要使用了 zoom、 css calc() 函数 和 css 变量来实现。但是使用起来仍有几个问题：

- css zoom 属性不兼容 hack 没有处理
- 对代码中 vh/vw 使用的部分侵入过强
- 无法直接用于已有项目

因此，我们需要一个全新的解决方案，来解决上面的几个问题。

## 新思路

无论 vw/vh 被用在 template 中还是 css 中，最后都会被编译为 css/js。我们可以通过自定义一个 webpack 插件，修改 vue-cli 最终编译的结果代码，实现效果。

在 webpack 编译完成后输出为代码文件前，在 html 中注入一些 js 代码，同时替换 js/css 文件中的 xxxvw/vh 为 calc(xxxvw/vh / var(--zoom))。

替换文件中的 vh/vw 这里是用了正则表达式：

```javascript
// ...
source.replace(/(?<=(\s|\{|\(|;|'|"|:))\d+.?\d*v(w|h)(?=(\s|\}|\)|;|'|"))/g, (v) => `calc(${v} / var(--zoom))`);
// ...
```

## 新实现

vue.config.js 中添加 ScaleCSSViewport

```javascript
configureWebpack: {
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.emit.tapAsync("ScaleCSSViewport", (compilation, callback) => {
          Object.keys(compilation.assets).forEach((item) => {
            let source = compilation.assets[item].source();
            if (item.match(/.html$/g)) {
              source = source.replace(
                "</head>",
                `
                        <style>
                            .ScaleCSSViewport_unzoom { zoom: calc(1 / var(--zoom)) }
                        </style>
                    </head>`
              );
              source = source.replace(
                "<body>",
                `<body>
                        <script>
                            let zoom = 1
                            if (navigator.userAgent.toLowerCase().includes("webkit")) {
                                zoom = document.body.offsetWidth / 1920
                                window.addEventListener('resize', () => {
                                    if (document.body.offsetWidth < 960 || document.body.offsetWidth > 1920) {
                                        window.location.reload()
                                    }
                                })
                            }
                            document.body.style.setProperty("--zoom", zoom)
                            document.body.style.zoom = zoom
                        </script>
                    `
              );
            }
            if (item.match(/.css|js$/g)) {
              source = source.replace(/(?<=(\s|\{|\(|;|'|"|:))\d+.?\d*v(w|h)(?=(\s|\}|\)|;|'|"))/g, (v) => `calc(${v} / var(--zoom))`);
              source = source.replace(/`\d+.?\d*v(w|h)`/g, (v) => v.replace(/`/g, ""));
            }
            compilation.assets[item] = {
              source: () => source,
              size: () => source.length,
            };
          });
          callback();
        });
      },
    },
  ];
}
```

## 一些边界情况

1、部分可视化库会在 document.body.style.zoom 发生变化时出现异常（如：andv）

解决方法：在 canvas 容器元素添加 class="ScaleCSSViewport_unzoom" 使该元素 zoom 为原始大小

2、ScaleCSSViewport（上面写的那个 webpack 插件）会无差别的将代码中的 xxxvw/vh 为 calc(xxxvw/vh / var(--zoom))，如果你需要在页面展示 100vh 这个字符串，ScaleCSSViewport 会将其替换为 calc(100vh / var(--zoom))

解决方法：100vh 外包上 \`\` 变为 \`100vh\`, ScaleCSSViewport 就会将 \`100vh\` 替换为 100vh。同理，想要展示为 \`100vh\` 就需要在代码中写上 \`\`100vh\`\`(PS: ScaleCSSViewport 不会替换通过 ajax 获取的文本文字，只会处理写死在代码中的 xxxvw/vh)

3、部分 antdesignvue 的 picker 选择器如果距离屏幕右侧过近，会出现选择弹窗右边部分超出屏幕

解决方法：将该选择器的 getPopupContainer 设置为其父元素（只要不是默认的 body 即可）（或在 全局化配置中 设置 getPopupContainer）。

4、部分情况下用户确实希望通过手动改变缩放，而不是我们决定 zoom 比例，因此就需要添加缓存了，需要将代码改为

```js
configureWebpack: {
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.emit.tapAsync("ScaleCSSViewport", (compilation, callback) => {
          Object.keys(compilation.assets).forEach((item) => {
            let source = compilation.assets[item].source();
            if (item.match(/.html$/g)) {
              source = source.replace(
                "</head>",
                `<style>
                        .ScaleCSSViewport_unzoom { zoom: calc(1 / var(--zoom)) }
                    </style>
                </head>`
              );
              source = source.replace(
                "<body>",
                `<body>
                    <script>
                        let zoom = 1
                        if (navigator.userAgent.toLowerCase().includes("webkit")) {
                            zoom = document.body.offsetWidth / (localStorage.getItem('offsetWidth') || 1920)
                            if(zoom > 0.99) zoom = 1
                            window.addEventListener('resize', () => {
                                localStorage.setItem('offsetWidth', document.body.offsetWidth > 1920 ? 1920 : document.body.offsetWidth)
                            })
                        }
                        document.body.style.setProperty("--zoom", zoom)
                        document.body.style.zoom = zoom
                    </script>
                `
              );
            }
            if (item.match(/.css|js$/g)) {
              if (Object.prototype.toString.call(source) === "[object Uint8Array]") {
                let str = "";
                for (let i = 0; i < source.length; i++) {
                  str += String.fromCharCode(source[i]);
                }
                source = str;
              }
              source = source.replace(/(?<=(\s|\{|\(|;|'|"|:))\d+.?\d*v(w|h)(?=(\s|\}|\)|;|'|"))/g, (v) => `calc(${v} / var(--zoom))`);
              source = source.replace(/`\d+.?\d*v(w|h)`/g, (v) => v.replace(/`/g, ""));
            }
            compilation.assets[item] = {
              source: () => source,
              size: () => source.length,
            };
          });
          callback();
        });
      },
    },
  ];
}
```

## 总结

以上便是个人对于前端处理解决用户缩放问题的一些探索与实践。

相关讨论在网上的资料不多，质量也是良莠不齐。因此这篇文章编写持续的时间非常长，自 8 月中旬到现在。同时这些解决方案的代码的一直运行在战略系统测试环境，相关边界情况也是在此期间遇到并进行了解决。这个方案已在战略系统上线。

## 注意事项

**因为一些客观原因，比如兼容等。目前此方案仅仅能在 webkit/blink 内核浏览器运行成功。**

**同时因为是针对性处理（我司目前用户设置现状），不建议此方案作为通用解决方案。**
