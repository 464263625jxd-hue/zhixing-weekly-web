# WeeklyWeb 埋点说明

本文档记录 Zechariah（`@zecharich/Tracking`）相关配置与 Yard 参数，便于联调与排查。前端脚本见 `js/zechariah-tracking.umd.js`，页面入口为 `index.html`。

---

## 测试环境 Yard 关键参数

| 参数名 | 值 | 说明 |
|--------|-----|------|
| `yard_name` | `weekly-web` | Yard 名称，与 Zechariah 后台/创建接口约定一致 |
| `yard_id` | `33` | Yard 数字 ID |
| `report_key` | `96111436-2ee1-45c2-9dd6-4cf126738de0` | 测试环境上报使用值；对应请求里的查询参数 `yard-report-key` |

## 正式环境 Yard 关键参数

| 参数名 | 值 | 说明 |
|--------|-----|------|
| `yard_name` | `weekly-web` | Yard 名称，与 Zechariah 后台/创建接口约定一致 |
| `yard_id` | `9` | Yard 数字 ID |
| `report_key` | `367b6bc0-31eb-4f39-89e0-3cd89426e9c6` | 正式环境上报使用值；对应请求里的查询参数 `yard-report-key` |

前端 `@zecharich/Tracking` 的 `yardKeyTest` / `yardKeyProd` 应填对应环境的上报 key；当前 `index.html` 已直接写入测试与正式 `report_key`。

> **安全提示**：密钥类信息若需提交到公开仓库，建议改为仅内网文档或 CI 注入；正式环境密钥请勿与测试环境混用。

---

## 与前端 `eventTrack.init` 的对应关系

浏览器端将 **`report_key`** 作为 **`yard-report-key`** 拼进上报 URL，例如：

```text
测试上报：POST https://zechariah.test.leqeegroup.com/api/report/report-yard-event?yard-report-key=<report_key>
```

`index.html` 内直接配置 **`yardKeyTest`**、**`yardKeyProd`**（均为对应环境的 **`report_key`**），并调用 `eventTrack.init`；插件根据 **`isProd`** 选用对应 key。

- **`isProd`**：当前页 URL 字符串中包含 `xue.leqeegroup.com`（即正式学域）时为 `true`，否则为 `false`（走测试 key）。
- **`yardKeyTest`**：测试环境上报 key。
- **`yardKeyProd`**：正式环境上报 key。

**`globalConfig`**：从浏览器 Cookie 读取并随每次埋点带上：

| 字段 | Cookie 名 |
|------|-----------|
| `username` | `username` |
| `displayName` | `displayName` |

若与 Zechariah 报表侧约定使用 `core_user_name` / `display_name` 等字段名，需在代码或网关中自行对齐。

---

## 与 Cookie 自动初始化的关系

页面脚本已手动 `init` 时，请勿再为 `yardKeyTest` / `yardKeyProd` 设置同名 Cookie，以免重复初始化。

---

## Hash 路由与 `event-tracking` 内置监听

官方 `setupRouteListener` 曾仅在 **`location.hash` 非空** 时注册 `hashchange`，首屏为 `index.html` 无 hash 时会导致后续 SPA 改 hash **无法触发「路由_变动」**。本仓库已在本地的 `js/zechariah-tracking.umd.js` 中改为 **始终注册 `hashchange`**。若你从 npm / 内网包升级 SDK，请确认合并了相同修复，或同步维护 `js/` 下副本。

---

## 变更记录

| 日期 | 说明 |
|------|------|
| 2026-03-23 | 初稿，记录测试环境 `yard_name` / `yard_id` / `yard_secret` |
| 2026-03-23 | 简化 `index.html`：`isProd` 依据 URL 含 `xue.leqeegroup.com`；`globalConfig` 从 Cookie `username` / `displayName` 读取 |
| 2026-03-23 | 明确埋点使用 **`report_key`**（非 `yard_secret`），测试 `report_key` 写入文档与 `yardKeyTest` |
| 2026-03-23 | 说明 Hash SPA 依赖 `hashchange` 全量注册；`js/zechariah-tracking.umd.js` 内已修复，升级 SDK 时需对齐 |
| 2026-03-26 | 出于安全原因移除仓库内 `yard_secret` 明文；保留 `report_key` 并在 `index.html` 中直接配置 `yardKeyTest`、`yardKeyProd` |
