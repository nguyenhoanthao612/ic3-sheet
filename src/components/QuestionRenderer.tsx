import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowUp, ArrowDown, Image as ImageIcon, Video, Check, HelpCircle } from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  value: any; // User answer
  onChange: (val: any) => void;
  disabled?: boolean;
  showCorrectAnswers?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswers = false,
}) => {
  const { type, questionText, options, correctAnswer, imageUrl, videoUrl } = question;

  // Render question media first
  const renderMedia = () => {
    if (imageUrl && type !== 'hotspot') {
      return (
        <div id="media-img-container" className="mb-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-lg mx-auto bg-slate-50">
          <img
            id="media-img"
            src={imageUrl}
            alt="Question Diagram"
            className="w-full h-auto object-cover max-h-64 sm:max-h-80"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
    if (videoUrl) {
      return (
        <div id="media-video-container" className="mb-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-xl mx-auto bg-black aspect-video relative">
          <iframe
            id="media-iframe"
            src={videoUrl}
            title="Practice Context Video"
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    return null;
  };

  // --- 1. Multiple Choice Renderer ---
  const renderMultipleChoice = () => {
    const selectedSelection = value as string;

    return (
      <div id="renderer-mcq" className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedSelection === option;
          const isCorrect = option === correctAnswer;
          
          let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-300";
          if (isSelected) {
            btnStyle = "border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/10";
          }
          if (showCorrectAnswers) {
            if (isCorrect) {
              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 font-medium";
            } else if (isSelected && !isCorrect) {
              btnStyle = "border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20";
            }
          }

          const letter = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <button
              id={`opt-mcq-${index}`}
              key={index}
              onClick={() => !disabled && onChange(option)}
              disabled={disabled}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition ${btnStyle}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border shrink-0 transition ${
                isSelected 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              } ${showCorrectAnswers && isCorrect ? 'bg-emerald-600 border-emerald-600 text-white' : ''} ${showCorrectAnswers && isSelected && !isCorrect ? 'bg-rose-600 border-rose-600 text-white' : ''}`}>
                {letter}
              </span>
              <span className="text-[15px] leading-relaxed">{option}</span>
              {showCorrectAnswers && isCorrect && (
                <Check className="w-5 h-5 text-emerald-600 ml-auto shrink-0 animate-bounce" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // --- 2. True / False Renderer ---
  const renderTrueFalse = () => {
    const selected = value as string; // 'True' or 'False'

    return (
      <div id="renderer-tf" className="grid grid-cols-2 gap-4">
        {['True', 'False'].map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === correctAnswer;

          let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-300";
          if (isSelected) {
            btnStyle = option === 'True'
              ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/10"
              : "border-rose-600 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/10";
          }
          if (showCorrectAnswers) {
            if (isCorrect) {
              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
            } else if (isSelected && !isCorrect) {
              btnStyle = "border-rose-500 bg-rose-50 text-rose-900";
            }
          }

          return (
            <button
              id={`opt-tf-${option}`}
              key={option}
              onClick={() => !disabled && onChange(option)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border transition h-32 sm:h-36 ${btnStyle}`}
            >
              <span className="text-lg sm:text-xl font-semibold mb-1">{option}</span>
              <span className="text-xs text-slate-500">
                {option === 'True' ? 'Statement is accurate' : 'Statement is incorrect'}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // --- 3. Fill in the Blank Renderer ---
  const renderFillBlank = () => {
    const valText = value as string || '';
    const isCorrect = valText.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    return (
      <div id="renderer-fill" className="space-y-4">
        <div className="relative max-w-sm">
          <input
            id="fill-blank-input"
            type="text"
            value={valText}
            onChange={(e) => !disabled && onChange(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer short here..."
            className={`w-full px-5 py-4 rounded-xl border text-base outline-none transition font-medium uppercase tracking-wider ${
              disabled ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 border-slate-300 shadow-sm'
            } ${showCorrectAnswers && isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-950 pr-12' : ''} ${showCorrectAnswers && !isCorrect && valText ? 'border-rose-500 bg-rose-50 text-rose-950 pr-12' : ''}`}
          />
          {showCorrectAnswers && (
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-sm ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
          )}
        </div>

        {showCorrectAnswers && (
          <div id="fill-correct-answer" className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            <strong>Expected answer:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-semibold uppercase">{correctAnswer}</span>
          </div>
        )}
      </div>
    );
  };

  // --- 4. Matching Renderer ---
  const renderMatching = () => {
    // Value represents an object mapping left string to right string: { "RAM": "Temp storage", ... }
    const currentMappings = (value as Record<string, string>) || {};

    // Get matching pairs from question text parsing or fallback options
    const pairs = question.matchingPairs || [];
    const leftKeys = pairs.map((p) => p.left);
    const rightValues = pairs.map((p) => p.right);

    const handleSelectMatch = (left: string, right: string) => {
      if (disabled) return;
      const updated = { ...currentMappings };
      if (!right) {
        delete updated[left];
      } else {
        updated[left] = right;
      }
      onChange(updated);
    };

    return (
      <div id="renderer-matching" className="space-y-4">
        <p className="text-xs text-slate-500 font-medium mb-2">Connect each item on the left with its correct counterpart on the right:</p>
        <div className="space-y-3">
          {leftKeys.map((left, idx) => {
            const selectedMatch = currentMappings[left] || '';
            const correctMatchObj = pairs.find((p) => p.left === left);
            const isMatchCorrect = selectedMatch === correctMatchObj?.right;

            let borderStyle = "border-slate-200 bg-slate-50/50";
            if (selectedMatch) {
              borderStyle = "border-indigo-200 bg-indigo-50/10";
            }
            if (showCorrectAnswers) {
              borderStyle = isMatchCorrect
                ? "border-emerald-200 bg-emerald-50/30"
                : "border-rose-200 bg-rose-50/30";
            }

            return (
              <div
                id={`matching-row-${idx}`}
                key={idx}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-xl gap-3 transition ${borderStyle}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 text-[14px]">{left}</span>
                </div>

                <div className="flex items-center gap-2 sm:max-w-md w-full sm:w-auto">
                  <select
                    id={`matching-select-${idx}`}
                    value={selectedMatch}
                    onChange={(e) => handleSelectMatch(left, e.target.value)}
                    disabled={disabled}
                    className={`w-full sm:w-72 px-3 py-2 rounded-lg border text-xs sm:text-[13px] bg-white text-slate-700 outline-none transition focus:border-indigo-500 ${
                      showCorrectAnswers && isMatchCorrect ? 'border-emerald-500 text-emerald-950 font-medium' : ''
                    } ${showCorrectAnswers && !isMatchCorrect && selectedMatch ? 'border-rose-500 text-rose-950' : ''}`}
                  >
                    <option value="">-- Choose matching item --</option>
                    {rightValues.map((def, defIdx) => (
                      <option key={defIdx} value={def}>
                        {def}
                      </option>
                    ))}
                  </select>

                  {showCorrectAnswers && (
                    <span className="shrink-0">
                      {isMatchCorrect ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <span title={`Correct: ${correctMatchObj?.right}`}>
                          <HelpCircle className="w-5 h-5 text-rose-600" />
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showCorrectAnswers && (
          <div id="matching-answers-box" className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-[13px] text-emerald-900 space-y-1">
            <strong>Correct Pairings Reference:</strong>
            <ul className="list-disc pl-5 space-y-1">
              {pairs.map((p, i) => (
                <li key={i}>
                  <span className="font-semibold text-slate-900">{p.left}:</span> {p.right}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // --- 5. Drag & Drop Categorization Renderer ---
  const renderDragDrop = () => {
    // Value stores categorized assignments: Record<string, string> mapping item text to selected category name
    const itemAssignments = (value as Record<string, string>) || {};
    
    // Drag-drop configuration parsing or fallback
    const config = question.dragDropCategories || { categories: ['Safe', 'Insecure'], items: [] };

    const handleCategorize = (itemText: string, category: string) => {
      if (disabled) return;
      const updated = { ...itemAssignments };
      if (!category) {
        delete updated[itemText];
      } else {
        updated[itemText] = category;
      }
      onChange(updated);
    };

    return (
      <div id="renderer-dragdrop" className="space-y-6">
        <p className="text-xs text-slate-500 font-medium">Assign each item below directly to its correct category box:</p>
        
        {/* Unassigned/Active Items Pool */}
        <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          {config.items.map((item, index) => {
            const assignedCat = itemAssignments[item.text] || '';
            const correctCat = item.category;
            const isCorrect = assignedCat === correctCat;

            let cardStyle = "border-slate-200 bg-white shadow-sm text-slate-700";
            if (assignedCat) {
              cardStyle = "border-indigo-100 bg-indigo-50/50 text-indigo-900";
              if (showCorrectAnswers) {
                cardStyle = isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-medium"
                  : "border-rose-300 bg-rose-50 text-rose-950";
              }
            }

            return (
              <div
                id={`dd-item-${index}`}
                key={index}
                className={`p-3 rounded-lg border text-xs sm:text-[13px] flex items-center gap-2 transition ${cardStyle}`}
              >
                <span>{item.text}</span>
                <select
                  id={`dd-select-${index}`}
                  value={assignedCat}
                  onChange={(e) => handleCategorize(item.text, e.target.value)}
                  disabled={disabled}
                  className="px-1.5 py-1 text-[11px] font-semibold border rounded bg-white text-slate-600 outline-none"
                >
                  <option value="">Unassigned</option>
                  {config.categories.map((cat, ci) => (
                    <option key={ci} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {showCorrectAnswers && assignedCat && (
                  <span>
                    {isCorrect ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-red-500 text-xs font-bold font-mono">X</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Visual Category Groups Bin display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.categories.map((category, catIdx) => {
            const itemsInThisCategory = config.items.filter(
              (it) => itemAssignments[it.text] === category
            );

            return (
              <div
                id={`dd-category-bin-${catIdx}`}
                key={catIdx}
                className="border border-indigo-100/70 rounded-2xl bg-indigo-50/10 p-4 min-h-[140px] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-3">
                  <span className="font-semibold text-indigo-950 text-sm">{category}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {itemsInThisCategory.length} categorized
                  </span>
                </div>

                <div className="space-y-2 flex-grow">
                  {itemsInThisCategory.length === 0 ? (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-xs text-slate-400 py-6">
                      No items placed yet
                    </div>
                  ) : (
                    itemsInThisCategory.map((item, itemIdx) => {
                      const isCorrect = item.category === category;
                      return (
                        <div
                          id={`dd-binned-item-${catIdx}-${itemIdx}`}
                          key={itemIdx}
                          className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-center justify-between ${
                            showCorrectAnswers
                              ? isCorrect
                                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                                : 'bg-rose-50 text-rose-950 border-rose-200'
                              : 'bg-white text-slate-700 border-slate-250 shadow-sm'
                          }`}
                        >
                          <span>{item.text}</span>
                          {showCorrectAnswers && (
                            <span>{isCorrect ? '✅' : '❌ Wrong Category'}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- 6. Hotspot Image Questions Renderer ---
  const renderHotspot = () => {
    // Value represents coordinate strings: "normalizedX,normalizedY" (e.g. "0.45,0.78")
    const coordinate = value as string;
    const [selectedX, selectedY] = coordinate ? coordinate.split(',').map(Number) : [null, null];

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Calculate normalized percentages
      const normalizedX = Number((clickX / rect.width).toFixed(2));
      const normalizedY = Number((clickY / rect.height).toFixed(2));

      onChange(`${normalizedX},${normalizedY}`);
    };

    // Correct target settings
    const hotspot = question.hotspotArea || { x: 50, y: 50, w: 20, h: 20 };

    return (
      <div id="renderer-hotspot" className="space-y-4">
        <p className="text-xs text-slate-500 font-medium">Click directly on the canvas image to select the target hotspot boundaries:</p>
        
        <div className="relative max-w-xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 select-none">
          <div
            id="hotspot-clickable-frame"
            className="relative cursor-crosshair inline-block w-full"
            onClick={handleImageClick}
          >
            <img
              id="hotspot-img"
              src={imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
              alt="Interaction Target"
              className="w-full h-auto max-h-[350px] object-cover block pointer-events-none"
              referrerPolicy="no-referrer"
            />
            
            {/* User selected indicator maker */}
            {selectedX !== null && selectedY !== null && (
              <div
                id="hotspot-user-marker"
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center animate-ping-once ${
                  showCorrectAnswers
                    ? (selectedX * 100 >= hotspot.x &&
                       selectedX * 100 <= hotspot.x + hotspot.w &&
                       selectedY * 100 >= hotspot.y &&
                       selectedY * 100 <= hotspot.y + hotspot.h)
                      ? 'bg-emerald-500/40 border-emerald-500'
                      : 'bg-rose-500/45 border-rose-500'
                    : 'bg-indigo-500/40 border-indigo-600'
                }`}
                style={{ left: `${selectedX * 100}%`, top: `${selectedY * 100}%` }}
              >
                <div id="marker-dot" className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
              </div>
            )}

            {/* Render true hotspot container if shown */}
            {showCorrectAnswers && (
              <div
                id="hotspot-target-overlay"
                className="absolute border-2 border-dashed border-emerald-500 bg-emerald-500/20 rounded flex items-center justify-center pointer-events-none"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  width: `${hotspot.w}%`,
                  height: `${hotspot.h}%`,
                }}
              >
                <div className="text-[10px] font-bold text-emerald-800 bg-white/90 px-1 py-0.2 rounded border border-emerald-500 shadow-sm">
                  🎯 Correct Target
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
          <span>
            {coordinate ? (
              <span>Your selection coordinate: <strong>X: {Math.round(selectedX! * 100)}%, Y: {Math.round(selectedY! * 100)}%</strong></span>
            ) : (
              <span className="text-amber-600 font-medium">⚠️ No selection made on the display. Click the image to pick a point.</span>
            )}
          </span>
          <button
            id="hotspot-reset"
            disabled={disabled || !coordinate}
            onClick={() => onChange('')}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-600 font-semibold"
          >
            Clear Target select
          </button>
        </div>
      </div>
    );
  };

  // --- 9. Step Ordering Questions Renderer ---
  const renderStepOrdering = () => {
    // Value represents comma separated list of original indices: e.g. "2,0,1,3,4"
    const orderString = value as string;
    const itemsCount = options.length;

    // Use internal state first to support easier reordering transitions safely
    const [currentOrder, setCurrentOrder] = useState<number[]>([]);

    useEffect(() => {
      if (orderString) {
        setCurrentOrder(orderString.split(',').map(Number));
      } else {
        // Initialize with default ascending range
        const base = Array.from({ length: itemsCount }, (_, i) => i);
        setCurrentOrder(base);
        onChange(base.join(','));
      }
    }, [orderString, itemsCount]);

    const handleMove = (index: number, direction: 'up' | 'down') => {
      if (disabled) return;
      const newOrder = [...currentOrder];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= itemsCount) return;

      // Swap
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;

      setCurrentOrder(newOrder);
      onChange(newOrder.join(','));
    };

    return (
      <div id="renderer-ordering" className="space-y-3">
        <p className="text-xs text-slate-500 font-medium">Change order using the control keys on the right:</p>
        
        <div className="space-y-2">
          {currentOrder.map((originalIndex, orderPos) => {
            const stepText = options[originalIndex];
            const isCorrectIndex = originalIndex === orderPos;

            let rowStyle = "border-slate-200 bg-white";
            if (showCorrectAnswers) {
              rowStyle = isCorrectIndex
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-rose-300 bg-rose-50 text-rose-900";
            }

            return (
              <div
                id={`ordering-row-${orderPos}`}
                key={originalIndex}
                className={`flex items-center justify-between p-3.5 border rounded-xl gap-3 transition shadow-sm ${rowStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition ${
                    showCorrectAnswers
                      ? isCorrectIndex
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                      : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  }`}>
                    {orderPos + 1}
                  </div>
                  <span className="text-[14px] leading-relaxed text-slate-800 font-semibold">{stepText}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    id={`order-up-${orderPos}`}
                    disabled={disabled || orderPos === 0}
                    onClick={() => handleMove(orderPos, 'up')}
                    className={`p-1.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 transition ${
                      (disabled || orderPos === 0) ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    id={`order-down-${orderPos}`}
                    disabled={disabled || orderPos === itemsCount - 1}
                    onClick={() => handleMove(orderPos, 'down')}
                    className={`p-1.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 transition ${
                      (disabled || orderPos === itemsCount - 1) ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {showCorrectAnswers && (
          <div id="ordering-correct-flow" className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-[13px] text-emerald-900 space-y-1">
            <strong>Correct Sequence Path:</strong>
            <ol className="list-decimal pl-5 space-y-1">
              {options.map((step, idx) => (
                <li key={idx} className="font-semibold">{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  // --- 10. Multi-select Renderer ---
  const renderMultiSelect = () => {
    // Value stores string delimited by "|" e.g. "Google Docs|Dropbox Paper"
    const currentListStr = value as string || '';
    const currentSelections = currentListStr.split('|').filter(Boolean);

    const handleToggleSelect = (option: string) => {
      if (disabled) return;
      let nextSelections = [...currentSelections];
      if (nextSelections.includes(option)) {
        nextSelections = nextSelections.filter((x) => x !== option);
      } else {
        nextSelections.push(option);
      }
      onChange(nextSelections.join('|'));
    };

    // Correct Answers parse
    const corrects = correctAnswer.split('|');

    return (
      <div id="renderer-multiselect" className="space-y-3">
        <p className="text-xs text-slate-500 font-medium">Select one or more items that apply:</p>
        
        {options.map((option, index) => {
          const isSelected = currentSelections.includes(option);
          const isCorrectChoice = corrects.includes(option);

          let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
          if (isSelected) {
            btnStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/10";
          }
          if (showCorrectAnswers) {
            if (isCorrectChoice) {
              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium";
            } else if (isSelected && !isCorrectChoice) {
              btnStyle = "border-rose-500 bg-rose-50 text-rose-950";
            }
          }

          return (
            <button
              id={`opt-multi-${index}`}
              key={index}
              disabled={disabled}
              onClick={() => handleToggleSelect(option)}
              className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition select-none ${btnStyle}`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                isSelected 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-white border-slate-300 text-transparent'
              } ${showCorrectAnswers && isCorrectChoice ? 'bg-emerald-600 border-emerald-600 text-white' : ''}`}>
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
              </div>

              <span className="text-[14px] sm:text-[15px] leading-relaxed text-slate-800 font-medium">{option}</span>
              
              {showCorrectAnswers && isCorrectChoice && (
                <span className="text-emerald-700 text-xs font-semibold ml-auto flex items-center gap-1 shrink-0 bg-emerald-100 py-0.5 px-2 rounded-full border border-emerald-200 shadow-sm animate-bounce">
                  <Check className="w-3 h-3" /> Correct Key
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Route layouts according to type values
  const renderLayout = () => {
    switch (type) {
      case 'multiple-choice':
      case 'image-question':
        return renderMultipleChoice();
      case 'true-false':
        return renderTrueFalse();
      case 'fill-blank':
        return renderFillBlank();
      case 'matching':
        return renderMatching();
      case 'drag-drop':
        return renderDragDrop();
      case 'hotspot':
        return renderHotspot();
      case 'step-ordering':
        return renderStepOrdering();
      case 'multi-select':
        return renderMultiSelect();
      case 'video-question':
        return (
          <div id="video-quest-wrap">
            {renderMedia()}
            {renderMultipleChoice()}
          </div>
        );
      default:
        // Default MCQ fallback
        return renderMultipleChoice();
    }
  };

  return (
    <div id="question-renderer-container" className="pt-2">
      {type !== 'video-question' && renderMedia()}
      <div id="question-answers-block" className="mt-2">{renderLayout()}</div>
    </div>
  );
};
