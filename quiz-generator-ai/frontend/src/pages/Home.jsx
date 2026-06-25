import { Brain, FileText, Zap, Target } from 'lucide-react';
import UploadForm from '../components/UploadForm';

const features = [
  {
    icon: FileText,
    title: 'Upload PDF',
    description: 'Upload any PDF learning material up to 20MB. Works with textbooks, notes, and research papers.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Brain,
    title: 'AI-Generated Quizzes',
    description: 'Gemini AI reads your document and creates tailored multiple-choice questions with explanations.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Target,
    title: 'Adaptive Difficulty',
    description: 'Choose Easy, Medium, or Hard difficulty. Generate 5, 10, or 20 questions per quiz.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get your score immediately with detailed review showing correct answers and AI explanations.',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-6">
            <Brain className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Turn PDFs into
            <span className="block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Smart Quizzes
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Upload your learning materials and let AI generate practice quizzes with
            explanations. Perfect for students, professionals, and lifelong learners.
          </p>
        </div>

        <div className="mb-16 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Upload Your PDF</h2>
          <UploadForm />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="card group hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
