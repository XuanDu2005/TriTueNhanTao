# AI Quiz Generator - Project Specification

## 1. Concept & Vision

A smart quiz generation platform where users upload PDF learning materials and instantly receive AI-crafted multiple-choice quizzes. The experience should feel like having a personal AI tutor that reads your documents and creates targeted practice tests. Clean, focused, and confidence-inspiring — a tool students and professionals actually want to use.

## 2. Design Language

### Aesthetic Direction
Modern dashboard with a scholarly yet approachable feel. Think Notion meets a premium learning platform — clean whitespace, subtle depth, and purposeful color usage that guides without overwhelming.

### Color Palette
- **Primary**: `#4F46E5` (Indigo-600) — CTAs, active states, primary actions
- **Primary Hover**: `#4338CA` (Indigo-700)
- **Secondary**: `#10B981` (Emerald-500) — Correct answers, success states
- **Danger**: `#EF4444` (Red-500) — Wrong answers, errors
- **Warning**: `#F59E0B` (Amber-500) — Highlights, warnings
- **Background**: `#F8FAFC` (Slate-50) — Page backgrounds
- **Surface**: `#FFFFFF` — Cards, panels
- **Border**: `#E2E8F0` (Slate-200)
- **Text Primary**: `#1E293B` (Slate-800)
- **Text Secondary**: `#64748B` (Slate-500)
- **Text Muted**: `#94A3B8` (Slate-400)

### Typography
- **Font**: Inter (Google Fonts) with system-ui fallback
- **Headings**: Bold, tight letter-spacing
- **Body**: Regular weight, 1.6 line-height for readability

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Page max-width: 1200px centered

### Motion Philosophy
- Transitions: 200ms ease-out for interactions, 300ms for page transitions
- Subtle scale on hover (1.02) for interactive cards
- Fade-in for content loading
- Progress bar animation during quiz generation

### Visual Assets
- Lucide React icons
- Gradient accent on hero sections
- Soft shadows for card elevation

## 3. Layout & Structure

### Page Architecture
```
/ (Home)            — Landing with feature overview and upload CTA
/upload             — PDF upload interface
/generate/:docId    — Quiz configuration and generation
/quiz/:docId        — Interactive quiz taking
/result/:resultId   — Score display and review
```

### Global Layout
- Fixed navbar with logo and navigation links
- Centered content container (max-w-5xl)
- Consistent page header with breadcrumb context
- Responsive: sidebar collapses on mobile

## 4. Features & Interactions

### Upload PDF
- Drag-and-drop zone with click fallback
- File type validation (PDF only)
- Size limit: 20MB with progress indicator
- Success: green checkmark animation, redirect prompt
- Error: red border, specific error message

### Generate Quiz
- Difficulty selector: Easy / Medium / Hard (radio cards)
- Question count: 5 / 10 / 20 (pill selector)
- Generate button with loading spinner
- Progress: "Analyzing document..." → "Generating questions..." → "Done!"
- Error: retry button with error details

### Quiz Taking
- One question per screen with progress indicator
- Options A-D as clickable cards with selection highlight
- Next/Previous navigation
- Submit confirmation modal
- Timer display (optional enhancement)

### Result Display
- Large score circle with percentage
- Correct/Wrong/Percentage stats row
- Expandable question review cards
- User answer vs correct answer comparison
- AI explanation for each question

## 5. Component Inventory

### Navbar
- Logo left, nav links right
- Active link: indigo underline
- Mobile: hamburger menu

### UploadForm
- Dashed border drop zone
- File icon centered
- "Drag PDF here or click to browse"
- States: default, dragover (indigo border), uploading (progress), success, error

### QuestionCard
- Question text in bold
- Options as radio-style cards
- Selected: indigo background
- Correct (review): green background
- Wrong: red background

### ScoreCard
- Circular progress indicator
- Large percentage number
- Stat rows: correct, wrong, total

### DifficultySelector
- Three cards: Easy (green), Medium (amber), Hard (red)
- Selected: elevated shadow + border color

### QuestionCountSelector
- Three pill buttons: 5, 10, 20
- Selected: filled indigo

## 6. Technical Approach

### Frontend
- React 19 with functional components and hooks
- React Router DOM v6 for routing
- Axios for HTTP requests
- Tailwind CSS for styling
- Vite for build tooling
- Custom hooks: useQuiz, useUpload

### Backend
- Flask with blueprint pattern
- SQLAlchemy ORM with SQLite
- pdfplumber for PDF text extraction
- google-generativeai for Gemini API
- Flask-CORS for cross-origin requests

### API Design

#### POST /api/upload
- Multipart form: `file` (PDF, max 20MB)
- Response 200: `{ "documentId": int, "filename": str, "message": str }`
- Response 400: `{ "error": str }`
- Response 413: `{ "error": "File too large" }`

#### POST /api/generate
- Body: `{ "documentId": int, "difficulty": str, "questionCount": int }`
- Response 200: `{ "questions": [...], "message": str }`
- Response 400: `{ "error": str }`
- Response 500: `{ "error": "Gemini API error" }`

#### GET /api/questions/<document_id>
- Response 200: `{ "questions": [...] }`

#### POST /api/submit
- Body: `{ "documentId": int, "answers": { "1": "A", "2": "C" } }`
- Response 200: `{ "resultId": int, "score": float, "total": int, "correct": int, "wrong": int, "percentage": float }`

#### GET /api/result/<result_id>
- Response 200: `{ "result": {...}, "questions": [...], "userAnswers": {...} }`

#### GET /api/documents
- Response 200: `{ "documents": [...] }`

### Data Model

**Document**
- id: Integer, PK
- filename: String(255)
- upload_time: DateTime

**Question**
- id: Integer, PK
- document_id: Integer, FK
- question: Text
- option_a: String(500)
- option_b: String(500)
- option_c: String(500)
- option_d: String(500)
- correct_answer: String(1)
- explanation: Text

**Result**
- id: Integer, PK
- document_id: Integer, FK
- score: Float
- total_questions: Integer
- correct_answers: Integer
- wrong_answers: Integer
- percentage: Float
- submit_time: DateTime
- answers: JSON

### Gemini Prompt Strategy
System prompt sets JSON structure requirements. User prompt includes extracted PDF text with difficulty and count parameters. Response parsed as JSON array of question objects.
