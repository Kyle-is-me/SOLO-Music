# SoloMusic Server API 接口文档

> Base URL: `http://localhost:3000/api/v1`
>
> 所有接口统一返回 JSON 格式：`{ code: 0, data: {...}, message: "success" }`

---

## 认证说明

### 认证方式

使用 JWT Bearer Token 认证。需要认证的接口需在请求头中携带：

```
Authorization: Bearer <token>
```

### 认证流程

```
1. 注册账号 → POST /auth/register
2. 登录获取 token → POST /auth/login
3. 后续请求携带 Authorization 头
```

### 接口分类

| 分类 | 说明 |
|------|------|
| 🔓 公开 | 无需 token 即可访问 |
| 🔒 需认证 | 必须携带有效 token |

---

## 1. 认证模块 🔓/🔒

### 1.1 用户注册 🔓

`POST /auth/register`

**请求体**：

```json
{
  "username": "testuser",
  "password": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名，3-20字符 |
| password | string | ✅ | 密码，至少6位 |

**成功响应** `201`：

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "",
      "avatar": "",
      "role": "user"
    }
  },
  "message": "success"
}
```

**错误响应**：

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 400 | 400 | 用户名或密码为空 / 格式不正确 |
| 409 | 409 | 用户名已存在 |

---

### 1.2 用户登录 🔓

`POST /auth/login`

**请求体**：

```json
{
  "username": "testuser",
  "password": "123456"
}
```

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "",
      "avatar": "",
      "role": "user"
    }
  },
  "message": "success"
}
```

**错误响应**：

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 400 | 400 | 用户名或密码为空 |
| 401 | 401 | 用户名或密码错误 |

---

### 1.3 获取当前用户信息 🔒

`GET /auth/profile`

**请求头**：`Authorization: Bearer <token>`

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "音乐爱好者",
    "avatar": "/avatars/1.png",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "success"
}
```

---

### 1.4 更新个人信息 🔒

`PUT /auth/profile`

**请求头**：`Authorization: Bearer <token>`

**请求体**：

```json
{
  "nickname": "音乐爱好者",
  "avatar": "/avatars/1.png"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | ❌ | 昵称 |
| avatar | string | ❌ | 头像路径 |

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "音乐爱好者",
    "avatar": "/avatars/1.png",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "success"
}
```

---

## 2. 曲目模块

### 2.1 获取曲目列表 🔓

`GET /songs`

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | ❌ | 1 | 页码 |
| pageSize | number | ❌ | 20 | 每页数量 |
| albumId | number | ❌ | - | 按专辑筛选 |
| artistId | number | ❌ | - | 按艺术家筛选 |

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "Song Title",
        "filePath": "/music/song.mp3",
        "duration": 245.5,
        "bitrate": 320,
        "sampleRate": 44100,
        "format": "mp3",
        "fileSize": 9830400,
        "coverPath": "/covers/abc.jpg",
        "albumId": 1,
        "artistId": 1,
        "album": { "id": 1, "name": "Album Name" },
        "artist": { "id": 1, "name": "Artist Name" },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "message": "success"
}
```

---

### 2.2 获取曲目详情 🔓

`GET /songs/:id`

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "Song Title",
    "filePath": "/music/song.mp3",
    "duration": 245.5,
    "bitrate": 320,
    "sampleRate": 44100,
    "format": "mp3",
    "fileSize": 9830400,
    "coverPath": "/covers/abc.jpg",
    "albumId": 1,
    "artistId": 1,
    "album": { "id": 1, "name": "Album Name", "coverPath": "/covers/abc.jpg", "releaseYear": 2024, "artistId": 1 },
    "artist": { "id": 1, "name": "Artist Name", "avatar": "", "bio": "" },
    "lyrics": { "id": 1, "songId": 1, "content": "[00:00.00]歌词内容", "offset": 0 },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "success"
}
```

**错误响应**：

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 404 | 404 | 曲目不存在 |

---

### 2.3 删除曲目 🔒

`DELETE /songs/:id`

**请求头**：`Authorization: Bearer <token>`

**成功响应** `200`：

