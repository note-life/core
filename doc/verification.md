## Verification
---

### 验证相关


#### API

```
GET: /verification/code
```

> query parameter:
> - email 发送验证码的目标邮箱


#### Example

##### Request:

```
GET: /verification/code?email=hxtao1996@gmail.com
```

##### Response:

```json
{
    "success": true
}
```