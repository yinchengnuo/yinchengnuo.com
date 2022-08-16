# Docker 入门

---

Docker 是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可抑制的容器中，然后发布到任何流行的 Linux 机器上。

容器完全使用沙盒机制，相互之间不会存在任何接口。几乎没有性能开销，可以很容易的在机器和数据中心运行。最重要的是，他们不依赖于任何语言、框架或者包装系统。

## 基础软件架构发展史

为了更好的理解什么是 Docker，我们先来看一段简单的基础架构历史：

> - 90 年代是传统服务器，在一些公司都会买小型机、塔式服务器、刀片式服务器，一个服务器上跑一个服务（一种应用），缺点是大量服务器资源被浪费；
> - 2000 年开始流行虚拟化技术，代表是`VMware`和`VirtualBox`软件，在一个服务器上可以模拟出多台虚拟服务器，缺点是占有服务器资源较多，需要虚拟内存和 CPU，占有服务器大量资源；
> - 2005 年-2015 年云技术 Cloud 开始流行，这个时候产生了很多大型云服务商，国际的有亚马逊、国内的阿里云，都是这个时期成长起来的公司。云技术也为容器技术提供了良好的生长土壤。
> - 2015 年以后 Container（容器）时代，现在无论是国际还是国内大厂，无一例外的都在使用容器技术。那最为出名的就是`Docker`。

通过这段历史，你应该大概能够知道 Docker 是什么了。

## Docker 与虚拟机

提到 `Docker`，就不得不提到虚拟机。

在容器技术之前，业界的网红是虚拟机。虚拟机技术的代表，是 VMWare 和 OpenStack。

相信很多人都用过虚拟机。虚拟机，就是在你的操作系统里面，装一个软件，然后通过这个软件，再模拟一台甚至多台“子电脑”出来。在“子电脑”里，你可以和正常电脑一样运行程序，例如开 QQ。如果你愿意，你可以变出好几个“子电脑”，里面都开上 QQ。“子电脑”和“子电脑”之间，是相互隔离的，互不影响。

虚拟机属于虚拟化技术。而 Docker 这样的容器技术，也是虚拟化技术，属于轻量级的虚拟化。

虚拟机虽然可以隔离出很多“子电脑”，但占用空间更大，启动更慢，虚拟机软件可能还要花钱（例如 VMWare）。

而容器技术恰好没有这些缺点。它不需要虚拟出整个操作系统，只需要虚拟一个小规模的环境（类似“沙箱”）。

它启动时间很快，几秒钟就能完成。而且，它对资源的利用率很高（一台主机可以同时运行几千个 Docker 容器）。此外，它占的空间很小，虚拟机一般要几 GB 到几十 GB 的空间，而容器只需要 MB 级甚至 KB 级。

简单的说就是：

> 我们如果在一台物理服务器上只跑一个服务是浪费，而同时跑很多服务他们又互相影响，比如说一个服务出了内存泄漏把整个服务器的内存都占满了，其他服务都跟着倒霉。所以要把每个服务都隔离起来，让它们只使用自己那部分有限的 cpu，内存和磁盘，以及自己依赖的软件包。这个早先是用虚拟机来实现隔离的，但是每个虚拟机都要装自己的操作系统核心，这是对资源有点浪费。于是就有了 Docker, 一个机器上可以装十几个到上千个 docker，他们共享操作系统核心，占用资源少，启动速度快。但又能提供了资源（cpu, 内存，磁盘等）的一定程度的隔离。

## Docker 核心概念

### Docker 镜像

Docker 镜像类似于虚拟机镜像，可以将它理解为一个只读的模板。

例如，一个镜像可以包含一个基本的操作系统环境，里面仅安装了 Apache 应用程序（或用户需要的其他软件）。可以把它称为一个 Apache 镜像。镜像是创建 Docker 容器的基础。通过版本管理和增量的文件系统，Docker 提供了一套十分简单的机制来创建和更新现有的镜像，用户甚至可以从网上下载一个已经做好的应用镜像，并直接使用。

### Docker 容器

