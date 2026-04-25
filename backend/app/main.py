from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import onboarding  # import the onboarding router I created
import asyncio

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# This creates your FastAPI application instance
# Think of this as turning the lights on in the kitchen
app = FastAPI(
    title="Pathways API",
    description="Personalised rights navigator for people navigating the UK immigration system",
    version="0.1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS tells backend which frontends are allowed to talk to it
# Without this, the React frontend would be blocked by the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://pathways-app.vercel.app", # update with your actual deployed frontend URL
        "*" # temp
    
    ],  # React dev server address
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(onboarding.router)  # This tells FastAPI to include the endpoints defined in onboarding.py    

# First endpoint — a health check
# Confirms the server is alive
@app.get("/")
def health_check():
    return {"status": "Pathways API is running"}

# Keepalive endpoint — pinged every 14 minutes to prevent cold starts (cause some hosting platforms put your server to sleep after 15 mins of inactivity)
@app.get("/ping")
def ping():
    return {"status": "alive"}