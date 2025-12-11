from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uuid
from database import db
from models import Participant, ParticipantCreate, ParticipantBase

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_client():
    db.connect()

@app.on_event("shutdown")
def shutdown_db_client():
    db.close()

@app.get("/api/participants", response_model=List[Participant])
def get_participants():
    query = "MATCH (p:Participant) RETURN p"
    with db.get_session() as session:
        result = session.run(query)
        participants = []
        for record in result:
            node = record["p"]
            # 최소한의 매핑, 실제 앱에서는 적절한 변환 필요
            participants.append(Participant(
                id=node["id"],
                name=node["name"],
                logicalName=node.get("logicalName")
            ))
        return participants

@app.post("/api/participants", response_model=Participant)
def create_participant(participant: ParticipantCreate):
    pid = str(uuid.uuid4())
    query = """
    CREATE (p:Participant {id: $id, name: $name, logicalName: $logicalName})
    RETURN p
    """
    with db.get_session() as session:
        result = session.run(query, id=pid, name=participant.name, logicalName=participant.logicalName)
        record = result.single()
        if record:
             node = record["p"]
             return Participant(
                id=node["id"],
                name=node["name"],
                logicalName=node.get("logicalName")
            )
    raise HTTPException(status_code=500, detail="Failed to create participant")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Sequence Editor Backend"}
