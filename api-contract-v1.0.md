# API 接口契约 v1.0

## 总览

| Item | Value |
|------|-------|
| Base URL | `https://{api-gateway-id}.execute-api.ap-southeast-1.amazonaws.com/prod` |
| Auth | AWS Cognito JWT Bearer token |
| Tenant isolation | `tenant_id` extracted from JWT; all queries scoped |
| Content type | `application/json` |
| Polling interval (live) | 10 seconds |
| CORS | Enabled for `*` during development |

### 认证

所有请求必须在 `Authorization` 请求头中携带有效的 JWT：

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

后端 Lambda 从 Token 中提取 `tenant_id` 和 `cognito:groups`（Free / Premium）。已认证用户无需额外 API Key。

---

## A. 实时模拟接口

以下接口提供由 Data Simulator Lambda 生成的模拟船舶位置数据，存储于 DynamoDB `LiveState` 表中。

---

### A1. GET /api/live/vessels

返回模拟中所有活跃船舶。

**查询参数：**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `bbox` | string | No | — | Bounding box filter: `min_lat,min_lng,max_lat,max_lng` |
| `vessel_type` | string | No | — | Filter by type: `cargo`, `tanker`, `passenger`, `tug`, `bunker` |
| `limit` | int | No | 200 | Max vessels returned (1–500) |

**Response `200 OK`:**

```json
{
  "timestamp": "2026-03-19T14:30:00Z",
  "count": 3,
  "vessels": [
    {
      "mmsi": "354499000",
      "vessel_name": "MSC ESTHI",
      "imo": "IMO9304411",
      "callsign": "3EFU3",
      "vessel_type": "cargo",
      "vessel_type_code": 70,
      "lat": 1.2145,
      "lng": 103.8821,
      "sog": 12.3,
      "cog": 87.5,
      "heading": 89,
      "status": "underway",
      "length": 336.0,
      "width": 45.0,
      "draft": 15.0,
      "destination": "SGSIN",
      "updated_at": "2026-03-19T14:29:55Z"
    },
    {
      "mmsi": "219028420",
      "vessel_name": "TORM CORRIDO",
      "imo": "IMO9411305",
      "callsign": "OZNT2",
      "vessel_type": "tanker",
      "vessel_type_code": 89,
      "lat": 1.1832,
      "lng": 103.7456,
      "sog": 0.1,
      "cog": 0.0,
      "heading": 247,
      "status": "anchored",
      "length": 182.0,
      "width": 32.0,
      "draft": 10.8,
      "destination": "SGSIN",
      "updated_at": "2026-03-19T14:29:51Z"
    },
    {
      "mmsi": "311000966",
      "vessel_name": "KYDON",
      "imo": "IMO8916607",
      "callsign": "C6EP8",
      "vessel_type": "passenger",
      "vessel_type_code": 60,
      "lat": 1.2634,
      "lng": 104.0312,
      "sog": 4.7,
      "cog": 315.2,
      "heading": 312,
      "status": "maneuvering",
      "length": 192.0,
      "width": 27.0,
      "draft": 6.4,
      "destination": "SGSIN",
      "updated_at": "2026-03-19T14:29:58Z"
    }
  ]
}
```

**Vessel `status` enum values:**

| Status | SOG range | Description |
|--------|-----------|-------------|
| `anchored` | < 0.5 kn | At anchorage, minimal movement |
| `maneuvering` | 0.5 – 5 kn | Entering/exiting port |
| `underway` | 5 – 15 kn | Normal cruising |
| `fast` | > 15 kn | High-speed transit |

**Vessel `vessel_type` enum values:**

| Type | Description | Approximate fleet share (SG) |
|------|-------------|------------------------------|
| `cargo` | Container + general cargo | ~24% |
| `tanker` | Oil and chemical tankers | ~20% |
| `bunker` | Bunker barges | ~21% |
| `tug` | Harbour tugs | ~5% |
| `passenger` | Ferries and cruise ships | ~8% |
| `other` | Miscellaneous | ~22% |

---

**实现说明 — `bbox` 过滤策略：**

由于 DynamoDB 原生不支持高效的二维地理空间查询，本系统采用"全量读取 + 内存过滤"策略：Lambda 先通过 `tenant_id` 分区键一次性 Query 出该租户下的所有活跃船舶（数百艘量级，远低于 DynamoDB 单次 Query 的 1MB 上限），然后在 Python 内存中对 `lat`/`lng` 做简单的 `if` 条件过滤。在数据量 < 10,000 条时性能良好，规避 DynamoDB 的空间查询短板。

---

### A2. GET /api/live/vessels/{mmsi}

返回单艘船舶的详细信息。

**Response `200 OK`:**

