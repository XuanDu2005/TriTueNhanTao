# AI Quiz Generator from PDF Documents

Upload any PDF learning material and generate AI-powered multiple-choice quizzes instantly using Google Gemini AI.

## Screenshots

![Preview](screenshots/preview.png)
![Upload](screenshots/upload.png)
![Generate](screenshots/generate.png)
![Quiz](screenshots/quiz.png)
![Results](screenshots/results.png)
![Export](screenshots/export.png)

## Features

- **PDF Upload** — Drag-and-drop PDF files up to 20MB
- **AI Quiz Generation** — Gemini AI reads your document and creates tailored questions
- **Adaptive Difficulty** — Choose Easy, Medium, or Hard difficulty levels
- **Flexible Question Count** — Generate 5, 10, or 20 questions per quiz
- **Interactive Quiz** — One question per screen with progress tracking
- **Instant Results** — Get your score immediately with percentage breakdown
- **Detailed Review** — See correct answers alongside AI-generated explanations
- **Export Quiz** — Export quiz results to PDF for offline review
- **Responsive Design** — Works on desktop and mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router DOM, jsPDF, Nginx |
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

Create `backend/.env` file:

```
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### 3. Build and Run

```bash
docker-compose up --build
```

### 4. Open the App

Navigate to `http://localhost:3000`

## Docker Commands

| Command | Description |
|---------|-------------|
| `docker-compose up --build` | Build and start all services |
| `docker-compose up -d` | Start in detached mode |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | View live logs |
| `docker-compose ps` | Check container status |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF file |
| POST | `/api/generate` | Generate quiz questions |
| GET | `/api/questions/<id>` | Get questions |
| POST | `/api/submit` | Submit answers |
| GET | `/api/result/<id>` | Get detailed results |
| GET | `/api/health` | Health check |

## Troubleshooting

- **Docker build fails**: Ensure Docker is running and WSL2 is enabled (Windows)
- **Gemini API errors**: Check `GEMINI_API_KEY` is correct
- **PDF extraction fails**: PDF must have selectable text (not scanned images)
- **Upload failed**: Check backend is healthy (`docker-compose ps`)
- **File too large**: Maximum upload size is 20MB
