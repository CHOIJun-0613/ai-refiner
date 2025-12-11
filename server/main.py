from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uuid
from database import db
from models import (
    Participant, ParticipantCreate, ParticipantBase,
    Package, PackageCreate,
    Class, ClassCreate,
    DAO, DAOCreate
)

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

@app.get("/api/packages", response_model=List[Package])
def get_packages():
    query = "MATCH (p:Package) RETURN p"
    with db.get_session() as session:
        result = session.run(query)
        packages = []
        for record in result:
            node = record["p"]
            packages.append(Package(
                id=node["id"],
                name=node["name"],
                description=node.get("description"),
                parentId=node.get("parentId")
            ))
        return packages

@app.post("/api/packages", response_model=Package)
def create_package(package: PackageCreate):
    pid = str(uuid.uuid4())
    query = """
    CREATE (p:Package {id: $id, name: $name, description: $description, parentId: $parentId})
    RETURN p
    """
    with db.get_session() as session:
        result = session.run(query, id=pid, name=package.name, description=package.description, parentId=package.parentId)
        record = result.single()
        if record:
             node = record["p"]
             return Package(
                id=node["id"],
                name=node["name"],
                description=node.get("description"),
                parentId=node.get("parentId")
            )
    raise HTTPException(status_code=500, detail="Failed to create package")

@app.get("/api/classes", response_model=List[Class])
def get_classes():
    query = "MATCH (c:Class) RETURN c"
    with db.get_session() as session:
        result = session.run(query)
        classes = []
        for record in result:
            node = record["c"]
            classes.append(Class(
                id=node["id"],
                name=node["name"],
                stereotype=node.get("stereotype"),
                description=node.get("description"),
                packageId=node.get("packageId")
            ))
        return classes

@app.post("/api/classes", response_model=Class)
def create_class(cls: ClassCreate):
    cid = str(uuid.uuid4())
    query = """
    CREATE (c:Class {id: $id, name: $name, stereotype: $stereotype, description: $description, packageId: $packageId})
    RETURN c
    """
    with db.get_session() as session:
        result = session.run(query, id=cid, name=cls.name, stereotype=cls.stereotype, description=cls.description, packageId=cls.packageId)
        record = result.single()
        if record:
             node = record["c"]
             return Class(
                id=node["id"],
                name=node["name"],
                stereotype=node.get("stereotype"),
                description=node.get("description"),
                packageId=node.get("packageId")
            )
    raise HTTPException(status_code=500, detail="Failed to create class")

@app.get("/api/daos", response_model=List[DAO])
def get_daos():
    query = "MATCH (d:DAO) RETURN d"
    with db.get_session() as session:
        result = session.run(query)
        daos = []
        for record in result:
            node = record["d"]
            daos.append(DAO(
                id=node["id"],
                name=node["name"],
                description=node.get("description")
            ))
        return daos

@app.post("/api/daos", response_model=DAO)
def create_dao(dao: DAOCreate):
    did = str(uuid.uuid4())
    query = """
    CREATE (d:DAO {id: $id, name: $name, description: $description})
    RETURN d
    """
    with db.get_session() as session:
        result = session.run(query, id=did, name=dao.name, description=dao.description)
        record = result.single()
        if record:
             node = record["d"]
             return DAO(
                id=node["id"],
                name=node["name"],
                description=node.get("description")
            )
    raise HTTPException(status_code=500, detail="Failed to create DAO")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Sequence Editor Backend"}
