# 中国铁路 · 动态发展史

交互式时间轴可视化：从 1876 淞沪铁路到 2025 高铁突破 5 万公里，示意干线、高铁走廊与城轨城市的生长过程。

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

- 拖动底部时间轴，或点击 **播放**
- 空格键播放/暂停；左右方向键逐年微调
- 点击右侧里程碑列表可跳转到对应年份

## 说明

- 北京地铁线位：**OpenStreetMap**（`npm run osm:beijing` 更新 → `public/geo/beijing-osm-lines.json`）
- 底图：Esri 街道图（演示放大后可见街道）
- 高铁走廊仍为枢纽站序示意
- 里程等指标综合公开统计，部分年份为插值

数据版权：© OpenStreetMap contributors（ODbL）
