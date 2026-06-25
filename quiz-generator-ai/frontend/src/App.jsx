import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GenerateQuiz from './pages/GenerateQuiz';
import Quiz from './pages/Quiz';
import Result from './pages/Result';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Home />} />
          <Route path="/generate/:docId" element={<GenerateQuiz />} />
          <Route path="/quiz/:docId" element={<Quiz />} />
          <Route path="/result/:resultId" element={<Result />} />
        </Routes>
      </main>
    </div>
  );
}
