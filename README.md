h5tracker 移动端页面统计框架
-----

# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url]

## Features（功能点）

1. Offline Storage.（离线存储）
2. File size is small.（文件小）
3. Manage multiple statistical modules.（统计模块并行）
4. Session life cycle. （会话生命周期）

## Usage（使用方法）

### Entry Script（入口脚本）

```html
<script src="../lib/inline.min.js?__inline" h5t-config='{"cdn":"../h5tracker.js"}'></script>
```

### App Options（应用配置）

```js
h5t('config', {
  sessionExpires: 30, // session 过期时间，单位：秒
  storageExpires: 10 * 24 * 60 * 60, // 存储过期时间，单位：秒
});
```

### Create a Tracker（创建追踪器）

```js
h5t('main.create', {
  accept: 'http://log.server.com/c.gif', // 日志接收地址 // send 时必须带上
  acceptStyle: 'query', // 日志接收方式，"query": 查询参数，"path": 路径，默认为: "query"
  data: { // 常规数据
    dm: document.domain,
    lo: document.location.pathname
  },
  event: { // 事件
    send: function (data) { // 发送数据时触发
      data.token = this.token(data);
    },
    createSession: function () { // Session 创建
      this.send({
        ht: 'appview'
      });
    }
  }
});
```

### Send the data（发送数据）

```js
h5t('main.send', { // 发送数据
  path: 'xxx' //
});
```

## Data Struct（数据结构式）

### App 数据

字段 | 全称          | 含义     | 备注
-----|---------------|----------|----------
do   | domain        | 域名     | 来至 document
lo   | location      | 路径     | 来至 document
rid  | record id     | 记录 ID  | 临时生成   
uid  | user id       | 用户 ID  | 来至 localStorage
sid  | session id    | 会话 ID  | 来至 sessionStorage
seq  | session seq   | 会话序号 | 来至 sessionStorage
time | relative time | 相对时间 | 36 进制，参考 session 创建时间
trn  | tracker name  | 追踪器名 | 默认 null

### Session ID（会话标识）

+ sessionStorage['h5t@global/sessionId']

### Session Seq（会话序号）

+ sessionStorage['h5t@global/sessionSeq']

### User ID（用户标识）

+ localStorage['h5t@global/userId']

### Last scan the storage time（最后扫描的时间）

+ localStorage['h5t@global/scanTime']

## License

MIT © [zswang](http://weibo.com/zswang)

[npm-url]: https://npmjs.org/package/h5tracker
[npm-image]: https://badge.fury.io/js/h5tracker.svg
[travis-url]: https://travis-ci.org/zswang/h5tracker
[travis-image]: https://travis-ci.org/zswang/h5tracker.svg?branch=master
[coverage-url]: https://coveralls.io/github/zswang/h5tracker?branch=master
[coverage-image]: https://coveralls.io/repos/zswang/h5tracker/badge.svg?branch=master&service=github
