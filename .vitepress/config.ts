/*
 * @Author: 尹成诺
 * @Date: 2022-07-11 17:03:09
 * @LastEditors: 尹成诺
 * @LastEditTime: 2022-08-02 15:24:55
 * @Description: file content
 */
// import nav from "./nav";
import glob from "glob";
// import sidebar from "./sidebar";
import { defineConfig, DefaultTheme } from "vitepress";

const modules = ["01_前端", "02_后端", "03_运维", "04_数据库"];

const links = glob.sync("**/*.md").filter((path: string) => modules.some((module) => path.startsWith(module))) as Array<string>;

const nav: Array<DefaultTheme.NavItem> = [];
const sidebar: DefaultTheme.Sidebar = {};

links.forEach((links: string) => (sidebar[`/${links.split("/")[0]}/`] = []));

links.forEach((link: string) => {
  const paths = link.split("/");
  const names = paths[1].split("_");
  sidebar[`/${paths[0]}/`][+names[0] - 1] = { text: names[1], items: [], collapsible: true };
});

links.forEach((link: string) => {
  const paths = link.split("/");
  const names1 = paths[1].split("_");
  const names2 = paths[2].split("_");
  sidebar[`/${paths[0]}/`][+names1[0] - 1].items[+names2[0] - 1] = { text: names2[1], link: `/${link}` };
});

Object.entries(sidebar).forEach(([key, value]: [string, DefaultTheme.SidebarGroup[]]) => {
  nav.push({ text: key.split("_")[1].replace("/", ""), items: value.map((e) => ({ text: e.text || "-", link: e.items[0].link })), activeMatch: `^${key}` });
});

export default defineConfig({
  lang: "zh", // 中文网站
  lastUpdated: true, // 显示上次更新时间
  title: "小楼昨夜听风雨", // 网站名称
  description: "尹成诺的个人网站", // meta
  // markdwon 配置
  markdown: {
    lineNumbers: true, // 代码显示行号
  },
  themeConfig: {
    outlineTitle: "文档大纲",
    lastUpdatedText: "最近更新时间",
    editLink: {
      pattern: "https://github.com/yinchengnuo/yinchengnuo.com/blob/master/:path",
      text: "在 GitHub 上编辑此页面",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/yinchengnuo" }],
    nav: [
      {
        link: "/",
        text: "首页",
        activeMatch: "^/$",
      },
      {
        text: "我的应用",
        activeMatch: "^/00_我的应用/",
        items: [
          { text: "滚动君小程序", link: "/00_我的应用/01_滚动君小程序/index.md" },
          { text: "青柠直播微信小程序", link: "/00_我的应用/02_青柠直播微信小程序/index.md" },
        ],
      },
      ...nav,
      {
        text: "工具",
        items: [
          { text: "图片压缩", link: "https://tinypng.com/" },
          { text: "图片裁剪", link: "https://www.gaitubao.com/" },
          { text: "图片生成ico", link: "https://tool.lu/favicon/" },
          { text: "代码导出为图片", link: "https://carbon.now.sh/" },
          { text: "WebSocket 在线测试", link: "http://www.websocket-test.com/" },
        ],
      },
      {
        text: "文档",
        items: [
          { text: "vite", link: "https://vitejs.cn/" },
          { text: "vue", link: "https://v3.cn.vuejs.org/" },
          { text: "nginx", link: "https://www.nginx.cn/doc/" },
          { text: "jenkins", link: "https://www.jenkins.io/zh/doc/" },
          { text: "vitepress", link: "https://vitepress.vuejs.org/" },
          { text: "markdown", link: "https://www.runoob.com/markdown/md-tutorial.html" },
          { text: "localhost https 证书", link: "https://letsencrypt.org/zh-cn/docs/certificates-for-localhost/" },
        ],
      },
      { text: "关于", link: "/关于/index" },
    ],
    sidebar,
  },
});
