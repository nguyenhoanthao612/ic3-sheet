import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizHistory } from '../types';
import { QuestionRenderer } from './QuestionRenderer';
import { AlertCircle, ArrowLeft, ArrowRight, Bookmark, Clock, Flag, Layout, Send } from 'lucide-react';

interface ExamViewProps {
  questions: Question[];
  onSaveQuizAttempt: (attempt: Omit<QuizHistory, 'id' | 'examDate'>) => string;
  onNavigate: (route: string) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  questions,
  onSaveQuizAttempt,
  onNavigate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Interactive answers registry state
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  
  // Timer systems
  const [timeLeft, setTimeLeft] = useState<number>(2700); // 45 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dialog status keys
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  
  // Result screen parameters
  const [isDone, setIsDone] = useState<boolean>(false);
  const [resultAttempt, setResultAttempt] = useState<any>(null);

  // Load standard 15 randomized questions for mock simulation
  const handleStartExam = () => {
    if (questions.length === 0) return;
    
    // Choose max 15 questions randomly representing diverse syllabus targets
    const selectionSize = Math.min(15, questions.length);
    const randomized = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, selectionSize);
      
    setExamQuestions(randomized);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds([]);
    setTimeLeft(2700);
    setIsPlaying(true);
    setIsDone(false);
    setResultAttempt(null);
    setShowSubmitModal(false);
  };

  // Timer systems countdown lifecycle
  useEffect(() => {
    if (isPlaying && !isDone) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isDone]);

  const handleAnswerSelect = (val: any) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }));
  };

  const currentQuestion = examQuestions[currentIndex];
  const currentVal = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Toggle visual flag bookmark
  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setFlaggedIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Auto Submission triggers when timer hits 0
  const handleAutoSubmit = () => {
    submitEvaluation(true);
  };

  // Human submission action
  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    submitEvaluation(false);
  };

  // Compute grading matrix
  const submitEvaluation = (isTimeoutForce: boolean = false) => {
    setIsDone(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    let cfCorrect = 0, cfTot = 0;
    let kaCorrect = 0, kaTot = 0;
    let loCorrect = 0, loTot = 0;

    examQuestions.forEach(q => {
      const userAns = answers[q.id];
      const isCorrect = testCorrectness(q, userAns);
      
      if (isCorrect) correctCount++;

      // Count core topic alignments
      if (q.domain === 'Computing Fundamentals') {
        cfTot++;
        if (isCorrect) cfCorrect++;
      } else if (q.domain === 'Key Applications') {
        kaTot++;
        if (isCorrect) kaCorrect++;
      } else if (q.domain === 'Living Online') {
        loTot++;
        if (isCorrect) loCorrect++;
      }
    });

    const finalPct = Math.round((correctCount / examQuestions.length) * 100);
    const passedStatus = finalPct >= 70; // 70% Global passing baseline marks
    const secondsSpent = 2700 - timeLeft;

    const quizAttemptPayload = {
      examType: 'mock-exam' as const,
      score: finalPct,
      totalQuestions: examQuestions.length,
      correctCount: correctCount,
      passed: passedStatus,
      domainScores: {
        'Computing Fundamentals': cfTot > 0 ? Math.round((cfCorrect / cfTot) * 100) : 100,
        'Key Applications': kaTot > 0 ? Math.round((kaCorrect / kaTot) * 100) : 100,
        'Living Online': loTot > 0 ? Math.round((loCorrect / loTot) * 100) : 100,
      },
      timeSpent: secondsSpent,
    };

    // Save item onto local persistence history logs
    onSaveQuizAttempt(quizAttemptPayload);
    setResultAttempt({
      ...quizAttemptPayload,
      isTimeoutForce,
    });
  };

  // Question grading evaluator
  const testCorrectness = (q: Question, ans: any): boolean => {
    if (ans === undefined || ans === null || ans === '') return false;

    const correct = q.correctAnswer.trim().toLowerCase();
    
    switch (q.type) {
      case 'multiple-choice':
      case 'true-false':
      case 'image-question':
      case 'video-question':
        return String(ans).trim().toLowerCase() === correct;

      case 'fill-blank':
        return String(ans).trim().toLowerCase() === correct;

      case 'matching': {
        const userMap = (ans as Record<string, string>) || {};
        const pairs = q.matchingPairs || [];
        if (pairs.length === 0) return false;
        
        let matchCount = 0;
        pairs.forEach(p => {
          if (userMap[p.left] === p.right) matchCount++;
        });
        return matchCount === pairs.length;
      }

      case 'drag-drop': {
        const userMap = (ans as Record<string, string>) || {};
        const config = q.dragDropCategories || { categories: [], items: [] };
        if (config.items.length === 0) return false;

        let matchCount = 0;
        config.items.forEach(it => {
          if (userMap[it.text] === it.category) matchCount++;
        });
        return matchCount === config.items.length;
      }

      case 'step-ordering': {
        return String(ans) === correct;
      }

      case 'hotspot': {
        const [x, y] = String(ans).split(',').map(Number);
        const bounds = q.hotspotArea;
        if (!bounds || x === undefined || y === undefined) return false;

        const xPct = x * 100;
        const yPct = y * 100;

        return (
          xPct >= bounds.x &&
          xPct <= bounds.x + bounds.w &&
          yPct >= bounds.y &&
          yPct <= bounds.y + bounds.h
        );
      }

      case 'multi-select': {
        const userSelectedList = String(ans).split('|').filter(Boolean).sort();
        const correctList = q.correctAnswer.split('|').filter(Boolean).sort();
        if (userSelectedList.length !== correctList.length) return false;
        return userSelectedList.every((val, idx) => val.toLowerCase() === correctList[idx].toLowerCase());
      }

      default:
        return String(ans).toLowerCase() === correct;
    }
  };

  // Convert seconds to minutes/seconds formats
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Styling helper based on severity levels
  const getTimerColorClass = () => {
    if (timeLeft < 300) return 'text-rose-500 font-extrabold animate-pulse bg-rose-50 border-rose-200'; // Under 5 minutes
    if (timeLeft < 900) return 'text-amber-600 font-bold bg-amber-50 border-amber-200'; // Under 15 minutes
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  const unansweredCount = examQuestions.filter(q => answers[q.id] === undefined || answers[q.id] === '').length;

  if (questions.length === 0) {
    return (
      <div id="exam-empty-state" className="py-14 text-center max-w-sm mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-800">Database Empty</h3>
        <p className="text-xs text-slate-500">
          Sync is required. Please restore defaults in the Sync tab or synchronize a custom Google Sheet to lock questions.
        </p>
        <button
          id="btn-nav-admin-exam"
          onClick={() => onNavigate('admin')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white cursor-pointer"
        >
          Go to Sync panel
        </button>
      </div>
    );
  }

  return (
    <div id="exam-simulator" className="max-w-5xl mx-auto space-y-6 py-2 text-left">
      {!isPlaying ? (
        /* Introductory instructional Card */
        <div id="exam-pre-instructions" className="p-6 sm:p-10 rounded-2xl border border-slate-200 bg-white max-w-2xl mx-auto space-y-7 shadow-sm text-left">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layout className="w-6 h-6 text-indigo-650" />
              IC3 GS6 Mock Examination Simulator
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed pt-1">
              Prepare yourself under authentic physical test parameters. Take a dynamic set of 15 syllabus questions aligned with core certification objectives.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs sm:text-[13px] text-slate-600">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-1.5">Official Exam Regulations:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Time allowance:</strong> 45 minutes (2,700 seconds) countdown. Once launched, timer cannot be paused.</li>
              <li><strong>Passing benchmark:</strong> You must score <strong>70% or above</strong> correct to pass.</li>
              <li><strong>Flagging tool bounds:</strong> Bookmark complex queries and navigation palette to jump elements retroactively.</li>
              <li><strong>Auto Submission:</strong> When time resets, active results are evaluated and finalized instantly.</li>
            </ul>
          </div>

          <button
            id="start-exam-trigger"
            onClick={handleStartExam}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-550 font-bold text-white transition text-xs tracking-wider uppercase shadow-lg shadow-emerald-600/15 cursor-pointer"
          >
            Launch Authentic Exam Client
          </button>
        </div>
      ) : isDone ? (
        /* Diagnostic Mock Exam Review Sheet */
        <div id="exam-diagnostic-results" className="space-y-8">
          <div className="p-6 sm:p-10 rounded-2xl border border-slate-200 bg-white text-center space-y-6 shadow-sm max-w-2xl mx-auto">
            {resultAttempt?.passed ? (
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold animate-bounce shadow">✓</div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto text-2xl font-bold animate-shake shadow">✗</div>
            )}
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 leading-none">
                {resultAttempt?.passed ? 'Congratulations! You Passed' : 'Did Not Clear Passing Marks'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {resultAttempt?.isTimeoutForce ? '⚠️ The examination session was force terminated as the countdown clock expired.' : 'The evaluation run has been registered with your profile data.'}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-405">Score</p>
                <p className={`text-xl font-black font-mono ${resultAttempt?.passed ? 'text-emerald-600' : 'text-rose-500'}`}>{resultAttempt?.score}%</p>
              </div>
              <div className="text-center border-l border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-405">Correct</p>
                <p className="text-xl font-bold text-slate-800 font-mono">{resultAttempt?.correctCount}/15</p>
              </div>
              <div className="text-center border-l border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-405">Time spent</p>
                <p className="text-xl font-bold text-slate-800 font-mono">{Math.floor(resultAttempt?.timeSpent / 60)}m</p>
              </div>
              <div className="text-center border-l border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-405">Status</p>
                <p className={`text-base font-extrabold uppercase pt-0.5 ${resultAttempt?.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {resultAttempt?.passed ? 'PASS' : 'FAIL'}
                </p>
              </div>
            </div>

            {/* Syllabus Topic drill-down breakdown lines */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-3 text-left">
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">Objectives Master Performance:</h4>
              
              <div className="space-y-2 text-xs">
                {Object.entries(resultAttempt?.domainScores || {}).map(([dom, val]: [any, any]) => (
                  <div key={dom} className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">{dom}:</span>
                    <span className="font-mono font-bold text-slate-800">{val}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                id="btn-retry-exam"
                onClick={handleStartExam}
                className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer transition shadow"
              >
                Retake Mock Exam
              </button>
              <button
                id="btn-nav-dashboard-exam"
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-3 rounded-lg border border-slate-200 text-slate-650 hover:bg-slate-50 font-semibold text-xs cursor-pointer transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
          
          {/* Detailed Question review sheets */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 text-sm sm:text-base">Comprehensive Question Corrections:</h3>
            
            <div className="divide-y divide-slate-100 space-y-6">
              {examQuestions.map((q, qidx) => {
                const isCorrect = testCorrectness(q, answers[q.id]);
                const userChoice = answers[q.id] || '(Skipped)';

                return (
                  <div id={`exam-corrected-card-${qidx}`} key={q.id} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white mt-0.5 ${
                        isCorrect ? 'bg-emerald-650' : 'bg-rose-500'
                      }`}>
                        {qidx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800 text-[14px] leading-relaxed text-left">{q.questionText}</p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">{q.domain} • Difficulty: {q.difficulty}</p>
                      </div>
                    </div>

                    <div className="pl-9 space-y-2 text-xs">
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-150 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs">
                        <p><strong>Your Input:</strong> <span className={isCorrect ? 'text-emerald-700 font-semibold' : 'text-rose-600'}>{userChoice}</span></p>
                        <p><strong>Correct Standard Key:</strong> <span className="text-emerald-700 font-semibold">{q.correctAnswer}</span></p>
                      </div>

                      <div className="p-3 bg-blue-50/40 rounded border border-blue-100 text-slate-600 leading-relaxed">
                        <strong>Correction Notes:</strong> {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Active Focused Fullscreen simulation stage */
        <div id="exam-client" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question view left 3 columns */}
          <div className="lg:col-span-3 space-y-5">
            {/* Header diagnostic bar */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-wide uppercase">IC3 GS6 OFFICIAL SIM</span>
                  <span className="text-[10px] text-slate-450 font-bold">•</span>
                  <span className="text-[11px] text-indigo-650 font-bold uppercase">{currentQuestion.domain}</span>
                </div>
              </div>

              {/* Floating Alert countdown timer */}
              <div className={`p-2 rounded-lg border flex items-center gap-2 transition ${getTimerColorClass()}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold text-xs sm:text-sm">{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* Core active question widget */}
            <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
              <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed text-left">
                  {currentQuestion.questionText}
                </h3>

                <div className="flex gap-2 shrink-0">
                  <button
                    id="exam-flag"
                    onClick={handleToggleFlag}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      flaggedIds.includes(currentQuestion.id)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title="Flag question"
                  >
                    <Flag className={`w-4 h-4 ${flaggedIds.includes(currentQuestion.id) ? 'fill-indigo-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Actual render form (without correctAnswer highlights to preserve realistic test criteria!) */}
              <QuestionRenderer
                question={currentQuestion}
                value={currentVal}
                onChange={handleAnswerSelect}
                disabled={false}
                showCorrectAnswers={false}
              />

              {/* Bottom slide controllers */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-5">
                <button
                  id="btn-prev-exam-slide"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className={`px-4 py-2 border rounded-lg bg-white font-semibold text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer select-none ${
                    currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous Block
                </button>

                <button
                  id="btn-submit-exam-trigger"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-550 rounded-lg text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer select-none"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Exam
                </button>

                <button
                  id="btn-next-exam-slide"
                  disabled={currentIndex === examQuestions.length - 1}
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className={`px-4 py-2 border rounded-lg bg-white font-semibold text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer select-none ${
                    currentIndex === examQuestions.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  Next Block <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right sidebar navigation panel */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm text-center">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm tracking-wider uppercase border-b border-slate-100 pb-2">Questions Palette</h4>
            
            <div id="palette-grid" className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2">
              {examQuestions.map((q, idx) => {
                const answerValue = answers[q.id];
                const isAnswered = answerValue !== undefined && answerValue !== null && answerValue !== '';
                const isFlagged = flaggedIds.includes(q.id);
                const isActive = idx === currentIndex;

                let paletteColorClass = "border-slate-200 text-slate-600 bg-white hover:bg-slate-50";
                if (isAnswered) paletteColorClass = "border-slate-350 bg-slate-150 text-slate-800";
                if (isFlagged) paletteColorClass = "border-indigo-400 bg-indigo-50/50 text-indigo-700";
                if (isActive) paletteColorClass = "border-indigo-650 bg-indigo-650 text-white font-bold ring-2 ring-indigo-550/20";

                return (
                  <button
                    id={`palette-key-${idx}`}
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs flex items-center justify-center relative cursor-pointer font-bold ${paletteColorClass}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-left text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-slate-200 bg-white block"></span>
                <span>Unopened/Skipped</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-slate-350 bg-slate-150 block"></span>
                <span>Completed Answer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-indigo-400 bg-indigo-50/50 block"></span>
                <span>Flagged for Review</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety modal triggered when clicking Submit */}
      {showSubmitModal && (
        <div id="safety-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="safety-modal-box" className="p-6 rounded-2xl border border-slate-200 bg-white max-w-sm w-full space-y-5 text-center shadow-2xl animate-scale-up">
            <AlertCircle className="w-12 h-12 text-indigo-600 mx-auto animate-pulse" />
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Are you ready to submit?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You possess <strong>{unansweredCount} unanswered questions</strong> out of {examQuestions.length}. Submitting triggers evaluation instantly.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                id="modal-cancel"
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 text-xs cursor-pointer"
              >
                No, Keep Writing
              </button>
              <button
                id="modal-submit"
                onClick={handleConfirmSubmit}
                className="w-1/2 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 font-bold text-white text-xs cursor-pointer shadow"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
