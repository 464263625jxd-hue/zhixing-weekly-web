#!/usr/bin/env python3
"""知行周刊发布前质量检查。

默认检查全部 issues；也可以传入具体文件：
python3 scripts/check-weekly-quality.py issues/issue78.json
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ISSUES_DIR = ROOT / "issues"
ALLOWED_CATEGORIES = ["宏观", "平台", "跨境", "数码科技", "美妆", "母婴", "食品饮料", "宠物"]
ALLOWED_SET = set(ALLOWED_CATEGORIES)
PUBLIC_TEXT_FIELDS = ("summary",)
ITEM_REQUIRED_FIELDS = ("id", "category", "subCategory", "title", "content", "highlight", "isAlert")
PRODUCER_TERMS = ("复查", "核对", "拆条", "扩充", "制作", "本期整理", "继续补充", "后续核对", "待补充", "待确认")


def issue_id_from_path(path: Path) -> int:
    match = re.search(r"issue(\d+)\.json$", path.name)
    return int(match.group(1)) if match else -1


def normalize_title(value: str) -> str:
    value = re.sub(r"\s+", "", value or "")
    value = re.sub(r"[，。、“”‘’：:；;！!？?（）()\[\]【】《》<>\-·.]", "", value)
    return value.lower()


def load_json(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"JSON 解析失败：{exc}") from exc
    if not isinstance(data, dict):
        raise ValueError("顶层必须是对象")
    return data


def add(findings: list[tuple[str, str]], level: str, message: str) -> None:
    findings.append((level, message))


def check_issue(path: Path) -> list[tuple[str, str]]:
    findings: list[tuple[str, str]] = []
    data = load_json(path)
    expected_id = issue_id_from_path(path)
    issue_id = data.get("id")
    if expected_id > 0 and issue_id != expected_id:
        add(findings, "ERROR", f"id 与文件名不一致：文件 issue{expected_id}，内容 id={issue_id}")

    items = data.get("data")
    if not isinstance(items, list) or not items:
        add(findings, "ERROR", "data 必须是非空列表")
        return findings

    for field in ("id", "date", "title", "summary", "insight", "data"):
        if field not in data:
            add(findings, "ERROR", f"缺少期刊字段：{field}")

    for field in PUBLIC_TEXT_FIELDS:
        text = str(data.get(field, ""))
        if any(term in text for term in PRODUCER_TERMS):
            add(findings, "WARN", f"{field} 可能含制作者流程语气")

    category_counts = Counter()
    subcategories: dict[str, set[str]] = defaultdict(set)
    normalized_titles: dict[str, list[tuple[int, str, str]]] = defaultdict(list)
    source_count = 0
    source_url_count = 0
    short_content = []
    missing_summary = 0

    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            add(findings, "ERROR", f"data[{idx}] 不是对象")
            continue

        for field in ITEM_REQUIRED_FIELDS:
            if field not in item:
                add(findings, "ERROR", f"data[{idx}] 缺少字段：{field}")

        category = item.get("category")
        title = str(item.get("title", ""))
        content = str(item.get("content", ""))
        subcategory = item.get("subCategory")

        if category not in ALLOWED_SET:
            add(findings, "ERROR", f"data[{idx}] 未知分类：{category} / {title[:40]}")
        else:
            category_counts[category] += 1
            if subcategory:
                subcategories[category].add(str(subcategory))

        if title:
            normalized_titles[normalize_title(title)].append((idx, str(category), title))
        if len(title) > 80:
            add(findings, "WARN", f"data[{idx}] 标题偏长（{len(title)}字）：{title[:60]}")
        if len(content.strip()) < 30:
            short_content.append((idx, title))
        if "summary" not in item:
            missing_summary += 1
        if item.get("source") or item.get("sourceTitle") or item.get("sourceName"):
            source_count += 1
        if item.get("sourceUrl") or item.get("url"):
            source_url_count += 1

        public_text = " ".join(str(item.get(field, "")) for field in ("title", "summary", "content"))
        if any(term in public_text for term in PRODUCER_TERMS):
            add(findings, "WARN", f"data[{idx}] 可能含制作者流程语气：{title[:40]}")

    highlight_count = sum(1 for item in items if isinstance(item, dict) and item.get("highlight"))
    alert_count = sum(1 for item in items if isinstance(item, dict) and item.get("isAlert"))
    if highlight_count != 1:
        add(findings, "ERROR", f"highlight 数量应为 1，当前为 {highlight_count}")
    if not 4 <= alert_count <= 9:
        add(findings, "WARN", f"isAlert 数量建议 4-9，当前为 {alert_count}")

    for category, count in category_counts.items():
        sub_count = len(subcategories[category])
        if count >= 5 and sub_count < 3:
            add(findings, "WARN", f"{category} subCategory 少于 3 个，当前 {sub_count} 个")

    duplicates = [rows for key, rows in normalized_titles.items() if key and len(rows) > 1]
    for rows in duplicates[:8]:
        add(findings, "WARN", "重复标题：" + " | ".join(f"#{idx} {cat} {title[:24]}" for idx, cat, title in rows))

    if short_content:
        sample = "；".join(f"#{idx} {title[:20]}" for idx, title in short_content[:6])
        add(findings, "WARN", f"正文过短 {len(short_content)} 条：{sample}")

    if missing_summary:
        add(findings, "INFO", f"有 {missing_summary} 条资讯没有 summary 字段，前端会回退显示正文摘要")
    if source_url_count == 0:
        add(findings, "WARN", "本期没有 sourceUrl/url，详情页无法展示原文链接")
    elif source_url_count < len(items):
        add(findings, "INFO", f"仅 {source_url_count}/{len(items)} 条资讯有原文链接")
    if source_count == 0:
        add(findings, "INFO", "本期没有 source/sourceTitle/sourceName，详情页会显示“知行周刊整理”")

    insight = data.get("insight")
    if isinstance(insight, dict):
        for category in ALLOWED_CATEGORIES:
            if category_counts.get(category, 0) == 0:
                continue
            value = insight.get(category)
            if not isinstance(value, dict):
                add(findings, "WARN", f"缺少 {category} 洞察对象")
                continue
            for field in ("risk", "opportunity", "action"):
                text = str(value.get(field, ""))
                if len(text) < 35:
                    add(findings, "WARN", f"{category}.{field} 偏短（{len(text)}字）")
                if any(term in text for term in PRODUCER_TERMS):
                    add(findings, "WARN", f"{category}.{field} 可能含制作者流程语气")
    else:
        add(findings, "ERROR", "insight 必须是对象")

    return findings


def main(argv: list[str]) -> int:
    paths = [Path(arg) for arg in argv] if argv else sorted(ISSUES_DIR.glob("issue*.json"), key=issue_id_from_path)
    total_errors = 0
    total_warnings = 0

    for raw_path in paths:
        path = raw_path if raw_path.is_absolute() else ROOT / raw_path
        try:
            findings = check_issue(path)
        except Exception as exc:  # noqa: BLE001
            findings = [("ERROR", str(exc))]

        errors = [msg for level, msg in findings if level == "ERROR"]
        warnings = [msg for level, msg in findings if level == "WARN"]
        infos = [msg for level, msg in findings if level == "INFO"]
        total_errors += len(errors)
        total_warnings += len(warnings)

        status = "OK" if not errors and not warnings else f"{len(errors)} error, {len(warnings)} warn"
        print(f"\n{path.relative_to(ROOT)}: {status}")
        for level, message in findings[:40]:
            print(f"  [{level}] {message}")
        if len(findings) > 40:
            print(f"  ... 还有 {len(findings) - 40} 条")

    print(f"\n汇总：{total_errors} 个错误，{total_warnings} 个警告")
    return 1 if total_errors else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
