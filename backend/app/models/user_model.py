from typing import Optional
from difflib import SequenceMatcher

from passlib.hash import bcrypt
from app.db import db


FP_SIMILARITY_THRESHOLD = 0.72  # fingerprints must be at least 72% similar


def _fp_similarity(a: str, b: str) -> float:
    """Return similarity ratio between two fingerprint strings (0.0 – 1.0)."""
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    return SequenceMatcher(None, a, b).ratio()


async def create_user(username: str, password: Optional[str]) -> dict:
    existing = await db.users.find_one({"username": username})
    if existing:
        raise ValueError("user_exists")
    hashed = None
    if password is not None:
        hashed = bcrypt.hash(password)
    doc = {"username": username, "password": hashed, "fingerprint": None}
    await db.users.insert_one(doc)
    return {"username": username}


async def get_user(username: str) -> Optional[dict]:
    return await db.users.find_one({"username": username})


async def verify_user_password(username: str, password: str) -> bool:
    user = await get_user(username)
    if not user:
        return False
    stored = user.get("password")
    if stored is None:
        return False
    try:
        return bcrypt.verify(password, stored)
    except Exception:
        return False


async def add_fingerprint(username: str, fingerprint_data: str):
    res = await db.users.update_one({"username": username}, {"$set": {"fingerprint": fingerprint_data}})
    if res.matched_count == 0:
        raise ValueError("no_user")


async def verify_fingerprint(username: str, fingerprint_data: str) -> bool:
    user = await get_user(username)
    if not user:
        return False
    stored = user.get("fingerprint")
    if stored is None:
        return False
    score = _fp_similarity(stored, fingerprint_data)
    print(f"[FP] verify '{username}': similarity={score:.2f} threshold={FP_SIMILARITY_THRESHOLD}")
    return score >= FP_SIMILARITY_THRESHOLD


async def get_user_by_fingerprint(fingerprint_data: str) -> Optional[dict]:
    """Find the best-matching user whose stored fingerprint is similar enough."""
    all_users = await db.users.find({"fingerprint": {"$ne": None}})
    best_user = None
    best_score = 0.0
    for user in all_users:
        stored = user.get("fingerprint") or ""
        score = _fp_similarity(stored, fingerprint_data)
        if score > best_score:
            best_score = score
            best_user = user
    print(f"[FP] login scan: best_score={best_score:.2f} threshold={FP_SIMILARITY_THRESHOLD} user={best_user.get('username') if best_user else None}")
    return best_user if best_score >= FP_SIMILARITY_THRESHOLD else None