```json
{
  "mmsi": "354499000",
  "vessel_name": "MSC ESTHI",
  "imo": "IMO9304411",
  "callsign": "3EFU3",
  "vessel_type": "cargo",
  "vessel_type_code": 70,
  "lat": 1.2145,
  "lng": 103.8821,
  "sog": 12.3,
  "cog": 87.5,
  "heading": 89,
  "status": "underway",
  "length": 336.0,
  "width": 45.0,
  "draft": 15.0,
  "destination": "SGSIN",
  "updated_at": "2026-03-19T14:29:55Z",
  "track": [
    { "lat": 1.2100, "lng": 103.8600, "sog": 12.1, "ts": "2026-03-19T14:20:00Z" },
    { "lat": 1.2115, "lng": 103.8680, "sog": 12.4, "ts": "2026-03-19T14:25:00Z" },
    { "lat": 1.2145, "lng": 103.8821, "sog": 12.3, "ts": "2026-03-19T14:30:00Z" }
  ]
}
```

`track` 数组包含最近 10 个历史位置（约 5 分钟的轨迹）。Member 3 可用此数据在地图上绘制船尾轨迹线。

**Response `404 Not Found`:**

```json
{
  "error": "vessel_not_found",
  "message": "No active vessel with MMSI 999999999"
}
```

---

### A3. GET /api/live/heatmap *（可选增强功能）*

返回预聚合的船舶密度网格，用于港口拥堵可视化。由 Heatmap Batching Lambda 每 60 秒聚合一次，存储于 DynamoDB `HeatmapAggregates` 表中。


**Response `200 OK`:**

```json
{
  "timestamp": "2026-03-19T14:30:00Z",
  "grid_resolution_deg": 0.01,
  "bbox": {
    "min_lat": 1.10,
    "min_lng": 103.60,
    "max_lat": 1.38,
    "max_lng": 104.10
  },
  "cells": [
    { "lat": 1.21, "lng": 103.88, "vessel_count": 12, "avg_sog": 8.7 },
    { "lat": 1.22, "lng": 103.88, "vessel_count": 8, "avg_sog": 5.2 },
    { "lat": 1.18, "lng": 103.74, "vessel_count": 15, "avg_sog": 0.3 },
    { "lat": 1.19, "lng": 103.95, "vessel_count": 6, "avg_sog": 11.1 }
  ]
}
```

每个网格单元覆盖 0.01° × 0.01° 区域（在新加坡纬度约为 1.1 km × 1.1 km）。仅返回 `vessel_count > 0` 的非空单元。

---

## B. 历史分析接口

以下接口提供来自新加坡海事及港务管理局 (MPA) 的真实公开数据（data.gov.sg），存储于 S3 数据湖中。数据为只读，按月更新。

---

### B1. GET /api/historical/cargo/total

月度货物总吞吐量。

**Query parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `from` | string | No | `2020-01` | Start month (YYYY-MM) |
| `to` | string | No | latest | End month (YYYY-MM) |

**Response `200 OK`:**

```json
{
  "unit": "thousand_tonnes",
  "source": "MPA via data.gov.sg",
  "data": [
    { "month": "2025-11", "cargo_throughput": 50563.31 },
    { "month": "2025-12", "cargo_throughput": 50839.82 },
    { "month": "2026-01", "cargo_throughput": 55266.91 }
  ]
}
```

**Data characteristics:**

| Field | Description |
|-------|-------------|
| `cargo_throughput` | Total cargo in thousand tonnes |
| Coverage | Jan 1995 – Jan 2026 (373 months) |
| Nulls | 0% |

---

### B2. GET /api/historical/cargo/breakdown

按货物类型分类的月度货物吞吐量。

**Query parameters:** Same as B1 (`from`, `to`).

**Response `200 OK`:**

```json
{
  "unit": "thousand_tonnes",
  "source": "MPA via data.gov.sg",
  "categories": {
    "primary": ["General Cargo", "Bulk Cargo"],
    "secondary": ["Containerised", "Conventional", "Oil", "Non-Oil Bulk"]
  },
  "data": [
    {
      "month": "2026-01",
      "breakdown": [
        { "primary": "General Cargo", "secondary": "Containerised", "throughput": 31628.63 },
        { "primary": "General Cargo", "secondary": "Conventional",  "throughput": 3704.80 },
        { "primary": "Bulk Cargo",    "secondary": "Oil",           "throughput": 16341.36 },
        { "primary": "Bulk Cargo",    "secondary": "Non-Oil Bulk",  "throughput": 3592.13 }
      ]
    }
  ]
}
```

**Category hierarchy (fixed — always 4 rows per month):**

```
General Cargo
├── Containerised   (~57% of total, dominant)
└── Conventional    (~7%)
Bulk Cargo
├── Oil             (~30%)
└── Non-Oil Bulk    (~6%)
```

---

### B3. GET /api/historical/container

月度集装箱吞吐量（TEU 标准箱）。

**Query parameters:** Same as B1 (`from`, `to`).

**Response `200 OK`:**

```json
{
  "unit": "thousand_TEUs",
  "source": "MPA via data.gov.sg",
  "data": [
    { "month": "2025-11", "container_throughput": 3705.04 },
    { "month": "2025-12", "container_throughput": 3919.00 },
    { "month": "2026-01", "container_throughput": 3892.37 }
  ]
}
```

