#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量提取微信文章完整内容
"""
import requests
from bs4 import BeautifulSoup
import json
import time
import re

# 文章列表
ARTICLES = [
    {
        "name": "跨境电商周报",
        "url": "https://mp.weixin.qq.com/s/-_AVT4CE4REvHd2D3c0e0A",
        "category": "平台&跨境"
    },
    {
        "name": "零售电商周报",
        "url": "https://mp.weixin.qq.com/s/KIFRKG44ySitl99lqdl1uQ",
        "category": "零售电商"
    },
    {
        "name": "一周财经盘点",
        "url": "https://mp.weixin.qq.com/s/eCcvqN9JiV_WrXd-_6t1CA",
        "category": "零售电商"
    },
    {
        "name": "美周热点",
        "url": "https://mp.weixin.qq.com/s/OmSg3ZfbklnzjDp3wZJ1fw",
        "category": "美妆"
    },
    {
        "name": "母婴忽然一周",
        "url": "https://mp.weixin.qq.com/s/YeFp9KitIrqrXSkR09TyMQ",
        "category": "母婴"
    },
    {
        "name": "宠业周报",
        "url": "https://mp.weixin.qq.com/s/DRwfAH3WtBnTA40B5yS-vg",
        "category": "宠物"
    }
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def extract_wechat_article(url):
    """提取微信公众号文章内容"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # 提取标题
        title_tag = soup.find('h1', {'class': 'rich_media_title'})
        title = title_tag.get_text(strip=True) if title_tag else "未知标题"
        
        # 提取内容
        content_div = soup.find('div', {'id': 'js_content'})
        if content_div:
            # 提取所有段落
            paragraphs = []
            for p in content_div.find_all(['p', 'section']):
                text = p.get_text(strip=True)
                if text and len(text) > 5:  # 过滤过短内容
                    paragraphs.append(text)
            
            content = '\n'.join(paragraphs)
            return {
                'success': True,
                'title': title,
                'content': content,
                'length': len(content)
            }
        else:
            return {'success': False, 'error': '未找到内容区域'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def parse_news_items(content, category):
    """解析资讯条目"""
    items = []
    
    # 尝试按编号分割（1、2、3... 或 【标题】）
    # 模式1: 数字编号
    pattern1 = r'\n(\d+[\.\、])\s*(.+?)(?=\n\d+[\.\、]|\n#|$)'
    matches1 = re.findall(pattern1, content, re.DOTALL)
    
    # 模式2: 【标题】
    pattern2 = r'【(.+?)】(.+?)(?=【|$)'
    matches2 = re.findall(pattern2, content, re.DOTALL)
    
    if matches1:
        for num, text in matches1:
            lines = text.strip().split('\n')
            title = lines[0] if lines else text[:50]
            body = '\n'.join(lines[1:]) if len(lines) > 1 else text
            items.append({
                'category': category,
                'title': title.strip(),
                'content': body.strip()
            })
    elif matches2:
        for title, body in matches2:
            items.append({
                'category': category,
                'title': title.strip(),
                'content': body.strip()
            })
    else:
        # 无法解析，返回整体
        items.append({
            'category': category,
            'title': '综合资讯',
            'content': content
        })
    
    return items

def main():
    print("=" * 50)
    print("开始批量提取微信文章")
    print("=" * 50)
    
    all_content = {}
    
    for article in ARTICLES:
        print(f"\n📥 正在提取: {article['name']}...")
        
        result = extract_wechat_article(article['url'])
        
        if result['success']:
            print(f"   ✅ 成功: {result['length']}字")
            
            # 保存到文件
            filename = f"temp_content/{article['name']}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"# {result['title']}\n\n")
                f.write(result['content'])
            
            all_content[article['name']] = {
                'url': article['url'],
                'category': article['category'],
                'title': result['title'],
                'content': result['content'],
                'length': result['length']
            }
        else:
            print(f"   ❌ 失败: {result['error']}")
        
        time.sleep(1)  # 避免请求过快
    
    # 保存汇总文件
    with open('temp_content/all_articles.json', 'w', encoding='utf-8') as f:
        json.dump(all_content, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 50)
    print(f"✅ 完成！共提取 {len(all_content)} 篇文章")
    print("📁 文件保存到: temp_content/")
    print("=" * 50)

if __name__ == '__main__':
    main()