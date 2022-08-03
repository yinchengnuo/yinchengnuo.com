# Jenkins 入门

Jenkins 是一款使用 Java 语言开发的开源的自动化服务器。我们通过界面或 Jenkinsfile 告诉它执行什么任务，何时执行。理论上，我们可以让它执行任何任务，但是通常只应用于持续集成和持续交付。

## 安装

```sh
docker run \
  -u root \
  --rm \
  -d \
  -u 0
  -p 8080:8080 \
  -p 50000:50000 \
  -v /jenkins:/var/jenkins_home \
  -v /jenkins:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkinsci/blueocean
```
