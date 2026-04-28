import os
from dotenv import load_dotenv
from app.models.onboarding import UserSituation
from google import genai

# Or use vertexai=True for Google Cloud Vertex AI


# Load variables from our .env file into the environment
load_dotenv()

# Configure the Gemini client with our API key
# os.getenv reads a variable from the environment safely
# If the key is missing it returns None rather than crashing immediately
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# This function takes the user's situation and generates a detailed prompt using prompt engineering best practices. The better the prompt, the better the output.
def build_prompt(situation: UserSituation) -> str:
    return f"""
    You are a specialist UK immigration and welfare rights adviser.
    Your job is to generate a clear, accurate, personalised action plan
    for a vulnerable person navigating the UK system for the first time.

    IMPORTANT LANGUAGE INSTRUCTION:
    You must write the ENTIRE response in {situation.preferred_language}.
    Do not mix languages. Do not add translations in brackets.
    If preferred_language is "english", write in plain simple English.
    Every section title, every sentence, every word must be in {situation.preferred_language} only.

    Here is the person's situation:
    - Immigration status: {situation.visa_status}
    - Claimed asylum before March 2 2026: {situation.claim_date_before_march_2026}
    - Country of origin: {situation.country_of_origin}
    - Years in UK: {situation.years_in_uk}
    - Has children: {situation.has_children}
    - Is unaccompanied minor: {situation.is_unaccompanied_minor}
    - Currently employed: {situation.is_employed}
    - No Recourse to Public Funds (NRPF): {situation.has_nrpf}
    - Currently in asylum accommodation: {situation.currently_in_asylum_accommodation}
    - English level: {situation.english_level}
    - Preferred language: {situation.preferred_language}
    - Additional notes: {situation.additional_notes}

    Generate a personalised action plan with EXACTLY this structure.
    Use these exact section markers so the frontend can parse them:

     [SECTION:STATUS]
    Start with a warm, reassuring opening sentence.
    Then explain in plain simple language what their current immigration
    status means for their daily life and rights right now.
    Keep this focused on giving them context and confidence — not alarm.
    [/SECTION]

    [SECTION:ENTITLEMENTS]
    This is the good news section. List everything they can currently access.
    
    Use this exact format for each entitlement — do NOT use sub-bullets or
    nested lists. Each entitlement should be its own clearly separated item:

    Benefit or service name: Plain explanation of what it is and who qualifies.
    Where to access: specific URL or organisation name.

    Leave a blank line between each entitlement so they are clearly separated.
    Cover: benefits, housing, healthcare, work rights, education, legal aid.
    Do NOT list things they are barred from due to their status or NRPF.
    [/SECTION]

    [SECTION:ACTIONS]
    This is their personalised to-do list. Number each action.
    For each action:
    - State clearly what they need to do
    - Explain briefly WHY it matters for their specific situation
    - Tell them exactly WHERE to do it — include the specific GOV.UK page,
      phone number, or organisation. For example:
      "Apply at gov.uk/universal-credit"
      "Call the Refugee Council helpline on 0808 196 7272"
      "Visit your local Jobcentre Plus — find yours at gov.uk/contact-jobcentre-plus"
    Order actions by urgency — most important first.
    Be specific. Generic advice like "seek legal help" is not enough —
    tell them exactly where to get it.
    [/SECTION]

    [SECTION:NEXT]
    Look 1 to 6 months ahead. Give them a sense of direction and hope.
    Include specific next applications, milestones, or goals they can work toward.
    Where relevant, include links or organisations that can help them get there.
    End with a warm, encouraging closing sentence.
    [/SECTION]

    [SECTION:TIMELINE]
    List every concrete deadline or time-sensitive milestone for this person.
    Use ONLY this exact format for each item, one per line:
    DEADLINE:timeframe|description|urgency

    Where:
    - timeframe is something like "28 days", "3 months", "12 months", "30 months"
    - description is a single plain sentence of what needs to happen, maximum 10 words
    - urgency is exactly one of: critical, warning, info

    Use critical for deadlines within 30 days.
    Use warning for deadlines within 3 months.
    Use info for anything beyond 3 months.

    If there are no concrete deadlines, write: NO_DEADLINES
    [/SECTION]

    CRITICAL UK POLICY RULES AS OF APRIL 2026 - APPLY THESE ACCURATELY:

    PRE-MARCH 2 2026 ASYLUM CLAIMS:
    - If granted refugee status: 5 years leave to remain
    - Work permission available after 12 months waiting, any occupation
    - Family reunion rights exist
    - Settlement pathway is shorter

    POST-MARCH 2 2026 ASYLUM CLAIMS (core protection):
    - If granted protection: only 30 months leave, then mandatory review
    - At review, if country deemed safe, expected to return
    - Work permission only in RQF level 6+ occupations (degree level jobs only)
    - No automatic family reunion
    - Settlement requires 20 years in UK
    - Unaccompanied children are exempt - still get 5 years

    WORK RIGHTS FOR ASYLUM SEEKERS (still waiting for decision):
    - Cannot work by default
    - After 12 months waiting with no decision through no fault of their own:
      can apply for Permission to Work
    - From 26 March 2026: work only permitted in RQF level 6+ occupations
    - Self employment is prohibited
    - Volunteering is allowed and encouraged
    - Illegal working from 27 March 2026 is grounds for losing accommodation and support

    VISA BRAKE - BANNED NATIONALITIES:
    - Afghanistan, Cameroon, Myanmar and Sudan: banned from Student visas
    - Afghanistan: also banned from Skilled Worker visas
    - Apply this when country_of_origin matches these nationalities

    Write in plain simple language. No legal jargon. 
    Be warm, clear and reassuring.
    Base everything strictly on current UK law and policy as of April 2026.
    """

# Core function of entire app — takes the user's situation and returns an action plan
# Could experiment with other models later for better quality or more features (e.g. images, longer responses) but for now I am happy with it
"""def generate_action_plan(situation: UserSituation) -> str:
    #Takes a validated UserSituation and returns a personalised action plan.
    #This is the core function of the entire application.
    prompt = build_prompt(situation)
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash', # gemini-2.5-flash is free tier, fast, and high quality
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        raise"""

def generate_action_plan(situation: UserSituation) -> str:
    prompt = build_prompt(situation)

    # Try models in order — if one fails, try the next
    # This makes the app resilient to individual model quota exhaustion
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            print(f"Trying model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            print(f"Success with model: {model_name}")
            return response.text
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            last_error = e
            continue

    # All models failed
    raise last_error