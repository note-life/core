## Configuration

- name        配置项名称
- key         配置项标识 key
- options     配置项具体内容
- createTime  配置项创建的时间
- updateTime  配置项更新的时间
- creator     谁创建的
- editor      编辑人
- private     是否私有
- freeze      是否冻结 （冻结的配置项无法删除）
- deleted     是否删除

---

### 新建配置项

#### API

```
POST(application/json): /configurations
```

#### Parameters

| Name | Type | Description |
| ------ | ------ | ------ |
| name | String | 配置项名称 |
| key | String | 配置项标识 |
| options | Object | 配置项具体内容 |
| private | String | 是否私有 |
| freeze | Boolean | 是否冻结 |
| deleted | Boolean | 是否删除 |

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
	"name": "test",
	"key": "script",
	"options": {}
}
```

##### Response

```json
{
    "options": {},
    "private": true,
    "freeze": false,
    "deleted": false,
    "_id": "5cd7bc3c6c6920772ba4f49e",
    "name": "test",
    "key": "script",
    "editor": "5cd6d91bcbf7ebb128da30cd",
    "creator": "5cd6d91bcbf7ebb128da30cd",
    "createTime": "2019-05-12T06:25:00.717Z",
    "updateTime": "2019-05-12T06:25:00.717Z",
    "__v": 0
}
```

---

### 查询配置项（单个）

#### API

```
GET: /configurations/:id
```

#### Example

##### Request:

```
GET: /configurations/5cd7be4ae859369917490a98
```

##### Response:

```json
{
    "options": {},
    "_id": "5cd7be4ae859369917490a98",
    "name": "teassdsat",
    "key": "scrisasptss"
}
```

> 注：
> 有无 token 查到的数据不一样， 携带 user token 查询到的数据会更详细

### 查询所有

#### API

```
GET: /configurations
```

#### Example

##### Request:

```
GET: /configurations
```

##### Response:

```json
[
    {
        "options": {},
        "_id": "5cd7be4ae859369917490a98",
        "name": "teassdsat",
        "key": "scrisasptss"
    }
]
```

> 注：
> 同上

---

### 修改配置信息

#### API

```
PUT(application/json): /configurations/:id
```

#### Parameters

| Name | Type | Description |
| ------ | ------ | ------ |
| name | String | 配置项名称 |
| key | String | 配置项标识 |
| options | Object | 配置项具体内容 |
| private | String | 是否私有 |
| freeze | Boolean | 是否冻结 |
| deleted | Boolean | 是否删除 |


#### Example

```
PUT: /configurations/5cd7bc3c6c6920772ba4f49e
```

##### Request:

```json
{
	"deleted": true
}
```

##### Response:

```json
{
    "options": {},
    "private": true,
    "freeze": false,
    "deleted": true,
    "_id": "5cd7bc3c6c6920772ba4f49e",
    "name": "test",
    "key": "script",
    "creator": {
        "avator": "avator",
        "_id": "5cd6d91bcbf7ebb128da30cd",
        "nickname": "hxtao"
    },
    "createTime": "2019-05-12T06:25:00.717Z",
    "updateTime": "2019-05-12T06:25:00.717Z"
}
```

---

### 删除配置（不支持批量）

#### API

```
DELETE: /configurations/:id
```

> 注：
> - 谨慎使用物理删除，从数据库中删除记录将不可恢复
> - 普通删除建议用逻辑删除，可恢复 （修改 deleted 为 true
> - 只有 admin 权限的才能操作物理删除

#### Example

##### Request:

```
DELETE: /configurations/5b8a446b5bef11e3087bf908
```

##### Response:

```json
{
    "success": true
}
```

