# 简办本地素材与多城章节

源目录：`E:\All全国地铁配线图&简办线路图`

B 站主页（简办动态演示）：https://space.bilibili.com/448378306/

## 3.0 风格城市视频（对照用）

| 城市 | 典型标题 |
|------|----------|
| 北京 | 北京地铁发展史3.0焕新版 BV13DZoBZErc |
| 香港 | 【港铁MTR】香港铁路百年动态发展史（1910-2035+）[BV1zc411q7X7](https://www.bilibili.com/video/BV1zc411q7X7) · 本地 `refs/jianban/videos/BV1zc411q7X7-hongkong-mtr.mp4` |
| 上海 / 广州 / 深圳 / 成都 / 杭州 / 重庆 / 南京 / 武汉 / 西安 / 苏州 / 天津 … | 【3.0风格】××地铁发展史 |

## 本地文件

| 路径 | 用途 |
|------|------|
| `【简办】…公开免费版\0x.××地铁3.0` | 运营/规划示意图 |
| `…学习版\90.中国地铁发展史 数据及素材` | 第1–4期 Excel（1971–2012） |
| `配线图\北京地铁配线图…pdf` | 配线对照 |

## 项目内生成物

- `src/data/jianbanNationalEvents.json` — 多城开通事件（Excel）
- `src/data/*StationsAmap.json` — 高德站位
- `src/data/{shanghai,guangzhou,…}Metro.js` — 章节场景（`npm run gen:cities`）

说明：Excel 目前只到 **2012**；2013 后节点在 `scripts/city-metro-extras.js` 按 3.0 视频主线补全。  
视频本地：`refs/jianban/videos/*-metro.mp4`。已逐段接入（含视频批）：西安/苏州/青岛/郑州/长沙/合肥/南昌/南宁/济南/石家庄/昆明/福州/宁波/无锡/东莞 等。  
台北/高雄等暂仍城标（无高德地铁图）。

## 一张地图（默认）

- `CHAPTERS.china` / `UNIFIED_SCENES` — 各城地铁**逐段 grow** + 全量城标点亮（含港澳台）+ 高铁/规划，按年混排
- `metroCityOpenings.js` — 简办对照的城轨首通年表（香港 1979、台北 1996、澳门 2019 等）
- `hsrHistory.js` — 高铁时间线；`network.js` — 走廊站序
