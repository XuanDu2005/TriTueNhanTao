import json
from google import genai
from google.genai import errors as genai_errors
from config import Config


def configure_gemini():
    if Config.GEMINI_API_KEY:
        genai.Client(api_key=Config.GEMINI_API_KEY)


def generate_quiz_questions(text: str, difficulty: str, count: int) -> list:
    client = genai.Client(api_key=Config.GEMINI_API_KEY)

    model = 'gemini-2.0-flash' if Config.GEMINI_API_KEY.startswith('AIza') else 'gemini-2.5-flash'

    difficulty_prompts = {
        'easy': 'basic comprehension questions',
        'medium': 'intermediate questions requiring understanding',
        'hard': 'advanced questions requiring deep analysis'
    }

    prompt = f"""You are an expert quiz designer. Generate {count} multiple-choice questions based on the following document content.

Difficulty: {difficulty.upper()} - {difficulty_prompts.get(difficulty, 'questions of varying difficulty')}

Requirements for each question:
- Question text should be clear and unambiguous
- All 4 options should be plausible (no obviously wrong options)
- Options should be labelled A, B, C, D
- Include the correct answer letter
- Include a concise explanation that helps learning

IMPORTANT: Return ONLY valid JSON array. No markdown, no code blocks, no additional text.
Format:
[
  {{
    "question": "Question text here?",
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text",
    "answer": "A",
    "explanation": "Explanation here"
  }}
]

Document content:
{text[:8000]}
"""

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt
        )
        response_text = response.text.strip()

        if response_text.startswith('```'):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])

        questions = json.loads(response_text)
        return questions

    except json.JSONDecodeError as e:
        raise ValueError(f'Failed to parse Gemini response as JSON: {e}')
    except genai_errors.APIError as e:
        raise RuntimeError(f'Gemini API error: {e}')
    except Exception as e:
        raise RuntimeError(f'Gemini API error: {e}')
