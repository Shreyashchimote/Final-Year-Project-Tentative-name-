from __future__ import annotations

import os
import time
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any

try:
    from databricks import sql as databricks_sql
except ImportError:  # pragma: no cover - exercised only when dependency is absent
    databricks_sql = None


class DatabricksConfigError(RuntimeError):
    """Raised when the Databricks connection is not configured."""


class DatabricksQueryError(RuntimeError):
    """Raised when Databricks rejects or fails a query."""


@dataclass(frozen=True)
class DatabricksSettings:
    server_hostname: str
    http_path: str
    access_token: str
    catalog: str
    schema: str
    cache_ttl_seconds: int

    @classmethod
    def from_env(cls) -> "DatabricksSettings":
        hostname = (
            os.getenv("DATABRICKS_SERVER_HOSTNAME")
            or os.getenv("DATABRICKS_HOST")
            or ""
        ).strip()
        hostname = hostname.replace("https://", "").replace("http://", "").rstrip("/")

        http_path = (
            os.getenv("DATABRICKS_HTTP_PATH")
            or os.getenv("DATABRICKS_WAREHOUSE_HTTP_PATH")
            or ""
        ).strip()
        warehouse_id = os.getenv("DATABRICKS_WAREHOUSE_ID", "").strip()
        if not http_path and warehouse_id:
            http_path = f"/sql/1.0/warehouses/{warehouse_id}"

        access_token = (
            os.getenv("DATABRICKS_ACCESS_TOKEN")
            or os.getenv("DATABRICKS_TOKEN")
            or os.getenv("DATABRICKS_PAT")
            or ""
        ).strip()

        missing = []
        if not hostname:
            missing.append("DATABRICKS_SERVER_HOSTNAME")
        if not http_path:
            missing.append("DATABRICKS_HTTP_PATH or DATABRICKS_WAREHOUSE_ID")
        if not access_token:
            missing.append("DATABRICKS_ACCESS_TOKEN")
        if missing:
            raise DatabricksConfigError(
                "Missing Databricks configuration: " + ", ".join(missing)
            )

        return cls(
            server_hostname=hostname,
            http_path=http_path,
            access_token=access_token,
            catalog=os.getenv("DATABRICKS_CATALOG", "main").strip() or "main",
            schema=os.getenv("DATABRICKS_SCHEMA", "default").strip() or "default",
            cache_ttl_seconds=int(os.getenv("DATABRICKS_CACHE_TTL_SECONDS", "300")),
        )


def normalize_databricks_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        if value == value.to_integral_value():
            return int(value)
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


class DatabricksSQLClient:
    def __init__(self, settings: DatabricksSettings | None = None):
        self.settings = settings or DatabricksSettings.from_env()
        self._cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}

    def table(self, table_name: str) -> str:
        """Return a safely qualified table name for the configured catalog/schema."""
        parts = table_name.split(".")
        if not all(part.replace("_", "").isalnum() for part in parts):
            raise DatabricksConfigError(f"Invalid table name: {table_name}")
        if len(parts) == 3:
            return table_name
        if len(parts) == 2:
            return f"{self.settings.catalog}.{table_name}"
        return f"{self.settings.catalog}.{self.settings.schema}.{table_name}"

    def query(
        self,
        statement: str,
        *,
        cache_key: str | None = None,
        ttl_seconds: int | None = None,
    ) -> list[dict[str, Any]]:
        if databricks_sql is None:
            raise DatabricksConfigError(
                "databricks-sql-connector is not installed. Run pip install -r requirements.txt."
            )

        ttl = self.settings.cache_ttl_seconds if ttl_seconds is None else ttl_seconds
        key = cache_key or statement
        cached = self._cache.get(key)
        now = time.time()
        if cached and now - cached[0] < ttl:
            return cached[1]

        try:
            with databricks_sql.connect(
                server_hostname=self.settings.server_hostname,
                http_path=self.settings.http_path,
                access_token=self.settings.access_token,
                catalog=self.settings.catalog,
                schema=self.settings.schema,
            ) as connection:
                with connection.cursor() as cursor:
                    cursor.execute(statement)
                    description = cursor.description or []
                    columns = [col[0] for col in description]
                    rows = cursor.fetchall()
        except Exception as exc:  # pragma: no cover - depends on remote Databricks
            raise DatabricksQueryError(str(exc)) from exc

        result = [
            {
                columns[index]: normalize_databricks_value(value)
                for index, value in enumerate(row)
            }
            for row in rows
        ]
        self._cache[key] = (now, result)
        return result


_client: DatabricksSQLClient | None = None


def get_databricks_client() -> DatabricksSQLClient:
    global _client
    if _client is None:
        _client = DatabricksSQLClient()
    return _client
