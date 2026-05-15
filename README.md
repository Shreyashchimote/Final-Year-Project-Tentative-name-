# RIMS - Real-Time Inventory Monitoring System

RIMS is a Databricks-backed supply-chain analytics application. The frontend reads live operational dashboards from the FastAPI backend, and the backend queries Databricks Gold tables instead of local mock data.

## Start the app

```bash
bash Final_App/start.sh
```

The startup script launches both services and prints:

- Frontend application: `http://127.0.0.1:8082`
- Backend Databricks health: `http://127.0.0.1:8000/api/databricks-status`
- Backend live JSON sample: `http://127.0.0.1:8000/api/dashboard-summary`

## Documentation

Backend service documentation is maintained component-wise in:

- `Final_App/Backend/README.md`
