# 知行周刊 Web - 数字化知识库

> 基于 Alpine.js + Tailwind CSS 的单页应用

**GitHub Pages**: https://464263625jxd-hue.github.io/zhixing-weekly-web/

**最新版本**: v1.1.0 (2026-03-06)

---

## 📋 项目说明

这是知行周刊的可视化网页，使用 **Alpine.js + Tailwind CSS** 构建的单页应用（SPA）。

### 核心特点
- ✅ **单文件架构** - index.html + data.json
- ✅ **零构建工具** - 直接在浏览器运行
- ✅ **响应式设计** - 完美适配移动端
- ✅ **实时搜索** - 全局资讯搜索
- ✅ **多视图切换** - 门户/阅读器/行业/企业
- ✅ **资讯分享** - 一键复制链接
- ✅ **数据标准化** - 完整字段 + 元数据

---

## 🚀 快速开始

### 1. 启用 GitHub Pages

**步骤**：
1. 访问：https://github.com/464263625jxd-hue/zhixing-weekly-web/settings/pages
2. **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main` + `/` (root)
   - 点击 **Save**
3. 等待 1-2 分钟

**访问地址**：
- 主页：https://464263625jxd-hue.github.io/zhixing-weekly-web/
- 调试：https://464263625jxd-hue.github.io/zhixing-weekly-web/?debug=true

### 2. 本地测试

```bash
cd ~/Desktop/zhixing-weekly-web
python3 -m http.server 9999
# 访问 http://localhost:9999
```

**注意**：必须使用 HTTP 服务器，不能直接打开 HTML 文件（CORS 限制）

---

## 📁 文件结构

```
zhixing-weekly-web/
├── index.html          # 主页面（62KB，包含所有 JS 逻辑）
├── data.json           # 周刊数据（786KB，标准化格式）
├── favicon.svg         # 网站图标
├── .gitignore          # Git 忽略文件
├── README.md           # 本文件
└── REBUILD_PLAN.md     # 重构计划
```

### index.html 结构

```
index.html (680 行)
├── <head>
│   ├── CDN 依赖 (Tailwind, Alpine.js, Chart.js)
│   ├── 自定义 CSS 样式
│   └── JavaScript 逻辑 (platformApp 函数)
└── <body>
    ├── 门户首页视图 (view === 'portal')
    ├── 阅读器视图 (view === 'reader')
    ├── 行业聚合页 (view === 'industry')
    └── 企业雷达页 (view === 'corporate')
