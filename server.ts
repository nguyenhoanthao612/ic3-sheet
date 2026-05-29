import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// CRYPTOGRAPHIC ADMINISTRATOR AUTHENTICATION SETUP
const SESSION_SECRET = process.env.SESSION_SECRET || 'ic3-masters-encryption-session-string-key-xyz-777';

// Generate a cryptographically secure, signed administrative session token
function generateSessionToken(email: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // valid for 24 hours
  const payload = `${expiresAt}|${email}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}|${hmac}`;
}

interface AdminSession {
  email: string;
  expiresAt: number;
}

// Verify dynamic signed session token to prevent malicious requests forging cookies
function verifySessionToken(token?: string): AdminSession | null {
  console.log('[Auth Debug] Verifying token:', token ? `${token.substring(0, 15)}...` : 'undefined');
  if (!token) {
    console.log('[Auth Debug] Token is falsy');
    return null;
  }
  const parts = token.split('|');
  if (parts.length !== 3) {
    console.log('[Auth Debug] Token format invalid, parts length:', parts.length);
    return null;
  }

  const [expiresAtStr, email, hmac] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || expiresAt < Date.now()) {
    console.log('[Auth Debug] Token expired or timestamp invalid:', expiresAtStr);
    return null; // Expired or mathematically invalid timestamp
  }

  const payload = `${expiresAtStr}|${email}`;
  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  if (hmac !== expectedHmac) {
    console.log('[Auth Debug] Signature verification failed. Expected:', expectedHmac.substring(0, 8), 'Got:', hmac.substring(0, 8));
    return null; // Signature verification failed - forged token!
  }

  console.log('[Auth Debug] Token verified successfully for email:', email);
  return { email, expiresAt };
}

// Extract cookies value easily from headers
function getCookieValue(cookieHeader?: string, name: string = 'admin_session'): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
}

// Rate limiter storage for preventing admin endpoint brute-forcing (5 attempts in 5 mins)
const loginRateLimit = new Map<string, { count: number; lockUntil: number }>();

// Require authenticated administrator middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = (req.headers['x-admin-token'] as string) || getCookieValue(req.headers.cookie);
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied. You do not hold a valid administrative session token.'
    });
  }
  (req as any).adminSession = session;
  next();
};

// MUTABLE SERVER COPY OF THE CORE SYLLABUS DATABASE
let serverQuestionsCopy = [
  {
    id: "mc-1",
    type: "multiple-choice",
    questionText: "Which of the following is an example of an absolute cell reference in Google Sheets/Excel?",
    options: ["A1", "$A1", "A$1", "$A$1"],
    correctAnswer: "$A$1",
    explanation: "An absolute cell reference uses dual dollar symbols ($A$1) to lock both the column letter and row number so they remain unchanged when formulas are filled.",
    domain: "Key Applications",
    difficulty: "Beginner"
  },
  {
    id: "mc-2",
    type: "multiple-choice",
    questionText: "What represents the physical brain of the computer that retrieves instructions and executes mathematical operations?",
    options: ["Random Access Memory (RAM)", "Central Processing Unit (CPU)", "Solid State Drive (SSD)", "Motherboard"],
    correctAnswer: "Central Processing Unit (CPU)",
    explanation: "The CPU is the central engine of the host, carrying out primary arithmetic and branching logic tasks.",
    domain: "Computing Fundamentals",
    difficulty: "Beginner"
  },
  {
    id: "tf-1",
    type: "true-false",
    questionText: "Multi-Factor Authentication (MFA) dramatically increases security by requiring multiple layers of independent validation.",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "MFA requires something you know (password) and something you have (OTP codes) to prevent mathematical cracking exploits.",
    domain: "Living Online",
    difficulty: "Beginner"
  }
];

