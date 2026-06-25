import os
import re
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import Config
from models import Document, Result, init_db, get_session
from services.pdf_service import extract_text_from_pdf
from services.gemini_service import generate_quiz_questions
from services.quiz_service import save_questions, get_questions_by_document, delete_questions_by_document

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

init_db()

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


def sanitize_filename(filename: str) -> str:
    safe = secure_filename(filename)
    name, ext = os.path.splitext(safe)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f'{name}_{timestamp}{ext}'


@app.route('/api/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400

    if file.content_length and file.content_length > Config.MAX_CONTENT_LENGTH:
        return jsonify({'error': 'File too large. Maximum size is 20MB'}), 413

    filename = sanitize_filename(file.filename)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        session = get_session()
        doc = Document(filename=filename)
        session.add(doc)
        session.commit()
        doc_id = doc.id
        session.close()

        return jsonify({
            'documentId': doc_id,
            'filename': filename,
            'message': 'Upload successful'
        }), 200

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': f'Database error: {e}'}), 500


@app.route('/api/generate', methods=['POST'])
def generate_quiz():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    document_id = data.get('documentId')
    difficulty = data.get('difficulty', 'medium')
    question_count = data.get('questionCount', 5)

    if not document_id:
        return jsonify({'error': 'documentId is required'}), 400

    if difficulty not in ('easy', 'medium', 'hard'):
        return jsonify({'error': 'difficulty must be easy, medium, or hard'}), 400

    if question_count not in (5, 10, 20):
        return jsonify({'error': 'questionCount must be 5, 10, or 20'}), 400

    try:
        session = get_session()
        doc = session.query(Document).filter(Document.id == document_id).first()
        session.close()

        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        filepath = os.path.join(Config.UPLOAD_FOLDER, doc.filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'PDF file not found on server'}), 404

        text = extract_text_from_pdf(filepath)

        if not text or len(text.strip()) < 50:
            return jsonify({'error': 'Could not extract readable text from PDF. Please ensure the PDF contains text content.'}), 400

        questions = generate_quiz_questions(text, difficulty, question_count)

        if not isinstance(questions, list) or len(questions) == 0:
            return jsonify({'error': 'Gemini did not return valid questions. Please try again.'}), 500

        delete_questions_by_document(document_id)
        saved = save_questions(document_id, questions)

        return jsonify({
            'questions': saved,
            'count': len(saved),
            'message': f'Successfully generated {len(saved)} questions'
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {e}'}), 500


@app.route('/api/questions/<int:document_id>', methods=['GET'])
def get_questions(document_id):
    try:
        questions = get_questions_by_document(document_id)
        if not questions:
            return jsonify({'error': 'No questions found for this document'}), 404
        return jsonify({'questions': questions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    document_id = data.get('documentId')
    answers = data.get('answers', {})

    if not document_id:
        return jsonify({'error': 'documentId is required'}), 400

    if not answers:
        return jsonify({'error': 'answers object is required'}), 400

    try:
        questions = get_questions_by_document(document_id)
        if not questions:
            return jsonify({'error': 'No questions found for this document'}), 404

        correct_count = 0
        wrong_count = 0

        for q in questions:
            q_id = str(q['id'])
            if q_id in answers and answers[q_id].upper() == q['correct_answer'].upper():
                correct_count += 1
            else:
                wrong_count += 1

        total = len(questions)
        percentage = round((correct_count / total) * 100, 1) if total > 0 else 0

        session = get_session()
        result = Result(
            document_id=document_id,
            score=correct_count,
            total_questions=total,
            correct_answers=correct_count,
            wrong_answers=wrong_count,
            percentage=percentage,
            answers=answers
        )
        session.add(result)
        session.commit()
        result_id = result.id
        session.close()

        return jsonify({
            'resultId': result_id,
            'score': correct_count,
            'total': total,
            'correct': correct_count,
            'wrong': wrong_count,
            'percentage': percentage
        }), 200

    except Exception as e:
        return jsonify({'error': f'Submission error: {e}'}), 500


@app.route('/api/result/<int:result_id>', methods=['GET'])
def get_result(result_id):
    try:
        session = get_session()
        result = session.query(Result).filter(Result.id == result_id).first()
        session.close()

        if not result:
            return jsonify({'error': 'Result not found'}), 404

        questions = get_questions_by_document(result.document_id)

        return jsonify({
            'result': {
                'id': result.id,
                'score': result.score,
                'total': result.total_questions,
                'correct': result.correct_answers,
                'wrong': result.wrong_answers,
                'percentage': result.percentage,
                'submit_time': result.submit_time.isoformat() if result.submit_time else None
            },
            'questions': questions,
            'userAnswers': result.answers
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/documents', methods=['GET'])
def get_documents():
    try:
        session = get_session()
        docs = session.query(Document).order_by(Document.upload_time.desc()).all()
        session.close()

        return jsonify({
            'documents': [
                {
                    'id': d.id,
                    'filename': d.filename,
                    'upload_time': d.upload_time.isoformat() if d.upload_time else None,
                    'question_count': len(d.questions)
                }
                for d in docs
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
