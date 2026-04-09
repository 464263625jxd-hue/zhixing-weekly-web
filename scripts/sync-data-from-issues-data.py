#!/usr/bin/env python3
"""
部署前运行：根据 issues 目录下的 issue<N>.json 生成根目录 data.json 与 version.json。

data.source.json：人工维护的源数据文件，保留 companies 与静态元信息等内容。

data.json：部署产物，包含 data.source.json + issueIds + _meta.totalIssues +
_meta.totalNews + _meta.updatedAt（并移除 issues）。

version.json：部署产物，version（与 _meta.updatedAt 同步，供前端轮询检测更新）、
issueId（最新期号）、totalIssues、totalNews、buildTime。

用法：python3 scripts/sync-data-from-issues-data.py
工作目录：项目根目录（脚本内解析项目根为 scripts 的上级目录）
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ISSUES_DIR = ROOT / "issues"
SOURCE_DATA_JSON = ROOT / "data.source.json"
DATA_JSON = ROOT / "data.json"
VERSION_JSON = ROOT / "version.json"
FILE_RE = re.compile(r"^issue(\d+)\.json$")


def format_datetime(d: datetime) -> str:
    return d.strftime("%Y-%m-%d %H:%M")


def format_build_time(d: datetime) -> str:
    return d.strftime("%Y-%m-%d %H:%M:%S")


def collect_issue_ids() -> list[int]:
    if not ISSUES_DIR.is_dir():
        raise FileNotFoundError(f"目录不存在: {ISSUES_DIR}")
    ids: list[int] = []
    for name in ISSUES_DIR.iterdir():
        if not name.is_file():
            continue
        m = FILE_RE.match(name.name)
        if m:
            ids.append(int(m.group(1)))
    ids.sort()
    return ids


def load_issue(issue_id: int) -> dict:
    file_path = ISSUES_DIR / f"issue{issue_id}.json"
    try:
        raw = file_path.read_text(encoding="utf-8")
    except OSError as e:
        raise OSError(f"无法读取 {file_path}: {e}") from e
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON 解析失败 {file_path}: {e}") from e


def load_source_data() -> dict:
    if not SOURCE_DATA_JSON.is_file():
        raise FileNotFoundError(f"缺少 {SOURCE_DATA_JSON}")

    try:
        raw = SOURCE_DATA_JSON.read_text(encoding="utf-8")
    except OSError as e:
        raise OSError(f"无法读取 {SOURCE_DATA_JSON}: {e}") from e

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON 解析失败 {SOURCE_DATA_JSON}: {e}") from e

    if not isinstance(data, dict):
        raise ValueError(f"{SOURCE_DATA_JSON} 顶层必须是对象")

    return data


def main() -> None:
    ids_asc = collect_issue_ids()

    total_news = 0
    for i in ids_asc:
        issue = load_issue(i)
        inner_id = issue.get("id")
        if inner_id is not None and int(inner_id) != i:
            print(
                f"警告: issue{i}.json 内 id 为 {inner_id}，与文件名不一致，仍以文件名期数为准。",
                file=sys.stderr,
            )
        n = len(issue["data"]) if isinstance(issue.get("data"), list) else 0
        total_news += n

    data = load_source_data()

    meta = data.setdefault("_meta", {})
    meta["totalIssues"] = len(ids_asc)
    meta["totalNews"] = total_news
    now = datetime.now()
    updated_at = format_datetime(now)
    meta["updatedAt"] = updated_at

    # 与前端约定一致：倒序（新期在前）
    data["issueIds"] = sorted(ids_asc, reverse=True)

    if "issues" in data:
        del data["issues"]

    DATA_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    latest_issue_id = ids_asc[-1] if ids_asc else 0
    version_payload = {
        "version": updated_at,
        "issueId": latest_issue_id,
        "totalIssues": len(ids_asc),
        "totalNews": total_news,
        "buildTime": format_build_time(now),
    }
    VERSION_JSON.write_text(
        json.dumps(version_payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    first = ids_asc[0] if ids_asc else "?"
    last = ids_asc[-1] if ids_asc else "?"
    print(
        f"已更新 data.json 与 version.json：共 {len(ids_asc)} 期（issue{first}-issue{last}），"
        f"资讯条数合计 {total_news}，issueIds 已按数字倒序写入。"
    )


if __name__ == "__main__":
    main()
