import { jsPDF } from 'jspdf';

export function exportQuizToPDF(data, locale = 'en') {
  const { result, questions, userAnswers } = data;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const texts = {
    en: {
      title: 'Quiz Results',
      score: 'Score',
      questions: 'Questions',
      difficulty: 'Difficulty',
      questionReview: 'Question Review',
      correct: 'Correct',
      wrong: 'Wrong',
      skipped: 'Skipped',
      yourAnswer: 'Your Answer',
      correctAnswer: 'Correct Answer',
      explanation: 'Explanation',
      page: 'Page',
    },
    vi: {
      title: 'Kết quả Bài kiểm tra',
      score: 'Điểm',
      questions: 'Câu hỏi',
      difficulty: 'Độ khó',
      questionReview: 'Xem lại câu hỏi',
      correct: 'Đúng',
      wrong: 'Sai',
      skipped: 'Bỏ qua',
      yourAnswer: 'Câu trả lời của bạn',
      correctAnswer: 'Đáp án đúng',
      explanation: 'Giải thích',
      page: 'Trang',
    },
  };

  const t = texts[locale] || texts.en;

  const addNewPageIfNeeded = (neededSpace) => {
    if (yPos + neededSpace > 280) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.score}: ${result.percentage}% (${result.correct}/${result.total})`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.questionReview, margin, yPos);
  yPos += 10;

  questions.forEach((q, index) => {
    addNewPageIfNeeded(60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const questionNum = `Câu ${index + 1}`;
    doc.text(`${questionNum}:`, margin, yPos);
    yPos += 6;

    const lines = doc.splitTextToSize(q.question, contentWidth);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5 + 4;

    const options = [
      { key: 'A', label: q.option_a },
      { key: 'B', label: q.option_b },
      { key: 'C', label: q.option_c },
      { key: 'D', label: q.option_d },
    ];

    doc.setFontSize(10);
    options.forEach((opt) => {
      const optLines = doc.splitTextToSize(`${opt.key}. ${opt.label}`, contentWidth - 10);
      const optHeight = optLines.length * 5;
      addNewPageIfNeeded(optHeight);
      doc.text(`${opt.key}. ${opt.label}`, margin + 5, yPos);
      yPos += optHeight;
    });

    yPos += 4;
    const userAnswer = userAnswers?.[q.id.toString()];
    const isCorrect = userAnswer?.toUpperCase() === q.correct_answer.toUpperCase();
    const isSkipped = !userAnswer;

    doc.setFontSize(10);
    if (isSkipped) {
      doc.setTextColor(150, 150, 150);
      doc.text(`${t.skipped}`, margin, yPos);
    } else {
      if (isCorrect) {
        doc.setTextColor(0, 128, 0);
      } else {
        doc.setTextColor(220, 50, 50);
      }
      doc.text(`${t.yourAnswer}: ${userAnswer} - ${isCorrect ? t.correct : t.wrong}`, margin, yPos);
    }
    yPos += 6;

    doc.setTextColor(0, 100, 200);
    doc.text(`${t.correctAnswer}: ${q.correct_answer}`, margin, yPos);
    yPos += 8;

    if (q.explanation) {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      const expLines = doc.splitTextToSize(`${t.explanation}: ${q.explanation}`, contentWidth);
      addNewPageIfNeeded(expLines.length * 5);
      doc.text(expLines, margin, yPos);
      yPos += expLines.length * 5;
    }

    yPos += 10;
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${t.page} ${i}/${pageCount}`, pageWidth - margin, 290, { align: 'right' });
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`quiz-results-${timestamp}.pdf`);
}
