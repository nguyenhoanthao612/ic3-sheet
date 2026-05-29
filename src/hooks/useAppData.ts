import { useState, useEffect } from 'react';
import { Question, QuizHistory, StudentProfile, LeaderboardEntry, Lesson } from '../types';
import { DEFAULT_QUESTIONS, DEFAULT_LESSONS, DEFAULT_LEADERBOARD, DEFAULT_PROFILE, ALL_BADGES } from '../mockData';

export const useAppData = () => {
  // Navigation / Router state
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  
  // Custom sheets configurations
  const [googleSheetId, setGoogleSheetId] = useState<string>(() => {
    return localStorage.getItem('ic3_google_sheet_id') || '';
  });
  
  // Questions pool (synced from sheet or fallback defaults)
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('ic3_cached_questions');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_QUESTIONS; }
    }
    return DEFAULT_QUESTIONS;
  });

  const [syncStatus, setSyncStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    syncedAt?: string;
  }>({ status: 'idle', message: 'Ready to sync with Google Sheets' });

  // Student progress trackers
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('ic3_student_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_PROFILE; }
    }
    return DEFAULT_PROFILE;
  });

  const [history, setHistory] = useState<QuizHistory[]>(() => {
    const saved = localStorage.getItem('ic3_quiz_history');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('ic3_leaderboard_entries');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_LEADERBOARD; }
    }
    return DEFAULT_LEADERBOARD;
  });

  // Review parameter tracker
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, any>>({});
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);

  // Synchronize state back onto localStorage on modifications
  useEffect(() => {
    localStorage.setItem('ic3_google_sheet_id', googleSheetId);
  }, [googleSheetId]);

  useEffect(() => {
    localStorage.setItem('ic3_cached_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('ic3_student_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('ic3_quiz_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ic3_leaderboard_entries', JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Synchronize with server-side Google Sheets parser API
  const syncWithGoogleSheet = async (sheetIdToSync: string = googleSheetId) => {
    if (!sheetIdToSync.trim()) {
      setSyncStatus({ status: 'error', message: 'Spreadsheet ID parameters cannot be blank.' });
      return false;
    }
    
    setSyncStatus({ status: 'loading', message: 'Fetching Google Spreadsheet rows...' });
    
    try {
      // Fetch from our backend Express route
      const cleanId = extractSheetId(sheetIdToSync);
      const res = await fetch(`/api/questions?sheetId=${cleanId}&refresh=true`);
      const data = await res.json();
      
      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setGoogleSheetId(cleanId);
        
        setSyncStatus({
          status: 'success',
          message: `Successfully synchronized ${data.questions.length} practice questions!`,
          syncedAt: data.syncedAt
        });

        // Award dynamic Badge for custom integrations!
        awardBadge('b6');
        addXp(200); // 200XP sync reward bonus!
        return true;
      } else {
        throw new Error(data.message || 'Row list parsed as empty. Ensure columns follow structure guidelines.');
      }
    } catch (err: any) {
      setSyncStatus({
        status: 'error',
        message: err.message || 'Google Sheets sync failed. Please review public sharing settings.'
      });
      return false;
    }
  };

  // Helper to strip Google Sheets URL to get the target Google Sheets ID
  const extractSheetId = (input: string): string => {
    if (!input) return '';
    // Matches spreadsheet ID in standard Google URL formats
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };

  // Logic to award achievement badges safely
  const awardBadge = (badgeId: string) => {
    setProfile(prev => {
      // Check if they already have it
      if (prev.badges.some(b => b.id === badgeId)) return prev;
      
      const badgeConfig = ALL_BADGES.find(b => b.id === badgeId);
      if (!badgeConfig) return prev;

      const newBadge = {
        ...badgeConfig,
        unlockedAt: new Date().toISOString()
      };
      
      return {
        ...prev,
        badges: [...prev.badges, newBadge]
      };
    });
  };

  // Logic to increase XP safely with level configurations
  const addXp = (xpEarned: number) => {
    setProfile(prev => {
      const totalXp = prev.xp + xpEarned;
      // standard level calc: Level = Floor(SquareRoot(totalXp / 100)) + 1
      const calculatedLevel = Math.floor(Math.sqrt(totalXp / 150)) + 1;
      const leveledUp = calculatedLevel > prev.level;
      
      // Sync leaderboard values
      updateLeaderboardXp(totalXp, calculatedLevel);

      return {
        ...prev,
        xp: totalXp,
        level: calculatedLevel,
        streak: prev.streak
      };
    });
  };

  // Sync leaderboard entry for current user
  const updateLeaderboardXp = (userXp: number, userLevel: number) => {
    setLeaderboard(prev => {
      const idx = prev.findIndex(item => item.isCurrentUser || item.name === 'Nguyen H.');
      let updated = [...prev];
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          xp: userXp,
          level: userLevel,
          isCurrentUser: true,
          name: 'Nguyen H. (You)'
        };
      } else {
        updated.push({
          rank: prev.length + 1,
          name: 'Nguyen H. (You)',
          xp: userXp,
          level: userLevel,
          streak: profile.streak,
          isCurrentUser: true
        });
      }
      
      // Re-sort leaderboard rankings by XP
      return updated
        .sort((a, b) => b.xp - a.xp)
        .map((player, index) => ({
          ...player,
          rank: index + 1
        }));
    });
  };

  // Record a completed exam or practice session
  const saveQuizAttempt = (attempt: Omit<QuizHistory, 'id' | 'examDate'>) => {
    const newId = `hist-${Date.now()}`;
    const newHistoryEntry: QuizHistory = {
      ...attempt,
      id: newId,
      examDate: new Date().toISOString()
    };

    setHistory(prev => [newHistoryEntry, ...prev]);

    // Submit live stats to secure server analytics database
    fetch('/api/exams/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nguyen H. (You)',
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctCount: attempt.correctCount,
        duration: attempt.timeSpent,
        examType: attempt.examType
      })
    }).catch(err => console.error("Could not record session score server-side:", err));

    // Give dynamic reward XP
    const baseXP = attempt.correctCount * 15; // 15 XP per correct question
    const passBonus = attempt.passed ? 100 : 0; // 100 XP pass bonus reward
    const totalAwarded = baseXP + passBonus;
    
    addXp(totalAwarded);

    // Increase day streaks
    setProfile(prev => {
      const nextStreak = prev.streak + 1;
      // Award special streak badge!
      if (nextStreak >= 5) {
        setTimeout(() => awardBadge('b3'), 100);
      }
      return {
        ...prev,
        streak: nextStreak,
        lastActiveDate: new Date().toISOString()
      };
    });

    // Award perfect score badge
    if (attempt.correctCount === attempt.totalQuestions) {
      if (attempt.domainScores['Living Online'] === attempt.totalQuestions && attempt.totalQuestions > 2) {
        awardBadge('b2');
      } else {
        awardBadge('b1');
      }
    }

    // Award domain master badge!
    if (history.length >= 2) {
      awardBadge('b4');
    }

    return newId;
  };

  // Restore defaults / Reset system
  const resetToLocalDefaults = () => {
    setQuestions(DEFAULT_QUESTIONS);
    setGoogleSheetId('');
    setProfile({
      xp: 150,
      streak: 1,
      lastActiveDate: new Date().toISOString(),
      badges: [
        {
          id: 'b1',
          name: 'First Blood',
          description: 'Completed your first IC3 GS6 practice session successfully.',
          icon: 'zap',
          unlockedAt: new Date().toISOString()
        }
      ],
      level: 1
    });
    setHistory([]);
    setLeaderboard(DEFAULT_LEADERBOARD);
    localStorage.removeItem('ic3_cached_questions');
    localStorage.removeItem('ic3_google_sheet_id');
    localStorage.removeItem('ic3_student_profile');
    localStorage.removeItem('ic3_quiz_history');
    localStorage.removeItem('ic3_leaderboard_entries');
    setSyncStatus({ status: 'idle', message: 'System restored to built-in fallback questions.' });
  };

  return {
    currentRoute,
    setCurrentRoute,
    googleSheetId,
    setGoogleSheetId,
    questions,
    setQuestions,
    syncStatus,
    setSyncStatus,
    profile,
    history,
    leaderboard,
    syncWithGoogleSheet,
    saveQuizAttempt,
    resetToLocalDefaults,
    selectedReviewId,
    setSelectedReviewId,
    reviewAnswers,
    setReviewAnswers,
    reviewQuestions,
    setReviewQuestions,
    awardBadge,
    addXp,
  };
};
