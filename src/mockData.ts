import { Question, Lesson, LeaderboardEntry, StudentProfile, Badge } from './types';

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    questionText: 'Which of the following cell references in a spreadsheet program represent an absolute column and absolute row reference?',
    options: ['A1', '$A1', 'A$1', '$A$1'],
    correctAnswer: '$A$1',
    explanation: 'An absolute cell reference is denoted by placing a dollar sign ($) before both the column letter and the row number (e.g., $A$1). This locks the reference so that it remains constant even if the formula is copied or moved to another cell.',
    domain: 'Key Applications',
    difficulty: 'Intermediate'
  },
  {
    id: 'q2',
    type: 'true-false',
    questionText: 'Multi-Factor Authentication (MFA) requires a user to present two or more separate categories of credentials before granting access to an account.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'True. Multi-Factor Authentication (MFA) is a security system that verifies identity using multiple separate factors: something you know (password), something you have (phone/token), or something you are (biometrics).',
    domain: 'Living Online',
    difficulty: 'Beginner'
  },
  {
    id: 'q3',
    type: 'fill-blank',
    questionText: 'The main processing unit of a computer that performs arithmetic, logic, and control operations is known as the __________ (Write the 3-letter acronym).',
    options: [],
    correctAnswer: 'CPU',
    explanation: 'The Central Processing Unit (CPU) is often called the "brain" of the computer. It executes instructions of computer programs by performing basic arithmetical, logical, control and input/output operations.',
    domain: 'Computing Fundamentals',
    difficulty: 'Beginner'
  },
  {
    id: 'q4',
    type: 'matching',
    questionText: 'Match each hardware component to its primary function.',
    options: ['RAM', 'SSD', 'GPU', 'Motherboard'],
    correctAnswer: 'RAM:Volatile high-speed temporary runtime memory|SSD:Non-volatile secondary storage for file persistence|GPU:Specialized processor designed to accelerate graphics rendering|Motherboard:The main printed circuit board that connects all hardware components',
    explanation: 'RAM provides transient high-speed memory for active processes. SSD provides durable flash-based non-volatile storage. GPU accelerates visual calculations. Motherboard serves as the primary communications hub connecting all elements.',
    domain: 'Computing Fundamentals',
    difficulty: 'Intermediate',
    matchingPairs: [
      { left: 'RAM', right: 'Volatile high-speed temporary runtime memory' },
      { left: 'SSD', right: 'Non-volatile secondary storage for file persistence' },
      { left: 'GPU', right: 'Specialized processor designed to accelerate graphics rendering' },
      { left: 'Motherboard', right: 'The main printed circuit board that connects all hardware components' }
    ]
  },
  {
    id: 'q5',
    type: 'drag-drop',
    questionText: 'Categorize each credential practice into either "Safe Practices" or "Insecure Practices" by dragging them to the proper category.',
    options: ['Safe Practices', 'Insecure Practices'],
    correctAnswer: 'Safe Practices:Using a unique passphrase separate for each account,Enabling automatic security updates|Insecure Practices:Clicking on links in unsolicited emails,Reusing the same password across multiple social networks',
    explanation: 'Using distinct passphrases and enabling automatic system updates are safe computing practices. Clicking links in unsolicited emails (phishing risk) and password reuse are high-risk insecure habits.',
    domain: 'Living Online',
    difficulty: 'Intermediate',
    dragDropCategories: {
      categories: ['Safe Practices', 'Insecure Practices'],
      items: [
        { text: 'Using a unique passphrase separate for each account', category: 'Safe Practices' },
        { text: 'Enabling automatic security updates', category: 'Safe Practices' },
        { text: 'Clicking on links in unsolicited emails', category: 'Insecure Practices' },
        { text: 'Reusing the same password across multiple social networks', category: 'Insecure Practices' }
      ]
    }
  },
  {
    id: 'q6',
    type: 'hotspot',
    questionText: 'Examine the modern web browser interface shown. Identify and CLICK on the "Settings Menu / More Actions" button (typically represented by three vertical dots in the upper-right corner).',
    options: [],
    correctAnswer: '0.94,0.06', // Relative x,y center (approx normalized coordinates)
    explanation: 'The "Settings / More Actions" icon in Google Chrome or Microsoft Edge is located in the far top-right corner of the window. Click on this button to access history, settings, downloads, and extensions.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', // Beautiful modern abstract UI card representation
    domain: 'Living Online',
    difficulty: 'Intermediate',
    hotspotArea: { x: 92, y: 5, w: 6, h: 8, label: 'More Actions menu' }
  },
  {
    id: 'q7',
    type: 'image-question',
    questionText: 'Looking at the spreadsheet screenshot, what formula should be entered in cell C6 to calculate the TOTAL cost of all items listed from row 2 to row 5?',
    options: ['=SUM(C2:C5)', '=TOTAL(C2:C5)', '=COUNT(C2:C5)', '=SUM(C2,C5)'],
    correctAnswer: '=SUM(C2:C5)',
    explanation: '=SUM(C2:C5) is the correct formula to add all numerical values in the range C2 to C5. The key is using the SUM function with a colon representing a continuous list from C2 through C5.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', // Aesthetic dashboard/chart view representing data spreadsheet
    domain: 'Key Applications',
    difficulty: 'Beginner'
  },
  {
    id: 'q8',
    type: 'video-question',
    questionText: 'This instructive video highlights defensive strategies for credential protection. According to cybersecurity guidelines, what makes a modern passphrase significantly stronger than a classic password?',
    options: [
      'It is generated using uppercase letters exclusively.',
      'It combines multiple random words into a longer character stream, increasing entropy and making brute-force attacks mathematically unfeasible.',
      'It must change automatically every 24 hours.',
      'It can only contain numbers.'
    ],
    correctAnswer: 'It combines multiple random words into a longer character stream, increasing entropy and making brute-force attacks mathematically unfeasible.',
    explanation: 'A passphrase (e.g., "correct-horse-battery-staple") uses length and random word association to create massive cryptographic scale (high entropy). This makes standard brute-force dictionary attacks practically impossible compared to short complex passwords.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder informational video embed
    domain: 'Living Online',
    difficulty: 'Expert'
  },
  {
    id: 'q9',
    type: 'step-ordering',
    questionText: 'Put the following steps in the correct order to securely clear cache and cookies in a modern desktop browser.',
    options: [
      'Click the browser menu (three dots or lines) in the top-right corner.',
      'Navigate to "Settings" then find "Privacy, search, and services" or "Privacy and security".',
      'Select "Clear browsing data".',
      'Choose the desired time range (e.g., "All time") and check the check-boxes for cookies and cache.',
      'Click the "Clear now" or "Clear data" button.'
    ],
    correctAnswer: '0,1,2,3,4', // Order of original indices
    explanation: 'The secure standard procedure begins with (1) Opening the browser settings menu, (2) Proceeding to Privacy/Security parameters, (3) Opening the Clear Browsing Data dialog, (4) Selecting the scope and ticking the cache/cookie checkboxes, and (5) Confirming deletion with the final button action.',
    domain: 'Living Online',
    difficulty: 'Intermediate',
    orderingSteps: [
      'Click the browser menu (three dots or lines) in the top-right corner.',
      'Navigate to "Settings" then find "Privacy, search, and services" or "Privacy and security".',
      'Select "Clear browsing data".',
      'Choose the desired time range (e.g., "All time") and check the check-boxes for cookies and cache.',
      'Click the "Clear now" or "Clear data" button.'
    ]
  },
  {
    id: 'q10',
    type: 'multi-select',
    questionText: 'Which of the following are examples of multi-user cloud collaboration services? (Select ALL that apply)',
    options: ['Google Docs', 'Microsoft OneDrive', 'Local Hard Drive / Drive C:', 'Dropbox Paper', 'Windows Notepad (offline)'],
    correctAnswer: 'Google Docs|Microsoft OneDrive|Dropbox Paper', // Custom multi separator
    explanation: 'Google Docs, Microsoft OneDrive, and Dropbox Paper represent collaborative cloud storage and word platforms that allow multiple users to edit, view, and sync changes concurrently over the internet. Local drive files and offline single-instance editors do not provide cloud sync or multi-user editing features.',
    domain: 'Living Online',
    difficulty: 'Intermediate'
  },
  {
    id: 'q11',
    type: 'multiple-choice',
    questionText: 'What is the purpose of the DNS (Domain Name System) on the internet?',
    options: [
      'To securely encrypt all local files on a computer hard drive.',
      'To translate human-readable domain names (like example.com) into machine-readable IP addresses (like 192.0.2.1).',
      'To regulate the speed of wireless routers and modem bands.',
      'To act as an email anti-spam server.'
    ],
    correctAnswer: 'To translate human-readable domain names (like example.com) into machine-readable IP addresses (like 192.0.2.1).',
    explanation: 'The Domain Name System (DNS) operates as the "phonebook" of the internet. It maps human-friendly URLs (e.g., google.com) to numeric IP addresses so that browsers can connect to correct destination web servers.',
    domain: 'Living Online',
    difficulty: 'Intermediate'
  },
  {
    id: 'q12',
    type: 'multiple-choice',
    questionText: 'Which of the following describes the function of virtual memory in a computer operating system?',
    options: [
      'A permanent cloud backup of configuration files.',
      'An auxiliary storage technique that uses secondary storage (like SSD or HDD space) to mimic primary random-access memory (RAM) when physical RAM is fully commercialized.',
      'A hardware chip dedicated exclusively to rendering high-definition monitors.',
      'A component that prevents viruses from infecting primary BIOS folders.'
    ],
    correctAnswer: 'An auxiliary storage technique that uses secondary storage (like SSD or HDD space) to mimic primary random-access memory (RAM) when physical RAM is fully commercialized.',
    explanation: 'Virtual memory allows a system to run larger applications or handle heavy concurrent loads by paging inactive memory blocks out onto secondary storage (SSD/HDD), freeing up physical memory for active processes.',
    domain: 'Computing Fundamentals',
    difficulty: 'Expert'
  }
];

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Hardware, Chips & Virtual Memory',
    domain: 'Computing Fundamentals',
    duration: '12 mins',
    description: 'Learn the primary hardware components of modern computers, how they clock and interface, and how Operating Systems optimize memory allocations.',
    content: `### 🖥️ Understanding Computer Hardware

Every digital system is governed by a set of physical components interfacing seamlessly:
1. **CPU (Central Processing Unit):** The ultimate computational engine. It executes instructions through the fetch-decode-execute cycle measured in gigahertz (GHz).
2. **RAM (Random Access Memory):** Volatile, high-speed temporary storage used to host running operating system processes and active applications. When a computer turns off, all data in RAM is empty.
3. **Storage (SSD/HDD):** Non-volatile persistence storage. SSDs (Solid State Drives) utilize modern flash media, providing massive reading/writing throughput compared to legacy mechanical HDDs (Hard Disk Drives).

---

### 🧠 The Mechanics of Virtual Memory

When active processes exceed available physical memory (RAM), the operating system (OS) handles it using **Virtual Memory**:
* **Paging file / Swap Space:** The OS allocates a virtual partition on the SSD to act as secondary workspace.
* **Page fault:** Inactive application memory frames are pushed to the storage drive to make space in the high-speed RAM.
* **Performance Impact:** Reading files from SSD is significantly slower than RAM. If a computer lacks physical RAM, excessive shifting of pages occurs (known as *thrashing*), leading to systemic delay.`,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    flashcards: [
      { front: 'What is volatile memory?', back: 'Memory that requires power to maintain data, such as RAM.' },
      { front: 'What is CPU cache?', back: 'Super fast on-chip static RAM (SRAM) storage used to hold incoming instructions.' },
      { front: 'Explain Virtal Memory swapping.', back: 'Moving inactive parts of applications from physical RAM onto secondary disk storage.' }
    ]
  },
  {
    id: 'l2',
    title: 'Spreadsheet Absolute References & Formulas',
    domain: 'Key Applications',
    duration: '15 mins',
    description: 'Master cell locking, absolute column/row styling, essential logical math operations, and visual chart rendering.',
    content: `### 📊 Cell Reference Mechanics in Spreadsheets

When drafting spreadsheet formulas in applications like Excel or Google Sheets, cell targets can behave in three distinct ways:

* **Relative Reference (A1):** The reference shifts automatically when the formula card is filled or copied onto nearby cells.
* **Absolute Reference ($A$1):** Locks both column letter and row number completely. Copied formulas always point to cell A1.
* **Mixed Reference ($A1 or A$1):** Only locks the column ($A1) or only locks the row (A$1), leaving the other axis free to slide.

---

### 🔑 Core Mathematical Operators

Common algebraic and functional syntax includes:
1. \`=SUM(B2:B10)\`: Aggregates and adds all cells inside the range.
2. \`=AVERAGE(B2:B10)\`: Divides the sum of numerical items by count.
3. \`=COUNT(B2:B10)\`: Counts row indexes containing numbers.
4. \`=IF(A1 > 50, "Pass", "Fail")\`: Runs a logical filter returning standard text based on conditions.`,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    flashcards: [
      { front: 'What character forces an absolute reference?', back: 'The dollar sign ($)' },
      { front: 'What is the correct cell range format?', back: 'Upper-left corner cell, colon, bottom-right cell (e.g., A1:C6).' },
      { front: 'What occurs when dividing by zero in spreadsheet formulas?', back: 'The spreadsheet triggers a designated DIV/0! structural calculation error.' }
    ]
  },
  {
    id: 'l3',
    title: 'Cybersecurity, Phishing & MFA',
    domain: 'Living Online',
    duration: '10 mins',
    description: 'Identify phishing patterns, apply secure credential strategies, and secure accounts using multi-factor credentials.',
    content: `### 🛡️ Establishing Modern Account Integrity

With contemporary computational cracking, classic passwords like "P@ssword1" are solved in minutes. Security standards now recommend:
1. **Passphrases:** Linking four or more random, unrelated vocabulary words (e.g., "coffee-bicycle-shining-castle"). This builds enormous complexity for software crackers while remaining very easy for humans to recall.
2. **Distinct Configurations:** Never share database or personal credentials across multiple websites. If a gaming system is leaked, hackers immediately test those same credentials on banking portals.

---

### 📲 Implementing Multi-Factor Authentication (MFA)

MFA incorporates defense-in-depth by requiring credentials across separate domains:
* **Something you KNOW:** Password, PIN, or passphrase.
* **Something you HAVE:** Smart-phone with Authenticator App generating TOTP tokens, hardware security key (YubiKey), or SIM card.
* **Something you ARE:** TouchID fingerprint, FaceID facial layout, or retinal patterns.

*Tip: Standard SMS (cellular message) verification is vulnerable to SIM-swap attacks. Authenticator apps (like Google Authenticator) or hardware keys are heavily preferred.*`,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    flashcards: [
      { front: 'What does MFA stand for?', back: 'Multi-Factor Authentication.' },
      { front: 'What is Phishing?', back: 'Social engineering emails that trick users into sharing sensitive personal credentials.' },
      { front: 'Why are passphrases preferred?', back: 'Length is the primary driver of cryptographic strength, preventing mathematical cracking.' }
    ]
  }
];

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex Rivera', xp: 5800, streak: 12, level: 14 },
  { rank: 2, name: 'Nguyen H.', xp: 5240, streak: 8, level: 12 },
  { rank: 3, name: 'Sarah Chen', xp: 4950, streak: 15, level: 11 },
  { rank: 4, name: 'Marcus Miller', xp: 4610, streak: 5, level: 10 },
  { rank: 5, name: 'Taylor Swift (Student)', xp: 3900, streak: 0, level: 9 },
  { rank: 6, name: 'Jordan Patel', xp: 3200, streak: 4, level: 8 }
];

