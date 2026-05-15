import asyncio
import json
from typing import Any, Callable

from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse

from databricks_analytics import (
    build_dashboard_summary,
    build_demand_intelligence,
    build_inventory,
    build_regional_performance,
    build_shipments,
)

stream_router = APIRouter()


async def sse_format(data: Any) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def stream_payload(
    builder: Callable[[], Any],
    selector: Callable[[Any], Any] | None = None,
    interval_seconds: int = 30,
):
    while True:
        try:
            payload = await run_in_threadpool(builder)
            if selector is not None:
                payload = selector(payload)
            yield await sse_format(payload)
        except Exception as exc:
            yield await sse_format({"error": str(exc)})
        await asyncio.sleep(interval_seconds)


@stream_router.get("/dashboard")
async def stream_dashboard():
    return StreamingResponse(
        stream_payload(
            build_dashboard_summary,
            lambda payload: {
                "kpiMetrics": payload["kpiMetrics"],
                "activityFeed": payload["activityFeed"],
            },
        ),
        media_type="text/event-stream",
    )


@stream_router.get("/inventory")
async def stream_inventory():
    return StreamingResponse(
        stream_payload(build_inventory, lambda payload: payload["items"]),
        media_type="text/event-stream",
    )


@stream_router.get("/forecasting")
async def stream_forecasting():
    return StreamingResponse(
        stream_payload(
            build_demand_intelligence,
            lambda payload: {"forecastSeries": payload["forecastSeries"]},
        ),
        media_type="text/event-stream",
    )


@stream_router.get("/shipments")
async def stream_shipments():
    return StreamingResponse(
        stream_payload(build_shipments, lambda payload: payload["shipments"]),
        media_type="text/event-stream",
    )


@stream_router.get("/risk")
async def stream_risk():
    return StreamingResponse(
        stream_payload(
            build_regional_performance,
            lambda payload: {"riskMatrix": payload["riskMatrix"]},
        ),
        media_type="text/event-stream",
    )
