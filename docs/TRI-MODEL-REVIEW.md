# 三模型并行审查技能

**版本**: 1.0.0  
**创建日期**: 2026-03-09  
**实战案例**: 第 68 期知行周刊

---

## 🎯 技能概述

使用三个模型（GLM-5、Kimi、MiniMax）并行审查知行周刊内容，确保质量与往期一致。

---

## 🤖 三模型分工

| 模型 | 擅长领域 | 审查重点 | 响应速度 |
|------|----------|----------|----------|
| **GLM-5** | 代码逻辑分析 | isAlert 打标逻辑、subCategory 分类、提取函数 bug | ⭐⭐⭐⭐ |
| **Kimi** | 内容质量审查 | Insight 生成、封面文字、格式一致性 | ⭐⭐⭐⭐ |
| **MiniMax** | 数据对比验证 | 图片 ID 对比、字段完整性、期数对比统计 | ⭐⭐⭐⭐⭐ |

---

## 📋 使用方式

### 方式 1：同时启动三个子代理

```python
sessions_spawn(
    task="# 知行周刊第 X 期全面审查 - MiniMax 模型\n\n## 任务目标\n对比第 X 期与往期的所有内容...",
    runtime="subagent",
    label="issueX-review-minimax",
    runTimeoutSeconds=180
)

sessions_spawn(
    task="# 知行周刊第 X 期代码审查 - GLM-5 模型\n\n## 任务目标\n从代码角度检查制作脚本...",
    runtime="subagent",
    label="issueX-review-glm5",
    runTimeoutSeconds=180
)

sessions_spawn(
    task="# 知行周刊第 X 期内容审查 - Kimi 模型\n\n## 任务目标\n全面对比第 X 期与往期内容质量...",
    runtime="subagent",
    label="issueX-review-kimi",
    runTimeoutSeconds=180
)
```

### 方式 2：根据问题类型选择模型

**代码 bug** → GLM-5:
```python
sessions_spawn(
    task="# 检查 isAlert 打标逻辑\n\n对比第 63-68 期的 isAlert 打标代码...",
    runtime="subagent",
    label="issue-alert-glm5"
)
```

**内容质量** → Kimi:
```python
sessions_spawn(
    task="# 检查 Insight 内容质量\n\n对比第 67 期和第 68 期的 Insight 内容...",
    runtime="subagent",
    label="issue-insight-kimi"
)
```

**数据验证** → MiniMax:
```python
sessions_spawn(
    task="# 检查封面图片是否重复\n\n对比第 67 期和第 68 期的 coverImage...",
    runtime="subagent",
    label="issue-cover-minimax"
)
```

---

## 📊 审查清单

### 封面文字检查
- [ ] title 是否为期数说明（应删除）
- [ ] summary 是否包含期数说明（应删除）
- [ ] coverImage 是否与往期重复
- [ ] tags 是否为具体话题（非泛标签）

### Insight 检查
- [ ] home insight 是否删除期数说明
- [ ] 所有 6 个板块 Insight 是否完整
- [ ] 每个板块是否包含 risk/opportunity/action
- [ ] 板块命名是否与往期一致（食品饮料）

### highlight/isAlert 检查
- [ ] highlight 是否覆盖所有板块（6-14 条）
- [ ] isAlert 是否覆盖所有板块（15-25 条）
- [ ] 对比往期分布是否合理

### 内容完整性检查
- [ ] 是否删除章节标题（"五、政策&新规"等）
- [ ] 是否合并过短资讯（<50 字符）
- [ ] subCategory 分类是否准确

---

## 🔧 修复流程

### 步骤 1：收集三份审查报告

```python
# 等待所有子代理完成
# 收集：
# - issueX-review-minimax 报告
# - issueX-review-glm5 报告
# - issueX-review-kimi 报告
```

### 步骤 2：汇总问题列表

```python
problems = []

# MiniMax 报告 → 数据对比问题
problems.append("封面图片重复")
problems.append("字段缺失")

# GLM-5 报告 → 代码逻辑问题
problems.append("isAlert 打标过于宽松")
problems.append("subCategory 分类 bug")

# Kimi 报告 → 内容质量问题
problems.append("Insight 缺失")
problems.append("封面文字格式错误")
```

