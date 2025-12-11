from pydantic import BaseModel
from typing import List, Optional, Any
from uuid import UUID, uuid4

class MethodBase(BaseModel):
    name: str
    logicalName: Optional[str] = None
    returnType: str = "void"
    parameters: List[Any] = []

class MethodCreate(MethodBase):
    pass

class Method(MethodBase):
    id: str

class ParticipantBase(BaseModel):
    name: str
    logicalName: Optional[str] = None

class ParticipantCreate(ParticipantBase):
    pass

class Participant(ParticipantBase):
    id: str
    methods: List[Method] = []
