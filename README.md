# NOTE.LIFE (0.0.1 🧟‍)

![note.life.logo](./logo.png)

![](https://img.shields.io/badge/node->%3D8.11.3-brightgreen.svg) ![](https://img.shields.io/badge/npm->%3D5.6.0-brightgreen.svg) ![](https://img.shields.io/badge/mongoose->%3D5.2.13-brightgreen.svg) ![](https://img.shields.io/badge/koa.js->%3D2.5.2-brightgreen.svg) ![](https://img.shields.io/badge/jsonwebtoken->%3D8.3.0-brightgreen.svg)


## What's this ?

>
> 以 RESTFul API 的形式提供一套内容管理服务
>

## 配置文件

```yml
# 数据库配置 db_auth 设置为 false 时会忽略 db_user db_pass
db_auth: true
db_user: your_db_username
db_pass: your_db_password
db_host: 127.0.0.1
db_port: 27017
db_name: note_life

# 启服务时指定的域名 默认 127.0.0.1 即可 (eg: 0.0.0.0 | 127.0.0.1 | 192.168.1.10 ...)
bind_ip: 127.0.0.1

# 启服务时指定的端口 默认 4533
bind_port: 4533

# 公网访问的域名
bind_domain: note.life.com

# 静态资源路径，默认 ./public 不用动; 如需指定其它，必须是绝对路径，
public_path: ./public

# 代理设置, 通过 nginx 转发时设置为 true
proxy_pass: true

# 是否启用 https, 生产环境推荐 nginx 层做掉 
https: false

# 是否启用 http2 (@todo)
http2: false

# 证书配置 默认 ssl 目录下，其它最好是完成的绝对路径
ssl_certificate: ./ssl/cert.pem
ssl_certificate_key: ./ssl/key.pem

# https 服务端口
ssl_bind_port: 4534
```

## Install Dependencies

```
npm i
```

## Run Dev

```
npm run dev
```

## Run Prod

线上环境依赖 `pm2` 来管理应用 (日志搜集、稳定运行-异常自动重启)

```
npm i -g pm2

npm start
```

## Run in docker

<https://hub.docker.com/repository/docker/hxtao1996/note-api>

```bash
docker push hxtao1996/note-api:0.0.1
```

## API Doc

- [setup](./doc/setup.md)  初始化
- [note](./doc/note.md)    文章
- [user](./doc/user.md)    用户
- [configuration](./doc/configuration.md)  配置
- [verification](./doc/verification.md)    验证

## Issues

有任何意见或建议都欢迎提 [issue](https://github.com/note-life/core/issues)

## done

- 暴露全局配置文件 config.yml
- 支持 https
- RESTFul API
- 资源上传功能 (图片压缩保存 webp & jpeg)
- 七牛云 oss 接入
- 定时任务: 数据库备份、JWT 的签名 token 自动变更
- 用户敏感信息加密保存 (哈希 sha256 + salt)
- 自定义配置（私密、冻结、已删除、是否启用）
- 限制请求 (防止恶意攻击)
- 邮件通知
- pv 统计
- 多用户
- 文章管理 (私密、草稿、已删除)

## TODO

- 增加 oss 支持，静态资源尽量不保存的本机
- Redis 接入，缓存数据持久化、减轻负载
- 数据库可选 mysql (现仅支持 mongodb)
- 插件化拓展
- 自动化测试单元
- 备份数据的可访问性 (目前仅仅做了自动备份的功能，需要登录主机手动处理备份数据)
- 支持 HTTP2 ?（考虑中是否应该在 node 层做掉）

## License

MIT