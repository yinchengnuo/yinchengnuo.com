# 企业私有 NPM 搭建及使用

NPM 是日常前端开发过程中离不开的包管理工具，可以帮助我们快速安装 NPM 仓库中优秀的第三方代码包，它的出现极大地促进了 Node 及前端生态的发展繁荣。

在日常工作中，大多数时候我们会使用 NPM 共有仓库中的优秀开源代码包，但还是会有一些不能够开源的代码封装和工具，或者对第三方的开源代码做定制化修改和扩展，这些代码包需要在组织内部进行管理和共享，不能够上传到 NPM 共有仓库中。

同时由于公司业务线的慢慢增加，不同团队依赖的公共东西也在慢慢增加。有时候更新一个 SDK/公共组件，得通知各方人员，并把对应更新好的 SDK/公共组件发送给他们。让他们添加在项目中，然后发布新版发布到线上。其实是增加了一定程度的风险。

最后，搭建自己的私有仓库同时还能够提升 NPM 包的安装下载速度和源的稳定性，比如大家常用的淘宝镜像源，本质上也是私有仓库。公司搭建自己的 NPM 仓库，就可以为自己的员工提供更快速稳定的工具包共享下载平台。

因此，我们需要私有 NPM 来帮助我们解决以上问题。

## Verdaccio

Verdaccio 是一个简单的、零配置要求的本地私有 NPM 注册中心。不需要额外数据库就能开始工作。Verdaccio 开箱即用，有自己的小型数据库，并能代理其他注册中心 (如 npmjs.org)，还引入了缓存下载模块的功能。最重要就是简单，使用简单，配置简单。

## 安装

这里使用 Docker 安装 Verdaccio。如果不懂 Docker 可以使用 npm/yarn 运行 Verdaccio。

```sh
docker run -d \
   --name npm \
  -p 4873:4873 \
  -u root \
  --env "VERDACCIO_PUBLIC_URL=https://npm.yinchengnuo.com" \
  -v /npm/conf:/verdaccio/conf \
  -v /npm/storage:/verdaccio/storage \
  -v /npm/plugins:/verdaccio/plugins \
  verdaccio/verdaccio
```

这里使用了我的个人网站 https://npm.yinchengnuo.com 搭建了 Verdaccio。大感兴趣可以自行使用体验。

需要注意的是制定 volume 的时候我们需要在 /conf 目录下新建一个 `config.yaml` 文件。内容填充自 https://github.com/verdaccio/verdaccio/blob/5.x/conf/docker.yaml 。这就是 Verdaccio 的默认配置。

我们可以通过修改 config.yaml 来更新 Verdaccio 配置。

运行后我们就可以通过 https://npm.yinchengnuo.com 来访问我们搭建的私有 NPM 了。

## 配置管理

以 Docker 运行为例，Verdaccio 所有的配置文件都位于 /cong/config.yaml。填充了默认配置的 config.yaml 中包含了所有的 Verdaccio 配置，都使用了 # 注释。如果需要修改默认配置项目，只需要解开注释保存修改，最后重启容器即可。

## 用户管理

Verdaccio 的用户管理没有 Web 页面，是通过对 htpasswd 的维护来管理的。

默认情况下，以 https://npm.yinchengnuo.com 为例。

运行：

```sh
npm adduser --registry https://npm.yinchengnuo.com/
```

可以实现注册/登陆。

通常情况下我们不希望通过这种形式实现用户注册，因此我们需要关闭命令行注册，修改 `config.yaml` 中 `max_users` 为 `-1` 即可。

因为已注册用户数据保都是存在 `/storage/htpasswd` 文件。因此我们可以通过修改 `/storage/htpasswd` 文件来管理用户。

用户名密码在 `/storage/htpasswd` 文件中默认以 bcrpyt 方式加密，在 `/storage/htpasswd` 中的形式为：

`用户名:bcrpyt_encode密码 日期`

例如：

`张三:$2a$10$yw900/jpXbxIEpmtMXgktOfHK/pXBumI9ZxOZvKG/hapaimFhi93a 2022-08-15T08:59:54.084Z`

Verdaccio 使用 bcrpyt 默认 Rounds 为 10，你可以在 https://www.bejson.com/encrypt/bcrpyt_encode/ 为明文密码加密。

除了 bcrpyt ，还可以使用 crpyt、md5 等加密方式。在 `config.yaml` 配置即可。`/storage/htpasswd` 管理方式同上。

## 权限管理

Verdaccio 可以配置包的访问及管理权限，默认都是公开可见的。可以通过配置 `config.yaml`

`packages` 选项。

`'@*/*'` 为私有包配置项，`'**'` 为共有包配置项，二者区别在于包 package.json 中的 privite 字段是否为 true。当然也可以使用自定义匹配批量保名，如：

```yaml
packages:
  "jquery":
    access: $all
    publish: $all
    unpublish: root
  "my-company-*":
    access: $all
    publish: $authenticated
    unpublish:
  "@my-local-scope/*":
    access: $all
    publish: $authenticated
    # unpublish: property commented out
  "**":
    access: $all
    publish: $authenticated
    proxy: npmjs
```

package 中每个包可以有 3 个权限配置项：`access`、`publish`、`unpublish`。值分别可以是：`$all`、`$anonymous`、`$authenticated` 或以空格分隔开的用户名。表示所有人可见、未登录可见、已登录可见和已登录指定人可见。

## 上游仓库

默认情况下安装 Verdaccio 中不存在的包时 Verdaccio 会自动前往 npmjs.org 拉取。相关配置在：

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
  server2:
    url: http://mirror.local.net/
    timeout: 100ms
  server3:
    url: http://mirror2.local.net:9000/
  baduplink:
    url: http://localhost:55666/
```

使用时配置相关包的 `proxy` 选项即可。`proxy` 选项和 `access`、`publish`、`unpublish` 同级。

## 源管理

使用 Verdaccio 需要注意的是。无论是任何 npm 相关的操作，只要是和私有 Verdaccio 相关的，都要在命令行显式声明 `--registry https://.../` 。这样显然过于麻烦，我们可以使用 `.npmrc` 来管理私有 Verdaccio 上的包源。

.npmrc：

```sh
registry=https://npm.yinchengnuo.com/
```

## 消息推送

Verdaccio 支持 webhook 方式推送发包信息(在 npm publish 的时候触发)。[文档地址](https://verdaccio.org/zh-cn/docs/notifications/)

推送消息到钉钉群：

```yaml
# 注意缩进
notify:
  "test-dingtalk":
    method: POST
    headers: [{ "Content-Type": "application/json;charset=utf-8" }]
    endpoint: https://oapi.dingtalk.com/robot/send?access_token=xxxx
    content: '{ "msgtype": "text","at": { "isAtAll": false }, "text": {"content":"New package published: `{{ name }}{{#each versions}} v{{version}}{{/each}}`"}}'
```
