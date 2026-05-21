from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.routes.health import router as health_router


app = FastAPI(
    title="${{ values.service_name }}",
    description="${{ values.description }}",
    version="0.1.0",
)

# Auto-instrument with Prometheus metrics
Instrumentator().instrument(app).expose(app)


@app.get("/", tags=["service"])
def service_info():
    return {
        "service": "${{ values.service_name }}",
        "status": "running",
        "version": "0.1.0",
    }


app.include_router(health_router)
