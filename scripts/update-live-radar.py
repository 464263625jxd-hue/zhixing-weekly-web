#!/usr/bin/env python3
import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path


CHANNELS = [
    ("recommend", "推荐", "_index/ClaudeCode/SkillJson/information_recommend", ["综合动态"]),
    ("future-retail", "未来零售", "_index/ClaudeCode/SkillJson/information_channel_50", ["平台", "即时零售"]),
    ("cross-border", "跨境电商", "_index/ClaudeCode/SkillJson/information_channel_51", ["出海", "跨境平台"]),
    ("industrial-internet", "产业互联网", "_index/ClaudeCode/SkillJson/information_channel_52", ["产业服务", "供应链"]),
    ("brand", "品牌", "_index/ClaudeCode/SkillJson/information_channel_87", ["品牌增长"]),
    ("ai", "AI", "_index/ClaudeCode/SkillJson/information_channel_88", ["AI应用"]),
]

ALERT_WORDS = ["成本", "承压", "违规", "清理", "整治", "垄断", "诉", "风险", "下滑", "跳涨", "低于预期", "打击", "资质缺失"]
FORBIDDEN_READER_WORDS = ["Codex", "额度", "素材池", "周刊候选", "制作者流程", "ebrun-original-news", "亿邦动力", "亿邦"]
SKILL_CANDIDATES = [
    Path.home() / ".codex/skills/ebrun-original-news",
    Path.home() / ".agents/skills/ebrun-original-news",
    Path.home() / ".openclaw/workspace/skills/ebrun-original-news",
]
TAG_RULES = [
    ("AI", ["AI", "ChatGPT", "Gemini", "Alexa", "数字人", "智能体", "大模型", "GEO"]),
    ("跨境", ["SHEIN", "Temu", "TikTok", "亚马逊", "Shopee", "OZON", "Wildberries", "出海", "英国", "美国", "巴西", "俄罗斯"]),
    ("平台", ["淘宝", "京东", "拼多多", "小红书", "抖音", "快手", "美团", "Shopify"]),
    ("财报", ["财报", "营收", "GMV", "利润", "盈利", "同比"]),
    ("供应链", ["物流", "供应链", "采购", "MRO", "B2B"]),
    ("融资", ["融资", "投资", "A轮", "估值", "IPO", "上市"]),
    ("品牌", ["品牌", "新品", "咖啡", "美妆", "韶音", "泡泡玛特", "名创优品"]),
]


def skill_fetch_script():
    for skill_dir in SKILL_CANDIDATES:
        script = skill_dir / "scripts/fetch_news.py"
        if script.exists():
            return script
    raise FileNotFoundError("ebrun-original-news skill is not installed")


def fetch_articles(fetch_script, channel_path):
    output = subprocess.check_output(
        [sys.executable, str(fetch_script), channel_path, "--json", "--limit", "10"],
        text=True,
    )
    return json.loads(output)


def tags_for(article, defaults):
    haystack = f"{article.get('title', '')} {article.get('summary', '')}"
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


def build_payload():
    fetch_script = skill_fetch_script()
    now = datetime.now()
    payload = {
        "updatedAt": now.strftime("%Y-%m-%d %H:%M"),
        "nextRun": (now + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
        "updateInterval": "2h",
        "channels": [],
    }

    for channel_id, name, channel_path, defaults in CHANNELS:
        items = []
        for article in fetch_articles(fetch_script, channel_path):
            title = clean_reader_text(article.get("title", ""))
            url = str(article.get("url", "")).strip()
            if not title or not url:
                continue
            summary = clean_reader_text(article.get("summary", ""))
            text = f"{title} {summary}"
            items.append(
                {
                    "id": f"{channel_id}-{len(items) + 1:02d}",
                    "title": title,
                    "summary": summary,
                    "publishedAt": str(article.get("publish_time", "")).strip(),
                    "sourceDate": short_date(str(article.get("publish_time", ""))),
                    "sourceUrl": url,
                    "tags": tags_for(article, defaults),
                    "isAlert": any(word in text for word in ALERT_WORDS),
                    "weeklyCandidate": True,
                }
            )
        payload["channels"].append({"id": channel_id, "name": name, "items": items})

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
    total = sum(len(channel["items"]) for channel in payload["channels"])
    print(f"Updated liveRadar/latest.json with {total} items.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
