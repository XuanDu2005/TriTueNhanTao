import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import { getQuestions, submitQuiz } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import { useI18n } from '../context/I18nContext';

export default function Quiz() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getQuestions(parseInt(docId));
        setQuestions(data.questions || []);
      } catch (err) {
        const msg = err.response?.data?.error || err.message || t('quiz.errors.failedToLoad');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [docId, t]);

  const handleSelect = (qId, answer) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);

    try {
      const answerMap = {};
      questions.forEach((q) => {
        if (answers[q.id] !== undefined) {
          answerMap[q.id.toString()] = answers[q.id];
        }
      });

      const result = await submitQuiz(parseInt(docId), answerMap);
      navigate(`/result/${result.resultId}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || t('quiz.errors.submissionFailed');
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">{t('quiz.loading')}</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="card text-center py-12">
          <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t('quiz.errors.errorLoading')}</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            {t('quiz.goHome')}
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="card py-12">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t('quiz.errors.noQuestions')}</h2>
          <p className="text-slate-500 mb-6">{t('quiz.errors.generateFirst')}</p>
          <button onClick={() => navigate(`/generate/${docId}`)} className="btn-primary">
            {t('quiz.errors.generateQuiz')}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t('quiz.title')}</h1>
          <p className="text-sm text-slate-500">
            {t('quiz.questionOf', { current: currentIndex + 1, total: questions.length })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-primary-600">{t('quiz.answered', { count: answeredCount })}</p>
          <p className="text-xs text-slate-400">{t('quiz.remaining', { count: questions.length - answeredCount })}</p>
        </div>
      </div>

      <div className="h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      <div className="card mb-6">
        <QuestionCard
          question={currentQ}
          index={currentIndex}
          selectedAnswer={answers[currentQ.id]}
          onSelect={(ans) => handleSelect(currentQ.id, ans)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('quiz.previous')}
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="btn-secondary flex items-center gap-1.5"
          >
            {t('quiz.next')}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {t('quiz.submitQuiz')}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('quiz.confirmSubmit')}</h3>
            <p className="text-sm text-slate-500 mb-6">
              {allAnswered
                ? t('quiz.allAnswered')
                : t('quiz.partialAnswered', { answered: answeredCount, total: questions.length })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
              >
                {t('quiz.review')}
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1"
              >
                {t('quiz.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
