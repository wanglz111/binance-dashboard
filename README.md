# Binance Quant Dashboard

自定义的 Binance 量化账户可视化面板，基于 Next.js 14 + App Router 构建，适配在 Vercel 上无缝部署。界面采用暗色系金融风格，提供资产概览、仓位监控、交易历史及策略分析预览，并预留 AI 分析接口。

## ✨ 主要特性
- **账户总览**：总资产、总盈利、ROI、未实现盈亏、最大盈亏等核心指标，支持实时趋势显示。
- **仓位监控**：表格展示方向、价格、数量、杠杆、保证金与盈亏率，支持 WebSocket 触发刷新。
- **交易历史**：最近交易流水、手续费、已实现盈亏统计，便于复盘策略。
- **分析面板**：内嵌盈亏曲线、胜率、平均盈亏等指标，为后续 AI 辅助分析打基础。
- **Mock 模式**：无账号或调试阶段可使用内置假数据快速预览 UI。

## 🚀 快速开始
1. 安装依赖（首次已安装可跳过）：
   ```bash
   npm install
   ```
2. 复制环境变量模板并根据需要填写：
   ```bash
   cp .env.example .env.local
   ```
3. 启动开发环境：
   ```bash
   npm run dev
   ```
4. 浏览器访问 [http://localhost:3000](http://localhost:3000)。

> 如果尚未准备好接入 Binance，可保持 `DASHBOARD_MOCK_MODE=true` 以使用示例数据。

## 🔐 环境变量说明
| 变量名 | 是否必填 | 说明 |
| --- | --- | --- |
| `BINANCE_API_KEY` | 是（生产） | Binance API Key。仅服务端使用。 |
| `BINANCE_API_SECRET` | 是（生产） | Binance API Secret。仅服务端使用。 |
| `BINANCE_INITIAL_EQUITY` | 是 | 初始本金，用于计算总盈利与收益率。 |
| `BINANCE_ACCOUNT_TYPE` | 否 | 账号类型，默认 `futures`。可换成 `spot`。 |
| `BINANCE_REST_URL` | 否 | REST 基础地址，默认 `https://fapi.binance.com`。 |
| `BINANCE_WS_URL` | 否 | 用户数据流基础地址，默认 `wss://fstream.binance.com`。 |
| `DASHBOARD_MOCK_MODE` | 否 | 设置为 `true` 使用假数据，默认 `false`。 |
| `NEXT_PUBLIC_ENABLE_STREAM` | 否 | 前端是否启用实时 WebSocket（默认 `false`）。 |
| `NEXT_PUBLIC_BINANCE_WS_URL` | 否 | 前端访问的 WS 地址，默认与 `BINANCE_WS_URL` 保持一致。 |
| `NEXT_PUBLIC_DASHBOARD_REFRESH_MS` | 否 | 轮询刷新间隔（毫秒），默认 `30000`。 |

## 🔄 实时数据流
1. 设置 `NEXT_PUBLIC_ENABLE_STREAM=true`。  
2. 确保部署环境里 `BINANCE_API_KEY` / `BINANCE_API_SECRET` 可用，服务端路由会按需创建 listenKey。  
3. 前端自动建立 `wss://.../ws/{listenKey}` 连接，并在 `ACCOUNT_UPDATE`、`ORDER_TRADE_UPDATE` 事件触发时刷新数据。  
4. 定时调用 `PUT /api/binance/listen-key` 维持 listenKey 有效（已内置）。  

若部署在 Vercel，需要将以上变量写入 Project → Settings → Environment Variables，并重新部署。

## 🧱 项目结构核心
```
src/
├─ app/
│  ├─ api/binance/...   # 服务器路由，聚合账户、仓位、交易数据，并提供 listenKey
│  └─ page.tsx          # UI 主页面
├─ components/dashboard # 仪表盘 UI 组件（指标卡、表格、分析面板等）
├─ hooks/use-dashboard-data.ts
│                       # 数据获取与实时更新逻辑（SWR + WebSocket）
├─ lib/binance          # Binance REST 客户端、Mock 服务与数据模型
├─ lib/env.ts           # 环境变量解析与校验
└─ config/dashboard.ts  # 前端可调配置（刷新间隔、WS 地址等）
```

## 🧪 校验
- 代码风格与类型检查：`npm run lint`
- Mock 数据为默认开启，可保证在本地及预览部署阶段顺利演示。

## 🛣️ 后续扩展建议
1. **AI 分析接入**：在 `AnalysisPanel` 预留的按钮中接入自研/第三方模型，输出策略建议或风险提示。
2. **策略回测**：增加历史 equity 曲线、回撤、夏普率等指标。
3. **事件通知**：结合 Webhook/邮件/IM 推送，实现风险阈值告警。
4. **多账号支持**：扩展 API 路由，允许选择不同账户或子账号数据源。

如需在 Vercel 部署，只需确保环境变量齐全并执行关联 Git 仓库，后续代码更新即可自动发布。欢迎根据自身量化需求继续扩展。祝开发顺利！ 🎯
