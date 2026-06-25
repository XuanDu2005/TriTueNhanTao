import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Sparkles, AlertCircle } from 'lucide-react';
import { generateQuiz } from '../services/api';

const difficulties = [
  { value: 'easy', label: 'Easy', description: 'Basic comprehension', color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-700', activeBg: 'bg-emerald-500', activeBorder: 'border-emerald-500' },
  { value: 'medium', label: 'Medium', description: 'Understanding required', color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700', activeBg: 'bg-amber-500', activeBorder: 'border-amber-500' },
  { value: 'hard', label: 'Hard', description: 'Deep analysis', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700', activeBg: 'bg-red-500', activeBorder: 'border-red-500' },
];

const questionCounts = [5, 10, 20];

export default function GenerateQuiz() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(10);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleGenerate = async () => {
    setStatus('generating');
    setError('');
    setProgress('Preparing your quiz...');

    const stages = [
      'Analyzing document content...',
      'Extracting key concepts...',
      'Generating questions with Gemini AI...',
      'Creating explanations...',
      'Finalizing your quiz...',
    ];

    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      if (stageIndex < stages.length - 1) {
        stageIndex++;
        setProgress(stages[stageIndex]);
      }
    }, 2000);

    try {
      await generateQuiz(parseInt(docId), difficulty, count);
      clearInterval(stageInterval);
      navigate(`/quiz/${docId}`);
    } catch (err) {
      clearInterval(stageInterval);
      const msg = err.response?.data?.error || err.message || 'Generation failed';
      setError(msg);
      setStatus('error');
    }
  };

  const selectedDiff = difficulties.find((d) => d.value === difficulty);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
          <Settings className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Configure Your Quiz</h1>
        <p className="text-slate-500">Customize difficulty and question count</p>
      </div>

      <div className="card space-y-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Select Difficulty</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  difficulty === d.value
                    ? `${d.activeBorder} ${d.bgColor} shadow-sm`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mb-3 ${difficulty === d.value ? d.activeBg : 'bg-slate-200'}`} />
                <p className={`font-bold ${difficulty === d.value ? d.textColor : 'text-slate-700'}`}>{d.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{d.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Number of Questions</label>
          <div className="flex gap-3">
            {questionCounts.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  count === n
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quiz Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Document ID</span>
              <span className="font-medium text-slate-700">#{docId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Difficulty</span>
              <span className={`font-semibold ${selectedDiff.textColor}`}>{selectedDiff.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Questions</span>
              <span className="font-semibold text-slate-700">{count}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Generation Failed</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {status === 'generating' ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-slate-600">{progress}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full animate-pulse-glow" style={{ width: '70%' }} />
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate Quiz with AI
          </button>
        )}
      </div>
    </div>
  );
}
