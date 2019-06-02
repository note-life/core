## User

- _id            id
- coverImg       封面
- nickname       昵称
- avator         头像
- email          邮箱
- password       密码
- salt           加密的随机 salt
- intro          概要介绍
- permissions    操作权限 
- status         状态
- sites          其它站点
- joinedDate     加入日期

---

### 新建（邀请）用户 🙋

#### API

```
POST(application/json): /users
```

#### Parameters

| Name | Type | Description |
| ------ | ------ | ------ |
| email | String | 邮箱 |

#### headers

```http
{
    "ut": "your user token"
}
```


#### Example

##### Request

```json
{
    "email": "hxtao1996@gmail.com"
}
```

##### Response

```json
{
    "success": true
}
```

---

### 查询用户（单个）

#### API

```
GET: /users/:id
```

#### Example

##### Request:

```
GET: /users/5b8a346be83ffbda29c401bc
```

##### Response:

```json
{
    "coverImg": "",
    "avator": "avator",
    "intro": "there is nothing!",
    "permissions": [],
    "status": "inactivated",
    "_id": "5cd6eed54efc8c7556c40a49",
    "email": "hxtao1996@gmail.com",
    "nickname": "hxt00",
    "joinedDate": "2019-05-11T15:48:37.194Z",
    "sites": []
}
```

### 查询所有

#### API

```
GET: /users
```

#### Example

##### Request:

```
GET: /users
```

##### Response:

```json
[
    {
        "coverImg": "",
        "avator": "avator",
        "intro": "there is nothing!",
        "permissions": [
            "admin",
            "invite",
            "remove"
        ],
        "status": "actived",
        "_id": "5cd6d91bcbf7ebb128da30cd",
        "email": "hxtao1996@gmail.cm",
        "joinedDate": "2019-05-11T14:15:55.713Z",
        "nickname": "hxtao",
        "sites": []
    },
    {
        "coverImg": "",
        "avator": "avator",
        "intro": "there is nothing!",
        "permissions": [],
        "status": "inactivated",
        "_id": "5cd6eed54efc8c7556c40a49",
        "email": "hxtao1996@gmail.com",
        "nickname": "hxt00",
        "joinedDate": "2019-05-11T15:48:37.194Z",
        "sites": []
    }
]
```

---

### 修改用户信息

#### API

```
PUT(application/json): /users/:id
```

#### Parameters

| Name | Type | Description |
| ------ | ------ | ------ |
| nickname | String | 昵称 |
| coverImg | String | 封面图 |
| avator | String | 头像 |
| email | String | 邮箱 |
| password | String | 密码 |
| intro | String | 标签 |
| sites | Array | 关联站点 |
| permissions | Array | 权限 |

> 注：
> 修改秘密时需要确认原先密码
>
> permissions 的值: invite 邀请权限, remove 移除用户权限, 只有 admin 管理员权限可对其他用户进行权限提升

#### Example

```
PUT: /users/5b8a446b5bef11e3087bf908
```

##### Request:

```json
{
	"email": "123@qq.com"
}
```

##### Response:

```json
{
    "coverImg": "",
    "avator": "avator",
    "intro": "there is nothing!",
    "permissions": [],
    "status": "inactivated",
    "_id": "5cd6eed54efc8c7556c40a49",
    "email": "123@qq.com",
    "nickname": "hxt00",
    "joinedDate": "2019-05-11T15:48:37.194Z",
    "sites": []
}
```

---

### 删除用户

#### API

```
DELETE: /users/:id
```

> 注：
> - 谨慎使用物理删除，从数据库中删除记录将不可恢复
> - 普通删除建议用逻辑删除，可恢复 （修改用户 status 为 removed）
> - 只有 admin 权限的才能操作物理删除

#### Example

##### Request:

```
DELETE: /users/5b8a446b5bef11e3087bf908
```

##### Response:

```json
{
    "success": true
}
```

---

### 删除用户（批量）📒

#### API

```
DELETE(application/json) :/notes
```

> 注：
> 同上

#### Example

##### Request:

```
{
	"ids": ["5b8a446b5bef11e3087bf908", "5b8a446b5bef11e3087bf907", "5b8a446b5bef11e3087bf906"]
}
```

##### Response:

```json
{
    "success": true
}
```

