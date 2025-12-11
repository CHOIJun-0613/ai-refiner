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

class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    parentId: Optional[str] = None

class PackageCreate(PackageBase):
    pass

class Package(PackageBase):
    id: str
    children: List['Package'] = []
    classes: List['Class'] = []

class ClassBase(BaseModel):
    name: str
    stereotype: Optional[str] = None # e.g., "interface", "abstract"
    description: Optional[str] = None
    packageId: Optional[str] = None

class ClassCreate(ClassBase):
    pass

class Class(ClassBase):
    id: str
    methods: List[Method] = []
    attributes: List[str] = [] # Simplified for now

class DAOBase(BaseModel):
    name: str
    description: Optional[str] = None

class DAOCreate(DAOBase):
    pass

class DAO(DAOBase):
    id: str
    queries: List[str] = []
