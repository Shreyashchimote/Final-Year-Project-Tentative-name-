# Backend Service Documentation

This backend powers the RIMS dashboard with live Databricks Gold-layer data. It exposes FastAPI JSON endpoints for the frontend, optional server-sent event streams for live refresh flows, and optional AI/RAG endpoints for document questions.

## Service Overview

The backend has three responsibilities:

- Connect securely to Databricks SQL using environment variables.
- Transform Gold table rows into frontend-ready dashboard contracts.
- Serve analytics, streaming, health, document, and AI routes from one FastAPI app.

The frontend should never call Databricks directly. It calls this backend through `VITE_API_BASE_URL`, and the backend owns credentials, SQL queries, response shaping, and error handling.

## Runtime

Use the repository startup script from the project root:

```bash
bash Final_App/start.sh
```

The script creates the backend virtual environment when needed, installs dependencies, starts FastAPI on port `8000`, verifies Databricks connectivity, then starts the frontend on port `8082`.

Direct backend startup is also supported:

```bash
cd Final_App/Backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Interactive API docs are available while the server is running:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Environment Configuration

Secrets live in `Final_App/Backend/.env`. Keep this file local and do not commit real tokens.

Required Databricks values:

```env
DATABRICKS_SERVER_HOSTNAME=adb-xxxxxxxxxxxxxxxx.x.azuredatabricks.net
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your_warehouse_id
DATABRICKS_ACCESS_TOKEN=dapi_your_databricks_pat_here
DATABRICKS_CATALOG=main
DATABRICKS_SCHEMA=default
DATABRICKS_CACHE_TTL_SECONDS=300
```

`DATABRICKS_WAREHOUSE_ID` can be used instead of `DATABRICKS_HTTP_PATH`; the client converts it into `/sql/1.0/warehouses/<warehouse_id>`.

Optional table overrides:

```env
DATABRICKS_GOLD_SALES_TABLE=gold_sales_ml_clean
DATABRICKS_GOLD_INVENTORY_TABLE=gold_inventory_features
DATABRICKS_GOLD_DELIVERY_TABLE=gold_delivery_features
```

Optional AI/RAG values:

```env
HF_API_TOKEN=hf_your_token_here
HF_MODEL_ID=deepseek-ai/DeepSeek-V4-Pro
FRONTEND_ORIGINS=http://localhost:8082,http://127.0.0.1:8082
```

## Component Map

### `main.py`

FastAPI application entry point.

Responsibilities:

- Loads `.env` values using `python-dotenv`.
- Configures CORS from `FRONTEND_ORIGINS`.
- Loads `AIHandler` and `RAGHandler` only when AI or document routes need them.
- Registers the streaming router under `/api/stream`.
- Registers the Databricks analytics router.
- Exposes health, AI query, document upload, document status, and document clearing routes.

Routes:

- `GET /` returns API health and points to the Databricks status endpoint.
- `POST /query` answers a question with optional RAG context.
- `POST /upload-documents` indexes `.txt` and `.md` files into Chroma.
- `GET /documents-status` returns vector-store state.
- `DELETE /clear-documents` clears the vector-store collection.

### `databricks_client.py`

Databricks SQL connection and query utility.

Responsibilities:

- Reads Databricks host, warehouse path, token, catalog, schema, and cache TTL.
- Normalizes hostnames by removing protocol prefixes.
- Builds the HTTP path from `DATABRICKS_WAREHOUSE_ID` when needed.
- Validates required settings and raises `DatabricksConfigError` for missing config.
- Safely qualifies table names as `catalog.schema.table`.
- Executes SQL through `databricks-sql-connector`.
- Converts Databricks values such as `Decimal`, `date`, and `datetime` into JSON-safe values.
- Caches query results in memory by cache key for the configured TTL.

Error types:

- `DatabricksConfigError` means local configuration is incomplete or invalid.
- `DatabricksQueryError` means Databricks rejected or failed a query.

### `databricks_analytics.py`

Analytics service layer and API router.

Responsibilities:

- Defines the `/api/*` analytics endpoints used by the frontend.
- Builds SQL against the configured Gold tables.
- Converts raw SQL aggregates into UI-friendly objects.
- Runs Databricks work in a threadpool so the async FastAPI event loop stays responsive.
- Converts Databricks config failures to HTTP `503`.
- Converts Databricks query failures to HTTP `502`.

Default Gold tables:

- Sales: `main.default.gold_sales_ml_clean`
- Inventory: `main.default.gold_inventory_features`
- Delivery: `main.default.gold_delivery_features`

Analytics builders:

- `build_dashboard_summary()` combines KPI cards, activity feed, AI-style insights, autonomous decisions, warehouse utilization, and shipment stats.
- `build_monthly_logistics()` creates month-by-month delivered, in-transit, delayed, at-risk, and returned slices.
- `build_demand_intelligence()` creates forecast series, inventory history, accuracy KPIs, model confidence, and scenarios.
- `build_inventory()` returns inventory rows and stock status history.
- `build_shipments()` returns the latest shipment rows, shipment stats, and daily shipment volume.
- `build_regional_performance()` returns risk matrix, risk trend, regional performance, and summary counts.
- `build_revenue_trends()` returns monthly revenue, profit, and order volume.

### `sendData.py`

Server-sent event streaming layer.

Responsibilities:

- Reuses the Databricks analytics builders instead of keeping mock streaming data.
- Emits JSON payloads in SSE format.
- Refreshes each stream every 30 seconds by default.
- Sends an error payload in the stream if a builder fails.

Streaming routes:

- `GET /api/stream/dashboard`
- `GET /api/stream/inventory`
- `GET /api/stream/forecasting`
- `GET /api/stream/shipments`
- `GET /api/stream/risk`

### `ai_handler.py`

Optional Hugging Face assistant layer.

Responsibilities:

- Initializes a Hugging Face `InferenceClient` when `HF_API_TOKEN` is present.
- Generates responses for `/query`.
- Formats RAG context into the prompt when document retrieval is enabled.
- Calculates a simple confidence score from retrieval similarity.
- Falls back to a clear local response when the Hugging Face token or client is unavailable.
- Loads lazily so dashboard routes can start without waiting on Hugging Face.

This component is optional for dashboard operation. Databricks analytics endpoints do not depend on Hugging Face.

### `rag_handler.py`

Optional document retrieval layer.

Responsibilities:

- Uses Chroma as a persistent vector store.
- Uses `all-MiniLM-L6-v2` sentence embeddings.
- Adds uploaded document chunks to the `documents` collection.
- Retrieves top-k related documents for `/query`.
- Reports vector-store status and clears stored documents when requested.
- Loads lazily so Databricks dashboard routes can start even when the embedding model is not available locally.

Generated vector data lives in `Final_App/Backend/chroma_db` and should not be committed.

### `requirements.txt`

Production dependency list for the backend.

Key packages:

- `fastapi` and `uvicorn` for the API server.
- `python-dotenv` for environment loading.
- `databricks-sql-connector` for Databricks SQL warehouse access.
- `chromadb` and `sentence-transformers` for RAG document retrieval.
- `huggingface-hub` for optional AI responses.

## Analytics API Reference

### `GET /api/databricks-status`

Purpose: Lightweight Databricks health check.

Returns:

```json
{
  "status": "connected"
}
```

### `GET /api/dashboard-summary`

Purpose: Main dashboard landing payload.

Returns:

- `kpiMetrics`: headline KPI cards.
- `activityFeed`: latest operational signals.
- `aiInsights`: derived risk and opportunity summaries.
- `autonomousDecisions`: replenishment-style recommendations.
- `warehouseUtilization`: store or warehouse utilization proxy.
- `shipmentStats`: shipment totals and exception counts.

### `GET /api/monthly-logistics`

Purpose: Logistics performance by month.

Returns:

- `monthOrder`: ordered month ids.
- `byMonth`: per-month slices for delivered, in transit, delayed, at risk, and returned.

### `GET /api/demand-intelligence`

Purpose: Forecasting and inventory intelligence page.

Returns:

- `forecastSeries`: actual, forecast, upper, and lower forecast values.
- `inventoryHistory`: monthly healthy, low, critical, and overstock counts.
- `accuracy`: forecast accuracy percentage.
- `kpiStrip`: compact KPI cards.
- `modelConfidence`: model/signal confidence cards.
- `scenarios`: baseline, high-demand, and inventory-stress scenarios.

### `GET /api/regional-performance`

Purpose: Risk and regional performance page.

Returns:

- `riskMatrix`: probability, impact, and exposure by risk category.
- `riskTrend`: weekly delivery-risk trend.
- `regions`: region-level orders, on-time delivery, revenue, and profit.
- `summary`: high exposure, network risk, anomalies, resolved, and reviewing counts.

### `GET /api/revenue-trends`

Purpose: Revenue trend chart data.

Returns:

- `trends`: monthly revenue, profit, and order count.

### `GET /api/inventory`

Purpose: Inventory table and inventory health history.

Returns:

- `items`: latest product-store stock records with status and days of cover.
- `history`: monthly inventory status counts.

### `GET /api/shipments`

Purpose: Shipment tracking page.

Returns:

- `shipments`: latest 100 shipment rows.
- `stats`: shipment, on-time, delayed, and at-risk totals.
- `volume`: recent daily shipment volume.

## Data Contract Notes

The backend returns camelCase fields because the frontend components consume camelCase props. SQL aliases may use snake_case internally, but builders translate them before returning JSON.

Stock status is derived in the backend:

- `Critical`: stock is below 80 percent of reorder point.
- `Low`: stock is below reorder point.
- `Overstock`: stock is above twice reorder point.
- `Healthy`: stock is inside the expected range.

Risk and confidence values are normalized to a `0` to `100` range before being returned.

## Error Behavior

Databricks endpoints use these status codes:

- `200`: request succeeded.
- `502`: Databricks query failed.
- `503`: Databricks configuration is missing or invalid.

Document and AI endpoints return `500` for unexpected handler failures and `400` when document upload receives no supported files.

## Security Notes

- Keep `.env` local and out of Git.
- Do not place Databricks tokens in frontend files.
- Rotate Databricks personal access tokens if they are exposed.
- Prefer a scoped Databricks token or service principal for shared deployments.
- Keep CORS restricted through `FRONTEND_ORIGINS` when deploying outside local development.

## Troubleshooting

If the app says Databricks is not connected:

- Check `DATABRICKS_SERVER_HOSTNAME`.
- Check `DATABRICKS_HTTP_PATH` or `DATABRICKS_WAREHOUSE_ID`.
- Check that `DATABRICKS_ACCESS_TOKEN` is active.
- Confirm the SQL warehouse is running.
- Visit `http://127.0.0.1:8000/api/databricks-status`.

If a dashboard route returns a query error:

- Confirm the configured catalog and schema exist.
- Confirm the Gold tables are present.
- Confirm table overrides match the actual table names.
- Check whether required columns exist in the Gold tables.

If the frontend loads but data is empty:

- Confirm the frontend is using `VITE_API_BASE_URL=http://127.0.0.1:8000`.
- Open `http://127.0.0.1:8000/api/dashboard-summary` and check the raw JSON.
- Restart with `bash Final_App/start.sh` so both services use the same environment.
