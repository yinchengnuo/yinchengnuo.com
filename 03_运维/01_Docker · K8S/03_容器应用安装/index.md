# 容器应用安装

## Nginx

```sh
docker run \
  -d \
  --name nginx \
  --network host \
  nginx
```

```sh
mkdir /nginx
```

```sh
docker cp nginx:/etc/nginx /nginx/conf
```

```sh
docker cp nginx:/var/log/nginx /nginx/log
```

```sh
docker cp nginx:/usr/share/nginx/html /nginx/html
```

```sh
docker container rm nginx -f
```

```sh
docker run \
  -d \
  --name nginx \
  --network host \
  -v /nginx/conf:/etc/nginx \
  -v /nginx/log:/var/log/nginx \
  -v /nginx/html:/usr/share/nginx/html \
  nginx
```

## Jenkins

```sh
docker run \
  -d \
  -u root \
  --name jenkins \
  -u 0
  -p 8080:8080 \
  -p 50000:50000 \
  -v /jenkins:/var/jenkins_home \
  -v /jenkins:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkinsci/blueocean
```

```sh
docker exec -it jenkins sh
```

## Gitlab

````sh
docker run -d \
  --hostname gitlab.yinchengnuo.com \
  --publish 8081:443 --publish 22022:22 \
  --name gitlab \
  --restart always \
  --volume /gitlab/config:/etc/gitlab \
  --volume /gitlab/logs:/var/log/gitlab \
  --volume /gitlab/data:/var/opt/gitlab \
  --shm-size 256m \
  gitlab/gitlab-ce:latest
```

```sh
docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
```


配置 https:

```sh
docker exec -it gitlab /bin/bash
````

```sh
vi /etc/gitlab/gitlab.rb
```
