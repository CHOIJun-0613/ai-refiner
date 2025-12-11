# AI Refiner (Web Sequence Editor)

이 프로젝트는 웹 기반의 시퀀스 다이어그램 에디터입니다. 사용자는 시퀀스 다이어그램을 작성, 편집하고 저장할 수 있으며, PDF나 SVG로 내보낼 수 있습니다. 백엔드는 FastAPI와 Neo4j를 사용하여 데이터를 관리합니다.

## 기술 스택 (Tech Stack)

### Frontend
- **Framework:** React 19, Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Diagramming:** Mermaid.js
- **Utilities:** html2canvas, jspdf

### Backend
- **Framework:** FastAPI
- **Language:** Python
- **Database:** Neo4j (Graph Database)

## 시작하기 (Getting Started)

### 사전 요구사항 (Prerequisites)
- Node.js (v18 이상 권장)
- Python 3.8 이상
- Neo4j Database (로컬 또는 클라우드 인스턴스)

### 설치 및 실행 (Installation & Running)

#### 1. Backend (Server)

`server` 디렉토리로 이동하여 필요한 패키지를 설치하고 서버를 실행합니다.

```bash
cd server

# 가상환경 생성 (권장)
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
# .env.example 파일을 복사하여 .env 파일을 생성하고 Neo4j 접속 정보를 입력하세요.
cp .env.example .env

# 서버 실행
uvicorn main:app --reload
```

서버는 기본적으로 `http://localhost:8000`에서 실행됩니다. API 문서는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

#### 2. Frontend (Client)

`client` 디렉토리로 이동하여 의존성을 설치하고 개발 서버를 실행합니다.

```bash
cd client

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 애플리케이션을 사용할 수 있습니다.

## 주요 기능 (Features)

- **시퀀스 다이어그램 작성:** 직관적인 UI를 통해 시퀀스 다이어그램을 생성하고 편집합니다.
- **저장 및 불러오기:** 작성한 다이어그램을 Neo4j 데이터베이스에 저장하고 다시 불러올 수 있습니다.
- **내보내기 (Export):** 다이어그램을 고화질의 SVG 또는 PDF 파일로 내보낼 수 있습니다.
- **참여자 관리:** 다이어그램에 등장하는 참여자(Participant)를 관리할 수 있습니다.

## 프로젝트 구조 (Project Structure)

```
.
├── client/          # React Frontend
│   ├── src/         # 소스 코드
│   ├── public/      # 정적 파일
│   └── ...
├── server/          # FastAPI Backend
│   ├── main.py      # 메인 애플리케이션 진입점
│   ├── database.py  # Neo4j 데이터베이스 연결
│   ├── models.py    # Pydantic 모델
│   └── ...
└── README.md        # 프로젝트 문서
```
