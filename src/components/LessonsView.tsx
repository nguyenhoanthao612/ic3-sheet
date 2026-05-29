import React, { useState } from 'react';
import { Lesson } from '../types';
import { DEFAULT_LESSONS } from '../mockData';
import { BookOpen, Layers, PlayCircle, Milestone, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';

interface LessonsViewProps {
  onNavigate: (route: string) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onNavigate }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(DEFAULT_LESSONS[0]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveCardIndex(0);
    setIsFlipped(false);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (activeCardIndex < selectedLesson.flashcards.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    } else {
      setActiveCardIndex(0); // loop back
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (activeCardIndex > 0) {
      setActiveCardIndex(prev => prev - 1);
    } else {
      setActiveCardIndex(selectedLesson.flashcards.length - 1);
    }
  };

  return (
    <div id="lessons-study-hub" className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-2 text-left">
      {/* Left Sidebar: Syllabus outline */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Syllabus Outline</h3>
          <p className="text-xs text-slate-500">Pick a module below to launch the curriculum reader:</p>
        </div>

        <div className="space-y-4">
          {['Computing Fundamentals', 'Key Applications', 'Living Online'].map((domainName) => {
            const domainLessons = DEFAULT_LESSONS.filter(l => l.domain === domainName);

            return (
              <div key={domainName} className="space-y-2">
                <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest pl-1">
                  {domainName}
                </p>
                <div className="space-y-1">
                  {domainLessons.map((les) => {
                    const isCurrent = les.id === selectedLesson.id;
                    return (
                      <button
                        id={`les-btn-${les.id}`}
                        key={les.id}
                        onClick={() => handleLessonSelect(les)}
                        className={`w-full p-3 rounded-xl border text-left transition text-xs sm:text-[13px] flex items-start gap-2.5 cursor-pointer ${
                          isCurrent
                            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 font-bold ring-2 ring-indigo-500/10'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="line-clamp-1">{les.title}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{les.duration} read time</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Launch Practice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Milestone className="w-4 h-4 text-emerald-600" /> Syllabus Ready?
          </p>
          <p className="text-slate-500 leading-relaxed">
            Test your diagnostics on this absolute topic module by launching a custom practice focus run!
          </p>
          <button
            id="lessons-launch-practice-btn"
            onClick={() => onNavigate('practice')}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] uppercase cursor-pointer text-center block"
          >
            Launch Practice Arena
          </button>
        </div>
      </div>

      {/* Right Content details: Lessons Markdown, videos elements and Flashcards */}
      <div className="lg:col-span-3 space-y-8">
        {/* Core Lesson Detail Panel */}
        <div id="lesson-detail-body" className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">
                {selectedLesson.domain} Module Lesson
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-930 tracking-tight">
                {selectedLesson.title}
              </h2>
            </div>
            
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-full shrink-0 self-start sm:self-auto">
              ⏱ Read duration: {selectedLesson.duration}
            </span>
          </div>

          {/* Embedded Context Video if registered */}
          {selectedLesson.videoUrl && (
            <div id="lesson-embed-video-card" className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video relative max-w-lg mx-auto shadow-sm">
              <iframe
                id="lesson-video-iframe"
                src={selectedLesson.videoUrl}
                title="Lesson Tutorial Video"
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Raw Markdown reader */}
          <div id="lesson-markdown-body" className="text-xs sm:text-[14px] leading-relaxed text-slate-700 markdown-body prose prose-slate max-w-none pt-2">
            <Markdown>{selectedLesson.content}</Markdown>
          </div>
        </div>

        {/* Dynamic Flashcard Interactive block */}
        <div id="lesson-flashcards-box" className="p-6 md:p-8 rounded-2xl border border-indigo-100 bg-indigo-50/10 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-indigo-950 text-base sm:text-lg flex items-center gap-2 justify-center">
              <Layers className="w-5 h-5 text-indigo-600 animate-pulse" />
              Syllabus Review Flashcards
            </h3>
            <p className="text-xs text-indigo-900/60">Click on the card to safely flip its response, memorizing key keywords.</p>
          </div>

          {selectedLesson.flashcards && selectedLesson.flashcards.length > 0 ? (
            <div id="flashcard-carousel-wrap" className="space-y-4 max-w-sm mx-auto">
              
              {/* Interactive Flippable Card Container */}
              <div
                id="flashcard-flippable-body"
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-48 w-full cursor-pointer select-none perspective-1000 group active:scale-[0.98] transition-transform"
              >
                <div
                  id="card-flip-face"
                  className={`relative w-full h-full text-center transition-all duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Card Front face */}
                  <div className="absolute inset-0 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-md backface-hidden">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Front of Card</span>
                    <div className="text-slate-800 font-bold text-sm sm:text-base leading-relaxed py-4">
                      {selectedLesson.flashcards[activeCardIndex].front}
                    </div>
                    <span className="text-[11px] text-indigo-600 font-bold hover:underline">Click to Flip Answer &rarr;</span>
                  </div>

                  {/* Card Back face */}
                  <div className="absolute inset-0 bg-indigo-900 border border-indigo-950 rounded-2xl p-6 flex flex-col justify-between text-white shadow-md backface-hidden rotate-y-180">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block text-left">Explanation / Key Answer</span>
                    <div className="font-medium text-xs sm:text-sm leading-relaxed py-4 text-indigo-100 overflow-y-auto max-h-32">
                      {selectedLesson.flashcards[activeCardIndex].back}
                    </div>
                    <span className="text-[11px] text-indigo-300 font-bold hover:underline">&larr; Return to Front</span>
                  </div>
                </div>
              </div>

              {/* Slider keys */}
              <div className="flex justify-between items-center px-2 text-xs">
                <button
                  id="btn-flash-prev"
                  onClick={handlePrevCard}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  &larr; Prev
                </button>
                <span className="font-mono font-bold text-slate-500">
                  Card {activeCardIndex + 1} of {selectedLesson.flashcards.length}
                </span>
                <button
                  id="btn-flash-next"
                  onClick={handleNextCard}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No flashcards registered for this module.</p>
          )}
        </div>
      </div>
    </div>
  );
};
