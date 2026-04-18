from fastapi import APIRouter # 
from app.models.onboarding import UserSituation # import the Pydantic model defined for validating the user's onboarding data

# APIRouter lets us group related endpoints together instead of defining everything in main.py
# Kind of a mini FastAPI app for one specific feature
router = APIRouter(
    prefix="/api/onboarding",  # every endpoint here starts with this
    tags=["Onboarding"]        # groups them neatly in /docs
)

@router.post("/submit")
def submit_situation(data: UserSituation):
    # For now return the data back to confirm validation works
    # Next step, pass this to our AI service
    return {
        "message": "Situation received successfully",
        "received": data
    }