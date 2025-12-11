from neo4j import GraphDatabase
from config import settings

class Neo4jConnection:
    def __init__(self):
        self.driver = None

    def connect(self):
        if self.driver is None:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )

    def close(self):
        if self.driver is not None:
            self.driver.close()
            self.driver = None

    def get_session(self):
        if self.driver is None:
            self.connect()
        return self.driver.session()

db = Neo4jConnection()
