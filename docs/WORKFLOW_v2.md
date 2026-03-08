# 知行周刊制作工作流 v2.0 - 三模型优化版

**版本**: 2.0  
**最后更新**: 2026-03-09  
**实战案例**: 第 68 期知行周刊（2026.03.02-03.08）

---

## 📋 目录

1. [工作流概述](#工作流概述)
2. [第一阶段：资讯提取](#第一阶段资讯提取)
3. [第二阶段：GLM-5 代码审查](#第二阶段 glm-5 代码审查)
4. [第三阶段：Kimi 深度审查](#第三阶段 kimi 深度审查)
5. [第四阶段：三模型封面检查](#第四阶段三模型封面检查)
6. [第五阶段：highlight/isAlert 修复](#第五阶段 highlightisalert 修复)
7. [三模型分工策略](#三模型分工策略)
8. [常见问题 FAQ](#常见问题-faq)

---

## 🎯 工作流概述

### 核心流程

```
资讯源 DOCX
    ↓
[阶段 1] 资讯提取脚本制作
    ↓
[阶段 2] GLM-5 代码审查 → 修复 isAlert 打标
    ↓
[阶段 3] Kimi 深度审查 → 修复 Insight/封面文字
    ↓
[阶段 4] 三模型封面检查 → 确保图片不重复
    ↓
[阶段 5] 三模型 highlight/isAlert 对比 → 修复遗漏
    ↓
最终推送备用仓库 → 用户确认 → 推送正式仓库
```

### 三模型分工

| 模型 | 擅长领域 | 审查重点 |
|------|----------|----------|
| **GLM-5** | 代码逻辑分析 | isAlert 打标逻辑、subCategory 分类 |
| **Kimi** | 内容质量审查 | Insight 生成、封面文字、格式一致性 |
| **MiniMax** | 数据对比验证 | 图片 ID 对比、字段完整性验证 |

---

## 📝 第一阶段：资讯提取

### 1.1 读取 DOCX 源文件

```python
from docx import Document

docx_path = '知行周刊 - 第六十八期（2026.03.02-03.08）完整详细版.docx'
doc = Document(docx_path)
paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
print(f"总段落数：{len(paragraphs)}")
```

### 1.2 识别分类结构

```python
# 查找分类标记位置
markers = []
for i, p in enumerate(paragraphs):
    if p in ['宏观·电商', '美妆·个护', '母婴·亲子', '食品·饮料', '宠物·经济']:
        markers.append((i, p))
        print(f"[{i:3}] {p}")
```

### 1.3 提取各分类资讯

**宏观类**（◎开头）:
```python
def extract_hongguan(paragraphs, start, end):
    items = []
    i = start
    current_title = None
    current_content = []
    
    while i <= end:
        p = paragraphs[i]
        if p.startswith('◎'):
            if current_title:
                items.append({
                    'title': current_title.replace('◎', '').strip(),
                    'content': '\n\n'.join(current_content)
                })
            current_title = p
            current_content = []
        elif len(p) > 30:
            current_content.append(p)
        i += 1
    
    return items
```

**母婴类**（短标题 + 长内容）:
```python
def extract_muying(paragraphs, start, end):
    items = []
    i = start
    current_title = None
    current_content = []
    
    while i <= end:
        p = paragraphs[i]
        # 短行（<60 字符）是标题
        if len(p) < 60 and not p.endswith(('。', '！', '？')):
            if current_title:
                items.append({
                    'title': current_title,
                    'content': '\n\n'.join(current_content)
                })
            current_title = p
            current_content = []
        else:
            if len(p) > 15:
                current_content.append(p)
        i += 1
    
    return items
```

### 1.4 构建 JSON 结构

```python
issue_68 = {
    'id': 68,
    'date': '2026.03.02 - 2026.03.08',
    'title': '政府工作报告发布，中东冲突升级，京东收入破万亿...',
    'summary': '政府工作报告提出 2026 年 GDP 增长目标 4.5%-5%；中东冲突...；京东 2025 年收入超 1.3 万亿...',
    'coverImage': 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3...',
    'tags': ['两会政策', '中东冲突', '京东财报', 'AI 大模型', '美妆涨价', '国货出海'],
    'insight': {
        'home': {'title': '本周综述 Executive Summary', 'content': '...', 'type': 'summary'},
        '宏观': {'title': '宏观·洞察', 'risk': '...', 'opportunity': '...', 'action': '...'},
        '平台': {...},
        '美妆': {...},
        '母婴': {...},
        '食品饮料': {...},
        '宠物': {...}
    },
    'data': [...]  # 资讯列表
}
```

---

## 🔍 第二阶段：GLM-5 代码审查

### 2.1 审查重点

- ✅ isAlert 打标逻辑是否合理
- ✅ subCategory 分类是否准确
- ✅ highlight 打标是否覆盖各板块

### 2.2 发现的问题

**问题 1**: isAlert 打标过于宽松
```
修复前：18 条（包含宠物收购、母婴门店升级等）
修复后：5 条（中东冲突、美国关税、KATE 关店等）
```

**问题 2**: 食品饮料 subCategory 全是"新品"
```
修复前：新品 10 条
修复后：新品 5 条 + 财报 5 条
```

### 2.3 修复代码

```python
# isAlert 收紧关键词
alert_keywords_strict = [
    '关闭', '关停', '退出', '裁员', '破产', '暴跌',
    '收购', '融资', '禁令', '处罚', '调查', '制裁',
    '首次全年盈利', '突破', '历史新高'
]

# subCategory 分类优化
def get_shipin_subcategory(title, content):
    full_text = title + ' ' + content
    if any(kw in full_text for kw in ['财报', '营收', '业绩']):
        return '财报'
    elif any(kw in full_text for kw in ['新品', '推出']):
        return '新品'
    elif any(kw in full_text for kw in ['价格', '涨价']):
        return '价格策略'
    else:
        return '其他'
```

---

## 📊 第三阶段：Kimi 深度审查

### 3.1 审查重点

- ✅ 封面文字格式（title/summary/coverImage/tags）
- ✅ Insight 内容质量（基于当期实际内容）
- ✅ 板块命名统一性（食品→食品饮料）

### 3.2 发现的问题

**问题 1**: 封面文字包含期数说明
```
修复前：'第 68 期知行周刊（2026.03.02-03.08）共收录 162 条重要资讯。宏观方面...'
修复后：'宏观方面，两会召开，政府工作报告提出 2026 年经济增长目标 4.5%-5%...'
```

**问题 2**: 食品饮料 Insight 缺失
```
修复前：缺失
修复后：{'title': '食饮·洞察', 'risk': '...', 'opportunity': '...', 'action': '...'}
```

**问题 3**: 板块名称不统一
```
修复前：'食品'
修复后：'食品饮料'（与第 67 期一致）
```

### 3.3 封面文字优化

**第 67 期格式参考**:
```python
title: '美以空袭伊朗，默茨访华，淘宝评分新规'  # 6 个关键词
summary: '美以联合空袭伊朗；德国总理默茨访华；央行下调外汇风险准备金率；...'  # 6-8 条资讯
coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71...'  # Unsplash 真实图片
tags: ['美以空袭', '德国访华', '淘宝新规', ...]  # 具体话题
```

**第 68 期修复后**:
```python
title: '政府工作报告发布，中东冲突升级，京东收入破万亿，千问负责人离职，美妆品牌涨价，花知晓入驻韩国'
summary: '政府工作报告提出 2026 年 GDP 增长目标 4.5%-5%；中东冲突进入第八天局势持续升级；京东 2025 年收入超 1.3 万亿...'
coverImage: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3...'
tags: ['两会政策', '中东冲突', '京东财报', 'AI 大模型', '美妆涨价', '国货出海']
```

---

## 🖼️ 第四阶段：三模型封面检查

### 4.1 任务分配

| 模型 | 检查项目 | 输出 |
|------|----------|------|
| **MiniMax** | 图片 ID 对比 | 两期图片 ID 对比表 |
| **GLM-5** | Git 提交验证 | 远程仓库状态检查 |
| **Kimi** | 全面内容对比 | 所有文本字段对比表 |

### 4.2 MiniMax 检查结果

```python
# 图片 ID 提取
id_67 = issue_67['coverImage'].split('photo-')[1].split('&')[0]
id_68 = issue_68['coverImage'].split('photo-')[1].split('&')[0]

print(f"第 67 期图片 ID: {id_67}")  # 1551288049-bebda4e38f71
print(f"第 68 期图片 ID: {id_68}")  # 1586339949916-3e9457bef6d3
print(f"是否相同：{id_67 == id_68}")  # False ✅
```

### 4.3 GLM-5 检查结果

```bash
# Git 提交验证
$ git show HEAD:data.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['issues'][0]['coverImage'])"
https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?q=80&w=2070&auto=format&fit=crop
✅ 远程仓库已正确更新
```

### 4.4 Kimi 检查结果

| 检查项目 | 第 67 期 | 第 68 期 | 状态 |
|----------|----------|----------|------|
| 封面图片 | photo-1551288049 | photo-1586339949916 | ✅ 不同 |
| 标题 | 美以空袭伊朗... | 政府工作报告发布... | ✅ 不同 |
| 摘要 | 美以联合空袭... | 第 68 期知行周刊... | ✅ 不同 |
| 标签 | 美以空袭... | 两会政策... | ✅ 无重复 |
| Home Insight | 本周宏观层面... | 宏观方面... | ✅ 不同 |

---

## 🎯 第五阶段：highlight/isAlert 修复

### 5.1 问题发现

**对比第 63-68 期打标分布**:

| 期数 | highlight 分布 | isAlert 分布 | 问题 |
|------|--------------|-------------|------|
| 第 66 期 | 9 条（各板块都有） | 18 条（各板块都有） | ✅ 标杆 |
| 第 67 期 | 6 条（宏观 3+ 平台 3） | 7 条（只有宏观） | ❌ 遗漏 5 板块 |
| 第 68 期 | 6 条（宏观 3+ 平台 3） | 5 条（宏观 4+ 美妆 1） | ❌ 遗漏 3 板块 |

**根本原因**: 打标逻辑从"每个板块选重要资讯"偏移到"只标宏观 + 平台大事"

### 5.2 三模型对比审查

启动三个子代理同时审查：

```bash
# MiniMax - 数据对比
sessions_spawn --label issue68-highlight-minimax --task "对比第 63-68 期 highlight/isAlert 分布"

# GLM-5 - 代码分析
sessions_spawn --label issue68-highlight-glm5 --task "检查打标代码逻辑演变"

# Kimi - 内容审查
sessions_spawn --label issue68-highlight-kimi --task "全面对比各期内容质量"
```

### 5.3 修复方案

**highlight 打标（14 条）**:
```python
highlight_titles = {
    '宏观': ['政府工作报告', '经济社会发展政策', '经济主题记者会'],
    '平台': ['千问模型负责人', '京东 2025 年收入', '京东物流'],
    '美妆': ['国际美妆品牌集体涨价', '拜尔斯道夫营收'],
    '母婴': ['全面实施育儿补贴制度', '"十五五"规划纲要草案'],
    '食品饮料': ['瑞幸咖啡 2025 全年净收入', '雀巢 2025 全年业绩'],
    '宠物': ['麦富迪品牌升级', '太平洋产险推出"太宠你"宠物医疗险']
}
```

**isAlert 打标（25 条）**:
```python
alert_keywords = ['冲突', '升级', '禁止', '关税', '起诉', '关闭', '关停', 
                  '裁员', '破产', '暴跌', '召回', '处罚', '调查', '制裁']
```

### 5.4 修复后对比

| 指标 | 修复前 | 修复后 | 改善 |
|------|--------|--------|------|
| **highlight** | 6 条（4 板块遗漏） | 14 条（6 板块完整） | +133% ✅ |
| **isAlert** | 5 条（3 板块遗漏） | 25 条（6 板块完整） | +400% ✅ |

**修复后分布**:
- highlight: 宏观 3、平台 3、美妆 2、母婴 2、食品 2、宠物 2
- isAlert: 宏观 4、平台 1、美妆 4、母婴 10、食品 1、宠物 5

---

## 🤖 三模型分工策略

### 模型特性对比

| 模型 | 擅长领域 | 适用场景 | 响应速度 |
|------|----------|----------|----------|
| **GLM-5** | 代码逻辑分析 | 审查打标逻辑、分类规则 | ⭐⭐⭐⭐ |
| **Kimi** | 内容质量审查 | Insight 生成、格式一致性 | ⭐⭐⭐⭐ |
| **MiniMax** | 数据对比验证 | 图片 ID 对比、字段完整性 | ⭐⭐⭐⭐⭐ |

### 最佳实践

**1. 代码审查 → GLM-5**
```python
# 适合检查：
- isAlert/highlight 打标逻辑
- subCategory 分类规则
- 提取函数 bug
```

**2. 内容审查 → Kimi**
```python
# 适合检查：
- Insight 内容质量
- 封面文字格式
- 板块命名统一性
```

**3. 数据验证 → MiniMax**
```python
# 适合检查：
- 图片 ID 对比
- 字段完整性
- 期数对比统计
```

### 并行审查策略

```python
# 同时启动三个子代理
sessions = []
for model, task in [
    ('minimax', '数据对比'),
    ('glm-5', '代码分析'),
    ('kimi', '内容审查')
]:
    sessions.append(sessions_spawn(
        label=f'issue68-{model}',
        task=task,
        runtime='subagent'
    ))

# 等待所有子代理完成
# 汇总三份报告 → 生成最终修复方案
```

---

## ❓ 常见问题 FAQ

### Q1: 为什么需要三模型审查？

**A**: 单个模型容易遗漏特定类型问题：
- GLM-5 擅长代码但可能忽略内容质量
- Kimi 擅长内容但可能忽略数据细节
- MiniMax 擅长数据但可能忽略逻辑

三模型并行审查可以：
1. 覆盖不同维度的问题
2. 相互验证结论准确性
3. 提高修复效率

### Q2: 如何选择审查模型？

**A**: 根据问题类型选择：
- **代码 bug** → GLM-5
- **内容质量** → Kimi
- **数据对比** → MiniMax
- **综合审查** → 三模型并行

### Q3: 封面图片重复怎么办？

**A**: 
1. 使用不同 Unsplash 图片 ID
2. 三模型验证图片 ID 是否不同
3. 清除浏览器缓存后查看

### Q4: highlight/isAlert 遗漏如何发现？

**A**: 
1. 对比往期（第 63-66 期）打标分布
2. 检查各板块是否都有打标
3. 三模型并行审查确认

### Q5: 如何确保 Insight 质量？

**A**: 
1. 基于当期实际资讯内容生成
2. 对比往期格式（risk/opportunity/action）
3. Kimi 模型审查内容相关性

---

## 📈 质量评分标准

| 维度 | 权重 | 评分标准 |
|------|------|----------|
| **封面文字** | 15% | title/summary/coverImage/tags 格式正确 |
| **Insight 质量** | 25% | 基于当期内容，建议可操作 |
| **highlight 分布** | 20% | 各板块都有，6-10 条 |
| **isAlert 分布** | 20% | 各板块都有，15-25 条 |
| **内容完整性** | 10% | 无章节标题残留，内容>50 字符 |
| **分类准确性** | 10% | subCategory 分布合理 |

**目标评分**: ≥85 分

---

## 📝 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2026-02-22 | 初始版本（单模型审查） |
| v2.0 | 2026-03-09 | 三模型优化版（GLM-5+Kimi+MiniMax） |

---

**维护者**: AI Assistant  
**最后更新**: 2026-03-09 02:00