```json
{
  "code": 0,
  "data": null,
  "message": "success"
}
```

---

### 2.4 音频流播放 🔒

`GET /songs/:id/stream`

**请求头**：
- `Authorization: Bearer <token>`
- `Range: bytes=0-1023`（可选，用于断点续传）

**完整播放**（无 Range 头）：

响应 `200`，返回完整音频流。

**部分播放**（有 Range 头）：

响应 `206`，返回部分内容。

**响应头**：

| 头部 | 说明 |
|------|------|
| Content-Type | 音频 MIME 类型（audio/mpeg 等） |
| Content-Length | 内容长度（字节） |
| Content-Range | `bytes start-end/total`（206 响应） |
| Accept-Ranges | bytes |

**MIME 类型映射**：

| 格式 | Content-Type |
|------|-------------|
| .mp3 | audio/mpeg |
| .flac | audio/flac |
| .wav | audio/wav |
| .ogg | audio/ogg |
| .aac | audio/aac |
| .m4a | audio/mp4 |

---

## 3. 音乐库模块

### 3.1 扫描目录导入音乐 🔒

`POST /library/scan`

**请求头**：`Authorization: Bearer <token>`

**请求体**：

```json
{
  "path": "D:/Music"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| path | string | ✅ | 要扫描的目录绝对路径 |

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "total": 50,
    "added": 45,
    "skipped": 3,
    "errors": 2
  },
  "message": "success"
}
```

| 字段 | 说明 |
|------|------|
| total | 扫描到的音频文件总数 |
| added | 成功导入数量 |
| skipped | 跳过（已存在）数量 |
| errors | 解析失败数量 |

---

## 4. 专辑模块

### 4.1 获取专辑列表 🔓

`GET /albums`

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | ❌ | 1 | 页码 |
| pageSize | number | ❌ | 20 | 每页数量 |
| artistId | number | ❌ | - | 按艺术家筛选 |

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "Album Name",
        "coverPath": "/covers/abc.jpg",
        "releaseYear": 2024,
        "artistId": 1,
        "artist": { "id": 1, "name": "Artist Name" }
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 20
  },
  "message": "success"
}
```

---

### 4.2 获取专辑详情 🔓

`GET /albums/:id`

**成功响应** `200`：包含专辑信息 + 曲目列表

---

## 5. 艺术家模块

### 5.1 获取艺术家列表 🔓

`GET /artists`

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | ❌ | 1 | 页码 |
| pageSize | number | ❌ | 20 | 每页数量 |

---

### 5.2 获取艺术家详情 🔓

`GET /artists/:id`

**成功响应** `200`：包含艺术家信息 + 专辑列表 + 曲目列表

---

## 6. 播放列表模块 🔒

> 以下所有接口均需 `Authorization: Bearer <token>`
>
> 播放列表按用户隔离，用户只能操作自己的列表

### 6.1 获取播放列表

`GET /playlists`

**成功响应** `200`：

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "我的收藏",
      "description": "喜欢的歌曲",
      "coverPath": "",
      "userId": 1,
      "_count": { "songs": 10 },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "success"
}
```

---

### 6.2 获取播放列表详情

`GET /playlists/:id`

**成功响应** `200`：包含播放列表信息 + 曲目列表（含歌曲详情）

---

### 6.3 创建播放列表

`POST /playlists`

**请求体**：

