## Note

- author        作者
- title         标题
- content       内容
- archive       归档
- tags          标签
- summary       摘要
- coverImg      封面图
- publishTime   发布实践
- updateTime    更新时间
- draft         是否为草稿
- deleted       是否被删除
- private       是否私密

---

### 新建笔记 📒


#### API

```
POST(application/json): /notes
```


#### Parameters

| Name | Type | Description |
| ------ | ------ | ------ |
| title | String | 标题 |
| coverImg | String | 封面图 |
| content | String | 主体内容 |
| summary | String | 简要 |
| archive | String | 归档 |
| tags | Array | 标签 |
| private | Boolean | 私密 |
| draft | Boolean | 草稿 |


#### Example

##### Request
```json
{
	"title": "hello world",
	"coverImg": "https://www.notelife.cc/cover-img.png",
	"content": "note content",
	"summary": "some fancy thing",
	"archive": "life note",
	"tags": ["test", "note"],
	"private": false,
	"draft": false
}
```

##### Response

```json
{
    "tags": [
        "test",
        "note"
    ],
    "draft": false,
    "deleted": false,
    "private": false,
    "_id": "5b8a346be83ffbda29c401bc",
    "title": "hello world",
    "coverImg": "https://www.notelife.cc/cover-img.png",
    "content": "note content",
    "summary": "some fancy thing",
    "archive": "life note",
    "publishTime": "2018-09-01T06:40:43.622Z",
    "updateTime": "2018-09-01T06:40:43.622Z",
    "author": "hxtao"
}
```

---

### 查询笔记（单篇）  📒

#### API

```
GET: /notes/:id
```

> 注：
> - 私密文章只对作者本人可见
> - 普通访客只能查看公开 note (即：draft=false && private=false && deleted=false)
> 

#### Example

##### Request:

```
GET: /notes/5b8a346be83ffbda29c401bc
```

##### Response:
```json
{
    "prev": {
        "_id": "5b8a33ade83ffbda29c401bb",
        "title": "some fancy thing"
    },
    "note": {
        "tags": [
            "test",
            "note"
        ],
        "draft": false,
        "deleted": false,
        "private": false,
        "_id": "5b8a346be83ffbda29c401bc",
        "title": "hello world",
        "coverImg": "https://www.notelife.cc/cover-img.png",
        "content": "note content",
        "summary": "some fancy thing",
        "archive": "life note",
        "publishTime": "2018-09-01T06:40:43.622Z",
        "updateTime": "2018-09-01T06:40:43.622Z",
        "author": {
	    "avator": "avator.png",
	    "_id": "5ba64e109541aa103edff6db",
	    "email": "hxtao1996@gmail.com"
	}
    },
    "next": null
}
```

---

### 查询笔记（批量）  📒

#### API

```
GET: /notes
```

> query parameter:
> - offset 默认 0
> - limit 默认 10
> - author
> - title 
> - keywords 
> - archive
> - tags  多个 tag 以逗号分隔
> - draft
> - deleted
> - private
> 
> 注：
> - 代码逻辑会强制普通访客 private=false, deleted=false, draft=false

#### Example

##### Request:

```
GET: /notes?author=子不语
```

##### Response:

```json
{
    "total": 0,
    "notes": []
}
```

---

### 编辑笔记 📒

#### API

```
PUT(application/json): /notes/:id
```

#### Parameters

| Name | Type | Description |
| ------ | ------ | ------ |
| title | String | 标题 |
| coverImg | String | 封面图 |
| content | String | 主体内容 |
| summary | String | 简要 |
| archive | String | 归档 |
| tags | Array | 标签 |
| private | Boolean | 私密 |
| draft | Boolean | 草稿 |
| deleted | Boolean | 逻辑删除 |


#### Example

```
PUT: /notes/5b8a446b5bef11e3087bf908
```

##### Request:

```json
{
    "title": "updated title"
}
```

##### Response:

```json
{
    "tags": [
        "test",
        "note"
    ],
    "draft": false,
    "deleted": true,
    "private": false,
    "_id": "5b8a446b5bef11e3087bf908",
    "title": "updated title",
    "coverImg": "https://www.notelife.cc/cover-img.png",
    "content": "note content",
    "summary": "some fancy thing",
    "archive": "life note",
    "publishTime": "2018-09-01T07:48:59.689Z",
    "updateTime": "2018-09-01T08:55:53.766Z",
    "author": {
	"avator": "avator.png",
	"_id": "5ba64e109541aa103edff6db",
	"email": "hxtao1996@gmail.com"
    }
}
```

---

### 删除笔记（单篇）📒

#### API

```
DELETE: /notes/:id
```

> 注：
> - 谨慎使用物理删除，从数据库中删除记录将不可恢复
> - 普通删除建议用逻辑删除，可恢复

#### Example

##### Request:

```
DELETE: /notes/5b8a446b5bef11e3087bf908
```

##### Response:

```json
{
    "success": true
}
```

---

### 删除笔记（批量）📒

#### API

```
DELETE(application/json) :/notes
```

> 注：
> - 谨慎使用物理删除，从数据库中删除记录将不可恢复
> - 普通删除建议用逻辑删除，可恢复

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