// IN-MEMORY STUDENTS DIRECTORY (Syncs with client-side actions)
let studentsList = [
  { id: 'usr-1', name: 'Alex Rivera', xp: 5800, streak: 12, level: 14, lastActiveDate: '2026-05-29' },
  { id: 'usr-2', name: 'Nguyen H.', xp: 5240, streak: 8, level: 12, lastActiveDate: '2026-05-29' },
  { id: 'usr-3', name: 'Sarah Chen', xp: 4950, streak: 15, level: 11, lastActiveDate: '2026-05-28' },
  { id: 'usr-4', name: 'Marcus Miller', xp: 4610, streak: 5, level: 10, lastActiveDate: '2026-05-27' },
  { id: 'usr-5', name: 'Taylor Swift (Student)', xp: 3900, streak: 0, level: 9, lastActiveDate: '2026-05-20' },
  { id: 'usr-6', name: 'Jordan Patel', xp: 3200, streak: 4, level: 8, lastActiveDate: '2026-05-29' }
];

// STUDENT HISTORICAL EXAM LOG ACTIONS
let examSubmissionsList = [
  { id: 'sub-1', sId: 'usr-1', studentName: 'Alex Rivera', examType: 'mock-exam', score: 88, passed: true, totalQuestions: 30, correctCount: 26, duration: 2540, submittedAt: '2026-05-29T10:15:00Z' },
  { id: 'sub-2', sId: 'usr-3', studentName: 'Sarah Chen', examType: 'mock-exam', score: 94, passed: true, totalQuestions: 30, correctCount: 28, duration: 1820, submittedAt: '2026-05-29T12:05:00Z' },
  { id: 'sub-3', sId: 'usr-2', studentName: 'Nguyen H.', examType: 'practice', score: 70, passed: false, totalQuestions: 15, correctCount: 11, duration: 940, submittedAt: '2026-05-28T16:22:00Z' },
  { id: 'sub-4', sId: 'usr-4', studentName: 'Marcus Miller', examType: 'mock-exam', score: 82, passed: true, totalQuestions: 30, correctCount: 24, duration: 2110, submittedAt: '2026-05-27T11:40:00Z' }
];

// Set up server-side Gemini AI client (lazy-initialized to avoid crashing on startup)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// In-Memory Google Sheets Cache
interface SheetCache {
  sheetId: string;
  questions: any[];
  syncedAt: string;
}

let activeSheetCache: SheetCache | null = null;

