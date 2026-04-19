from fastapi import APIRouter # 
from app.models.onboarding import UserSituation # import the Pydantic model defined for validating the user's onboarding data
from app.services.ai_service import generate_action_plan # import the function that will call the AI to generate the action plan
from fastapi import HTTPException # for returning proper HTTP errors if something goes wrong with the AI


# APIRouter lets us group related endpoints together instead of defining everything in main.py
# Kind of a mini FastAPI app for one specific feature
router = APIRouter(
    prefix="/api/onboarding",  # every endpoint here starts with this
    tags=["Onboarding"]        # groups them neatly in /docs
)

"""
Initial router function to test validation — just returns the data back to confirm it works

@router.post("/submit")
def submit_situation(data: UserSituation):
    # For now return the data back to confirm validation works
    # Next step, pass this to our AI service
    return {
        "message": "Situation received successfully",
        "received": data
    }"""

# This is the endpoint that will receive the user's situation data from the frontend
# FastAPI will read the HTTP method and the URL path of the incoming data to determine which function to run
@router.post("/submit")
def submit_situation(data: UserSituation):
    # Pass the validated data to our AI service
    # The route doesn't know how the AI works, it just calls the service
    try: # try means run this block, if anything goes wrong, jump to the except block instead of crashing the server
        action_plan = generate_action_plan(data)
        return {
            "message": "Action plan created successfully",
            "action_plan": action_plan
        }
    except Exception as e:
        # If something goes wrong with the AI call, return a proper HTTP error
        # 500 = "something went wrong on the server"
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
