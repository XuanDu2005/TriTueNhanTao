import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadPDF } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MAX_SIZE_MB = 20;

export default function UploadForm() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const validateFile = (f) => {
    if (!f) return 'No file selected';
    if (f.type !== 'application/pdf') return 'Only PDF files are allowed';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File too large. Maximum size is ${MAX_SIZE_MB}MB`;
    return null;
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      setStatus('error');
      return;
    }
    setFile(f);
    setError('');
    setStatus('selected');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setError('');

    try {
      const data = await uploadPDF(file, setProgress);
      setDocumentId(data.documentId);
      setStatus('success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setError(msg);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setProgress(0);
    setStatus('idle');
    setError('');
    setDocumentId(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isUploading = status === 'uploading';
  const isSuccess = status === 'success';

  return (
    <div className="w-full max-w-lg mx-auto">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={isUploading || isSuccess}
      />

      {!isSuccess ? (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : status === 'error'
              ? 'border-red-300 bg-red-50'
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          }`}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-600 animate-bounce" />
              </div>
              <p className="text-sm font-medium text-slate-600">Uploading...</p>
              <div className="w-64 mx-auto h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{progress}%</p>
            </div>
          ) : (
            <>
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                file ? 'bg-primary-100' : 'bg-slate-100'
              }`}>
                {file ? (
                  <FileText className="w-8 h-8 text-primary-600" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400" />
                )}
              </div>
              {file ? (
                <div>
                  <p className="font-semibold text-slate-800 mb-1">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  {error && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-slate-700 mb-1">
                    Drag PDF here or click to browse
                  </p>
                  <p className="text-sm text-slate-400">Maximum file size: {MAX_SIZE_MB} MB</p>
                  {error && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="border-2 border-emerald-300 bg-emerald-50 rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-emerald-800 text-lg">Upload Successful!</p>
            <p className="text-sm text-emerald-600 mt-1">{file?.name}</p>
          </div>
        </div>
      )}

      {!isUploading && !isSuccess && (
        <div className="mt-4 flex gap-3">
          {file && !error && (
            <button onClick={handleUpload} className="btn-primary flex-1">
              Generate Quiz
            </button>
          )}
          {file && (
            <button onClick={handleReset} className="btn-secondary">
              Reset
            </button>
          )}
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => navigate(`/generate/${documentId}`)}
            className="btn-primary flex-1"
          >
            Continue to Generate Quiz
          </button>
          <button onClick={handleReset} className="btn-secondary">
            Upload Another
          </button>
        </div>
      )}
    </div>
  );
}