### 步骤 3：生成修复代码

```python
# 根据问题列表生成修复脚本
fix_script = """
import json

# 修复 1: 更换封面图片
issue['coverImage'] = 'https://images.unsplash.com/photo-NEW_ID...'

# 修复 2: 删除期数说明
issue['insight']['home']['content'] = issue['insight']['home']['content'].replace('第 X 期...', '')

# 修复 3: 补充缺失 Insight
issue['insight']['食品饮料'] = {...}

# 修复 4: 优化 highlight/isAlert 打标
for item in issue['data']:
    if item['category'] == '美妆' and '涨价' in item['title']:
        item['isAlert'] = True
"""
```

### 步骤 4：执行修复并验证

```python
# 执行修复脚本
exec(fix_script)

# 验证修复结果
print(f"highlight: {sum(1 for n in issue['data'] if n.get('highlight', False))}条")
print(f"isAlert: {sum(1 for n in issue['data'] if n.get('isAlert', False))}条")
```

---

## 📈 质量评分标准

| 维度 | 权重 | 评分标准 | 目标 |
|------|------|----------|------|
| **封面文字** | 15% | title/summary/coverImage/tags 格式正确 | ✅ |
| **Insight 质量** | 25% | 基于当期内容，建议可操作 | ✅ |
| **highlight 分布** | 20% | 各板块都有，6-14 条 | ✅ |
| **isAlert 分布** | 20% | 各板块都有，15-25 条 | ✅ |
| **内容完整性** | 10% | 无章节标题残留，内容>50 字符 | ✅ |
| **分类准确性** | 10% | subCategory 分布合理 | ✅ |

**目标评分**: ≥85 分

---

## 📝 实战案例：第 68 期

### 问题发现

| 模型 | 发现问题 | 严重程度 |
|------|----------|----------|
| **GLM-5** | isAlert 打标过于宽松（18 条→5 条） | 🔴 高 |
| **GLM-5** | 食品饮料 subCategory 全是"新品" | 🟡 中 |
| **Kimi** | 封面文字包含期数说明 | 🔴 高 |
| **Kimi** | 食品饮料 Insight 缺失 | 🔴 高 |
| **Kimi** | 板块名称不统一（食品→食品饮料） | 🟡 中 |
| **MiniMax** | 封面图片与第 67 期重复 | 🔴 高 |
| **MiniMax** | highlight 遗漏 4 个板块 | 🔴 高 |
| **MiniMax** | isAlert 遗漏 3 个板块 | 🔴 高 |

### 修复结果

| 指标 | 修复前 | 修复后 | 改善 |
|------|--------|--------|------|
| **封面图片** | 与第 67 期重复 | 完全不同 | ✅ |
| **封面文字** | 包含期数说明 | 内容总结 | ✅ |
| **Insight** | 缺失 1 个板块 | 6 板块完整 | ✅ |
| **highlight** | 6 条（4 板块遗漏） | 14 条（6 板块完整） | +133% |
| **isAlert** | 5 条（3 板块遗漏） | 25 条（6 板块完整） | +400% |
| **subCategory** | 全是"新品" | 新品 5 条 + 财报 5 条 | ✅ |

---

## ❓ 常见问题

### Q1: 为什么需要三模型审查？

**A**: 单个模型容易遗漏特定类型问题：
- GLM-5 擅长代码但可能忽略内容质量
- Kimi 擅长内容但可能忽略数据细节
- MiniMax 擅长数据但可能忽略逻辑

三模型并行审查可以：
1. 覆盖不同维度的问题
2. 相互验证结论准确性
3. 提高修复效率

### Q2: 如何等待所有子代理完成？

**A**: 
```python
# 记录所有子代理 session_key
sessions = ['session1', 'session2', 'session3']

# 等待所有子代理完成
for session in sessions:
    while subagents.list(session)['status'] == 'running':
        time.sleep(10)
    
# 汇总报告
```

### Q3: 三模型结论冲突怎么办？

**A**: 
1. 优先相信对应领域模型（如代码问题信 GLM-5）
2. 人工验证冲突点
3. 取最保守的修复方案

---

**维护者**: AI Assistant  
**最后更新**: 2026-03-09