**前端注意：** 集装箱 TEU 和货物吞吐量（Containerised 千吨）衡量的是不同维度（体积 vs 重量）。两者比值约为 1 TEU ≈ 8 千吨。可使用双 Y 轴图表同时展示。

---

### B4. GET /api/historical/vessel-calls

按到港目的分类的月度船舶靠泊次数。

**Query parameters:** Same as B1 (`from`, `to`), plus:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `purpose` | string | No | all | Filter: `Cargo`, `Repairs`, `Bunkers`, `Supplies`, `Others` |

**Response `200 OK`:**

```json
{
  "unit_calls": "count",
  "unit_tonnage": "thousand_GT",
  "source": "MPA via data.gov.sg",
  "data": [
    {
      "month": "2026-01",
      "by_purpose": [
        { "purpose": "Cargo",    "vessel_calls": 4314,  "gross_tonnage": 119289.11 },
        { "purpose": "Repairs",  "vessel_calls": 102,   "gross_tonnage": 538.40 },
        { "purpose": "Bunkers",  "vessel_calls": 3778,  "gross_tonnage": 210383.37 },
        { "purpose": "Supplies", "vessel_calls": 2448,  "gross_tonnage": 115882.23 },
        { "purpose": "Others",   "vessel_calls": 7264,  "gross_tonnage": 142766.47 }
      ]
    }
  ]
}
```

**到港目的类型（固定结构 — 每月始终 5 行）：**

| Purpose | Typical share (calls) | Typical share (GT) | Notes |
|---------|----------------------|---------------------|-------|
| Others | ~40% | ~24% | Largest by count, smallest vessels |
| Cargo | ~24% | ~20% | Commercial freight |
| Bunkers | ~21% | ~36% | Largest by tonnage |
| Supplies | ~14% | ~19% | Provisioning |
| Repairs | ~1% | ~1% | Drydock / maintenance |

---

## C. 统一错误响应格式

所有接口使用一致的错误返回格式：

```json
{
  "error": "error_code",
  "message": "Human-readable description"
}
```

| HTTP Status | Error Code | Cause |
|-------------|-----------|-------|
| 400 | `invalid_params` | Malformed query params (bad date, out-of-range bbox) |
| 401 | `unauthorized` | Missing or expired JWT token |
| 403 | `forbidden` | Tenant does not have access (Premium-only endpoint) |
| 404 | `not_found` | Resource does not exist (e.g. unknown MMSI) |
| 429 | `rate_limited` | Too many requests (API Gateway throttle) |
| 500 | `internal_error` | Lambda execution failure |

---

## D. 数据层映射

各接口对应的 AWS 资源关系（供 Member 2 参考）：

```
Polling (10s)
  │
  ▼
API Gateway (/api/*)
  │
  ├── /api/live/*      →  Lambda (API Handler)  →  DynamoDB (LiveState)
  │                                              →  DynamoDB (HeatmapAggregates)
  │
  └── /api/historical/* →  Lambda (API Handler)  →  S3 Data Lake (CSV files)
```

| Endpoint group | DynamoDB Table | S3 Path | Partition key |
|---------------|----------------|---------|---------------|
| A1, A2 | `LiveState` | — | `tenant_id#mmsi` |
| A3 | `HeatmapAggregates` | — | `grid_cell` |
| B1 | — | `s3://datalake/historical/cargo_total.csv` | — |
| B2 | — | `s3://datalake/historical/cargo_breakdown.csv` | — |
| B3 | — | `s3://datalake/historical/container.csv` | — |
| B4 | — | `s3://datalake/historical/vessel_calls.csv` | — |

---

## E. Mock Server 使用说明

### 启动
```bash
npm install -g json-server
json-server --watch mock-data.json --port 8080
```

### Mock 阶段可用接口

| 接口 | Mock URL | 上线后真实 URL |
|------|----------|---------------|
| 实时船舶列表 | `/api_live_vessels` | `/api/live/vessels` |
| 实时热力图 | `/api_live_heatmap` | `/api/live/heatmap` |
| 货物总吞吐量 | `/api_historical_cargo_total` | `/api/historical/cargo/total` |
| 货物分类吞吐量 | `/api_historical_cargo_breakdown` | `/api/historical/cargo/breakdown` |
| 集装箱吞吐量 | `/api_historical_container` | `/api/historical/container` |
| 船舶靠泊统计 | `/api_historical_vessel_calls` | `/api/historical/vessel-calls` |

### 注意事项

- Mock 阶段查询参数（`?from=2025-01`）不生效，返回完整数据集
- 单船详情无法直接路由，前端可从 vessels 数组中 `find()` 匹配 mmsi
- 对接真实后端时，将 URL 路径从下划线格式切换为斜杠格式即可


---

## F. 变更日志

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-03-19 | WANG CONGTANG | Initial contract — all endpoints locked |

---
