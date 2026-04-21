from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import onboarding  # import the onboarding router I created

# This creates your FastAPI application instance
# Think of this as turning the lights on in the kitchen
app = FastAPI(
    title="Pathways API",
    description="Personalised rights navigator for vulnerable people in the UK",
    version="0.1.0"
)

# CORS tells backend which frontends are allowed to talk to it
# Without this, the React frontend would be blocked by the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server address
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

 