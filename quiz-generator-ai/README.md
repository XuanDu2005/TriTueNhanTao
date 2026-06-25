# AI Quiz Generator from PDF Documents

Upload any PDF learning material and generate AI-powered multiple-choice quizzes instantly using Google Gemini AI.

## Features

- **PDF Upload** — Drag-and-drop PDF files up to 20MB
- **AI Quiz Generation** — Gemini AI reads your document and creates tailored questions
- **Adaptive Difficulty** — Choose Easy, Medium, or Hard difficulty levels
- **Flexible Question Count** — Generate 5, 10, or 20 questions per quiz
- **Interactive Quiz** — One question per screen with progress tracking
- **Instant Results** — Get your score immediately with percentage breakdown
- **Detailed Review** — See correct answers alongside AI-generated explanations
- **Responsive Design** — Works on desktop and mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router DOM, Nginx |
| Backend | Python Flask, SQLAlchemy, pdfplumber |
| AI | Google Gemini API |
| Database | SQLite |
| Container | Docker, Docker Compose |

## Quick Start with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- Google Gemini API key

### 1. Get a Gemini API Key

Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and create an API key.

### 2. Configure Environment

In the `backend/` folder, copy the example env file and add your key:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and set your key:

```
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### 3. Build and Run

From the project root (`quiz-generator-ai/`):

```bash
docker-compose up --build
```

This will:
- Build the backend Docker image and start it on port **5000**
- Build the frontend Docker image and start it on port **3000**
- Wait for the backend to be healthy before starting the frontend

### 4. Open the App

Navigate to `http://localhost:3000` to use the application.

> **Note:** On first run, Docker will download Node.js, Python, and Nginx images. This may take a few minutes.

## Running Without Docker

### Prerequisites

- Python 3.9+
- Node.js 18+
- Google Gemini API key

### Backend

```bash
cd quiz-generator-ai/backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
python app.py
```

The backend runs on `http://localhost:5000`.

### Frontend

```bash
cd quiz-generator-ai/frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Project Structure

```
quiz-generator-ai/
├── backend/
│   ├── services/
│   │   ├── gemini_service.py
│   │   ├── pdf_service.py
│   │   └── quiz_service.py
│   ├── uploads/
│   ├── Dockerfile
│   ├── .env.example
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UploadForm.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   └── ScoreCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── GenerateQuiz.jsx
│   │   │   ├── Quiz.jsx
│   │   │   └── Result.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── SPEC.md
└── README.md
```

## Docker Commands

| Command | Description |
|---------|------------|
| `docker-compose up --build` | Build and start all services |
| `docker-compose up -d` | Start in detached mode |
| `docker-compose down` | Stop and remove containers |
| `docker-compose down -v` | Stop and remove containers + volumes |
| `docker-compose restart` | Restart all services |
| `docker-compose logs -f` | View live logs |

## API Documentation

### POST /api/upload
Upload a PDF file.

- **Request**: `multipart/form-data` with `file` field
- **Response**: `{ "documentId": 1, "filename": "file.pdf", "message": "Upload successful" }`

### POST /api/generate
Generate quiz questions for a document.

- **Request**: `{ "documentId": 1, "difficulty": "medium", "questionCount": 10 }`
- **Response**: `{ "questions": [...], "count": 10, "message": "..." }`

### GET /api/questions/\<document_id\>
Retrieve questions for a document.

- **Response**: `{ "questions": [...] }`

### POST /api/submit
Submit quiz answers.

- **Request**: `{ "documentId": 1, "answers": { "1": "A", "2": "C" } }`
- **Response**: `{ "resultId": 1, "score": 8, "total": 10, "correct": 8, "wrong": 2, "percentage": 80.0 }`

### GET /api/result/\<result_id\>
Get detailed result with question review.

- **Response**: `{ "result": {...}, "questions": [...], "userAnswers": {...} }`

### GET /api/documents
List all uploaded documents.

- **Response**: `{ "documents": [...] }`

### GET /api/health
Health check endpoint.

- **Response**: `{ "status": "ok", "timestamp": "..." }`

## Troubleshooting

**Docker build fails**: Ensure Docker is running. On Windows, make sure WSL2 is enabled.

**Gemini API errors**: Verify your `GEMINI_API_KEY` in `backend/.env` is correct and has available quota.

**PDF text extraction fails**: The PDF must contain selectable text (not scanned images). Scanned PDFs require OCR which is not supported.

**Frontend shows "Upload failed"**: Check that the backend container is healthy (`docker-compose ps`) and that port 5000 is not already in use.

**File too large**: The maximum upload size is 20MB.
