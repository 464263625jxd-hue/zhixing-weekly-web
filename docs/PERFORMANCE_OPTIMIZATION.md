# 知行周刊网站性能优化方案

**创建日期**: 2026-03-16
**问题**: 网站加载缓慢，首次打开需要较长时间

---

## 📊 问题分析

### 当前状态
| 文件 | 大小 | 说明 |
|------|------|------|
| `data.json` | 1.1 MB | 包含所有9期数据 |
| `index.html` | 74 KB | 页面文件 |

### 加载流程（当前）
```
用户打开 → 加载 index.html → 加载 data.json (1.1MB) → 渲染页面
                    ↑
                  瓶颈！一次性加载所有数据
```

---

## ✅ 已实施优化

### 1. 数据分片（已完成）

| 文件 | 大小 | 用途 |
|------|------|------|
| `index.json` | 5 KB | 期数索引 |
| `data-lite.json` | 171 KB | 最新一期数据 |
| `issueXX.json` | 30-200 KB | 单期数据（按需加载） |

**首次加载减少**: 488KB → 176KB（减少 64%）

---

## 🚀 待实施优化

### 2. 懒加载策略（需要修改 index.html）

```javascript
// 当前（一次性加载所有）
const response = await fetch('data.json');

// 优化后（分步加载）
// Step 1: 加载索引（5KB）
const index = await fetch('index.json').then(r => r.json());

// Step 2: 加载最新一期（171KB）
const latest = await fetch('data-lite.json').then(r => r.json());

// Step 3: 切换期数时按需加载
async function loadIssue(id) {
    if (!cachedIssues[id]) {
        cachedIssues[id] = await fetch(`issues-data/issue${id}.json`).then(r => r.json());
    }
    return cachedIssues[id];
}
```

### 3. localStorage 缓存

```javascript
// 缓存已加载数据
function loadWithCache(url, maxAge = 3600000) { // 1小时
    const cached = localStorage.getItem(url);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
            return data;
        }
    }
    const data = await fetch(url).then(r => r.json());
    localStorage.setItem(url, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
}
```

### 4. 骨架屏

```html
<!-- 加载时显示骨架 -->
<div class="skeleton">
    <div class="skeleton-title"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text"></div>
</div>

<style>
.skeleton {
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
</style>
```

### 5. CDN 加速

将 `data.json` 等静态资源放到 CDN 或对象存储，由边缘节点回源或同步，可减轻源站压力并缩短访问延迟。

```javascript
// 示例：使用与页面同域或 CDN 上的绝对地址
const url = 'https://your-cdn.example.com/path/data.json';
```

**优势**：
- 全球 CDN 节点
- 自动缓存
- 更快的响应速度

---

## 📋 实施优先级

| 优先级 | 优化项 | 预期效果 | 工作量 |
|--------|--------|----------|--------|
| 🔴 P0 | 数据分片 | 减少64%首次加载 | ✅ 已完成 |
| 🔴 P0 | 懒加载 | 按需加载，秒开 | 🟡 待实施 |
| 🟡 P1 | localStorage缓存 | 二次访问秒开 | 🟡 待实施 |
| 🟡 P1 | CDN加速 | 加速全球访问 | 🟢 简单 |
| 🟢 P2 | 骨架屏 | 提升体验 | 🟢 简单 |

---

## 🔧 快速优化方案

### 方案A：CDN加速（最简单，立即可用）

只需修改 index.html 中的数据 URL：

```javascript
// 将
fetch('data.json')

// 改为
fetch('https://cdn.jsdelivr.net/gh/464263625jxd-hue/zhixing-weekly-web@main/data.json')
```

**效果**：jsDelivr CDN 加速，全球节点缓存

### 方案B：懒加载（中等难度，效果最好）

需要修改 index.html 的数据加载逻辑，实现：
1. 先加载 index.json 显示期数列表
2. 加载 data-lite.json 显示最新一期
3. 切换期数时按需加载

---

## 📊 预期效果

| 指标 | 当前 | 优化后 |
|------|------|--------|
| 首次加载 | 488 KB | 176 KB |
| 首屏时间 | 3-5秒 | 1-2秒 |
| 二次访问 | 3-5秒 | <1秒（缓存） |
| 切换期数 | 即时（已加载） | <1秒（懒加载） |

---

**最后更新**: 2026-03-16
