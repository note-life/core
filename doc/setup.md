## Setup
---

### 初始化管理员账户


#### API

```
POST(application/json): /setup/admin
```


#### Parameters

| Name | Type | Description |
| ------ | ------ | ------ |
| email | String | 邮箱 |
| nickname | String | 昵称 |
| password | String | 密码 |


#### Example

##### Request
```json
{
    "email": "hxtao1996@gmail.cm",
    "nickname": "hxtao",
    "password": "1234567"
}
```

##### Response

```json
{
    "success": true
}
```