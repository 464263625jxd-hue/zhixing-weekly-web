# 频道快讯工作流

频道快讯是知行周刊首页的实时阅读入口，面向读者展示平台、跨境、产业、品牌、AI 与科技商业动态。后台通过 `zhixing-weekly-live-radar` 聚合层统一调用来源 skill；当前来源为 `ebrun-original-news` 和 `36kr-hotlist`。前台允许展示“亿邦动力 / 36氪”等来源分组，禁止展示 skill、Codex、额度、素材池、制作者流程等后台信息。

## 文件结构

```text
liveRadar/
  latest.json              # 首页读取的最新频道快讯

sources/
  live-radar-sources.json  # 来源组、频道、更新频率、额度策略和后台来源说明

scripts/
  update-live-radar.py     # 快讯聚合脚本，调用来源 skill 并输出统一 JSON
```

后续如需要保留历史快照，可增加：

```text
liveRadar/archive/YYYY-MM-DD-HH.json
```

## 前台原则

- 页面只使用读者语言：频道快讯、实时情报、需关注、查看原文。
- 不出现 Codex、额度、素材池、周刊候选、制作者流程等后台词。
- 不直接出现外部来源站品牌；外部能力只作为后台抓取和整理能力。
- 每条快讯尽量保留 `sourceUrl`，方便读者打开原文。

## 每日轻量更新

默认每天 10:15 执行一次轻量更新：

1. 调用 `scripts/update-live-radar.py`。
2. 脚本内部调用 `ebrun-original-news/scripts/fetch_news.py` 获取亿邦动力 6 个频道内容。
3. 脚本内部调用 `36kr-hotlist/scripts/fetch_hotlist.py` 获取 36 氪 24 小时热榜。
4. 将每个来源写入 `sourceGroups`，并在来源内做二次频道归类与标签标记。
5. 同时输出兼容旧前端的扁平 `channels` 字段。
6. 如内容有变化，提交 `liveRadar/latest.json` 并同步 GitLab / GitHub Pages。

## 来源扩展

新增来源时不要重写前端结构：

1. 在 `sources/live-radar-sources.json` 增加新的 `sourceGroups` 配置。
2. 在 `scripts/update-live-radar.py` 增加一个来源 adapter，输出 `{ id, name, description, channels }`。
3. 每个 `channel.items` 保持统一字段：`id/sourceId/sourceName/channelId/channelName/title/summary/publishedAt/sourceDate/sourceUrl/tags/isAlert/weeklyCandidate`。
4. 前端会自动根据 `sourceGroups` 展示来源切换和频道切换。

## 周刊整合

每周生成正式 `issues/issueXX.json` 时，可读取 `liveRadar/latest.json` 和历史快照作为补充来源。频道快讯只能作为候选输入，正式周刊仍需按现有质量规则重新去重、分类、补来源、判断 `highlight/isAlert`，并运行质量检查。

## 额度注意

当前使用 GPT Plus / Codex 额度时，不建议做深度分析。若发现更新消耗过大，立即切换为降级方案：

- 每天只更新 1 次；
- 保留两个来源但减少每个来源的保留条数；
- 每次只保留标题、链接、频道、日期，不生成长摘要；
- 周刊大更新时再做集中整理。