// Helper to convert Google Sheets visualization JSON to structured Question objects
function parseGoogleSheetTable(table: any): any[] {
  if (!table || !table.cols || !table.rows) {
    throw new Error('Table does not match expected Google Sheets JSON output schema.');
  }

  // Get index labels
  const cols = table.cols.map((col: any, index: number) => {
    const label = col.label ? col.label.toLowerCase().trim() : '';
    return { label, index };
  });

  const parsedQuestions: any[] = [];

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    if (!row || !row.c) continue;

    const cells = row.c;
    const rowObj: any = {};

    cols.forEach((col: any) => {
      const cell = cells[col.index];
      let val = '';
      if (cell) {
        if (cell.v !== null && cell.v !== undefined) {
          val = String(cell.v);
        } else if (cell.f !== null && cell.f !== undefined) {
          val = String(cell.f);
        }
      }
      rowObj[col.label] = val.trim();
    });

    // Check if the row contains logical values
    const sheetIdVal = rowObj.id || rowObj.question || `row-${r + 1}`;
    const questionText = rowObj.question || rowObj.questiontext || rowObj.q;

    if (!questionText) continue; // Skip blank rows

    // Process options split by pipe "|"
    let rawOptions = rowObj.options || '';
    let optionsArray: string[] = [];
    if (rawOptions) {
      optionsArray = rawOptions.split('|').map((o: string) => o.trim()).filter(Boolean);
    }

    const type = (rowObj.type || 'multiple-choice').toLowerCase().trim();

    // Reconstruct basic attributes
    const qItem: any = {
      id: rowObj.id || `sheet-${r + 1}`,
      type: type,
      questionText: questionText,
      options: optionsArray,
      correctAnswer: rowObj.answer || rowObj.correctanswer || '',
      explanation: rowObj.explanation || 'See textbook outline for details.',
      domain: rowObj.domain || 'Computing Fundamentals',
      difficulty: rowObj.difficulty || 'Intermediate',
    };

    if (rowObj.image || rowObj.imageurl) qItem.imageUrl = rowObj.image || rowObj.imageurl;
    if (rowObj.video || rowObj.videourl) qItem.videoUrl = rowObj.video || rowObj.videourl;

    // Rich type processings
    if (type === 'matching') {
      // options represent left labels, answer represents LeftKey:RightLabel|LeftKey:RightLabel
      // Let's build matching pairs
      const listPairs: { left: string; right: string }[] = [];
      const parts = qItem.correctAnswer.split('|');
      parts.forEach((p: string) => {
        const pairParts = p.split(':');
        if (pairParts.length >= 2) {
          listPairs.push({ left: pairParts[0].trim(), right: pairParts.slice(1).join(':').trim() });
        }
      });
      qItem.matchingPairs = listPairs;
    } else if (type === 'drag-drop') {
      // answer: Safe Practices:Using unique passwords|Insecure Practices:Clicking malicious links
      const categories: string[] = [];
      const items: { text: string; category: string }[] = [];
      const categoriesAndItemsStr = qItem.correctAnswer.split('|');

      categoriesAndItemsStr.forEach((catBlock: string) => {
        const blockParts = catBlock.split(':');
        if (blockParts.length >= 2) {
          const categoryName = blockParts[0].trim();
          categories.push(categoryName);
          const blockItems = blockParts[1].split(',').map((it: string) => it.trim()).filter(Boolean);
          blockItems.forEach((itText) => {
            items.push({ text: itText, category: categoryName });
          });
        }
      });

      qItem.dragDropCategories = {
        categories,
        items,
      };
    } else if (type === 'step-ordering') {
      // options represents randomized steps, correctAnswer could be comma separated correct order indexes e.g., 2,0,1,3
      qItem.orderingSteps = qItem.options;
    } else if (type === 'hotspot') {
      // options is custom bounds x,y,w,h (or hotspotarea)
      const rawArea = rowObj.hotspotarea || '';
      if (rawArea) {
        try {
          qItem.hotspotArea = JSON.parse(rawArea);
        } catch {
          // Fallback to parsed string bounds
          const bounds = rawArea.split(',').map(Number);
          if (bounds.length === 4) {
            qItem.hotspotArea = { x: bounds[0], y: bounds[1], w: bounds[2], h: bounds[3] };
          }
        }
      } else {
        // Mock boundary in target
        qItem.hotspotArea = { x: 80, y: 10, w: 15, h: 15, label: 'More Actions Menu' };
      }
    }

    parsedQuestions.push(qItem);
  }

  return parsedQuestions;
}

// 🌐 API ROUTES & IMPLEMENTATION

