import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { getResult } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import QuestionCard from '../components/QuestionCard';

export default function Result() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const loadResult = async () => {
      try {
        const result = await getResult(parseInt(resultId));
        setData(result);
        setExpandedQuestions(
          Object.fromEntries((result.questions || []).map((q) => [q.id, true]))
        );
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Failed to load result';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, [resultId]);

  const toggleQuestion = (qId) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="card text-center py-12">
          <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500 mb-6">{error || 'Could not load result'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { result, questions, userAnswers } = data;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Quiz Complete!</h1>
        <p className="text-slate-500">Here's how you performed</p>
      </div>

      <div className="card mb-8 animate-fade-in flex justify-center" style={{ animationDelay: '100ms' }}>
        <ScoreCard
          score={result.score}
          total={result.total}
          correct={result.correct}
          wrong={result.wrong}
          percentage={result.percentage}
        />
      </div>

      <div className="flex gap-3 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <button
          onClick={() => navigate(`/generate/${data.questions[0]?.document_id || docId}`)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Quiz
        </button>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Question Review</h2>
        <div className="space-y-4">
          {questions.map((q, index) => {
            const isExpanded = expandedQuestions[q.id];
            const userAnswer = userAnswers?.[q.id.toString()];

            return (
              <div key={q.id} className="card">
                <button
                  onClick={() => toggleQuestion(q.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-700 truncate text-sm">
                      {q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {userAnswer ? (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        userAnswer.toUpperCase() === q.correct_answer.toUpperCase()
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {userAnswer.toUpperCase() === q.correct_answer.toUpperCase() ? 'Correct' : 'Wrong'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-500">
                        Skipped
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <QuestionCard
                      question={q}
                      index={index}
                      selectedAnswer={userAnswer}
                      showResult={true}
                      userAnswer={userAnswer}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
