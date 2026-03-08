#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知行周刊第 68 期制作脚本 v2
严格按照第 67 期格式，确保内容完整不压缩
"""

from docx import Document
import json
import re
from collections import Counter

# ============ 配置 ============
DOCX_PATH = '知行周刊 - 第六十八期（2026.03.02-03.08）完整详细版.docx'
OUTPUT_DIR = '知行周刊 -68'
ISSUE_ID = 68
DATE_RANGE = '2026.03.02 - 2026.03.08'

# ============ 数据提取 ============
def load_docx(path):
    """读取 DOCX 文件"""
    doc = Document(path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    print(f"✅ 读取 DOCX: {len(paragraphs)}段")
    return paragraphs

def extract_hongguan(paragraphs, start, end):
    """提取宏观类（段落 16-55）"""
    items = []
    i = start
    current_title = None
    current_content = []
    
    while i <= end:
        p = paragraphs[i]
        
        # 跳过元信息
        if p.startswith(('来源:', '发布时间:', '原标题:', '作者:', '期数:')):
            i += 1
            continue
        if p in ['一、宏观资讯', '（一）热点聚焦', '（二）热点速览']:
            i += 1
            continue
        
        # 识别标题（◎开头）
        is_title = p.startswith('◎')
        
        if is_title:
            if current_title:
                content_text = '\n\n'.join(current_content) if current_content else ''
                title_clean = current_title.replace('◎', '').strip()
                if len(title_clean) > 5:
                    items.append({'title': title_clean, 'content': content_text})
            current_title = p
            current_content = []
        else:
            # 内容（以数字或括号开头的段落）
            if current_title and (p.startswith(('（', '（1）', '（2）', '（3）', '美国:', '伊朗:')) or (len(p) > 30 and not p.startswith(('1.', '2.', '3.')))):
                current_content.append(p)
        i += 1
    
    if current_title:
        content_text = '\n\n'.join(current_content) if current_content else ''
        title_clean = current_title.replace('◎', '').strip()
        if len(title_clean) > 5:
            items.append({'title': title_clean, 'content': content_text})
    
    return items

def extract_platform(paragraphs, start, end):
    """提取平台类（电商部分，段落 56-140）"""
    items = []
    i = start
    current_title = None
    current_content = []
    current_company = None
    
    platform_keywords = ['阿里', '腾讯', '京东', '拼多多', '抖音', '快手', '小红书', 'B 站', '电商', '淘宝', '天猫', '亚马逊', '美团', '字节', '百度', '跨境', '平台', '直播']
    
    while i <= end:
        p = paragraphs[i]
        
        # 跳过章节标题
        if p in ['二、电商大事件', '三、跨境电商', '四、你可能关心的事']:
            i += 1
            continue
        
        # 识别公司名（阿里巴巴、京东、抖音电商、快手、B 站等）
        if p in ['阿里巴巴', '京东', '抖音电商', '快手', 'B 站']:
            current_company = p
            i += 1
            continue
        
        # 识别标题（数字开头，如"1. "）
        is_title = re.match(r'^(\d+)\.\s*', p)
        
        if is_title:
            if current_title and current_content:
                content_text = '\n\n'.join(current_content)
                title_clean = re.sub(r'^\d+\.\s*', '', current_title).strip()
                if len(title_clean) > 5:
                    full_text = title_clean + ' ' + content_text
                    if any(kw in full_text for kw in platform_keywords):
                        items.append({'title': title_clean, 'content': content_text})
            current_title = p
            current_content = []
        else:
            # 内容
            if current_title and len(p) > 20:
                current_content.append(p)
        i += 1
    
    if current_title and current_content:
        content_text = '\n\n'.join(current_content)
        title_clean = re.sub(r'^\d+\.\s*', '', current_title).strip()
        if len(title_clean) > 5:
            full_text = title_clean + ' ' + content_text
            if any(kw in full_text for kw in platform_keywords):
                items.append({'title': title_clean, 'content': content_text})
    
    return items

def extract_muying(paragraphs, start, end):
    """提取母婴类（短行标题 + 长行内容）"""
    items = []
    i = start
    
    # 跳过分类标题和元信息
    while i <= end:
        p = paragraphs[i]
        if p == '母婴·亲子' or p.startswith(('来源:', '发布时间:', '原标题:', '作者:')):
            i += 1
            continue
        if p in ['一、两会', '二、人口', '三、批件', '四、动态', '五、营销', '六、投融资']:
            i += 1
            continue
        break
    
    current_title = None
    current_content = []
    
    while i <= end:
        p = paragraphs[i]
        
        # 跳过子分类标题
        if p in ['一、两会', '二、人口', '三、批件', '四、动态', '五、营销', '六、投融资']:
            if current_title and len(current_title) > 5:
                content_text = '\n\n'.join(current_content) if current_content else ''
                items.append({'title': current_title, 'content': content_text})
            current_title = None
            current_content = []
            i += 1
            continue
        
        # 跳过元信息
        if p.startswith(('来源:', '发布时间:', '原标题:', '作者:')):
            i += 1
            continue
        
        # 短行（<60 字符）且不是内容格式 → 标题
        if len(p) < 60 and not p.endswith(('。', '！', '？')) and not p.startswith(('3 月', '2026', '近日', '日前')):
            if current_title:
                content_text = '\n\n'.join(current_content) if current_content else ''
                items.append({'title': current_title, 'content': content_text})
            current_title = p
            current_content = []
        else:
            # 长行 → 内容
            if current_title and len(p) > 15:
                current_content.append(p)
        
        i += 1
    
    if current_title and len(current_title) > 5:
        content_text = '\n\n'.join(current_content) if current_content else ''
        items.append({'title': current_title, 'content': content_text})
    
    return items

def extract_category(paragraphs, start, end, category_name):
    """提取食品、宠物等分类"""
    items = []
    i = start
    current_title = None
    current_content = []
    
    # 跳过分类标题
    while i <= end:
        p = paragraphs[i]
        if p == category_name or p.startswith(('来源:', '发布时间:', '原标题:', '作者:')):
            i += 1
            continue
        if re.match(r'^[一二三四五六七八九十]+[、.]', p):
            i += 1
            continue
        break
    
    while i <= end:
        p = paragraphs[i]
        if p.startswith(('来源:', '发布时间:', '原标题:', '作者:')):
            i += 1
            continue
        is_title = re.match(r'^(\d+)\.\s*', p)
        if is_title:
            if current_title:
                content_text = '\n\n'.join(current_content) if current_content else ''
                title_clean = re.sub(r'^\d+\.\s*', '', current_title).strip()
                if len(title_clean) > 5:
                    items.append({'title': title_clean, 'content': content_text})
            current_title = p
            current_content = []
        else:
            if current_title and len(p) > 15:
                current_content.append(p)
        i += 1
    
    if current_title:
        content_text = '\n\n'.join(current_content) if current_content else ''
        title_clean = re.sub(r'^\d+\.\s*', '', current_title).strip()
        if len(title_clean) > 5:
            items.append({'title': title_clean, 'content': content_text})
    
    return items

def get_subcategory(category, title, content):
    """根据内容自动识别 subCategory（参考第 67 期）"""
    full_text = title + ' ' + content
    
    if category == '宏观':
        if any(kw in full_text for kw in ['政府工作报告', '两会', '人大', '政协', '政治局']):
            return '政策'
        elif any(kw in full_text for kw in ['中东', '伊朗', '美国', '关税', '贸易', '国际', '欧盟', '法国']):
            return '国际形势'
        elif any(kw in full_text for kw in ['央行', '利率', '资金', '货币', '外汇']):
            return '金融政策'
        elif any(kw in full_text for kw in ['GDP', '经济', '增长', '数据', 'PMI', '生产', '产能', '制造']):
            return '经济数据'
        elif any(kw in full_text for kw in ['楼市', '房地产', '房价', '住宅', '拿地']):
            return '房地产'
        elif any(kw in full_text for kw in ['比亚迪', '电池', '汽车', '新能源']):
            return '产业动态'
        elif any(kw in full_text for kw in ['娃哈哈', '宗馥莉', '麻辣烫', '加盟', '永旺', '泸溪河', '茶颜悦色', '蜜雪冰城', '喜茶', '西贝', '皮爷']):
            return '企业动态'
        else:
            return '其他'
    
    elif category == '平台':
        if any(kw in full_text for kw in ['阿里', '淘宝', '天猫', '蚂蚁', '千问']):
            return '阿里巴巴'
        elif any(kw in full_text for kw in ['京东']):
            return '京东'
        elif any(kw in full_text for kw in ['抖音', '快手', '直播', 'B 站', '随心团', '抖省省']):
            return '直播电商'
        elif any(kw in full_text for kw in ['跨境', '乐天', '日本', '亚马逊', '法国', '欧洲']):
            return '跨境电商'
        else:
            return '其他'
    
    elif category == '美妆':
        if any(kw in full_text for kw in ['融资', '投资', '估值', '收购']):
            return '投融资'
        elif any(kw in full_text for kw in ['财报', '营收', '利润', '盈利', '业绩']):
            return '财报'
        elif any(kw in full_text for kw in ['涨价', '关闭', '退出', '裁员']):
            return '品牌动态'
        elif any(kw in full_text for kw in ['入驻', '进驻', '渠道', '门店', '丝芙兰']):
            return '渠道拓展'
        elif any(kw in full_text for kw in ['标准', '团标', '备案']):
            return '新原料'
        elif any(kw in full_text for kw in ['新品', '推出', '发布', '联名', '升级']):
            return '新品'
        else:
            return '其他'
    
    elif category == '母婴':
        if any(kw in full_text for kw in ['两会', '政策', '补贴', '育儿']):
            return '政策解读'
        elif any(kw in full_text for kw in ['批件', '注册', '特医', '配方']):
            return '注册批件'
        elif any(kw in full_text for kw in ['融资', '投资', '收购']):
            return '投融资'
        elif any(kw in full_text for kw in ['财报', '营收', '业绩']):
            return '财报'
        elif any(kw in full_text for kw in ['营销', '联名', '品牌']):
            return '品牌营销'
        else:
            return '其他'
    
    elif category == '食品':
        if any(kw in full_text for kw in ['新品', '推出', '发布', '上市']):
            return '新品'
        elif any(kw in full_text for kw in ['财报', '营收', '利润', '业绩']):
            return '财报'
        elif any(kw in full_text for kw in ['价格', '降价', '涨价', '补贴']):
            return '价格策略'
        elif any(kw in full_text for kw in ['融资', '投资', '收购']):
            return '投融资'
        else:
            return '其他'
    
    elif category == '宠物':
        if any(kw in full_text for kw in ['融资', '投资', '收购', '估值']):
            return '投融资'
        elif any(kw in full_text for kw in ['财报', '营收', '业绩']):
            return '财报'
        elif any(kw in full_text for kw in ['新品', '产品', '食品']):
            return '新品'
        elif any(kw in full_text for kw in ['医疗', '保险', '疫苗', '诊疗', 'CT']):
            return '宠物医疗'
        elif any(kw in full_text for kw in ['春节', '服饰', '出行', '旅游', '乐园', '民宿', '餐厅']):
            return '宠物经济'
        elif any(kw in full_text for kw in ['标准', '认证', '质量', '监管']):
            return '行业规范'
        else:
            return '其他'
    
    return '其他'

def build_news_items(items, category, subcat_func, start_id=1):
    """构建完整的 news 数组"""
    result = []
    for idx, item in enumerate(items, start_id):
        content = item['content'] if item['content'] else item['title']
        # summary 取 content 前 100 字符或 title
        summary = content[:100] + '...' if len(content) > 100 else content
        
        result.append({
            'id': start_id + idx - 1,
            'category': category,
            'subCategory': subcat_func(category, item['title'], item['content']),
            'title': item['title'],
            'summary': summary,
            'content': content,
            'highlight': False,
            'isAlert': False
        })
    return result

# ============ Insight 生成 ============
def generate_insight(all_news):
    """生成 Insight（参考第 67 期格式）"""
    
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
    
    return insight

# ============ 主流程 ============
def main():
    print("=" * 70)
    print("📰 知行周刊第 68 期制作脚本 v2")
    print("=" * 70)
    
    # 1. 读取 DOCX
    paragraphs = load_docx(DOCX_PATH)
    
    # 2. 提取各分类
    print("\n=== 提取资讯 ===")
    hongguan = extract_hongguan(paragraphs, 16, 55)  # 宏观部分
    platform = extract_platform(paragraphs, 56, 140)  # 电商/平台部分
    muying = extract_muying(paragraphs, 141, 261)
    shipin = extract_category(paragraphs, 262, 314, '食品·饮料')
    chongwu = extract_category(paragraphs, 315, 403, '宠物·经济')
    
    print(f"宏观：{len(hongguan)}条")
    print(f"平台：{len(platform)}条")
    print(f"母婴：{len(muying)}条")
    print(f"食品：{len(shipin)}条")
    print(f"宠物：{len(chongwu)}条")
    
    # 3. 构建 news 数组
    print("\n=== 构建 JSON ===")
    all_news = []
    
    news_id = 1
    for items, cat in [(hongguan, '宏观'), (platform, '平台'), (muying, '母婴'), (shipin, '食品'), (chongwu, '宠物')]:
        news_items = build_news_items(items, cat, get_subcategory, news_id)
        all_news.extend(news_items)
        news_id += len(items)
    
    # 4. 去重
    seen_titles = set()
    unique_news = []
    duplicates = []
    for item in all_news:
        title_key = item['title'][:50]
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_news.append(item)
        else:
            duplicates.append(item)
    
    print(f"去重前：{len(all_news)}条")
    print(f"去重后：{len(unique_news)}条")
    print(f"删除重复：{len(duplicates)}条")
    
    all_news = unique_news
    
    # 5. 重新编号
    for i, item in enumerate(all_news, 1):
        item['id'] = i
    
    # 6. 生成 Insight
    print("\n=== 生成 Insight ===")
    insight = generate_insight(all_news)
    
    # 7. 构建 issue JSON
    issue_68 = {
        'id': ISSUE_ID,
        'date': DATE_RANGE,
        'title': f'知行周刊 - 第{ISSUE_ID}期',
        'coverImage': 'https://example.com/cover68.jpg',
        'summary': f'第{ISSUE_ID}期知行周刊，共收录{len(all_news)}条重要资讯',
        'tags': ['知行周刊', '行业资讯', '2026'],
        'insight': insight,
        'data': all_news
    }
    
    # 8. 质量检查
    print("\n=== 质量检查 ===")
    cat_counts = Counter(n['category'] for n in all_news)
    subcat_counts = Counter(n['subCategory'] for n in all_news)
    
    print(f"分类统计:")
    for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}条")
    
    print(f"\nsubCategory 分布（前 15）:")
    for cat, count in subcat_counts.most_common(15):
        print(f"  {cat}: {count}条")
    
    lengths = [len(n['content']) for n in all_news]
    print(f"\n内容长度:")
    print(f"  平均：{sum(lengths)/len(lengths):.0f}字符")
    print(f"  最短：{min(lengths)}字符")
    print(f"  最长：{max(lengths)}字符")
    
    # 9. 保存
    import os
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    with open(f'{OUTPUT_DIR}/issue-68.json', 'w', encoding='utf-8') as f:
        json.dump(issue_68, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 已保存到 {OUTPUT_DIR}/issue-68.json")
    
    # 10. 整合到 data.json
    with open('data.json', 'r', encoding='utf-8') as f:
        main_data = json.load(f)
    
    # 移除旧的 68 期（如果有）
    main_data['issues'] = [i for i in main_data['issues'] if i['id'] != ISSUE_ID]
    
    # 添加新的 68 期（放在最前面）
    main_data['issues'].insert(0, issue_68)
    
    # 更新元数据
    main_data['_meta'] = {
        'version': '1.0',
        'updatedAt': '2026-03-09 00:50',
        'totalIssues': len(main_data['issues']),
        'totalNews': sum(len(i['data']) for i in main_data['issues'])
    }
    
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(main_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已整合到 data.json，共{len(main_data['issues'])}期，{main_data['_meta']['totalNews']}条资讯")
    
    print("\n" + "=" * 70)
    print("✅ 第 68 期知行周刊制作完成！")
    print("=" * 70)

if __name__ == '__main__':
    main()