export const DEFAULT_PROFILE: StudentProfile = {
  xp: 1250,
  streak: 3,
  lastActiveDate: '2026-05-29',
  level: 4,
  badges: [
    {
      id: 'b1',
      name: 'First Blood',
      description: 'Completed your first IC3 GS6 practice session successfully.',
      icon: 'zap',
      unlockedAt: '2026-05-27T14:00:00Z'
    },
    {
      id: 'b2',
      name: 'Living Online Guru',
      description: 'Scored 100% on a network security module.',
      icon: 'shield',
      unlockedAt: '2026-05-28T10:30:00Z'
    }
  ]
};

export const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'b1', name: 'First Blood', description: 'Completed your first practice topic.', icon: 'zap' },
  { id: 'b2', name: 'Living Online Guru', description: 'Master Living Online practices with a perfect quiz score.', icon: 'shield' },
  { id: 'b3', name: 'Iron Will', description: 'Maintained a active practice streak of 5 days.', icon: 'flame' },
  { id: 'b4', name: 'Domain Conqueror', description: 'Cleared mock exams in all 3 IC3 GS6 domains with a passing mark.', icon: 'award' },
  { id: 'b5', name: 'Grid Master', description: 'Excel in Spreadsheet Reference modules on the Key Applications section.', icon: 'grid' },
  { id: 'b6', name: 'Google Sheets synced', description: 'Synchronized custom exam database using your Google Sheets.', icon: 'refresh-cw' }
];