Docker 容器类似于一个轻量级的沙箱，Docker 利用容器来运行和隔离应用。容器是从镜像创建的应用运行实例。它可以启动、开始、停止、删除，而这些容器都是彼此相互隔离、互不可见的。可以吧容器看做一个简易版的 Linux 系统环境（包括 root 用户权限、进程空间、用户空间和网络空间等）以及运行在其中的应用程序打包而成的盒子。

注意：镜像自身是只读的。容器从镜像启动的时候，会在镜像的最上层创建一个可写层。

### Docker 仓库

Docker 仓库类似于代码仓库，是 Docker 集中存放镜像文件的场所。从认识上来说，就好像软件包上传下载站，有各种软件的不同版本被上传供用户下载，共享和管理 Docker 镜像，官方地址为：[https://registry.hub.docker.com/](https://registry.hub.docker.com/)

### 容器和镜像的区别

> 镜像像是一个包含了 OS 文件系统和应用的对象，类似虚拟机的模板（比如 Window10 镜像）。如果你是一个开发者，可以把镜像看成面向对象编程中的只读类(read-only Class)。

> 容器和镜像几乎一模一样，唯一的区别是镜像是只读的，而容器上面有一个可读写层。所以容器=镜像+读写层。

## Docker 安装运行

ps: 本文都所有的操作都是在 linux 环境

1、使用`curl`命令下载一个`sh`脚本

```sh
curl -fsSL get.docker.com -o get-docker.sh
```

2、运行 Docker 安装脚本

```sh
sh get-docker.sh
```

3、启动 docker

```sh
systemctl start docker
```

此时安装一个 nginx 试一下：

```sh
docker container run -d -p 88:80 nginx
```

运行完成后执行：

```sh
curl 127.0.0.1:88
```

即可看到：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to nginx!</title>
    <style>
      html {
        color-scheme: light dark;
      }
      body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <h1>Welcome to nginx!</h1>
    <p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>

    <p>
      For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.<br />
      Commercial support is available at
      <a href="http://nginx.com/">nginx.com</a>.
    </p>

    <p><em>Thank you for using nginx.</em></p>
  </body>
</html>
```

此时，我们就使用 Docker 启动了一个 Nginx 服务器，通过浏览器 88 端口可以访问。

## Docker Container

### 创建一个容器

```sh
docker container run < image name >
```

image 代表一个镜像的名称，比如上文中的 nginx。

当命令执行时，如果系统没有这个镜像，Docker 会自动去`Docker Hub`上拉取对应的镜像到本地，根据镜像创建容器。

> Docker Hub 是 Docker 官方的镜像和社区，里边有很多开发者制作好的镜像，我们可以直接使用这些镜像。如果你有能力，也可以制作镜像，并上传到 Docker Hub。

注意，这时候容器是在前台运行的。

### 查看容器的相关命令

```sh
docker container ls -a
```

输入命令后，就会显示出当前已经存在的容器，并且会列出对应的信息。

> - CONTAINER ID : 容器对应的 ID，这个是唯一的
> - IMAGE : 使用的镜像名称，显示不同
> - COMMAND : 执行的相关命令
> - CREATED: 创建的时间
> - STATUS: 目前镜像的状态，一般会有两种状态 Up 和 Exited.
> - PORTS: 协议和端口
> - NAMES: 容器的名称，名字是 Docker 随机生成的

### 停止容器的相关命令

```sh
docker container stop <name or ID>
```

### 删除容器的相关命令

```sh
docker container rm <name or ID>
```

### attached 和 detached 模式

两种模式最简单的对比理解就是：attached 模式在前台运行，detached 模式在后台运行。

attached 即 前台模式。在前台模式下（不指定-d 参数即可），Docker 会在容器中启动进程，同时将当前的命令行窗口附着到容器的标准输入、标准输出和标准错误中。也就是说容器中所有的输出都可以在当前窗口中看到。

detached 即后台模式。后台模式下所有 I/O 数据只能通过网络资源或者共享卷组来进行交互。因为容器不再监听你执行 docker run 的这个终端命令行窗口。但你可以通过执行 docker attach 来重新附着到该容器的会话中。

### detached 模式转换 attached 模式

```sh
docker  attach <ID or Name>
```

### detached 模式下查看 logs

```sh
docker container logs <ID or Name>
```

虽然日志在窗口中出现了，但只打印一次 logs,如果想动态一直跟踪日志，可以在命令上加入一个 `-f`。

### container 的交互模式

有时候容器的镜像不是简单的一个服务，而是需要交互的操作系统。例如创建一个 Ubuntu 系统，然后需要到系统里输入各种 Shell 命令和系统进行交互。这时候 attached 模式和 detached 模式就不能满足要求了。需要使用交互模式。

```sh
docker container run -it ubuntu sh
```

`-it`代表启用交互模式，`sh`代表可以使用 `Shell` 脚本。当你输入玩这个脚本后，Docker 就会进入到交互模式。可以使用`ls`来得到目录下的文件，也可以使用`hostname`来查看计算机名称。

这时候你想退出容器和交互模式可以输入`exit`命令。需要重点说明的是，随着命令退出后，容器也会跟着退出，变成 Exited 模式。

### detached 模式下的交互模式

```sh
docker exec -it <ID or Name> sh
```

`exec`是执行的意思，`-it`交互模式 ， `sh`交互的方式，用`shell`脚本进行交互。整个命令的意思是：用 shell 脚本的方式执行交互模式。

这种模式的优点是，再使用 `exit` 退出后，服务并不会停止，而只是退出了交互模式。可以自己尝试一下退出，然后使用 `docker container ls -a` 来查看一下容器的状态，你会发现依然是 up 状态。

## Docker Image

上面我们说过，Docker image 是一个 read-only 文件，这个文件包含文件系统、源码、库文件、依赖等运行应用需要的文件，可以理解为一个模板。

### 获取镜像的三个基本途径

- 从网络社区直接拉取，在 Docker 里这种社区叫做 Registry(登记处)的意思。（pull from registry）
- 从 Dockerfile 构建一个镜像，这种像是 DIY 一个镜像，但是整个构建过程是需要联网，因为需要西在基础镜像，然后根据基础镜像进行构建（build from Dockerfile）。
- 自有文件的导入，可以从本地导入已经构建好的镜像文件，在没有网络的时候可以用。这个文件是通过 已有的镜像导出来的压缩包，然后就可以进行使用了。

总结：三种方法中最简单的是第一种，一条命令就可以完成。最复杂的是用 Dockerfile 进行构建，因为要写很多批处理命令 Shell，但这正式 Docker 的魅力所在，也是我们必须要掌握的。

### 镜像社区的介绍

镜像社区也叫做 Image registry（镜像登记处），是拉取和下载镜像的网站，你也可以通过 Dockerfile 制作镜像，让所有人使用，类似 Docker Image 专属的简单版 GitHub。

目前最流行的两个社区，一个是官方自己的另一个是红帽旗下的 Quay.io。

dockerhub：https://hub.docker.com/ ,Docker 官方社区，在使用 Docker 时默认的拉取网站。

Quay：https://quay.io/ ，这个是 Liunx Red Hat （红帽）的旗下一个第三方 Docker 社区。

### 镜像的拉取

```sh
docker image pull node
```

从 Quay.io 上拉取镜像

```sh
docker pull quay.io/calico/node
```

### 镜像的查看

```sh
docker image ls
```

### 镜像的删除

```sh
docker image rm <Image ID>
```

需要注意的是，当有容器在使用镜像时，是没有办法被删除的。即使容器是停止掉的，依然是没办法删除的。

### 镜像的导出

```sh
docker image save busybox:latest -o mybusybox.image
```

`save`是导出/保存的意思，`busybox:latest`是镜像名称+版本号， `-o`代表输出，`mybusybox.image`是导出后镜像的名字。

命令执行完成后，可以看到在执行命令所在的目录下就会多出一个`mybusybox.image`的文件，这就是刚才导出的镜像了。

### 镜像的导入

```sh
docker image load -i .\mybusybox.image
```

## Docker Dockerfile

Dockerfile 是一个用来构建镜像的文本文件，文本内容包含了一条条构建镜像所需的指令和说明。

可以简单总结为下面三点：

- Dockerfile 是用于构建 docker 镜像的文件
- Dockerfile 里包含了构建镜像所需的”指令“
- Dockerfile 有其特定的语法规则（重要学习）

### 为什么需要 Dockerfile

> 问题: 在 dockerhub 中官方提供很多镜像已经能满足我们的所有服务了,为什么还需要自定义镜像
>
> 核心作用:日后用户可以将自己应用打包成镜像,这样就可以让我们应用进行容器运行.还可以对官方镜像做扩展，以打包成我们生产应用的镜像。

### Dockerfile 的格式

两种类型的行

- 以# 开头的注释行
- 由专用“指令（Instruction）”开头的指令行

由 Image Builder 顺序执行各指令，从而完成 Image 构建。

下面以定制一个 nginx 镜像（构建好的镜像内会有一个 /usr/share/nginx/html/index.html 文件）为示例展开讲解。

在一个空目录下，新建一个名为 Dockerfile 文件，并在文件内添加以下内容：

```sh
FROM nginx
RUN echo '这是一个本地构建的nginx镜像' > /usr/share/nginx/html/index.html
```

`FROM`：定制的镜像都是基于 FROM 的镜像，这里的 nginx 就是定制需要的基础镜像。后续的操作都是基于 nginx。

`RUN`：用于执行后面跟着的命令行命令。有以下俩种格式：

shell 格式：

```sh
RUN <命令行命令>
# <命令行命令> 等同于，在终端操作的 shell 命令。
```

exec 格式：

```sh
RUN ["可执行文件", "参数1", "参数2"]
# 例如：
# RUN ["./test.php", "dev", "offline"] 等价于 RUN ./test.php dev offline
```

注意：Dockerfile 的指令每执行一次都会在 docker 上新建一层。所以过多无意义的层，会造成镜像膨胀过大。例如：

```sh
FROM centos
RUN yum -y install wget
RUN wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz"
RUN tar -xvf redis.tar.gz
```

以上执行会创建 3 层镜像。可简化为以下格式：

```sh
FROM centos
RUN yum -y install wget \
    && wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz" \
    && tar -xvf redis.tar.gz
```

如上，以 && 符号连接命令，这样执行后，只会创建 1 层镜像。

### 构建镜像

在 Dockerfile 文件的存放目录下，执行构建动作。

以下示例，通过目录下的 Dockerfile 构建一个 nginx:v3（镜像名称:镜像标签）。

注：最后的 . 代表本次执行的上下文路径

```sh
docker build -t nginx:v3 .
```

### 指令详解

#### COPY

复制指令，从上下文目录中复制文件或者目录到容器里指定路径。

格式：

```sh
COPY [--chown=<user>:<group>] <源路径1>...  <目标路径>
COPY [--chown=<user>:<group>] ["<源路径1>",...  "<目标路径>"]
```

[--chown=\<user\>:\<group\>]：可选参数，用户改变复制到容器内文件的拥有者和属组。

<源路径>：源文件或者源目录，这里可以是通配符表达式，其通配符规则要满足 Go 的 filepath.Match 规则。例如：

```sh
COPY hom* /mydir/
COPY hom?.txt /mydir/
```

<目标路径>：容器内的指定路径，该路径不用事先建好，路径不存在的话，会自动创建。

#### ADD

ADD 指令和 COPY 的使用格类似（同样需求下，官方推荐使用 COPY）。功能也类似，不同之处如下：

- ADD 的优点：在执行 <源文件> 为 tar 压缩文件的话，压缩格式为 gzip, bzip2 以及 xz 的情况下，会自动复制并解压到 <目标路径>。
- ADD 的缺点：在不解压的前提下，无法复制 tar 压缩文件。会令镜像构建缓存失效，从而可能会令镜像构建变得比较缓慢。具体是否使用，可以根据是否需要自动解压来决定。

#### CMD

类似于 RUN 指令，用于运行程序，但二者运行的时间点不同:

- CMD 在 docker run 时运行。
- RUN 是在 docker build。

作用：为启动的容器指定默认要运行的程序，程序运行结束，容器也就结束。CMD 指令指定的程序可被 docker run 命令行参数中指定要运行的程序所覆盖。

注意：如果 Dockerfile 中如果存在多个 CMD 指令，仅最后一个生效。

格式：

```sh
CMD <shell 命令>
CMD ["<可执行文件或命令>","<param1>","<param2>",...]
CMD ["<param1>","<param2>",...]  # 该写法是为 ENTRYPOINT 指令指定的程序提供默认参数
```

推荐使用第二种格式，执行过程比较明确。第一种格式实际上在运行的过程中也会自动转换成第二种格式运行，并且默认可执行文件是 sh。

#### ENTRYPOINT

类似于 CMD 指令，但其不会被 docker run 的命令行参数指定的指令所覆盖，而且这些命令行参数会被当作参数送给 ENTRYPOINT 指令指定的程序。

但是, 如果运行 docker run 时使用了 --entrypoint 选项，将覆盖 ENTRYPOINT 指令指定的程序。

优点：在执行 docker run 的时候可以指定 ENTRYPOINT 运行所需的参数。

注意：如果 Dockerfile 中如果存在多个 ENTRYPOINT 指令，仅最后一个生效。

格式：

```sh
ENTRYPOINT ["<executeable>","<param1>","<param2>",...]
```

可以搭配 CMD 命令使用：一般是变参才会使用 CMD ，这里的 CMD 等于是在给 ENTRYPOINT 传参，以下示例会提到。

示例：

假设已通过 Dockerfile 构建了 nginx:test 镜像：

```sh
FROM nginx

ENTRYPOINT ["nginx", "-c"] # 定参
CMD ["/etc/nginx/nginx.conf"] # 变参
```

1、不传参运行

```sh
docker run  nginx:test
```

容器内会默认运行以下命令，启动主进程。

```sh
nginx -c /etc/nginx/nginx.conf
```

2、传参运行

```sh
docker run  nginx:test -c /etc/nginx/new.conf
```

容器内会默认运行以下命令，启动主进程(/etc/nginx/new.conf:假设容器内已有此文件)

```sh
nginx -c /etc/nginx/new.conf
```

#### ENV

设置环境变量，定义了环境变量，那么在后续的指令中，就可以使用这个环境变量。

格式：

```sh
ENV <key> <value>
ENV <key1>=<value1> <key2>=<value2>...
```

以下示例设置 NODE_VERSION = 7.2.0 ， 在后续的指令中可以通过 $NODE_VERSION 引用：

```sh
ENV NODE_VERSION 7.2.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc"
```

#### ARG

构建参数，与 ENV 作用一致。不过作用域不一样。ARG 设置的环境变量仅对 Dockerfile 内有效，也就是说只有 docker build 的过程中有效，构建好的镜像内不存在此环境变量。

构建命令 docker build 中可以用 --build-arg <参数名>=<值> 来覆盖。

格式：

```sh
ARG <参数名>[=<默认值>]
```

#### VOLUME

定义匿名数据卷。在启动容器时忘记挂载数据卷，会自动挂载到匿名卷。

作用：

- 避免重要的数据，因容器重启而丢失，这是非常致命的。
- 避免容器不断变大。

格式：

```sh
VOLUME ["<路径1>", "<路径2>"...]
VOLUME <路径>
```

在启动容器 docker run 的时候，我们可以通过 -v 参数修改挂载点。

#### EXPOSE

仅仅只是声明端口。

作用：

帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射。

在运行时使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口。

格式：

```sh
EXPOSE <端口1> [<端口2>...]
```

#### WORKDIR

指定工作目录。用 WORKDIR 指定的工作目录，会在构建镜像的每一层中都存在。（WORKDIR 指定的工作目录，必须是提前创建好的）。

docker build 构建镜像过程中的，每一个 RUN 命令都是新建的一层。只有通过 WORKDIR 创建的目录才会一直存在。

格式：

```sh
WORKDIR <工作目录路径>
```

#### USER

用于指定执行后续命令的用户和用户组，这边只是切换后续命令执行的用户（用户和用户组必须提前已经存在）。

格式：

```sh
USER <用户名>[:<用户组>]
```

## Docker Volume

默认情况下，在运行中的容器里创建的文件，被保存在一个可写的容器层：

- 如果容器被删除了，则数据也没有了
- 这个可写的容器层是和特定的容器绑定的，也就是这些数据无法方便的和其它容器共享

Docker 主要提供了两种方式做数据的持久化

- Data Volume, 由 Docker 管理，(/var/lib/docker/volumes/ Linux), 持久化数据的最好方式
- Bind Mount，由用户指定存储的数据具体 mount 在系统什么位置

### 不能持久化的案例演示

对比的学习效果最好，所以这里先操作一个不能持久化的案例。当我们了解问题后，再学习持久化就更容易理解和重视。先运行一个官方的 Ngix 的容器。

```sh
docker container run -d nginx
```

服务运行后，用下面的命令进入交互模式:

```sh
docker container exec  -it <Container ID> sh
```

然后我们在 `/app` 目录创建一个 `test` 目录

如果此时我们退出交互模式并停止容器最后删除容器后，我们新建的 test 目录就消失了。

### VOLUME 命令实现持久化操作

```sh
docker container run -d -v /app nginx
```

此时我们在 `/app` 目录创建一个 `test` 目录，删除容器后文件夹依然存在。那这些持久化的数据被保存到了那里哪？这就需要我们再学习一下`docker volume`的相关命令了。

### docker volume 相关命令

现在退出容器，来到主系统当中，可以输入下面的命令,就可以看到 docker volume 相关的命令了。

```sh
# docker volume

Usage:  docker volume COMMAND

Manage volumes

Commands:
  create      Create a volume
  inspect     Display detailed information on one or more volumes
  ls          List volumes
  prune       Remove all unused local volumes
  rm          Remove one or more volumes

Run 'docker volume COMMAND --help' for more information on a command.
```

可以用 `docker volume ls` 查看所有的持久化空间，最主要的是可以看到存储空间的 ID。

有了 ID 之后，使用下面的命令，可以查看到持久化的具体地址。

```sh
# docker volume ls
DRIVER    VOLUME NAME
local     202028fdcadfb2e76309cd9fa7ce767e8c1e6612a974d51ba2ccff90df59c656
# docker volume inspect 202028fdcadfb2e76309cd9fa7ce767e8c1e6612a974d51ba2ccff90df59c656
[
    {
        "CreatedAt": "2022-08-06T15:33:29+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/202028fdcadfb2e76309cd9fa7ce767e8c1e6612a974d51ba2ccff90df59c656/_data",
        "Name": "202028fdcadfb2e76309cd9fa7ce767e8c1e6612a974d51ba2ccff90df59c656",
        "Options": null,
        "Scope": "local"
    }
]
```

其中的 Mountpoint 就是持久化的地址，复制这个地址，然后用 cd 命令进入后就能看到我们创建的 test 目录了。

通过上面的学习，你已经会把容器（container）中的数据和文件，保存在操作系统上了。现在的需求是，再创建一个容器，新容器如何用我们之前用 volume 保存下来的的持久化数据？

### 使用具名 volume 实现复用

还是启动一个 nginx，同时加上名称：

```sh
# docker container run -d -v my_nginx:/app nginx
641eb11eea39eb253b23bd1d9b212de55bf2c484e4375ace7192faf10affda25
# docker volume ls
DRIVER    VOLUME NAME
local     20e96ab6798c7cc70d79ea6dc2595093c0fbb7ad0e5cde74a562b346f0ef8d88
local     my_nginx
# docker volume inspect my_nginx
[
    {
        "CreatedAt": "2022-08-06T15:50:03+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/my_nginx/_data",
        "Name": "my_nginx",
        "Options": null,
        "Scope": "local"
    }
]
# cd /var/lib/docker/volumes/my_nginx/_data
# mkdir my_nginx_test
# docker container exec -it 641 sh
# cd /app
# ls
my_nginx_test
# exit
```

当我们使用具名 volume 运行容器后，我们可以通过名称找到持久化所在的位置，在外部对持久化目录做的修改会映射到容器内部。

此时我们如果删除容器，使用上面的方式重新创建一个容器，数据仍然存在，这时候就实现了数据持久化：

```sh
# docker container rm 641 -f
641
# docker container run -d -v my_nginx:/app nginx
fcd49f7525f7a498e72b25b56a11fff2508b8cd863d262aa957fc181ce1474f4
# docker container exec -it fcd sh
# cd /app
# ls
my_nginx_test
# exit
```

### Bind Mount 实现数据持久化

数据持久化除了上面讲的 Data Volume 外，还有一种叫做 Bind Mount，从中文翻译来讲，就是挂载绑定。简单讲就是把容器中持久化的数据，绑定到本机的一个自定义位置。

bind mount 是将主机上的目录或文件 mount 到容器里。

使用直观高效，易于理解。

使用-v 选项指定挂载路径，格式 host_path:container_path : 前面是宿主机真实存在的路径 :后面是容器内的路径

```sh
# 后台运行一个使用nginx镜像的容器并将宿主机的/data目录挂载到容器的目录/usr/share/nginx/html下
# docker run -d --name demo -v /data:/usr/share/nginx/html nginx
```

在宿主机操作 /data 目录或在容器内操作 /usr/share/nginx/html 目录会相互映射。这里不再重复演示。

### 多个机器之间的容器共享数据

官方参考链接 https://docs.docker.com/storage/volumes/#share-data-among-machines

## Docker NetWork

一台服务器上可以跑很多容器，容器间是相互配合运行的。有配合就需要有网络通讯，就需要设置网络。

比如现在我们启动一个 nginx 的容器，用 detached 模式启动，并映射端口到 8888 上。

```sh
docker container run -d -p 8888:80 nginx
```

容器启动后，可以用查看容器的具体信息。命令如下。

```sh
docker container inspect <Container ID >
```

输入完成后，你可以看到有很多信息。其中有一项是 Networks，这个就是容器的网路设置了：

```sh
"Networks": {
    "bridge": {
        "IPAMConfig": null,
        "Links": null,
        "Aliases": null,
        "NetworkID": "d93ef70843f3885fca96ce8d00c8953d7849f3560de49dfac07501823b5658a9",
        "EndpointID": "e8924969dfc8d45519619b1013a26194c77b11a9da66e6ad2f9768b670873888",
        "Gateway": "172.17.0.1",
        "IPAddress": "172.17.0.4",
        "IPPrefixLen": 16,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:ac:11:00:04",
        "DriverOpts": null
    }
}
```

信息中是可以看出很多东西的，比如这个网络的连接方式是 bridge，也就是桥接。然后 IP 地址 IPAddress 是 `172.17.0.4` 这个就是它的内网 IP 地址。

为了看的更清晰，我们可以再启动一个 nginx 容器.

```sh
docker container run -d -p 8889:80 nginx
```

这个容器的 network 信息为：

```sh
"Networks": {
    "bridge": {
        "IPAMConfig": null,
        "Links": null,
        "Aliases": null,
        "NetworkID": "d93ef70843f3885fca96ce8d00c8953d7849f3560de49dfac07501823b5658a9",
        "EndpointID": "2df423cafc17d39476ffc294ae863015ed5c0864429a56d4a44b153bda302646",
        "Gateway": "172.17.0.1",
        "IPAddress": "172.17.0.5",
        "IPPrefixLen": 16,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:ac:11:00:05",
        "DriverOpts": null
    }
}
```

此时，这个容器的 IP 地址变成了 `172.17.0.5`

也就是说每一个容器启动后都会有一个 IP，并且每个 IP 是不同，自动变化的。这就是 Docker 为我们作的默认网络配置。并且虽然容器的启动顺畅，给的 IP 地址也是递增的。

这种默认的问题就是，如果每次启动的顺序不一样，IP 地址就会不同，这样每次都要重新进行配置。这肯定在工作中是行不通的。真实工作中，可能一台服务器就有几十个容器，如果每次修改通讯地址，这个工作将变的混乱不堪，无法继续。

那一般情况下，我们会通过 --name 来置顶固定名称，然后再用名称进行通信。这种解决方案的前提就是需要了解网络模式和自定义网络后，才能实现可控状态。

#### 查看所有 Docker 的网络列表

可以使用下面的命令进行查看主机上已经有的网络配置列表：

```sh
docker network ls
```

docker 默认有 3 种网络模式：

- bridge ： 这个是网关模式。在这个模式下，Docker 会为每一个容器分配、设置 IP 等，并将容器连接到一个 docker0 虚拟网关，默认为该模式。
- host ：使用主机模式，容器没有 IP 和网关这些，都是用实体主机的。容器将不会虚拟出自己的网卡，配置自己的 IP 等，而是使用宿主机的 IP 和端口。
- none ：就是不创建自己的 IP 网络。也就是常说的没有网，当然你可以自己进行定义网络模式。容器有独立的 Network namespace，但并没有对其继续任何网络设置，如分配 veth pair 和网桥连接，IP 等。

还有一种 container 模式，就是利用其它容器的网络，别的容器有网络了，使用其它的容器网络。新创建的容器不会创建自己的网卡和配置自己的 IP，而是和一个指定的容器共享 IP、端口等。此种方式不是默认网络模式，它需要基于另一个容器。

#### bridge 网络模式

在该模式中，Docker 守护进程创建了一个虚拟以太网桥 docker 0,新建的容器会自动桥接到这个接口，附加在其上的任何网卡之间都能自动转发数据包。

如上面的 `172.17.0.5` 和 `172.17.0.4` 可以互相通信。因为所有 bridge 模式的容器共享同一个网关 `172.17.0.1`，这个网关就是 docker0。

我们可以测试下通信。还是刚刚的那两个容器，我们将 IP 为 `172.17.0.5` 的容器命名为 `ip5`。将 IP 为 `172.17.0.4` 的容器命名为 `ip4`。

修改容器内容：

```sh
docker container exec -it ip5 sh -c 'echo ip5 > /usr/share/nginx/html/index.html'
```

```sh
docker container exec -it ip4 sh -c 'echo ip4 > /usr/share/nginx/html/index.html'
```

此时在 ip5 容器请求 ip4:

```sh
# docker container exec ip5 curl 172.17.0.4
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100     4  100     4    0     0   4000      0 --:--:-- --:--:-- --:--:--  4000
ip4
```

#### host 模式

host 网络模式使用主机网络模式，容器没有 IP 和网关这些，都是用实体主机的。容器将不会虚拟出自己的网卡，配置自己的 IP 等，而是使用宿主机的 IP 和端口。采用 host 网络模式的 Docker Container，可以直接使用主机的 IP 地址与外界进行通信，若主机的 eth0 是一个共有 IP，那么容器有用这个共有 IP。同时容器内服务的端口也可以使用端口，无需额外进行 NAT 转换。

```sh
docker run -it --name nginx1 --network host nginx
```

#### none 网络模式

none 网络模式是指禁用网络功能，只有 `lo` 接口 `local` 的简写，代表 `127.0.0.1`,即 `localhost` 本地环回接口。在创建容器时通过 `-- net none` 或者 `--network none` 指定。

`none` 网络模式即不为容器创建任何的网络环境，容器内部只能使用 loopback 网络设备，不会再有其他的网络资源。可以说 none 模式为容器做了极少的网络设定，但是俗话说的好“少即是多”。在没有网络配置的情况下，作为 Docker 开发者，才能在这基础做其他无限多的可能的网络定制开发。这也体现了 Docker 设计理念的开发。

#### container 网络模式

Container 网络模式是 Docker 中一种较为特别的网络模式。在创建时通过参数 `-- net container` : 已运行的网络名称 | ID 或者 `-- network container` : 已运行的容器名称 | ID 指定。处于这个模式下的 Docker 容器会共享一个网络栈，这样两个容器之间可以使用 localhost 高效通信。Container 网络模式即新创建的容器不会创建自己的网卡，配置自己的 IP，而是和一个指定的容器共享 IP、端口范围等。同样两个容器除了网络方面相同之外，其他的如文件系统、进程列表等还是隔离的。
