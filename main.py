import os
import uuid
from datetime import datetime

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from supabase import create_client, Client
from groq import Groq

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase URL or anon key in env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

VEDASTRO_API_BASE = "https://api.vedastro.org/api"

app = FastAPI(title="Vedic Astro API (Supabase + Groq)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PersonDetails(BaseModel):
    name: str
    place: str
    time: str  # HH:MM
    day: str   # DD
    month: str # MM
    year: str  # YYYY
    timezone: str  # e.g., +01:00

class MatchRequest(BaseModel):
    user1_id: str
    user2_id: str

class AskRequest(BaseModel):
    question: str

def check_resp(resp):
    status_code = getattr(resp, "status_code", None)
    if status_code is not None and status_code >= 400:
        msg = "Supabase error"
        try:
            err_json = resp.response.json()
            if isinstance(err_json, dict) and "message" in err_json:
                msg = err_json["message"]
        except Exception:
            pass
        raise HTTPException(status_code=status_code, detail=msg)

    if resp.data is None:
        raise HTTPException(status_code=500, detail="Supabase returned no data")

def get_record(table: str, key: str, value: str):
    resp = supabase.table(table).select("*").eq(key, value).single().execute()

    status_code = getattr(resp, "status_code", None)
    if status_code is not None and status_code >= 400:
        msg = "Supabase error"
        raw_resp = getattr(resp, "response", None)
        if raw_resp is not None:
            try:
                err_json = raw_resp.json()
                if isinstance(err_json, dict) and "message" in err_json:
                    msg = err_json["message"]
            except Exception:
                pass
        raise HTTPException(status_code=status_code, detail=msg)

    if resp.data is None:
        raise HTTPException(status_code=404, detail=f"{table[:-1].title()} not found")

    return resp.data


@app.post("/register_user")
async def register_user(details: PersonDetails):
    user_id = str(uuid.uuid4())
    payload = details.dict()
    payload["id"] = user_id

    resp = supabase.table("users").insert(payload).execute()
    check_resp(resp)

    return {"message": "User registered successfully", "user_id": user_id}

@app.get("/get_user/{user_id}")
async def get_user(user_id: str):
    return get_record("users", "id", user_id)

@app.post("/generate_chart/{user_id}")
async def generate_chart(user_id: str):
    user = get_record("users", "id", user_id)
    url = (
        f"{VEDASTRO_API_BASE}/Calculate/SouthIndianChart/"
        f"Location/{user['place']}/Time/{user['time']}/"
        f"{user['day']}/{user['month']}/{user['year']}/{user['timezone']}/"
        "ChartType/BhavaChalit/Ayanamsa/RAMAN"
    )
    r = requests.get(url)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="VedAstro error")

    svg = r.text
    chart_id = str(uuid.uuid4())
    insert_resp = supabase.table("astro_data").insert({
        "id": chart_id,
        "user_id": user_id,
        "svg_chart": svg
    }).execute()
    check_resp(insert_resp)

    return Response(content=r.content, media_type="image/svg+xml")

@app.post("/match_compatibility")
async def match_compatibility(body: MatchRequest):
    u1 = get_record("users", "id", body.user1_id)
    u2 = get_record("users", "id", body.user2_id)

    url = (
        f"{VEDASTRO_API_BASE}/Calculate/MatchReport/"
        f"Location/{u1['place']}/Time/{u1['time']}/"
        f"{u1['day']}/{u1['month']}/{u1['year']}/{u1['timezone']}/"
        f"Location/{u2['place']}/Time/{u2['time']}/"
        f"{u2['day']}/{u2['month']}/{u2['year']}/{u2['timezone']}/"
        "Ayanamsa/LAHIRI"
    )
    r = requests.get(url)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="VedAstro error")

    report = r.text
    insert_resp = supabase.table("compatibility_checks").insert({
        "id": str(uuid.uuid4()),
        "user1_id": body.user1_id,
        "user2_id": body.user2_id,
        "result": report,
        "timestamp": datetime.utcnow().isoformat()
    }).execute()
    check_resp(insert_resp)

    return {"match_report": report}

@app.post("/daily_horoscope/{user_id}")
async def generate_daily_horoscope(user_id: str):
    user = get_record("users", "id", user_id)

    prompt = (
        f"Generate a short and insightful daily horoscope for {user['name']}, "
        f"born on {user['day']}-{user['month']}-{user['year']} at {user['time']} "
        f"in {user['place']}. Use professional astrologer tone."
    )
    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
        )
        text = res.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    insert_resp = supabase.table("user_queries").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "question": "daily_horoscope",
        "response": text,
        "timestamp": datetime.utcnow().isoformat()
    }).execute()
    check_resp(insert_resp)

    return {"daily_horoscope": text}

@app.post("/personalized_insights/{user_id}")
async def generate_personalized_insights(user_id: str):
    user = get_record("users", "id", user_id)
    time_str = f"{user['time']}/{user['day']}/{user['month']}/{user['year']}/{user['timezone']}"
    loc = user["place"]

    def fetch(endpoint):
        r = requests.get(f"{VEDASTRO_API_BASE}/{endpoint}")
        if not r.ok:
            raise HTTPException(status_code=502, detail=f"VedAstro {endpoint} failed")
        return r.json()

    planet_data = fetch(f"Calculate/AllPlanetData/PlanetName/All/Location/{loc}/Time/{time_str}/Ayanamsa/RAMAN")
    house_data  = fetch(f"Calculate/AllHouseData/HouseName/All/Location/{loc}/Time/{time_str}/Ayanamsa/RAMAN")

    minimal_planets = {
        name: {
            "House": p.get("HousePlanetOccupiesBasedOnSign"),
            "IsBenefic": p.get("IsPlanetBenefic"),
            "Conjunct": p.get("PlanetsInConjunction", []),
        }
        for entry in planet_data.get("Payload", {}).get("AllPlanetData", [])
        for name, p in entry.items()
    }
    minimal_houses = {
        hn: {
            "Lord": hd.get("LordOfHouse", {}).get("Name"),
            "Sign": hd.get("HouseRasiSign", {}).get("Name")
        }
        for entry in house_data.get("Payload", {}).get("AllHouseData", [])
        for hn, hd in entry.items()
    }

    prompt = (
        f"You are a professional Vedic astrologer. Generate a simple, personalized insight for "
        f"{user['name']} (DOB: {user['day']}-{user['month']}-{user['year']} at {user['time']}), "
        f"with planetary data {minimal_planets} and house data {minimal_houses}."
    )
    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
        )
        insight = res.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    insert_resp = supabase.table("user_queries").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "question": "personalized_insights",
        "response": insight,
        "timestamp": datetime.utcnow().isoformat()
    }).execute()
    check_resp(insert_resp)

    return JSONResponse(content={"personalized_insight": insight})

@app.post("/ask_astrologer/{user_id}")
async def ask_astrologer(user_id: str, chat: AskRequest):
    user = get_record("users", "id", user_id)

    system = (
        f"User Info:\nName: {user['name']}\n"
        f"DOB: {user['day']}-{user['month']}-{user['year']} at {user['time']}\n"
        f"Place: {user['place']} ({user['timezone']})\n"
        "You are a professional Vedic astrologer."
    )
    prompt = f"{system}\n\nQuestion: \"{chat.question}\"\nAnswer:"

    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
        )
        ans = res.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    insert_resp = supabase.table("user_queries").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "question": chat.question,
        "response": ans,
        "timestamp": datetime.utcnow().isoformat()
    }).execute()
    check_resp(insert_resp)

    return JSONResponse(content={"answer": ans})