// Fetch questions (returns currently cached Google Sheet questions, or default empty/configured)
app.get('/api/questions', async (req, res) => {
  const querySheetId = req.query.sheetId ? String(req.query.sheetId).trim() : null;
  const envSheetId = process.env.GOOGLE_SHEET_ID ? String(process.env.GOOGLE_SHEET_ID).trim() : null;
  const sheetToSync = querySheetId || envSheetId;

  if (!sheetToSync) {
    return res.json({
      success: true,
      source: 'default',
      questions: serverQuestionsCopy,
    });
  }

  // Check if we already have it in in-memory cache and not expired (revalidation occurs if requested explicitly or cache clean)
  const forceRefresh = req.query.refresh === 'true';
  if (!forceRefresh && activeSheetCache && activeSheetCache.sheetId === sheetToSync) {
    console.log(`[Cache Hit] Serving questions for sheet ${sheetToSync}`);
    return res.json({
      success: true,
      source: 'cache',
      syncedAt: activeSheetCache.syncedAt,
      sheetId: sheetToSync,
      questions: activeSheetCache.questions,
    });
  }

  console.log(`[Sync Triggered] Fetching live sheet: ${sheetToSync}`);
  try {
    const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetToSync}/gviz/tq?tqx=out:json`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const rawText = await response.text();
    const match = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
    if (!match) {
      throw new Error('Retrieved content does not resemble a valid Google Sheets JSON query output.');
    }

    const dataObj = JSON.parse(match[1]);
    const parsedQuestions = parseGoogleSheetTable(dataObj.table);

    // Save back to server memory cache
    activeSheetCache = {
      sheetId: sheetToSync,
      questions: parsedQuestions,
      syncedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      source: 'live',
      syncedAt: activeSheetCache.syncedAt,
      sheetId: sheetToSync,
      questions: parsedQuestions,
    });
  } catch (error: any) {
    console.error('[Sync Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to synchronize with Google Sheet. Please verify if the spreadsheet is "Shared -> Anyone with the link can view".',
      error: error.message,
    });
  }
});

// Clear cache endpoint
app.post('/api/questions/clear-cache', (req, res) => {
  activeSheetCache = null;
  return res.json({ success: true, message: 'Server questions cache cleared successfully.' });
});

// 1. ADMIN LOGIN
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  
  console.log('[Auth Debug] Login attempt from IP:', ip, 'Email:', email);

  // Check Rate Limiting Lock
  const limit = loginRateLimit.get(ip);
  if (limit && limit.lockUntil > Date.now()) {
    const secondsLeft = Math.ceil((limit.lockUntil - Date.now()) / 1000);
    console.log('[Auth Debug] Rate limited lock active for IP:', ip);
    return res.status(429).json({
      success: false,
      message: `Too many failed login attempts. Sealed temporary access. Try again in ${secondsLeft}s.`
    });
  }

  const targetEmail = process.env.ADMIN_EMAIL || 'nguyenhoanthao612@gmail.com';
  const targetPassword = process.env.ADMIN_PASSWORD || '57717469';

  const isMatchedEmail = email === targetEmail;
  const isCorrectPassword = password === targetPassword;

  console.log('[Auth Debug] Email matched:', isMatchedEmail, 'Password correct:', isCorrectPassword);

  if (isMatchedEmail && isCorrectPassword) {
    // Clear lock
    loginRateLimit.delete(ip);
    
    const token = generateSessionToken(email);
    console.log('[Auth Debug] Login succeeded, generated token:', token.substring(0, 15) + '...');
    
    // Set Secure/HttpOnly session cookie suitable for sandboxed cross-origin iframes
    res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=86400;`);
    
    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { email, role: 'admin' }
    });
  } else {
    const now = Date.now();
    if (!limit) {
      loginRateLimit.set(ip, { count: 1, lockUntil: 0 });
    } else {
      limit.count += 1;
      if (limit.count >= 5) {
        limit.lockUntil = now + 5 * 60 * 1000; // block for 5 minutes
      }
    }
    
    console.log('[Auth Debug] Login failed for Email:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative email or password combination.'
    });
  }
});

// 2. ADMIN LOGOUT
app.post('/api/admin/logout', (req, res) => {
  console.log('[Auth Debug] Logout requested');
  res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return res.json({ success: true, message: 'Administrative session terminated successfully.' });
});

// 3. GET SESSION STATUS
app.get('/api/admin/session', (req, res) => {
  console.log('[Auth Debug] /api/admin/session called');
  const token = (req.headers['x-admin-token'] as string) || getCookieValue(req.headers.cookie);
  const session = verifySessionToken(token);
  if (!session) {
    console.log('[Auth Debug] Session not authenticated');
    return res.json({ authenticated: false });
  }
  console.log('[Auth Debug] Session is authenticated for:', session.email);
  return res.json({
    authenticated: true,
    user: { email: session.email, role: 'admin' }
  });
});

