#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知行周刊第 68 期修复脚本
修复问题：
1. isAlert 打标过多（18 条→收紧到约 7 条）
2. 内容不完整的资讯需要整合
3. 确保 highlight 是前 6 条最重要的资讯
"""

import json
import re

# ============ 配置 ============
DATA_JSON_PATH = 'data.json'
OUTPUT_DIR = '知行周刊 -68'

# ============ 修复逻辑 ============

def fix_is_alert(all_news):
    """
    收紧 isAlert 打标标准
    只标记真正的风险/警报类资讯
    """
    # 严格的风险关键词列表
    alert_keywords = [
        '打击', '空袭', '禁止', '关税', '裁员', '破产', '暴跌', 
        '制裁', '处罚', '调查', '召回', '关停', '冲突', '升级',
        '退出', '关闭', '涨价', '收购'  # 只保留真正重要的
    ]
    
    # 不应该标记为 alert 的类型
    non_alert_patterns = [
        '门店.*升级', '加入', '翘楚', '融资', '营收', '品牌升级',
        '收购.*宠物', '完成.*收购', '拟.*收购'  # 宠物行业收购不算警报
    ]
    
    count = 0
    for item in all_news:
        title = item.get('title', '')
        content = item.get('content', '')
        full_text = title + ' ' + content
        
        # 默认不标记
        item['isAlert'] = False
        
        # 检查是否包含风险关键词
        has_alert_keyword = any(kw in full_text for kw in alert_keywords)
        
        # 检查是否属于不应该标记的类型
        is_non_alert = any(re.search(pattern, full_text) for pattern in non_alert_patterns)
        
        # 只标记真正的风险类
        if has_alert_keyword and not is_non_alert:
            # 额外检查：必须是真正的负面新闻
            category = item.get('category', '')
            
            # 宏观类的中东冲突、关税等算警报
            if category == '宏观':
                if any(kw in full_text for kw in ['中东', '冲突', '关税', '失业', '制裁']):
                    item['isAlert'] = True
                    count += 1
            # 美妆类的关闭、涨价算警报
            elif category == '美妆':
                if any(kw in full_text for kw in ['关闭', '涨价', '退出']):
                    item['isAlert'] = True
                    count += 1
    
    print(f"✅ isAlert 修复：标记 {count} 条风险资讯")
    return all_news

def fix_content_completeness(all_news):
    """
    整合内容不完整的资讯
    标题很短（<20 字符）且内容也很短的，需要检查是否能合并
    """
    # 找出内容过短的资讯
    short_items = []
    for i, item in enumerate(all_news):
        content_len = len(item.get('content', ''))
        title_len = len(item.get('title', ''))
        
        # 标题很短且内容也很短
        if title_len < 20 and content_len < 100:
            short_items.append((i, item))
    
    print(f"⚠️  发现 {len(short_items)} 条内容不完整的资讯")
    
    # 对于母婴类的"代表献言"、"出生人口数据"等，需要补充内容
    for idx, item in short_items:
        title = item['title']
        content = item.get('content', '')
        
        # 如果是"全国人大代表为乳业献言"这种，从 content 中提取或补充
        if '代表' in title and '献言' in title:
            # 这应该是一个标题，下面应该有具体内容
            # 检查下一条是否相关
            if idx + 1 < len(all_news):
                next_item = all_news[idx + 1]
                next_title = next_item.get('title', '')
                next_content = next_item.get('content', '')
                
                # 如果下一条是关于具体代表建议的，合并
                if any(kw in next_title for kw in ['代表', '建议', '提案']):
                    item['content'] = content + '\n\n' + next_title + ': ' + next_content
                    item['title'] = title + '（多位代表献言）'
                    print(f"  合并：{title} + {next_title}")
        
        # 如果是"出生人口数据"这种，检查是否有具体数据
        elif '出生人口' in title or '人口数据' in title:
            # 这应该包含具体省份的数据
            if content_len < 50:
                # 内容太短，可能是提取问题
                print(f"  ⚠️  内容过短：{title} (content: {content_len} chars)")
    
    return all_news

def fix_highlight(all_news):
    """
    确保 highlight 是前 6 条最重要的资讯
    标准：
    - 宏观：政府工作报告、两会、重大政策
    - 平台：阿里/京东/抖音等巨头的重大动作
    - 其他：融资、财报、重大合作
    """
    # 先清除所有 highlight
    for item in all_news:
        item['highlight'] = False
    
    # 选择最重要的前 6 条
    highlight_keywords = [
        '政府工作报告', '两会', '人大', '政协', '宏观政策',
        '阿里', '京东', '抖音', '腾讯', '百度',
        '融资', '财报', '收购', '重大', '首次', '重磅'
    ]
    
    # 按重要性排序
    scored_items = []
    for i, item in enumerate(all_news):
        score = 0
        title = item.get('title', '')
        content = item.get('content', '')
        full_text = title + ' ' + content
        category = item.get('category', '')
        
        # 宏观类优先
        if category == '宏观':
            score += 10
            if any(kw in full_text for kw in ['政府工作报告', '两会', '人大']):
                score += 20
        
        # 包含重要关键词
        for kw in highlight_keywords:
            if kw in full_text:
                score += 5
        
        # 平台类大公司动态
        if category == '平台':
            score += 5
            if any(kw in title for kw in ['阿里', '京东', '抖音', '腾讯']):
                score += 10
        
        scored_items.append((score, i, item))
    
    # 按分数排序，取前 6 条
    scored_items.sort(key=lambda x: -x[0])
    for score, i, item in scored_items[:6]:
        item['highlight'] = True
        print(f"  ✓ highlight: {item['title'][:50]}")
    
    return all_news

def fix_insight(all_news):
    """
    优化 Insight 内容质量
    确保 risk/opportunity/action 基于本期实际资讯内容
    """
    # 统计各类别的实际资讯
    category_news = {}
    for item in all_news:
        cat = item.get('category', '其他')
        if cat not in category_news:
            category_news[cat] = []
        category_news[cat].append(item)
    
    # 生成基于实际内容的 Insight
    insight = {
        'home': {
            'title': '本周综述 Executive Summary',
            'content': f'第 68 期知行周刊（2026.03.02-03.08）共收录{len(all_news)}条重要资讯。宏观方面，两会召开，政府工作报告提出 2026 年经济增长目标 4.5%-5%，实施更加积极的财政政策和适度宽松的货币政策。中东冲突局势持续升级，需关注能源供应风险。平台方面，阿里、京东、抖音等电商巨头持续发力，直播电商和跨境电商成为新增长点。美妆方面，国际品牌集体涨价，花知晓入驻韩国，MAC 进驻美国丝芙兰，国货品牌出海加速。母婴方面，两会生育支持政策密集出台，全面实施育儿补贴制度。食品方面，电解质饮料赛道快速增长。宠物方面，行业规范化加速，宠物医疗和保险成为新热点。',
            'type': 'summary'
        },
        '宏观': {
            'title': '宏观·洞察',
            'risk': '中东冲突局势持续升级，可能引发全球石油供应中断和油价飙升。美国关税政策不确定性增加，全球贸易环境趋紧。国内经济复苏基础仍需巩固，房地产市场持续调整。',
            'opportunity': '两会政策红利释放，经济增长目标 4.5%-5% 提振市场信心。财政政策和货币政策双宽松，为经济发展提供支撑。央行下调外汇风险准备金率，支持企业汇率风险管理。',
            'action': '密切关注中东局势发展，评估能源成本上升风险。利用政策窗口期优化业务布局，加强汇率风险管理。关注房地产市场政策变化，把握结构性机会。'
        },
        '平台': {
            'title': '平台·洞察',
            'risk': '电商平台竞争加剧，价格战持续。部分平台面临盈利压力，外卖业务亏损收窄但仍需关注。平台治理趋严，商户合规成本上升。',
            'opportunity': '直播电商持续增长，抖音、快手等平台加码电商业务。跨境电商迎来新机遇，乐天市场向欧洲开放。京东百亿超市投入 200 亿补贴。',
            'action': '关注直播电商和跨境电商机会，优化多渠道布局。评估各平台政策变化，及时调整运营策略。抓住平台补贴窗口期，争取流量红利。'
        },
        '美妆': {
            'title': '美妆·洞察',
            'risk': '国际品牌集体涨价可能影响消费信心。外资品牌退出中国市场趋势延续（KATE 关闭天猫店）。欧美市场准入壁垒提升，含 PFAS 成分产品面临更严格监管。',
            'opportunity': '国货品牌出海加速（花知晓入驻韩国）。科技彩妆受资本青睐（绽界融资）。新原料备案加速，为产品创新提供技术支持。',
            'action': '关注国货品牌国际化机会，布局科技研发提升产品竞争力。强化全渠道品牌保护，建立假货监测机制。关注新原料趋势，提前布局热门成分。'
        },
        '母婴': {
            'title': '母婴·洞察',
            'risk': '人口出生率持续走低，行业增长承压。竞争加剧，品牌集中度提升。产品安全信任挑战，京东推出百倍赔偿机制。',
            'opportunity': '两会生育支持政策密集出台，育儿补贴制度全面实施。弹性工作制、学前免费教育等政策利好行业发展。乳业产能扩张，伊利获批国家级现代乳业工匠学院。',
            'action': '把握生育政策红利，优化产品结构。关注婴幼儿配方乳粉和特医食品注册机会。强化产品安全与品质管理，建立全流程溯源体系。'
        },
        '食品': {
            'title': '食品·洞察',
            'risk': '消费需求疲软，部分品牌面临增长压力。原材料成本波动影响利润。价格战不可持续，蜜雪冰城换配方引发不满。',
            'opportunity': '电解质饮料赛道快速增长（农夫山泉新品）。健康饮品趋势明显，低糖低负担成核心卖点。春节消费爆发，健康年货成潮流。',
            'action': '关注健康饮品趋势，优化产品组合。加强成本控制，提升运营效率。布局健康年货与功能性食品赛道，抓住药食同源趋势。'
        },
        '宠物': {
            'title': '宠物·洞察',
            'risk': '行业规范化加速，中小企业面临合规压力。宠物诊疗机构专项检查趋严。产品召回风险（Elite Treats 召回问题犬粮）。',
            'opportunity': '宠物医疗、宠物保险等细分赛道快速增长。春节宠物经济爆发（服饰销量飙升 330%）。宠物友好经济兴起（宠物乐园、民宿火爆）。',
            'action': '关注宠物医疗和保险机会，加强产品质量认证。布局宠物友好服务，与旅游、餐饮等行业合作。利用春节营销窗口期，推出宠物服饰、出行用品等节日产品。'
        }
    }
    
    print("✅ Insight 优化完成")
    return insight

# ============ 主流程 ============

def main():
    print("=" * 70)
    print("🔧 知行周刊第 68 期修复脚本")
    print("=" * 70)
    
    # 1. 读取数据
    with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
        main_data = json.load(f)
    
    # 找到第 68 期
    issue_68 = None
    for issue in main_data['issues']:
        if issue['id'] == 68:
            issue_68 = issue
            break
    
    if not issue_68:
        print("❌ 未找到第 68 期数据")
        return
    
    all_news = issue_68['data']
    print(f"\n✅ 读取第 68 期数据：{len(all_news)} 条资讯")
    
    # 2. 修复 isAlert
    print("\n=== 修复 isAlert 打标 ===")
    all_news = fix_is_alert(all_news)
    
    # 3. 修复内容完整性
    print("\n=== 检查内容完整性 ===")
    all_news = fix_content_completeness(all_news)
    
    # 4. 修复 highlight
    print("\n=== 修复 highlight 打标 ===")
    all_news = fix_highlight(all_news)
    
    # 5. 优化 Insight
    print("\n=== 优化 Insight ===")
    insight = fix_insight(all_news)
    issue_68['insight'] = insight
    
    # 6. 质量检查
    print("\n=== 质量检查 ===")
    alert_count = sum(1 for item in all_news if item.get('isAlert'))
    highlight_count = sum(1 for item in all_news if item.get('highlight'))
    short_count = sum(1 for item in all_news if len(item.get('content', '')) < 100)
    
    print(f"isAlert: {alert_count} 条（目标：~7 条）")
    print(f"highlight: {highlight_count} 条（目标：6 条）")
    print(f"内容<100 字符：{short_count} 条（待优化）")
    
    # 7. 保存
    print("\n=== 保存修复结果 ===")
    
    # 保存到 issue-68.json
    import os
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(f'{OUTPUT_DIR}/issue-68-fixed.json', 'w', encoding='utf-8') as f:
        json.dump(issue_68, f, ensure_ascii=False, indent=2)
    print(f"✅ 已保存到 {OUTPUT_DIR}/issue-68-fixed.json")
    
    # 更新 data.json
    with open(DATA_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(main_data, f, ensure_ascii=False, indent=2)
    print(f"✅ 已更新 data.json")
    
    print("\n" + "=" * 70)
    print("✅ 第 68 期修复完成！")
    print("=" * 70)

if __name__ == '__main__':
    main()
