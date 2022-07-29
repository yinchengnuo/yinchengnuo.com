# Docker 常用命令

## 安装&启动

### 安装

1. 使用 `curl` 命令下载 `shell` 脚本

```sh
curl -fsSL get.docker.com -o get-docker.sh
```

2. 执行 `shell` 脚本

```sh
sh get-docker.sh
```

## 磁盘空间、日志、Volume 清理

### 查看当前 docker 使用的磁盘情况

```sh
docker system df
```

### 清除没有使用的镜像、容器、存储卷、网络

```sh
docker system prune # 默认会清除"悬空"镜像【就是既没有标签名也没有容器引用的镜像】

docker system prune -a # 删除所有 没正在使用的 镜像、容器、存储卷、网络

docker system prune -f # 强制删除，不需要进行交互式确认
```

### 查看容器的日志

```sh
ls -lh $(find /var/lib/docker/containers/ -name *-json.log)
```

### 删除所有 dangling 数据卷（即无用的 Volume）

```sh
docker volume rm $(docker volume ls -qf dangling=true)
```