```json
{
  "name": "我的收藏",
  "description": "喜欢的歌曲",
  "coverPath": ""
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 列表名称 |
| description | string | ❌ | 描述 |
| coverPath | string | ❌ | 封面路径 |

**成功响应** `201`

---

### 6.4 更新播放列表

`PUT /playlists/:id`

**请求体**：

```json
{
  "name": "新名称",
  "description": "新描述"
}
```

---

### 6.5 删除播放列表

`DELETE /playlists/:id`

---

### 6.6 向播放列表添加曲目

`POST /playlists/:id/songs`

**请求体**：

```json
{
  "songId": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songId | number | ✅ | 曲目ID |

**错误响应**：

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 404 | 404 | 播放列表不存在 |
| 409 | 409 | 曲目已在播放列表中 |

---

### 6.7 从播放列表移除曲目

`DELETE /playlists/:id/songs/:songId`

---

### 6.8 调整播放列表曲目顺序

`PUT /playlists/:id/songs/reorder`

**请求体**：

```json
{
  "songs": [
    { "songId": 3, "order": 0 },
    { "songId": 1, "order": 1 },
    { "songId": 5, "order": 2 }
  ]
}
```

---

## 7. 搜索模块 🔓

### 7.1 搜索

`GET /search?q=keyword&type=song`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | ✅ | 搜索关键词 |
| type | string | ❌ | 搜索类型：`song` / `album` / `artist`，不传则搜索全部 |

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "songs": [
      { "id": 1, "title": "Song", "album": {...}, "artist": {...} }
    ],
    "albums": [
      { "id": 1, "name": "Album", "artist": {...}, "_count": { "songs": 10 } }
    ],
    "artists": [
      { "id": 1, "name": "Artist", "_count": { "albums": 3, "songs": 15 } }
    ]
  },
  "message": "success"
}
```

**错误响应**：

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 400 | 400 | 搜索关键词为空 |

---

## 8. 收藏模块 🔒

> 以下所有接口均需 `Authorization: Bearer <token>`
>
> 收藏按用户隔离

### 8.1 获取收藏列表

`GET /favorites`

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | ❌ | 1 | 页码 |
| pageSize | number | ❌ | 20 | 每页数量 |

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 1,
        "songId": 1,
        "song": {
          "id": 1,
          "title": "Song Title",
          "album": { "id": 1, "name": "Album" },
          "artist": { "id": 1, "name": "Artist" }
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  },
  "message": "success"
}
```

---

### 8.2 收藏曲目

`POST /favorites/:songId`

幂等操作，重复收藏不报错。

**成功响应** `201`

---

### 8.3 取消收藏

`DELETE /favorites/:songId`

**错误响应**：

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 404 | 404 | 收藏记录不存在 |

---

## 9. 播放历史模块 🔒

> 以下所有接口均需 `Authorization: Bearer <token>`
>
> 播放历史按用户隔离

### 9.1 获取播放历史

`GET /history`

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | ❌ | 1 | 页码 |
| pageSize | number | ❌ | 20 | 每页数量 |

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 1,
        "songId": 1,
        "song": {
          "id": 1,
          "title": "Song Title",
          "album": { "id": 1, "name": "Album" },
          "artist": { "id": 1, "name": "Artist" }
        },
        "playedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "success"
}
```

---

### 9.2 记录播放

`POST /history/:songId`

**成功响应** `200`

---

## 10. 歌词模块

### 10.1 获取歌词 🔓

`GET /songs/:id/lyrics`

**成功响应** `200`：

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "songId": 1,
    "content": "[00:00.00]第一行歌词\n[00:05.50]第二行歌词",
    "offset": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "success"
}
```

**错误响应**：

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 404 | 404 | 歌曲或歌词不存在 |

---

### 10.2 更新/创建歌词 🔒

`PUT /songs/:id/lyrics`

**请求头**：`Authorization: Bearer <token>`

**请求体**：

```json
{
  "content": "[00:00.00]第一行歌词\n[00:05.50]第二行歌词",
  "offset": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | ✅ | 歌词内容（LRC格式） |
| offset | number | ❌ | 时间偏移量（毫秒），默认0 |

如果歌词已存在则更新，不存在则创建。

---

## 错误码汇总

### 通用错误码

| HTTP状态码 | code | 说明 |
|-----------|------|------|
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证 / 认证失败 |
| 401 | 4010 | Token 无效或已过期 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突 |
| 500 | 500 | 服务器内部错误 |
| 500 | 5001 | 播放历史记录失败 |

### 认证相关错误

| 场景 | HTTP状态码 | code | message |
|------|-----------|------|---------|
| 未携带 token | 401 | 401 | Authentication required |
| token 无效/过期 | 401 | 4010 | Invalid or expired token |
| 用户名或密码错误 | 401 | 401 | Invalid username or password |
| 用户名已存在 | 409 | 409 | Username already exists |
