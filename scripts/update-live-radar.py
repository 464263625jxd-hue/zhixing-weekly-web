#!/usr/bin/env python3
import importlib.util
import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path


EBRUN_CHANNELS = [
    ("recommend", "推荐", "_index/ClaudeCode/SkillJson/information_recommend", ["综合动态"]),
    ("future-retail", "未来零售", "_index/ClaudeCode/SkillJson/information_channel_50", ["平台", "即时零售"]),
    ("cross-border", "跨境电商", "_index/ClaudeCode/SkillJson/information_channel_51", ["出海", "跨境平台"]),
    ("industrial-internet", "产业互联网", "_index/ClaudeCode/SkillJson/information_channel_52", ["产业服务", "供应链"]),
    ("brand", "品牌", "_index/ClaudeCode/SkillJson/information_channel_87", ["品牌增长"]),
    ("ai", "AI", "_index/ClaudeCode/SkillJson/information_channel_88", ["AI应用"]),
]

KR36_CHANNELS = [
    ("kr36-hot", "热榜", ["热榜"]),
    ("kr36-ai-tech", "AI与科技", ["AI", "科技"]),
    ("kr36-business", "商业公司", ["公司", "商业"]),
    ("kr36-capital", "创投资本", ["融资", "资本"]),
    ("kr36-consumption", "消费生活", ["消费", "生活"]),
]

ALERT_WORDS = ["成本", "承压", "违规", "清理", "整治", "垄断", "诉", "风险", "下滑", "跳涨", "低于预期", "打击", "资质缺失", "泄密"]
FORBIDDEN_READER_WORDS = ["Codex", "额度", "素材池", "周刊候选", "制作者流程", "ebrun-original-news", "36kr-hotlist"]
EBRUN_SKILL_CANDIDATES = [
    Path.home() / ".codex/skills/ebrun-original-news",
    Path.home() / ".agents/skills/ebrun-original-news",
    Path.home() / ".openclaw/workspace/skills/ebrun-original-news",
]
KR36_SKILL_CANDIDATES = [
    Path.home() / ".codex/skills/36kr-hotlist",
    Path.home() / ".agents/skills/36kr-hotlist",
    Path.home() / ".openclaw/workspace/skills/36kr-hotlist",
]
TAG_RULES = [
    ("AI", ["AI", "ChatGPT", "Gemini", "Alexa", "数字人", "智能体", "大模型", "GEO", "Anthropic", "英伟达"]),
    ("跨境", ["SHEIN", "Temu", "TikTok", "亚马逊", "Shopee", "OZON", "Wildberries", "出海", "英国", "美国", "巴西", "俄罗斯"]),
    ("平台", ["淘宝", "京东", "拼多多", "小红书", "抖音", "快手", "美团", "Shopify"]),
    ("财报", ["财报", "营收", "GMV", "利润", "盈利", "同比", "净利润"]),
    ("供应链", ["物流", "供应链", "采购", "MRO", "B2B"]),
    ("融资", ["融资", "投资", "A轮", "估值", "IPO", "上市"]),
    ("品牌", ["品牌", "新品", "咖啡", "美妆", "韶音", "泡泡玛特", "名创优品"]),
    ("科技", ["科技", "芯片", "机器人", "模型", "算力", "自动驾驶", "新能源"]),
    ("消费", ["消费", "餐饮", "门店", "食品", "旅游", "生活", "零售"]),
]


def first_existing_script(candidates, script_name):
    for skill_dir in candidates:
        script = skill_dir / script_name
        if script.exists():
            return script
    raise FileNotFoundError(f"skill script not found: {script_name}")


def fetch_ebrun_articles(fetch_script, channel_path):
    output = subprocess.check_output(
        [sys.executable, str(fetch_script), channel_path, "--json", "--limit", "10"],
        text=True,
    )
    return json.loads(output)


