import os
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialise Supabase client using environment variables
# This connects our backend to the Supabase database
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

router = APIRouter(
    prefix="/api/plans",
    tags=["Plans"]
)

# Schema for saving a plan
class SavePlanRequest(BaseModel):
    plan_text: str
    language: str

@router.post("/save")
def save_plan(data: SavePlanRequest):
    """
    Saves an action plan to Supabase and returns a unique ID.
    The frontend uses this ID to generate a shareable URL.
    """
    try:
        # Generate a unique ID for this plan
        # uuid4 generates a random universally unique identifier
        # We take the first 8 characters to keep the URL short
        plan_id = str(uuid.uuid4())[:8]

        # Insert the plan into the Supabase plans table
        response = supabase.table("plans").insert({
            "id": plan_id,
            "plan_text": data.plan_text,
            "language": data.language,
        }).execute()

        return {
            "id": plan_id,
            "message": "Plan saved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save plan: {str(e)}"
        )

@router.get("/{plan_id}")
def get_plan(plan_id: str):
    """
    Fetches a saved plan by its ID.
    Called when someone opens a shared plan URL.
    """
    try:
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()

        # If no rows returned the plan doesn't exist
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Plan not found"
            )

        plan = response.data[0]
        return {
            "id": plan["id"],
            "plan_text": plan["plan_text"],
            "language": plan["language"],
            "created_at": plan["created_at"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch plan: {str(e)}"
        )