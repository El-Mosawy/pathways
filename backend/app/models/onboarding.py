from pydantic import BaseModel # Pydantic ensures that the data received from the user matches the expected format. It will auto validate and reject requests that don't match the model we define.
from typing import Optional # basically let's the field either be a value or None. It doesn't have to be filled in.
# Need Optional since users won't always know every detail about their situation
from enum import Enum # Enums restrict a field to only specific allowed values. This prevents typos and makes the data consistent

""" Initial onboarding model
# This defines exactly what the app expects from the user
# Pydantic will automatically reject any request that doesn't match this shape
class UserSituation(BaseModel):
    visa_status: str          # e.g. "refugee", "asylum_seeker", "work_visa"
    years_in_uk: float        # e.g. 0.5 for 6 months, 2 for 2 years
    has_children: bool        # True or False
    is_employed: bool         # True or False
    preferred_language: str   # e.g. "arabic", "french", "english"
    additional_notes: Optional[str] = None  # doesn't have to be included 
"""

class VisaStatus(str, Enum):
    asylum_seeker = "asylum_seeker"           # claim pending, no decision yet
    core_protection = "core_protection"        # new 30-month refugee status (post March 2026)
    refugee_five_year = "refugee_five_year"    # old 5-year refugee status (pre March 2026)
    humanitarian_protection = "humanitarian_protection"
    eu_pre_settled = "eu_pre_settled"          # EU citizens, limited public funds access
    eu_settled = "eu_settled"                  # EU citizens, full access
    skilled_worker = "skilled_worker"          # work visa, NRPF applies
    student_visa = "student_visa"              # very limited rights
    family_visa = "family_visa"                # NRPF usually applies
    undocumented = "undocumented"              # no status, most vulnerable
    other = "other"

class EnglishLevel(str, Enum):
    none = "none"
    basic = "basic"           # A1/A2
    intermediate = "intermediate"  # B1
    upper_intermediate = "upper_intermediate"  # B2 - new threshold for many visas
    fluent = "fluent"         # C1/C2

class UserSituation(BaseModel):
    # Core status fields
    visa_status: VisaStatus
    claim_date_before_march_2026: Optional[bool] = None  # critical for asylum seekers (Optional since meaningless for student visa holders, etc)
    country_of_origin: str                # affects which visa routes are available
    years_in_uk: float                    # e.g. 0.5 for 6 months
    
    # Family situation
    has_children: bool
    is_unaccompanied_minor: bool = False  # exempt from new 30-month rule
    
    # Financial and work situation
    is_employed: bool
    has_nrpf: Optional[bool] = None       # No Recourse to Public Funds condition
    
    # Language
    preferred_language: str               # language for their action plan
    english_level: EnglishLevel           # affects which routes and jobs are available
    
    # Housing
    currently_in_asylum_accommodation: Optional[bool] = None  # triggers move-on period advice since users will soon need to find their own housing
    
    # Open field for anything we haven't captured
    additional_notes: Optional[str] = None