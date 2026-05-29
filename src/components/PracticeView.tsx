import React, { useState, useEffect } from 'react';
import { Question, QuizHistory } from '../types';
import { QuestionRenderer } from './QuestionRenderer';
import { BookOpen, Sparkles, AlertCircle, HelpCircle, ArrowRight, RotateCcw, Bookmark, CheckSquare, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

interface PracticeViewProps {
  questions: Question[];
  onSaveQuizAttempt: (attempt: Omit<QuizHistory, 'id' | 'examDate'>) => string;
  onNavigate: (route: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  questions,
  onSaveQuizAttempt,
  onNavigate,
}) => {
  // Domain picker states
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  // Active question indexes
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);

  // AI Tutoring explanation states
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // End result sheets
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // Filter questions relative to domain pick
  useEffect(() => {
    let filtered = [...questions];
    if (selectedDomain !== 'All') {
      filtered = questions.filter(q => q.domain === selectedDomain);
    }
    // Randomize list for optimal diverse practice prep
    setPracticeQuestions(filtered.sort(() => Math.random() - 0.5));
  }, [questions, selectedDomain, isStarted]);

  const handleStart = () => {
    if (practiceQuestions.length === 0) return;
    setIsStarted(true);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsChecked(false);
    setAiExplanation('');
    setFlaggedIds([]);
    setIsFinished(false);
    setCorrectCount(0);
  };

  const handleAnswerChange = (val: any) => {
    if (isChecked) return; // Prevent edits after locking/checking
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }));
  };

  const currentQuestion = practiceQuestions[currentIndex];
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  // Bookmarking flagging toggle
  const toggleFlag = () => {
    const qId = currentQuestion.id;
    setFlaggedIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Grade an answer index/payload
  const checkAnswer = () => {
    if (!currentQuestion) return;
    setIsChecked(true);

    const isCorrect = gradeAnswerValue(currentQuestion, currentAnswer);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const gradeAnswerValue = (q: Question, ans: any): boolean => {
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
        // ans represents a record map of selections: { "RAM": "Temp memory", ... }
        const userMap = (ans as Record<string, string>) || {};
        const pairs = q.matchingPairs || [];
        if (pairs.length === 0) return false;
        
        // Count matches
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
        // ans is order string e.g. "2,0,1,3" compared to correct "0,1,2,3" is ascending
        return String(ans) === correct;
      }

      case 'hotspot': {
        // ans is "relativeX,relativeY" percents. Check if within hotspot target bounds
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
        // ans is choice strings joined by pipe A|B
        const userSelectedList = String(ans).split('|').filter(Boolean).sort();
        const correctList = q.correctAnswer.split('|').filter(Boolean).sort();
        if (userSelectedList.length !== correctList.length) return false;
        return userSelectedList.every((val, idx) => val.toLowerCase() === correctList[idx].toLowerCase());
      }

      default:
        return String(ans).toLowerCase() === correct;
    }
  };

  // Launch Server-Side AI Tutor feedback
  const askAiTutor = async () => {
    if (!currentQuestion) return;
    setIsAiLoading(true);
    setAiExplanation('');

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQuestion.questionText,
          options: currentQuestion.options,
          selectedAnswer: currentAnswer || 'Skipped/No option selected',
          correctAnswer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
          domain: currentQuestion.domain,
        }),
      });

      const data = await response.json();
      setAiExplanation(data.text || 'Unable to retrieve feedback at this moment.');
    } catch {
      setAiExplanation('### AI Connection Error\nSorry! Our sandboxed AI tutoring gateway experienced a timeout. Ensure server.ts is active.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleNext = () => {
    setAiExplanation('');
    setIsChecked(false);
    
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed last quiz item! Save attempt to history
      const scorePct = Math.round((correctCount / practiceQuestions.length) * 100);
      
      onSaveQuizAttempt({
        examType: 'practice',
        score: scorePct,
        totalQuestions: practiceQuestions.length,
        correctCount: correctCount,
        passed: scorePct >= 70, // Standard IC3 70% pass threshold
        domainScores: {
          'Computing Fundamentals': scorePct,
          'Key Applications': scorePct,
          'Living Online': scorePct,
        },
        timeSpent: 300, // Practice averages
      });
      setIsFinished(true);
    }
  };

  // Skip step helper
  const handleSkip = () => {
    handleAnswerChange('');
    checkAnswer();
  };

  if (questions.length === 0) {
    return (
      <div id="practice-loading-state" className="py-14 text-center max-w-sm mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-800">Database Empty</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          There are no questions loaded in the pool. Sync a dynamic Google Sheet first or restore system defaults in the Admin Panel to load fallback questions.
        </p>
        <button
          id="btn-nav-admin"
          onClick={() => onNavigate('admin')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
        >
          Go to Sync Panel
        </button>
      </div>
    );
  }

  return (
    <div id="practice-section" className="max-w-3xl mx-auto space-y-8 py-4 text-left">
      {!isStarted ? (
        /* Domain Selector Panel */
        <div id="practice-selector-card" className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Focus Practice Arena</h2>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
              Select an IC3 Global Standard 6 domain to target specific exam sections. Each block randomizes loaded rows to optimize diagnostic retention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['All', 'Computing Fundamentals', 'Key Applications', 'Living Online'].map((domain) => {
              const count = domain === 'All'
                ? questions.length
                : questions.filter(q => q.domain === domain).length;
              
              const isSelected = selectedDomain === domain;

              return (
                <button
                  id={`pick-domain-${domain.replace(/\s+/g, '-').toLowerCase()}`}
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`p-5 rounded-xl border text-left flex flex-col justify-between h-28 transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-650 bg-indigo-50/20 text-indigo-900 ring-2 ring-indigo-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-800 hover:border-slate-350'
                  }`}
                >
                  <span className="font-semibold text-sm line-clamp-1">{domain}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200 self-start mt-2">
                    {count} Questions available
                  </span>
                </button>
              );
            })}
          </div>

          <button
            id="btn-start-practice"
            onClick={handleStart}
            className="w-full py-4 rounded-xl bg-indigo-650 hover:bg-indigo-600 font-bold text-white transition text-sm cursor-pointer shadow-lg shadow-indigo-650/15"
          >
            Launch Focus Arena Session
          </button>
        </div>
      ) : isFinished ? (
        /* Summary statistics display card */
        <div id="practice-result-card" className="p-6 sm:p-10 rounded-2xl border border-slate-200 bg-white text-center space-y-6 shadow-sm">
          <BookOpen className="w-14 h-14 text-indigo-600 mx-auto animate-bounce" />
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Practice Arena Complete!</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              You worked through your selected Focus curriculum questions series. Review your immediate diagnostics below:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto p-4 bg-slate-55 border border-slate-200 rounded-xl">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
              <p className="text-xl font-extrabold text-slate-800 font-mono">{practiceQuestions.length}</p>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400">Correct</p>
              <p className="text-xl font-extrabold text-emerald-600 font-mono">{correctCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
              <p className="text-xl font-extrabold text-indigo-600 font-mono">{Math.round((correctCount / practiceQuestions.length) * 100)}%</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[13px] text-slate-500 max-w-md mx-auto leading-relaxed">
            🎓 Completion awards <strong>+{correctCount * 15} XP Points</strong> to your overall progression levels, keeping your Daily streak safely active!
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              id="btn-retry-practice"
              onClick={handleStart}
              className="px-5 py-3 rounded-lg bg-indigo-650 hover:bg-indigo-600 font-semibold text-white text-xs cursor-pointer"
            >
              Practice Again
            </button>
            <button
              id="btn-nav-dashboard"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 text-xs cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Actual Active practice quiz board */
        <div id="practice-active-arena" className="space-y-6">
          {/* Header Progress panel */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="text-left space-y-0.5">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{currentQuestion.domain}</p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-sm sm:text-base">Practice ID: #{currentQuestion.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                  currentQuestion.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700' :
                  currentQuestion.difficulty === 'Intermediate' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs text-slate-500 font-mono font-bold">
                Question {currentIndex + 1} of {practiceQuestions.length}
              </span>
              <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition"
                  style={{ width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Box Card */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
            <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed text-left">
                {currentQuestion.questionText}
              </h3>
              
              {/* Flag button */}
              <button
                id="btn-flag-quest"
                onClick={toggleFlag}
                className={`p-2 rounded-lg border transition shrink-0 cursor-pointer ${
                  flaggedIds.includes(currentQuestion.id)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title="Flag question for review"
              >
                <Bookmark className={`w-4 h-4 ${flaggedIds.includes(currentQuestion.id) ? 'fill-indigo-600' : ''}`} />
              </button>
            </div>

            {/* Dynamic visual options form */}
            <QuestionRenderer
              question={currentQuestion}
              value={currentAnswer}
              onChange={handleAnswerChange}
              disabled={isChecked}
              showCorrectAnswers={isChecked}
            />

            {/* Response button controls block */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 justify-between items-center">
              <div>
                {!isChecked ? (
                  <button
                    id="btn-skip-practice"
                    onClick={handleSkip}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Skip Question
                  </button>
                ) : (
                  <div className="text-xs text-slate-400">
                    Press Next Question to save progression.
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                {!isChecked ? (
                  <button
                    id="btn-check-answer"
                    disabled={currentAnswer === undefined || currentAnswer === ''}
                    onClick={checkAnswer}
                    className={`px-5 py-2.5 rounded-lg font-semibold text-xs border cursor-pointer flex items-center gap-1.5 transition ${
                      currentAnswer === undefined || currentAnswer === ''
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-indigo-650 hover:bg-indigo-600 text-white border-indigo-650 shadow-sm'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" /> Grade Answer
                  </button>
                ) : (
                  <button
                    id="btn-next-practice"
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-550 border border-emerald-600 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    Next Question <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback details box shown after check */}
          {isChecked && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-semibold ${
                    gradeAnswerValue(currentQuestion, currentAnswer) ? 'bg-emerald-600' : 'bg-rose-500'
                  }`}>
                    {gradeAnswerValue(currentQuestion, currentAnswer) ? '✓' : '✗'}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {gradeAnswerValue(currentQuestion, currentAnswer) ? 'Excellent! Correct Answer' : 'Incorrect choice response'}
                  </h4>
                </div>

                <button
                  id="btn-ask-ai"
                  disabled={isAiLoading}
                  onClick={askAiTutor}
                  className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow shadow-indigo-600/10"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Ask AI Tutor Pro feedback
                </button>
              </div>

              {/* AI Tutoring Explanation container */}
              {isAiLoading && (
                <div id="ai-loading" className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> Connecting Gemini 3.5 Turbo mentoring cells... Asking customized tutoring suggestions.
                </div>
              )}

              {aiExplanation && (
                <div id="ai-explanation-box" className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs sm:text-[13px] leading-relaxed text-indigo-950 markdown-body shadow-sm">
                  <Markdown>{aiExplanation}</Markdown>
                </div>
              )}

              {/* Standard documentation description fallback */}
              <div id="standard-explanation-box" className="space-y-1.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800">Syllabus Guide Explanation:</p>
                <p>{currentQuestion.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
