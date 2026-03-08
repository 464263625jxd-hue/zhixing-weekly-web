# 知行周刊文件组织规范化方案

**版本**: 1.0  
**制定日期**: 2026-03-09  
**生效期数**: 第 69 期起

---

## 📋 问题分析

### 第 67 期文件组织
```
知行周刊 - 第六十七期.docx  # 源文件（根目录）
data.json                   # 主数据文件
index.html                  # 网页版
```

### 第 68 期文件组织
```
知行周刊 - 第六十八期（2026.03.02-03.08）完整详细版.docx  # 源文件（根目录）
知行周刊 -68/                                            # 新建文件夹
  ├── issue-68-fixed.json
  └── issue-68.json
data.json                   # 主数据文件
```

### 问题
1. **源文件命名不统一**: 第 67 期简单命名 vs 第 68 期详细命名
2. **文件夹结构不一致**: 第 67 期无文件夹 vs 第 68 期有文件夹
3. **JSON 文件位置不统一**: 第 67 期直接在 data.json vs 第 68 期在子文件夹

---

## ✅ 规范化方案（第 69 期起执行）

### 目录结构
```
~/Desktop/zhixing-weekly/
├── README.md                    # 项目说明
├── data.json                    # 主数据文件（所有期数汇总）
├── index.html                   # 网页版（最新一期）
│
├── sources/                     # 源文件目录
│   ├── issue-67.docx            # 第 67 期源文件
│   ├── issue-68.docx            # 第 68 期源文件
│   └── issue-69.docx            # 第 69 期源文件
│
├── issues/                      # 各期独立数据目录
│   ├── issue-67/
│   │   ├── data.json            # 第 67 期独立数据
│   │   └── index.html           # 第 67 期网页版
│   ├── issue-68/
│   │   ├── data.json            # 第 68 期独立数据
│   │   └── index.html           # 第 68 期网页版
│   └── issue-69/
│       ├── data.json            # 第 69 期独立数据
│       └── index.html           # 第 69 期网页版
│
├── scripts/                     # 制作脚本目录
│   ├── make_issue.py            # 通用制作脚本
│   └── fix_issue.py             # 修复脚本
│
└── docs/                        # 文档目录
    ├── WORKFLOW_v2.md           # 制作工作流
    ├── TRI-MODEL-REVIEW.md      # 三模型审查
    └── STANDARDIZATION.md       # 本规范文件
```

---

## 📝 命名规范

### 源文件命名
```
sources/issue-{期数}.docx
```
**示例**:
- `sources/issue-67.docx`
- `sources/issue-68.docx`
- `sources/issue-69.docx`

### 期数文件夹命名
```
issues/issue-{期数}/
```
**示例**:
- `issues/issue-67/`
- `issues/issue-68/`
- `issues/issue-69/`

### JSON 文件命名
```
issues/issue-{期数}/data.json    # 该期独立数据
data.json                         # 所有期数汇总（根目录）
```

### HTML 文件命名
```
issues/issue-{期数}/index.html   # 该期网页版
index.html                        # 最新一期网页版（根目录）
```

---

## 🔧 迁移方案（第 67-68 期）

### 步骤 1: 创建标准化目录
```bash
cd ~/Desktop/zhixing-weekly
mkdir -p sources issues/issue-67 issues/issue-68 scripts docs
```

### 步骤 2: 迁移源文件
```bash
# 重命名并移动源文件
mv "知行周刊 - 第六十七期.docx" "sources/issue-67.docx"
mv "知行周刊 - 第六十八期（2026.03.02-03.08）完整详细版.docx" "sources/issue-68.docx"
```

### 步骤 3: 迁移期数数据
```bash
# 第 67 期
cp data.json issues/issue-67/data.json  # 需要提取单期数据
# 第 68 期
mv "知行周刊 -68/issue-68.json" "issues/issue-68/data.json"
rm -rf "知行周刊 -68/"
```

### 步骤 4: 移动脚本和文档
```bash
mv make_issue68_v2.py scripts/make_issue.py
mv fix_issue68.py scripts/fix_issue.py
mv WORKFLOW_v2.md docs/
mv TRI-MODEL-REVIEW.md docs/
mv STANDARDIZATION.md docs/
```

### 步骤 5: 更新 Git 提交
```bash
git add -A
git commit -m "refactor: 统一文件组织结构（第 67-68 期迁移）"
git push origin main
```

---

## 📋 第 69 期制作流程（标准化）

### 1. 准备工作
```bash
cd ~/Desktop/zhixing-weekly

# 创建第 69 期目录
mkdir -p issues/issue-69

# 复制源文件
cp /path/to/知行周刊 - 第六十九期.docx sources/issue-69.docx
```

### 2. 制作数据
```bash
# 使用通用制作脚本
python3 scripts/make_issue.py --issue 69 --source sources/issue-69.docx

# 输出到 issues/issue-69/data.json
```

### 3. 三模型审查
```bash
# 启动三模型审查
# （参考 docs/TRI-MODEL-REVIEW.md）
```

### 4. 修复并整合
```bash
# 修复问题
python3 scripts/fix_issue.py --issue 69

# 整合到主 data.json
python3 scripts/merge_to_main.py --issue 69
```

### 5. 提交并推送
```bash
git add -A
git commit -m "Issue 69: 第 69 期知行周刊（YYYY.MM.DD-MM.DD）"
git push origin main
```

---

## 🎯 标准化优势

| 优势 | 说明 |
|------|------|
| **统一命名** | 所有文件按 `issue-{期数}` 格式命名 |
| **清晰结构** | 源文件、期数数据、脚本、文档分类存放 |
| **易于维护** | 每期独立文件夹，互不干扰 |
| **便于回溯** | 可快速定位任意期数的源文件和数据 |
| **自动化友好** | 标准化路径便于脚本自动化处理 |

---

## ✅ 检查清单（每期制作）

- [ ] 源文件保存到 `sources/issue-{期数}.docx`
- [ ] 创建 `issues/issue-{期数}/` 文件夹
- [ ] 生成 `issues/issue-{期数}/data.json`
- [ ] 生成 `issues/issue-{期数}/index.html`
- [ ] 更新根目录 `data.json`（整合所有期数）
- [ ] 更新根目录 `index.html`（最新一期）
- [ ] 三模型审查完成
- [ ] Git 提交并推送

---

**制定者**: AI Assistant  
**生效日期**: 2026-03-09  
**适用范围**: 第 69 期起所有知行周刊制作
