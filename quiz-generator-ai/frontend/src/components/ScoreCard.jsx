import { CheckCircle, XCircle } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function ScoreCard({ score, total, correct, wrong, percentage }) {
  const { t } = useI18n();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getCircleColor = () => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getMessage = () => {
    if (percentage >= 80) return t('scoreCard.excellent');
    if (percentage >= 60) return t('scoreCard.goodEffort');
    return t('scoreCard.keepStudying');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={getCircleColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${getScoreColor()}`}>
            {percentage}%
          </span>
          <span className="text-sm text-slate-500 font-medium mt-1">
            {score} / {total}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{correct}</p>
            <p className="text-xs text-slate-500">{t('scoreCard.correct')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{wrong}</p>
            <p className="text-xs text-slate-500">{t('scoreCard.wrong')}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className={`font-semibold text-sm ${
          percentage >= 80 ? 'text-emerald-700' : 
          percentage >= 60 ? 'text-amber-700' : 'text-red-700'
        }`}>
          {getMessage()}
        </p>
      </div>
    </div>
  );
}