```

---

## 🎯 核心功能

### 1. 门户首页
- 最新期刊展示（封面图 + 摘要）
- 行业导航（6 个行业入口）
- 企业雷达（按行业分类）
- 往期回顾（滚动列表）

### 2. 阅读器视图
- 本期概览（综述 + 数据亮点）
- 赛道情报（6 个行业卡片）
- 全部资讯（筛选 + 搜索）
- 详情弹窗（完整内容）

### 3. 行业聚合页
- 时间轴展示（所有期刊）
- 每期洞察（风险/机会/行动）
- 资讯聚合（按行业筛选）

### 4. 企业雷达页
- 行业切换（美妆/食品/母婴等）
- 公司卡片（Logo + 简介）
- 官网/财报链接

---

## 🔧 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Alpine.js** | 3.14.1 | 响应式数据绑定 |
| **Tailwind CSS** | CDN | 样式框架 |
| **Chart.js** | CDN | 数据可视化 |
| **Google Fonts** | - | 字体（Noto Sans SC） |

### 为什么不拆分 JS 文件？

经过多次尝试，发现**单文件架构**最适合这个项目：

1. ✅ **简单** - 无需构建工具
2. ✅ **快速** - 无额外 HTTP 请求
3. ✅ **稳定** - 无加载顺序问题
4. ✅ **易维护** - 所有逻辑在一处

---

## 📊 数据格式

### data.json 结构

```json
{
  "issues": [
    {
      "id": 67,
      "title": "知行周刊第六十七期",
      "date": "2026-03-01",
      "coverImage": "https://...",
      "summary": "...",
      "tags": ["AI", "大模型", "应用"],
      "data": [
        {
          "title": "新闻标题",
          "category": "美妆",
          "subCategory": "战略",
          "content": "详细内容...",
          "isAlert": false,
          "highlight": false
        }
      ],
      "insight": {
        "美妆": {
          "title": "美妆行业洞察",
          "risk": "风险...",
          "opportunity": "机会...",
          "action": "行动..."
        }
      }
    }
  ],
  "companies": {
    "美妆": [
      {
        "name": "欧莱雅",
        "code": "OR.PA",
        "site": "https://...",
        "ir": "https://...",
        "desc": "公司简介..."
      }
    ]
  }
}
```

---

## 🐛 常见问题

### Q1: 页面只显示背景色
**原因**：data.json 加载失败（CORS 问题）

**解决**：
```bash
# 必须使用 HTTP 服务器
python3 -m http.server 9999
# 访问 http://localhost:9999
```

### Q2: GitHub Pages 404
**原因**：Pages 未启用

**解决**：访问仓库 Settings → Pages → 启用

### Q3: 控制台报错 "Alpine is not defined"
**原因**：CDN 加载失败

**解决**：检查网络连接，刷新页面

---

## 📝 开发笔记

### Alpine.js 核心用法

```javascript
function platformApp() {
    return {
        // 状态
        isLoading: true,
        view: 'portal',
        
        // 初始化
        async init() {
            const data = await fetch('data.json').then(r => r.json());
            this.issueDB = data.issues;
            this.isLoading = false;
        },
        
        // 计算属性
        get latestIssue() { return this.issueDB[0]; },
        
        // 方法
        openIssue(id) {
            this.currentIssueId = id;
            this.view = 'reader';
        }
    }
}
```

### HTML 模板语法

```html
<div x-data="platformApp()" x-init="init()">
    <!-- 条件渲染 -->
    <div x-show="isLoading">加载中...</div>
    
    <!-- 列表渲染 -->
    <div x-for="issue in issueDB" x-text="issue.title"></div>
    
    <!-- 事件绑定 -->
    <button @click="openIssue(issue.id)">打开</button>
    
    <!-- 类绑定 -->
    <div :class="active ? 'bg-blue-500' : 'bg-gray-500'"></div>
</div>
```

---

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/464263625jxd-hue/zhixing-weekly-web
- **原始仓库**: https://github.com/464263625jxd-hue/weekly-backup
- **Gitee 镜像**: https://gitee.com/stonejin1998/zhixing-weekly-web

---

## 📝 更新日志

### v1.1.2 (2026-03-06 13:20) - 内容显示修复

**问题修复**:
- ✅ 分享内容优化（移除冗余摘要，只保留标题 + 内容）
- ✅ 资讯内容智能分段（支持 \n\n 和 \n 分隔）
- ✅ 长段落自动按句号分段（>500 字）
- ✅ 优化段落间距和排版

### v1.1.1 (2026-03-06 13:15) - 分享功能优化

**功能增强**:
- ✅ 分享完整资讯内容（不只是链接）
- ✅ 格式化分享卡片（标题/分类/期号/摘要/内容）
- ✅ 自动截断长内容（最多 3 段）
- ✅ 优化分享按钮 UI（图标 + 文字）

### v1.1.0 (2026-03-06 13:00) - P0+P1 优化

**P0 必要优化**:
- ✅ 添加 `.gitignore` 文件
- ✅ 添加 `favicon.svg` 图标
- ✅ 添加资讯分享功能（复制链接）

**数据优化**:
- ✅ 添加元数据（_meta 字段）
- ✅ 标准化所有资讯字段
- ✅ 字段完整率提升至 100%

**性能优化**:
- ✅ 添加资源预加载（preconnect）
- ✅ Chart.js 延迟初始化
- ✅ 优化动画过渡效果

**视觉优化**:
- ✅ 优化卡片悬浮效果
- ✅ 优化阴影和圆角
- ✅ 优化按钮交互反馈

**代码质量**:
- ✅ 添加详细中文注释
- ✅ 代码分段清晰
- ✅ 统一代码风格

### v1.0.0 (2026-03-06) - 初始版本

- ✅ 原始版本迁移
- ✅ GitHub Pages 部署

---

## 📄 许可证

内部使用，未经授权不得外传。

---

**最后更新**: 2026-03-06 13:20  
**当前版本**: v1.1.2  
**总提交数**: 12+ commits  
**优化阶段**: ✅ P0+P1 + 分享优化 + 内容修复完成
