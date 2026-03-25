# 知行周刊 Web - 数字化知识库

> 基于 Alpine.js + Tailwind CSS 的单页应用

| 环境 | 访问地址 |
|------|----------|
| 测试 | https://xue.test.leqeegroup.com/weeklyweb/ |
| 正式 | https://xue.leqeegroup.com/weeklyweb/ |

**最新版本**: v1.3.0 (2026-03-16)

---

## 📊 数据概览

| 指标 | 数值 |
|------|------|
| **最新期号** | 第 69 期 |
| **发布日期** | 2026.03.09 - 2026.03.15 |
| **本期资讯** | 163 条 |
| **总期数** | 9 期 |
| **总资讯** | 1161 条 |

### 第 69 期亮点
- 📰 **标题**: 十五五规划纲要发布，中东冲突升级，京东收入破万亿，美妆供应链涨价潮
- 📅 **周期**: 2026.03.09 - 2026.03.15
- 📊 **资讯数**: 163 条

---

## 📁 文件结构

前端部署后从根目录加载 `data.json`（含 `issueIds`、`_meta`），再按需请求 `issues/issue<N>.json` 各期正文。
仓库中提交的是 `data.source.json`；`data.json` 与 `version.json` 由部署前脚本生成，不再提交到 Git。

```
zhixing-weekly-web/
├── data.source.json       # 源数据：companies、静态元信息（提交到 Git）
├── data.json              # 部署产物：主索引（由脚本生成，Git 忽略）
├── index.html             # 单页应用入口
├── favicon.svg            # 网站图标
├── version.json           # 部署产物：版本信息（由脚本生成，Git 忽略）
├── README.md              # 本文件
│
├── issues/                # 各期完整数据（扁平 JSON）
│   ├── issue61.json
│   └── …                  # issue62.json … issue69.json
│
├── js/                    # 本地托管的前端脚本（UMD 等）
│   └── zechariah-tracking.umd.js
│
├── docs/                  # 文档与规范
│   ├── FILE_MANAGEMENT.md   # 文件管理规范 ⭐
│   ├── STANDARDIZATION.md
│   ├── WORKFLOW_v2.md
│   ├── TRACKING.md
│   └── …
│              
└── scripts/
        └── sync-data-from-issues-data.py  # 根据 data.source.json + issues/ 生成部署文件
```

**📖 [文件管理规范](docs/FILE_MANAGEMENT.md)** - 每次更新必读！

部署前在仓库根目录执行：

`python3 scripts/sync-data-from-issues-data.py`

典型部署流程：

```bash
git pull
python3 scripts/sync-data-from-issues-data.py
# 然后由运维同步/发布静态文件
```

首次切换到该结构时，如果部署机上旧的 `data.json`、`version.json` 仍是 Git 跟踪文件且已被本地改动，需要先清理工作区，再执行上述流程。

---

## 📋 资讯分类

| 分类 | 说明 |
|------|------|
| 🌍 宏观 | 政策、经济、国际动态 |
| 🏢 平台 | 电商平台、零售品牌（含跨境） |
| 💄 美妆 | 美妆护肤行业资讯 |
| 🍼 母婴 | 母婴、乳业、婴幼儿 |
| 🥤 食品饮料 | 食品、饮料、餐饮 |
| 🐾 宠物 | 宠物食品、医疗、用品 |

---

## 🚀 快速开始

### 本地测试

```bash
cd /path/to/zhixing-weekly-web
python3 -m http.server 9999
# 浏览器访问 http://localhost:9999
```

---

## 📝 更新日志

### v1.3.0 (2026-03-16) - 文件规范化 + 多标签分类

**文件管理优化**:
- ✅ 制定《文件管理规范》（docs/FILE_MANAGEMENT.md）
- ✅ 清理中间文件（issue*_news*.json）
- ✅ 归档过时脚本和文档
- ✅ 上传资讯源文件到 sources/
- ✅ 规范往期数据目录

**分类系统优化**:
- ✅ 取消独立的"跨境"分类，归入"平台"
- ✅ subCategory使用平台名称
- ✅ 新增 isCrossBorder 标记
- ✅ 多标签分类系统（tags字段）
- ✅ 三模型验证（Kimi + DeepSeek + GLM-5）

### v1.2.0 (2026-03-16) - 第69期发布

- ✅ 智能资讯清理模块
- ✅ 细化SubCategory分类规则
- ✅ 版本检测+自动刷新

---

## 📄 许可证

内部使用，未经授权不得外传。

---

**最后更新**: 2026-03-24  
**当前版本**: 2026-03-24 16:47  
**总期数**: 9 期  
