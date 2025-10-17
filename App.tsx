
import React, { useState, useCallback } from 'react';
import { AnalysisResult, InterviewQuestionCategory } from './types';
import { analyzeResume, generateInterviewQuestions } from './services/geminiService';
import ResultsCard from './components/ResultsCard';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resume, setResume] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionCategory[] | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [questionGenerationError, setQuestionGenerationError] = useState<string | null>(null);


  const handleAnalyze = useCallback(async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      setError("Please provide both a job description and a resume.");
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setInterviewQuestions(null);
    setQuestionGenerationError(null);
    setIsLoading(true);

    try {
      const result = await analyzeResume(jobDescription, resume);
      setAnalysisResult(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [jobDescription, resume]);

  const handleGenerateQuestions = useCallback(async () => {
    if (!analysisResult) return;

    setIsGeneratingQuestions(true);
    setQuestionGenerationError(null);
    try {
      const questions = await generateInterviewQuestions(jobDescription, resume, analysisResult);
      setInterviewQuestions(questions);
    } catch (err: unknown) {
       if (err instanceof Error) {
        setQuestionGenerationError(err.message);
      } else {
        setQuestionGenerationError("An unexpected error occurred while generating questions.");
      }
    } finally {
        setIsGeneratingQuestions(false);
    }
  }, [jobDescription, resume, analysisResult]);
  
  const handleExample = () => {
    setJobDescription("Looking for a Python developer with experience in Machine Learning, Data Analysis, and AWS deployment. Familiarity with Docker is a plus.");
    setResume("Experienced software engineer who has worked on predictive ML models using Python. Built data pipelines and dashboards for analytics. Extensive experience with various cloud tools and containerization.");
    handleClear(false);
  };
  
  const handleClear = (clearInputs = true) => {
      if (clearInputs) {
        setJobDescription('');
        setResume('');
      }
      setAnalysisResult(null);
      setError(null);
      setInterviewQuestions(null);
      setQuestionGenerationError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            AI Resume Shortlister
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Instantly analyze candidate suitability with the power of Gemini.
          </p>
        </header>

        <main>
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  rows={10}
                  className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-300 mb-2">
                  Candidate Resume
                </label>
                <textarea
                  id="resume"
                  rows={10}
                  className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"
                  placeholder="Paste the candidate's resume here..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
               <button
                onClick={() => handleClear()}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 font-semibold text-red-300 bg-gray-700/50 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Clear All
              </button>
              <button
                onClick={handleExample}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 font-semibold text-cyan-300 bg-gray-700/50 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Load Example
              </button>
            </div>
          </div>

          <div className="mt-8">
            {isLoading && <Loader text="Analyzing..." subtext="Our AI assistant is reviewing the documents." />}
            {error && <ErrorMessage message={error} />}
            {analysisResult && (
                <ResultsCard 
                    result={analysisResult} 
                    onGenerateQuestions={handleGenerateQuestions}
                    isGeneratingQuestions={isGeneratingQuestions}
                    interviewQuestions={interviewQuestions}
                    questionGenerationError={questionGenerationError}
                />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
