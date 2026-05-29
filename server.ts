import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
      questions: [],
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
