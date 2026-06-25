import { CheckCircle, XCircle } from 'lucide-react';

const OPTION_LABELS = { A: 0, B: 1, C: 2, D: 3 };

export default function QuestionCard({
  question,
  index,
  selectedAnswer,
  onSelect,
  showResult = false,
  userAnswer,
}) {
  const options = [
    { key: 'A', label: question.option_a },
    { key: 'B', label: question.option_b },
    { key: 'C', label: question.option_c },
    { key: 'D', label: question.option_d },
  ];

  const getOptionStyle = (option) => {
    const isSelected = selectedAnswer === option.key;
    const isCorrect = question.correct_answer.toUpperCase() === option.key;
    const isWrong = showResult && userAnswer && isSelected && !isCorrect;

    if (showResult) {
      if (isCorrect) return 'border-emerald-400 bg-emerald-50 text-emerald-800';
      if (isWrong) return 'border-red-400 bg-red-50 text-red-800';
    }
    if (isSelected) return 'border-primary-500 bg-primary-50 text-primary-800 ring-2 ring-primary-200';
    return 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-slate-50';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start gap-3 mb-5">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center">
          {index + 1}
        </span>
        <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed pt-1">
          {question.question}
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isCorrect = question.correct_answer.toUpperCase() === option.key;
          const isSelected = selectedAnswer === option.key;

          return (
            <button
              key={option.key}
              onClick={() => !showResult && onSelect(option.key)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                getOptionStyle(option)
              } ${!showResult && 'cursor-pointer'}`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center transition-colors ${
                isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {option.key}
              </span>
              <span className="text-sm sm:text-base font-medium flex-1">{option.label}</span>
              {showResult && isCorrect && (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              {showResult && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-semibold text-amber-800 mb-1">Explanation</p>
          <p className="text-sm text-amber-700 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
