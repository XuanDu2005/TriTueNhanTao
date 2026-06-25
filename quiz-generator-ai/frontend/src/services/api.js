import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 300000,
});

export const uploadPDF = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return response.data;
};

export const generateQuiz = async (documentId, difficulty, questionCount) => {
  const response = await api.post('/generate', {
    documentId,
    difficulty,
    questionCount,
  });
  return response.data;
};

export const getQuestions = async (documentId) => {
  const response = await api.get(`/questions/${documentId}`);
  return response.data;
};

export const submitQuiz = async (documentId, answers) => {
  const response = await api.post('/submit', {
    documentId,
    answers,
  });
  return response.data;
};

export const getResult = async (resultId) => {
  const response = await api.get(`/result/${resultId}`);
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export default api;
