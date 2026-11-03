# World Railway Maps

全球地铁 · 铁路 · 公交静态线路图（OpenStreetMap 线位）。按国家 / 城市浏览，切换地铁、铁路、公交图层。

在线版：[https://jinruimaomao.github.io/WorldRailwayMaps/](https://jinruimaomao.github.io/WorldRailwayMaps/)（GitHub Pages，push `main` 后自动构建）。

## 运行

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
npm run preview
```

## 操作

- 左侧选择国家 / 城市，或搜索线路
- 顶部切换 **地铁 / 铁路 / 公交**
- 地图拖拽缩放；铁路层按视口加载轨位

## 数据

- 城轨 / 铁路轨位：OpenStreetMap（及 OpenRailwayMap 基础设施层）
- 公交：OSM `route=bus` 等
- 中国铁路全网：`public/geo/china-rail-network.json`
- 世界各国 ORM 轨位：`public/geo/world/{cc}-orm-rails.json`

更新示例：

```bash
npm run osm:cities
npm run osm:china-network
npm run osm:orm-rails -- de fr jp
```

数据版权：© OpenStreetMap contributors（ODbL）