// 4. GET PROTECTED STATS / ANALYTICS
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const totalQuestions = (activeSheetCache && activeSheetCache.questions) 
    ? activeSheetCache.questions.length 
    : serverQuestionsCopy.length;
    
  const totalStudents = studentsList.length;
  const totalXP = studentsList.reduce((sum, s) => sum + s.xp, 0);
  const averageXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;
  const examsCompleted = examSubmissionsList.length;

  res.json({
    success: true,
    stats: {
      totalQuestions,
      totalStudents,
      averageXP,
      examsCompleted
    },
    students: studentsList,
    recentExams: examSubmissionsList
  });
});

// 5. GET PROTECTED STUDENTS LIST
app.get('/api/admin/students', requireAdmin, (req, res) => {
  res.json({ success: true, students: studentsList });
});

// 6. DELETE / RESET STUDENT
app.post('/api/admin/students/delete', requireAdmin, (req, res) => {
  const { studentId, action } = req.body; // action: 'delete' or 'reset'
  
  if (action === 'delete') {
    studentsList = studentsList.filter(s => s.id !== studentId);
    return res.json({ success: true, message: 'Student removed from directory successfully.', students: studentsList });
  } else if (action === 'reset') {
    studentsList = studentsList.map(s => {
      if (s.id === studentId) {
        return { ...s, xp: 0, level: 1, streak: 0 };
      }
      return s;
    });
    return res.json({ success: true, message: 'Student diagnostic scores reset successfully.', students: studentsList });
  }
  
  res.status(400).json({ success: false, message: 'Invalid administrative action payload.' });
});

// 7. GET PROTECTED ENTIRE EXAMS LIST
app.get('/api/admin/exams', requireAdmin, (req, res) => {
  res.json({ success: true, exams: examSubmissionsList });
});

// 8. GET PROTECTED QUESTIONS LIST
app.get('/api/admin/questions', requireAdmin, (req, res) => {
  const activeQuestions = (activeSheetCache && activeSheetCache.questions) 
    ? activeSheetCache.questions 
    : serverQuestionsCopy;
  res.json({ success: true, questions: activeQuestions, isUsingGoogleSheet: !!activeSheetCache });
});

