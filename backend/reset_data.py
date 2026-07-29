"""One-off: wipe all business data (keeps admin users). Run: python reset_data.py"""
import asyncio, os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")


async def main():
    c = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = c[os.environ["DB_NAME"]]
    out = {}
    for coll in ("clients", "contracts", "payments", "sessions", "leads", "events"):
        res = await db[coll].delete_many({})
        out[coll] = res.deleted_count
    print("Wiped:", out)
    users = await db.users.count_documents({})
    print(f"Kept {users} admin user(s).")
    c.close()


if __name__ == "__main__":
    asyncio.run(main())
