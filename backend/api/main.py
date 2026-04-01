from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import physical, epistemic, operational, metrics, analysis
from awsrt_core.io.paths import ensure_data_dirs


def create_app() -> FastAPI:
    ensure_data_dirs()

    app = FastAPI(title="AWSRT API", version="0.1.0", docs_url="/docs", redoc_url="/redoc")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=False,
    )

    @app.get("/health")
    def health():
        return {"ok": True, "version": app.version}

    app.include_router(physical.router, prefix="/physical", tags=["physical"])
    app.include_router(epistemic.router, prefix="/epistemic", tags=["epistemic"])
    app.include_router(operational.router, prefix="/operational", tags=["operational"])
    app.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
    app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])

    return app


app = create_app()
