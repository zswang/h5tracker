h5tracker 移动端页面统计框架
-----

## Features

1. 断线重发机制
2. 文件小
3. 统计模块并行

## App 应用

### Methods

```js
/**
 * 初始化
 *
 * @param {Object} argv
 */
App.init(argv)

// 生命周期
App.start()
App.resume()
App.pause()
App.exit()

// 事件
/**
 * 绑定事件
 * 
 * @param {string} event
 * @param {Function} callback
 */
App.on()

/**
 * 绑定事件
 * 
 * @param {string} event
 * @param {Object...} data
 */
App.emit()
```

### Variants

```js
sessionId
sessionSeq
```

### Events

'createSession'
'destroySession'

## Tracker 追踪器

### Methods

Tracker.set()
Tracker.get()

Tracker.send()

## Storage 存储

Storage.init()

// 发送
Storage.post()
Storage.save()
Storage.scan()

userId

sessionStorage.h5t_sessionId
sessionStorage.h5t_sessionSeq

localStorage.h5t_userId
localStorage.h5t_dataList

[{
	createTime: 1455603047968, // 记录产生的时间
	post: 'http://log.ifreetalk.com/u.gif', // 统计模块
	data: 'ht=event&action=tap&page=home&xp=A(main)BC2A' // 数据
}]

localStorage.h5t_follow

{
	createTime: 1455603047968, // 创建时间
	updateTime: 1455603047968, // 最后更新时间
	sessionId: 'asdfasdf', // Session ID
	sessionSeq: 1, // 第几个生成
	path: [
		{
			time: 1455603047968,
			location: "/home/room/12312"
		}, {
			time: 1455603041128,
			location: "/?room=1123"
		}
	],
	status: "resume" // resume|pause
}