def load_36kr_module():
    script = first_existing_script(KR36_SKILL_CANDIDATES, "scripts/fetch_hotlist.py")
    spec = importlib.util.spec_from_file_location("kr36_hotlist_skill", script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def tags_for(title, summary, defaults):
    haystack = f"{title} {summary}"
    tags = []
    for tag, words in TAG_RULES:
        if any(word in haystack for word in words):
            tags.append(tag)
    for tag in defaults:
        if tag not in tags:
            tags.append(tag)
    return tags[:4]


def short_date(value):
    return value[:10] if value else ""


def clean_reader_text(value):
    text = str(value or "").strip()
    return text.replace("亿邦动力董事长、亿邦智库院长", "行业调研团队")


def contains_forbidden_reader_words(*values):
    text = " ".join(str(value or "") for value in values)
    return any(word in text for word in FORBIDDEN_READER_WORDS)


def is_alert(title, summary):
    text = f"{title} {summary}"
    return any(word in text for word in ALERT_WORDS)


def item_id(source_id, channel_id, index):
    return f"{source_id}-{channel_id}-{index + 1:02d}"


def build_ebrun_group():
    fetch_script = first_existing_script(EBRUN_SKILL_CANDIDATES, "scripts/fetch_news.py")
    channels = []
    for channel_id, name, channel_path, defaults in EBRUN_CHANNELS:
        items = []
        for article in fetch_ebrun_articles(fetch_script, channel_path):
            title = clean_reader_text(article.get("title", ""))
            url = str(article.get("url", "")).strip()
            if not title or not url:
                continue
            summary = clean_reader_text(article.get("summary", ""))
            if contains_forbidden_reader_words(title, summary):
                continue
            items.append(
                {
                    "id": item_id("ebrun", channel_id, len(items)),
                    "sourceId": "ebrun",
                    "sourceName": "亿邦动力",
                    "channelId": channel_id,
                    "channelName": name,
                    "title": title,
                    "summary": summary,
                    "publishedAt": str(article.get("publish_time", "")).strip(),
                    "sourceDate": short_date(str(article.get("publish_time", ""))),
                    "sourceUrl": url,
                    "tags": tags_for(title, summary, defaults),
                    "isAlert": is_alert(title, summary),
                    "weeklyCandidate": True,
                }
            )
        channels.append({"id": channel_id, "name": name, "items": items})
    return {"id": "ebrun", "name": "亿邦动力", "description": "电商、零售、跨境与产业互联网动态", "channels": channels}


def kr36_channel_for(article):
    title = str(article.get("title", ""))
    content = str(article.get("content", ""))
    text = f"{title} {content}"
    if any(word in text for word in ["AI", "大模型", "芯片", "英伟达", "Anthropic", "机器人", "科技", "自动驾驶", "新能源"]):
        return "kr36-ai-tech"
    if any(word in text for word in ["融资", "投资", "IPO", "上市", "估值", "资本"]):
        return "kr36-capital"
    if any(word in text for word in ["消费", "餐饮", "门店", "食品", "旅游", "生活", "零售", "寿司郎"]):
        return "kr36-consumption"
    if any(word in text for word in ["公司", "CEO", "财报", "营收", "利润", "商业", "马斯克", "谷歌"]):
        return "kr36-business"
    return "kr36-hot"


def build_36kr_group():
    module = load_36kr_module()
    articles = module.fetch_hotlist(datetime.now().date().isoformat())
    channel_map = {channel_id: {"id": channel_id, "name": name, "items": []} for channel_id, name, _ in KR36_CHANNELS}
    defaults = {channel_id: tags for channel_id, _, tags in KR36_CHANNELS}
    for article in articles[:15]:
        channel_id = kr36_channel_for(article)
        channel = channel_map.get(channel_id) or channel_map["kr36-hot"]
        title = clean_reader_text(article.get("title", ""))
        summary = clean_reader_text(article.get("content", ""))
        url = str(article.get("url", "")).strip()
        if not title or not url:
            continue
        if contains_forbidden_reader_words(title, summary):
            continue
        channel["items"].append(
            {
                "id": item_id("36kr", channel["id"], len(channel["items"])),
                "sourceId": "36kr",
                "sourceName": "36氪",
                "channelId": channel["id"],
                "channelName": channel["name"],
                "rank": article.get("rank"),
                "title": title,
                "summary": summary,
                "publishedAt": str(article.get("publishTime", "")).strip(),
                "sourceDate": short_date(str(article.get("publishTime", ""))),
                "sourceUrl": url,
                "tags": tags_for(title, summary, defaults.get(channel["id"], [])),
                "isAlert": is_alert(title, summary),
                "weeklyCandidate": True,
            }
        )
    return {"id": "36kr", "name": "36氪", "description": "科技商业、创投与公司热榜", "channels": list(channel_map.values())}


def flatten_channels(source_groups):
    channels = []
    for group in source_groups:
        for channel in group["channels"]:
            channels.append(
                {
                    "id": f"{group['id']}-{channel['id']}",
                    "name": f"{group['name']} · {channel['name']}",
                    "sourceId": group["id"],
                    "sourceName": group["name"],
                    "items": channel["items"],
                }
            )
    return channels


def build_payload():
    now = datetime.now()
    source_groups = [build_ebrun_group(), build_36kr_group()]
    payload = {
        "updatedAt": now.strftime("%Y-%m-%d %H:%M"),
        "nextRun": (now + timedelta(days=1)).replace(hour=10, minute=15, second=0, microsecond=0).strftime("%Y-%m-%d %H:%M"),
        "updateInterval": "1d",
        "sourceGroups": source_groups,
        "channels": flatten_channels(source_groups),
    }

    serialized = json.dumps(payload, ensure_ascii=False)
    leaked = [word for word in FORBIDDEN_READER_WORDS if word in serialized]
    if leaked:
        raise ValueError(f"reader-facing forbidden words found: {', '.join(leaked)}")
    return payload


def comparable(payload):
    copy = dict(payload)
    copy.pop("updatedAt", None)
    copy.pop("nextRun", None)
    return copy


def main():
    target = Path("liveRadar/latest.json")
    payload = build_payload()
    old_payload = json.loads(target.read_text(encoding="utf-8")) if target.exists() else None

    if old_payload and comparable(old_payload) == comparable(payload):
        print("No live radar content changes.")
        return 0

    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(channel["items"]) for group in payload["sourceGroups"] for channel in group["channels"])
    print(f"Updated liveRadar/latest.json with {total} items from {len(payload['sourceGroups'])} sources.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