// 9. ADD / UPDATE CORE QUESTION (PROTECTED)
app.post('/api/admin/questions/add', requireAdmin, (req, res) => {
  const q = req.body;
  if (!q.questionText || !q.correctAnswer) {
    return res.status(400).json({ success: false, message: 'Missing structural parameters.' });
  }
  
  const newQuestion = {
    id: q.id || `custom-${Date.now()}`,
    type: q.type || 'multiple-choice',
    questionText: q.questionText,
    options: Array.isArray(q.options) ? q.options : [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || 'Created in management panel.',
    domain: q.domain || 'Computing Fundamentals',
    difficulty: q.difficulty || 'Intermediate'
  };

  // Insert to the active lists
  if (activeSheetCache && activeSheetCache.questions) {
    activeSheetCache.questions.unshift(newQuestion);
  } else {
    serverQuestionsCopy.unshift(newQuestion);
  }

  res.json({ success: true, message: 'Successfully published custom question.', question: newQuestion });
});

// 10. REMOVE CORE QUESTION (PROTECTED)
app.post('/api/admin/questions/delete', requireAdmin, (req, res) => {
  const { questionId } = req.body;
  if (!questionId) {
    return res.status(400).json({ success: false, message: 'Missing target ID.' });
  }

  if (activeSheetCache && activeSheetCache.questions) {
    activeSheetCache.questions = activeSheetCache.questions.filter(it => it.id !== questionId);
  } else {
    serverQuestionsCopy = serverQuestionsCopy.filter(it => it.id !== questionId);
  }

  res.json({ success: true, message: 'Deleted question successfully from live memory pool.' });
});

// 11. SUBMIT LIVE EXAM TO BACKEND LOG (PUBLIC STUDENT METHOD)
app.post('/api/exams/submit', (req, res) => {
  const { name, score, totalQuestions, correctCount, duration, examType } = req.body;
  
  const cleanName = name || 'Anonymous Student';
  const newId = `sub-${Date.now()}`;
  
  // Find or create student reference so we update dynamic lists
  let matchedStudent = studentsList.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
  
  if (!matchedStudent) {
    // Register new student in directory dynamically
    matchedStudent = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      xp: 0,
      streak: 1,
      level: 1,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    studentsList.push(matchedStudent);
  }

  // Update dynamic scores
  const xpReward = examType === 'mock-exam' ? (score >= 70 ? 150 : 50) : 30; // standard bonus configuration
  matchedStudent.xp += xpReward;
  matchedStudent.level = Math.floor(1 + matchedStudent.xp / 450);
  matchedStudent.lastActiveDate = new Date().toISOString().split('T')[0];

  const submission = {
    id: newId,
    sId: matchedStudent.id,
    studentName: cleanName,
    examType: examType || 'practice',
    score: score || 0,
    passed: score >= 70,
    totalQuestions: totalQuestions || 10,
    correctCount: correctCount || 0,
    duration: duration || 120,
    submittedAt: new Date().toISOString()
  };

  examSubmissionsList.unshift(submission);

  // If matchedStudent is updated on server, let's return stats
  res.json({
    success: true,
    message: `Logged score on server! Received +${xpReward} XP.`,
    submission,
    student: matchedStudent
  });
});

// AI Feedback / Tutoring Engine
app.post('/api/ai/explain', async (req, res) => {
  const { questionText, options, selectedAnswer, correctAnswer, explanation, domain } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: false,
        text: `### 🤖 AI Tutor Hint
**AI Tutor Mode offline.** To unlock personalized feedback recommendations, please configure your **GEMINI_API_KEY** in the Secrets block.

**Standard explanation:**
${explanation || 'No additional material registered.'}`,
      });
    }

    const userSelectedText = selectedAnswer !== undefined ? String(selectedAnswer) : 'Skipped';
    let optionsText = 'N/A';
    if (options && Array.isArray(options) && options.length > 0) {
      optionsText = options.map((opt, i) => `[Option ${i + 1}]: "${opt}"`).join(', ');
    }

    const domainTopic = domain || 'IC3 GS6 general principles';

    const promptMessage = `You are an empathetic, highly encouraging, expert EdTech tutor for the **IC3 GS6 (Global Standard 6) Certification**.
Analyze this practice question situation step-by-step and write a dynamic mentoring review:

Domain/Module: ${domainTopic}
Question Text: ${questionText}
Possible options: ${optionsText}
User's Selected Choice: "${userSelectedText}"
Correct Official Answer: "${correctAnswer}"
Reference Base explanation: "${explanation || 'No standard documentation provided'}"

Tasks:
1. State instantly (with positive friendly terminology) whether they are correct or explain the logic if they are incorrect.
2. Outline the fundamental concept (e.g. absolute references, physical CPU operations, or phishing protocols).
3. Provide a 1-sentence "Pro Tip" for exam success related to this question.

Keep the review content strictly under 3 short paragraphs. Write in clean, beautiful Markdown with direct spacing.`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptMessage,
    });

    return res.json({
      success: true,
      text: chatResponse.text,
    });
  } catch (err: any) {
    console.error('[Gemini Request Failure]', err);
    return res.json({
      success: false,
      text: `### 🤖 AI Tutor Timeout
An error occurred during generative tutoring: *${err.message || 'Standard timeout'}*

**Base reference:**
${explanation || 'No additional explanation documented.'}`,
    });
  }
});

// Full-Stack Dev & Production setups
async function setupExpressServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development middleware using Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static hosting
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IC3 CMS backend] Listening at http://localhost:${PORT}`);
  });
}

setupExpressServer();
