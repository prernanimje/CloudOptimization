"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.orm import Session
import logging

# Local imports
from .database import init_db, get_db
from .config import APP_TITLE, APP_VERSION, FRONTEND_URL, DEBUG
from .routes import instances, upload, analysis, health, metrics, auth

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Cloud Cost Optimization Dashboard API"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "*"])

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup"""
    logger.info("🚀 Starting Cloud Optimization Dashboard...")
    try:
        init_db()
        logger.info("✅ Database initialized successfully")
        
        # Start Real-Time Simulation Engine
        from .services.simulation import simulation_engine
        simulation_engine.start()
        logger.info("✅ Simulation Engine started")
        
    except Exception as e:
        logger.error(f"⚠️  Database initialization warning: {str(e)}")
        logger.info("Continuing without database. API will fail until database is available.")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("🛑 Shutting down application...")
    from .services.simulation import simulation_engine
    simulation_engine.stop()


# ============ ROUTES ============

# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API is running"""
    return {
        "message": "Cloud Cost Optimization Dashboard API",
        "status": "running",
        "version": APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "api"}


# Include routers
app.include_router(instances.router, prefix="/api", tags=["Instances"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(metrics.router, prefix="/api", tags=["Metrics"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])


# ============ ERROR HANDLERS ============

from fastapi import HTTPException
from starlette.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status": "error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=DEBUG)
