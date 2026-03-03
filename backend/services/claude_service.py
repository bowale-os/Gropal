import json
import google.generativeai as genai
from config import settings

_configured = False


def _get_model(model_name: str = "gemini-2.0-flash") -> genai.GenerativeModel:
    global _configured
    if not _configured:
        genai.configure(api_key=settings.gemini_api_key)
        _configured = True
    return genai.GenerativeModel(model_name)


FALLBACK_ASK = (
    "I'm having a bit of trouble connecting right now. "
    "Try asking again in a moment — I'll be ready."
)

FALLBACK_ALTERNATIVES = [
    {
        "id": "A",
        "label": "Downgrade Option",
        "description": "Consider a less expensive option in the same category that meets the core need.",
        "goal_impact_months": 2.0,
        "monthly_cost": None,
        "action": "downgrade",
        "emoji": "🅰️",
    },
    {
        "id": "B",
        "label": "Delay + Save Route",
        "description": "Save for 3–5 months before making this purchase. Your goals stay on track.",
        "goal_impact_months": 0.5,
        "monthly_cost": 300.0,
        "action": "save_first",
        "emoji": "🅱️",
    },
    {
        "id": "C",
        "label": "Restructure Route",
        "description": "Redirect funds from a lower-priority goal temporarily to cover this purchase.",
        "goal_impact_months": 3.0,
        "monthly_cost": None,
        "action": "restructure",
        "emoji": "🅾️",
    },
]


def _demo_answer(user_profile: dict, message: str) -> str | None:
    """
    Hard-coded Q&A for demo so Ask Fort still works
    even if the LLM API key is missing or failing.
    """
    text = (message or "").lower()
    stage = user_profile.get("stage") or "Credit Builder"
    top_risk = user_profile.get("top_risk") or "high credit utilization"
    income = user_profile.get("income_monthly") or 3200

    if "how am i doing" in text:
        return (
            f"Big picture: you're in the {stage} stage with about ${income:,.0f} coming in each month. "
            f"Your top risk is {top_risk}, but you’ve already started moving money toward your goals — "
            "stay consistent and you’ll see real progress over the next 3–6 months."
        )

    if "can i afford this" in text or "afford this" in text:
        return (
            "Rule of thumb: if this pushes your budget above ~30% of take-home on non-essentials, "
            "it probably slows your main goals down. Try capping this purchase at one week of free cash "
            "and sending the rest toward your top goal instead."
        )

    if "pay off debt" in text or "pay off my debt" in text or "credit card" in text:
        return (
            "Focus on your highest-interest card first. Keep making minimums on everything else, "
            "then add any extra cash to that one card until it’s gone. Once it’s paid off, roll the "
            "same payment into the next card so your momentum keeps compounding."
        )

    if "top risk" in text or "biggest risk" in text:
        return (
            f"Right now your biggest risk is {top_risk}. That’s what’s most likely to slow your goals "
            "down if life throws a curveball, so we’ll keep surfacing habits and Tap Checks that chip away at it."
        )

    if "next stage" in text or "level up" in text or "xp" in text:
        return (
            "To hit your next stage, stack small wins: complete your daily builds, say yes to Tap Check pauses "
            "when a purchase isn’t aligned, and keep at least one automatic contribution flowing into your top goal."
        )

    return None


def ask(user_profile: dict, message: str, history: list) -> str:
    # First, try demo Q&A so the product works offline / without an API key.
    demo = _demo_answer(user_profile, message)
    if demo is not None:
        return demo

    try:
        model = _get_model()
        system_prompt = f"""You are Fort, FortiFi's AI financial advisor for young adults aged 18-25.
User profile: {json.dumps(user_profile)}

Rules:
- Respond conversationally in plain language — no jargon
- Always tie advice to their specific goals and numbers
- Never give generic tips — use their actual data
- Keep responses under 100 words unless a simulation is requested
- Be encouraging and non-judgmental
- If they ask about affordability, calculate it from their profile
- If asked for a simulation, show before/after numbers clearly"""

        chat_history = []
        for msg in history[-10:]:
            role = "user" if msg.get("role") == "user" else "model"
            chat_history.append({"role": role, "parts": [msg.get("content", "")]})

        chat = model.start_chat(history=chat_history)
        response = chat.send_message(f"{system_prompt}\n\nUser: {message}")
        return response.text
    except Exception as e:
        print(f"Gemini ask error: {e}")
        return FALLBACK_ASK


def generate_alternatives(user_profile: dict, amount: float, category: str) -> list[dict]:
    try:
        model = _get_model()
        prompt = f"""You generate financial alternatives as JSON only.
No preamble. No explanation. No markdown. Return only a valid JSON array.

User profile: {json.dumps(user_profile)}
The user wants to spend ${amount} on {category}.
Generate exactly 3 alternatives as a JSON array.
Each object must have: id (A/B/C), label, description, goal_impact_months (number), monthly_cost (number or null), action, emoji.
Use their actual income, goals, and monthly contributions. Real specific numbers only.
goal_impact_months should be LESS than the original purchase impact to show improvement."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.split("```")[0]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini alternatives error: {e}")
        return FALLBACK_ALTERNATIVES


def assign_stage_via_claude(financial_profile: dict) -> dict | None:
    try:
        model = _get_model()
        prompt = f"""Given this financial profile: {json.dumps(financial_profile)}
Assign a stage from: Income Initiate, Credit Builder, Stability Architect, Wealth Foundation Builder, Independent Operator.
Return JSON only, no markdown: {{"stage": "...", "top_risk": "...", "risk_level": "low|moderate|high|critical", "stress_test_summary": "...", "recommended_goal": "..."}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.split("```")[0]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini stage error: {e}")
        return None


def parse_suggested_actions(response_text: str) -> list[dict]:
    actions = []
    keywords = {
        "contribute": {"label": "Apply to GPS", "action": "recalculate_goals"},
        "pay": {"label": "Log this payment", "action": "log_payment"},
        "save": {"label": "Set a savings goal", "action": "add_goal"},
        "set a limit": {"label": "Set spending limit", "action": "set_limit"},
        "limit": {"label": "Set spending limit", "action": "set_limit"},
    }
    lower = response_text.lower()
    seen = set()
    for keyword, action in keywords.items():
        if keyword in lower and action["action"] not in seen:
            actions.append(action)
            seen.add(action["action"])
    return actions[:2]
