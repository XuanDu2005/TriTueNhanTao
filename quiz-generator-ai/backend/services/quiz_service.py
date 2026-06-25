from models import Question, get_session


def save_questions(document_id: int, questions: list) -> list:
    session = get_session()
    saved = []

    try:
        for q in questions:
            question = Question(
                document_id=document_id,
                question=q.get('question', ''),
                option_a=q.get('A', ''),
                option_b=q.get('B', ''),
                option_c=q.get('C', ''),
                option_d=q.get('D', ''),
                correct_answer=q.get('answer', ''),
                explanation=q.get('explanation', '')
            )
            session.add(question)
            session.flush()
            saved.append({'id': question.id})
            session.expunge(question)

        session.commit()
        return saved

    except Exception as e:
        session.rollback()
        raise RuntimeError(f'Failed to save questions: {e}')
    finally:
        session.close()


def get_questions_by_document(document_id: int) -> list:
    session = get_session()
    try:
        questions = session.query(Question).filter(Question.document_id == document_id).all()
        return [
            {
                'id': q.id,
                'question': q.question,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'correct_answer': q.correct_answer,
                'explanation': q.explanation
            }
            for q in questions
        ]
    finally:
        session.close()


def delete_questions_by_document(document_id: int):
    session = get_session()
    try:
        session.query(Question).filter(Question.document_id == document_id).delete()
        session.commit()
    finally:
        session.close()
