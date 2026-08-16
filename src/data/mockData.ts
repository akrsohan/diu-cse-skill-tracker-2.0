import { Field, Skill, RoadmapStep, Badge, Profile, UserProgress } from '../types';

export const initialFields: Field[] = [
  {
    id: 'field-1',
    name: 'Web Development',
    description: 'Frontend, Backend, and Full-Stack modern web technologies',
    icon: '🌐',
    color: '#00b894'
  },
  {
    id: 'field-2',
    name: 'Cyber Security',
    description: 'Ethical hacking, network defense, penetration testing and cryptography',
    icon: '🛡️',
    color: '#e17055'
  },
  {
    id: 'field-3',
    name: 'Software Engineering',
    description: 'Clean architecture, OOP design patterns, CI/CD, and system design',
    icon: '⚙️',
    color: '#6c5ce7'
  },
  {
    id: 'field-4',
    name: 'AI & Data Science',
    description: 'Machine Learning, Deep Learning, Computer Vision and Data Analytics',
    icon: '🤖',
    color: '#0984e3'
  },
  {
    id: 'field-5',
    name: 'Competitive Programming',
    description: 'Data Structures, Algorithms, Problem Solving, and ACM-ICPC tracks',
    icon: '⚡',
    color: '#fdcb6e'
  },
  {
    id: 'field-6',
    name: 'Mobile Development',
    description: 'Android, Flutter, iOS and React Native cross-platform apps',
    icon: '📱',
    color: '#e84393'
  }
];

export const initialSkills: Skill[] = [
  {
    id: 'skill-html',
    field_id: 'field-1',
    name: 'HTML',
    description: 'Building the fundamental semantic structure of web applications',
    order_index: 1,
    icon: 'H',
    bg_color: '#e84393',
    difficulty: 'Beginner',
    avg_days: '2 days',
    learner_count: 42,
    step_count: 3
  },
  {
    id: 'skill-c',
    field_id: 'field-3',
    name: 'C Programming',
    description: 'Core procedural programming, pointer memory mastery & data structures',
    order_index: 2,
    icon: 'C',
    bg_color: '#0984e3',
    difficulty: 'Intermediate',
    avg_days: '4 days',
    learner_count: 31,
    step_count: 3
  },
  {
    id: 'skill-js',
    field_id: 'field-1',
    name: 'JavaScript',
    description: 'Dynamic scripting, asynchronous event loop, APIs & modern ES6+',
    order_index: 3,
    icon: 'JS',
    bg_color: '#00b894',
    difficulty: 'Intermediate',
    avg_days: '5 days',
    learner_count: 28,
    step_count: 4
  },
  {
    id: 'skill-css',
    field_id: 'field-1',
    name: 'CSS',
    description: 'Modern flexbox, grid, keyframe animations & responsive layout styling',
    order_index: 4,
    icon: 'CS',
    bg_color: '#e17055',
    difficulty: 'Beginner',
    avg_days: '3 days',
    learner_count: 24,
    step_count: 3
  },
  {
    id: 'skill-python',
    field_id: 'field-4',
    name: 'Python',
    description: 'Pythonic syntax, data manipulation, automation & scientific computing',
    order_index: 5,
    icon: 'PY',
    bg_color: '#fdcb6e',
    difficulty: 'Beginner',
    avg_days: '3 days',
    learner_count: 38,
    step_count: 3
  },
  {
    id: 'skill-react',
    field_id: 'field-1',
    name: 'React',
    description: 'Component lifecycles, state management, hooks & frontend SPA building',
    order_index: 6,
    icon: 'RE',
    bg_color: '#6c5ce7',
    difficulty: 'Advanced',
    avg_days: '6 days',
    learner_count: 22,
    step_count: 4
  },
  {
    id: 'skill-git',
    field_id: 'field-3',
    name: 'Git & GitHub',
    description: 'Version control workflows, branching, rebasing, pull requests and releases',
    order_index: 7,
    icon: 'GT',
    bg_color: '#2d3436',
    difficulty: 'Beginner',
    avg_days: '2 days',
    learner_count: 45,
    step_count: 3
  },
  {
    id: 'skill-sql',
    field_id: 'field-1',
    name: 'SQL & DBs',
    description: 'Relational database schema modeling, queries, indexing and optimization',
    order_index: 8,
    icon: 'DB',
    bg_color: '#a29bfe',
    difficulty: 'Intermediate',
    avg_days: '4 days',
    learner_count: 19,
    step_count: 3
  }
];

export const initialRoadmapSteps: Record<string, RoadmapStep[]> = {
  'skill-html': [
    {
      id: 'step-html-1',
      skill_id: 'skill-html',
      title: 'Learn basic tags',
      description: 'html, head, body, headings (h1-h6), paragraphs (p), links (a), and images (img)',
      step_order: 1,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Learn/HTML'
    },
    {
      id: 'step-html-2',
      skill_id: 'skill-html',
      title: 'Forms and inputs',
      description: 'form tag, input types (text, email, password), textarea, button, select, and label',
      step_order: 2,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Learn/Forms'
    },
    {
      id: 'step-html-3',
      skill_id: 'skill-html',
      title: 'Semantic HTML',
      description: 'header, nav, main, footer, article, section, aside, accessibility and SEO tags',
      step_order: 3,
      resource_link: 'https://web.dev/learn/html/semantic-html'
    }
  ],
  'skill-c': [
    {
      id: 'step-c-1',
      skill_id: 'skill-c',
      title: 'Variables, Types & Operators',
      description: 'Primitive datatypes, format specifiers, arithmetic and bitwise operators in C',
      step_order: 1,
      resource_link: 'https://www.learn-c.org/'
    },
    {
      id: 'step-c-2',
      skill_id: 'skill-c',
      title: 'Control Structures & Arrays',
      description: 'If-else branching, switch-cases, while and for loops, 1D/2D arrays and string manipulation',
      step_order: 2,
      resource_link: 'https://www.geeksforgeeks.org/c-programming-language/'
    },
    {
      id: 'step-c-3',
      skill_id: 'skill-c',
      title: 'Pointers & Dynamic Memory',
      description: 'Pointer arithmetic, dereferencing, struct definitions, malloc/calloc/free memory allocation',
      step_order: 3,
      resource_link: 'https://en.cppreference.com/w/c'
    }
  ],
  'skill-js': [
    {
      id: 'step-js-1',
      skill_id: 'skill-js',
      title: 'ES6+ Syntax & Scope',
      description: 'let/const, arrow functions, template literals, destructuring, rest/spread, and closures',
      step_order: 1,
      resource_link: 'https://javascript.info/'
    },
    {
      id: 'step-js-2',
      skill_id: 'skill-js',
      title: 'DOM Manipulation & Events',
      description: 'querySelector, addEventListener, event bubbling, modifying classes and styles dynamically',
      step_order: 2,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model'
    },
    {
      id: 'step-js-3',
      skill_id: 'skill-js',
      title: 'Async JS, Promises & async/await',
      description: 'Understanding event loop, microtasks, Promise chaining, try/catch error handling',
      step_order: 3,
      resource_link: 'https://javascript.info/async'
    },
    {
      id: 'step-js-4',
      skill_id: 'skill-js',
      title: 'Fetch API & JSON Storage',
      description: 'Calling RESTful APIs, parsing JSON payloads, localStorage and sessionStorage APIs',
      step_order: 4,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'
    }
  ],
  'skill-css': [
    {
      id: 'step-css-1',
      skill_id: 'skill-css',
      title: 'Box Model & Typography',
      description: 'Content, padding, border, margin, box-sizing, web fonts, line-height & colors',
      step_order: 1,
      resource_link: 'https://web.dev/learn/css/'
    },
    {
      id: 'step-css-2',
      skill_id: 'skill-css',
      title: 'Flexbox & CSS Grid',
      description: '1D flex alignment, justify-content, 2D grid template columns, gaps and auto-fill',
      step_order: 2,
      resource_link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/'
    },
    {
      id: 'step-css-3',
      skill_id: 'skill-css',
      title: 'Responsive & Keyframe Animations',
      description: 'Media queries for mobile/tablet breakpoints, transitions, transforms and @keyframes',
      step_order: 3,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations'
    }
  ],
  'skill-python': [
    {
      id: 'step-py-1',
      skill_id: 'skill-python',
      title: 'Python Fundamentals',
      description: 'Variables, loops, functions, lists, tuples, sets, and dictionary data types',
      step_order: 1,
      resource_link: 'https://docs.python.org/3/tutorial/'
    },
    {
      id: 'step-py-2',
      skill_id: 'skill-python',
      title: 'Object-Oriented Programming',
      description: 'Classes, instances, inheritance, dunder methods, and module imports',
      step_order: 2,
      resource_link: 'https://realpython.com/'
    },
    {
      id: 'step-py-3',
      skill_id: 'skill-python',
      title: 'Data Analysis & File Handling',
      description: 'File reading/writing, CSV parsing, intro to NumPy and pandas dataframes',
      step_order: 3,
      resource_link: 'https://pandas.pydata.org/'
    }
  ],
  'skill-react': [
    {
      id: 'step-react-1',
      skill_id: 'skill-react',
      title: 'Components & JSX',
      description: 'Functional component architecture, JSX syntax, props passing and conditional rendering',
      step_order: 1,
      resource_link: 'https://react.dev/'
    },
    {
      id: 'step-react-2',
      skill_id: 'skill-react',
      title: 'useState & useEffect Hooks',
      description: 'Component state triggers, lifecycle effects, dependency arrays and cleanup functions',
      step_order: 2,
      resource_link: 'https://react.dev/learn/state-a-components-memory'
    },
    {
      id: 'step-react-3',
      skill_id: 'skill-react',
      title: 'Custom Hooks & State Management',
      description: 'Extracting reusable hook logic, Context API, and state lifting principles',
      step_order: 3,
      resource_link: 'https://react.dev/learn/reusing-logic-with-custom-hooks'
    },
    {
      id: 'step-react-4',
      skill_id: 'skill-react',
      title: 'React Router & API Integration',
      description: 'Client-side routing, URL parameters, loading states, and mutations with fetch',
      step_order: 4,
      resource_link: 'https://reactrouter.com/'
    }
  ],
  'skill-git': [
    {
      id: 'step-git-1',
      skill_id: 'skill-git',
      title: 'Git Basics & Configuration',
      description: 'git init, clone, status, add, commit, push, and configuring user email/name',
      step_order: 1,
      resource_link: 'https://git-scm.com/doc'
    },
    {
      id: 'step-git-2',
      skill_id: 'skill-git',
      title: 'Branching & Resolving Conflicts',
      description: 'Creating feature branches, git switch/checkout, git merge, and resolving conflict markers',
      step_order: 2,
      resource_link: 'https://learngitbranching.js.org/'
    },
    {
      id: 'step-git-3',
      skill_id: 'skill-git',
      title: 'GitHub Collaboration & PRs',
      description: 'Forking repositories, making pull requests, code reviews, and tagging releases',
      step_order: 3,
      resource_link: 'https://docs.github.com/en/get-started'
    }
  ],
  'skill-sql': [
    {
      id: 'step-sql-1',
      skill_id: 'skill-sql',
      title: 'Relational Model & CRUD',
      description: 'CREATE TABLE, SELECT, INSERT, UPDATE, DELETE, WHERE conditions and constraints',
      step_order: 1,
      resource_link: 'https://sqlbolt.com/'
    },
    {
      id: 'step-sql-2',
      skill_id: 'skill-sql',
      title: 'Joins & Aggregations',
      description: 'INNER JOIN, LEFT JOIN, GROUP BY, HAVING, COUNT, SUM, and subqueries',
      step_order: 2,
      resource_link: 'https://www.postgresqltutorial.com/'
    },
    {
      id: 'step-sql-3',
      skill_id: 'skill-sql',
      title: 'Indexes, Transactions & Foreign Keys',
      description: 'B-Tree indexes, ACID transaction blocks (BEGIN, COMMIT, ROLLBACK), and cascades',
      step_order: 3,
      resource_link: 'https://use-the-index-luke.com/'
    }
  ]
};

export const initialBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'First step',
    description: 'Completed your first skill',
    icon_symbol: '★',
    bg_color: '#fdcb6e',
    criteria_type: 'first_skill',
    unlocked: true
  },
  {
    id: 'badge-2',
    name: '5-day streak',
    description: 'Stayed active 5 days straight',
    icon_symbol: '🔥',
    bg_color: '#a29bfe',
    criteria_type: 'streak_5',
    unlocked: true
  },
  {
    id: 'badge-3',
    name: 'Skill collector',
    description: 'Complete 5 skills to unlock',
    icon_symbol: '🔒',
    bg_color: '#b2bec3',
    criteria_type: 'skills_5',
    unlocked: false
  },
  {
    id: 'badge-4',
    name: 'Speed Demon',
    description: 'Finish a skill challenge in under 24 hours',
    icon_symbol: '⚡',
    bg_color: '#00b894',
    criteria_type: 'fast_completion',
    unlocked: true
  },
  {
    id: 'badge-5',
    name: 'Top 3 Podium',
    description: 'Rank among top 3 learners in your batch',
    icon_symbol: '🏆',
    bg_color: '#ff7675',
    criteria_type: 'top_3',
    unlocked: true
  },
  {
    id: 'badge-6',
    name: 'DIU Champion',
    description: 'Accumulate over 300 points',
    icon_symbol: '💎',
    bg_color: '#37f0ff',
    criteria_type: 'points_300',
    unlocked: false
  }
];

export const ADMIN_EMAIL = 'mdsohanali636@gmail.com';

export const initialProfiles: Profile[] = [
  {
    id: 'user-sohan',
    email: 'mdsohanali636@gmail.com',
    full_name: 'Md. Sohan Ali',
    department: 'CSE',
    roll_number: '221-15-5001',
    batch_number: 'Batch 55',
    fb_link: 'https://facebook.com/mdsohanali',
    telegram_link: 'https://t.me/sohanali',
    whatsapp_link: '+8801700000001',
    profile_completed: true,
    points: 380,
    current_streak: 10,
    longest_streak: 14,
    is_admin: true,
    is_banned: false
  },
  {
    id: 'user-rafi',
    email: 'rafi.cse@diu.edu.bd',
    full_name: 'Rafi Ahmed',
    department: 'CSE',
    roll_number: '221-15-4498',
    batch_number: 'Batch 55',
    fb_link: 'https://facebook.com/rafi.ahmed',
    telegram_link: 'https://t.me/rafi_cse',
    profile_completed: true,
    points: 340,
    current_streak: 8,
    longest_streak: 12,
    is_admin: false,
    is_banned: false
  },
  {
    id: 'user-mehedi',
    email: 'mehedi.cse@diu.edu.bd',
    full_name: 'Mehedi Sadi',
    department: 'CSE',
    roll_number: '221-15-4502',
    batch_number: 'Batch 55',
    fb_link: 'https://facebook.com/mehedi.sadi',
    telegram_link: 'https://t.me/mehedi',
    profile_completed: true,
    points: 295,
    current_streak: 6,
    longest_streak: 9,
    is_admin: false,
    is_banned: false
  },
  {
    id: 'user-rakib',
    email: 'rakib.cse@diu.edu.bd',
    full_name: 'Rakib Hassan',
    department: 'CSE',
    roll_number: '221-15-4521',
    batch_number: 'Batch 55',
    fb_link: 'https://facebook.com/rakib.hassan',
    telegram_link: 'https://t.me/rakib_diu',
    whatsapp_link: '+8801712345678',
    profile_completed: true,
    points: 120,
    current_streak: 5,
    longest_streak: 7,
    is_admin: false,
    is_banned: false
  },
  {
    id: 'user-tania',
    email: 'tania.cse@diu.edu.bd',
    full_name: 'Tania Islam',
    department: 'CSE',
    roll_number: '221-15-4560',
    batch_number: 'Batch 55',
    fb_link: 'https://facebook.com/tania.islam',
    profile_completed: true,
    points: 88,
    current_streak: 3,
    longest_streak: 4,
    is_admin: false,
    is_banned: false
  },
  {
    id: 'user-shakil',
    email: 'shakil.cse@diu.edu.bd',
    full_name: 'Shakil Khan',
    department: 'CSE',
    roll_number: '221-15-4588',
    batch_number: 'Batch 55',
    whatsapp_link: '+8801700000000',
    profile_completed: true,
    points: 64,
    current_streak: 2,
    longest_streak: 3,
    is_admin: false,
    is_banned: false
  },
  {
    id: 'user-sumaiya',
    email: 'sumaiya.swe@diu.edu.bd',
    full_name: 'Sumaiya Akter',
    department: 'SWE',
    roll_number: '222-35-1002',
    batch_number: 'Batch 56',
    fb_link: 'https://facebook.com/sumaiya.swe',
    telegram_link: 'https://t.me/sumaiya',
    profile_completed: true,
    points: 240,
    current_streak: 7,
    longest_streak: 10,
    is_admin: false,
    is_banned: false
  },
  {
    id: 'user-fahim',
    email: 'fahim.swe@diu.edu.bd',
    full_name: 'Fahim Shahriar',
    department: 'SWE',
    roll_number: '222-35-1045',
    batch_number: 'Batch 56',
    fb_link: 'https://facebook.com/fahim',
    profile_completed: true,
    points: 190,
    current_streak: 4,
    longest_streak: 8,
    is_admin: false,
    is_banned: false
  },
  {
    id: 'user-anika',
    email: 'anika.cis@diu.edu.bd',
    full_name: 'Anika Tabassum',
    department: 'CIS',
    roll_number: '223-25-2011',
    batch_number: 'Batch 57',
    telegram_link: 'https://t.me/anika',
    profile_completed: true,
    points: 150,
    current_streak: 4,
    longest_streak: 5,
    is_admin: false,
    is_banned: false
  }
];

export const initialCompletedSkills: Record<string, { skillName: string; icon: string; bg: string; duration: string; completedAt: string }[]> = {
  'user-sohan': [
    { skillName: 'HTML', icon: 'H', bg: '#e84393', duration: 'Finished in 1 day 10 hours', completedAt: '1 day ago' },
    { skillName: 'CSS', icon: 'CS', bg: '#e17055', duration: 'Finished in 2 days 2 hours', completedAt: '3 days ago' },
    { skillName: 'JavaScript', icon: 'JS', bg: '#00b894', duration: 'Finished in 3 days 12 hours', completedAt: '6 days ago' },
    { skillName: 'React', icon: 'RE', bg: '#6c5ce7', duration: 'Finished in 4 days 6 hours', completedAt: '10 days ago' },
    { skillName: 'Git & GitHub', icon: 'GT', bg: '#2d3436', duration: 'Finished in 1 day 4 hours', completedAt: '14 days ago' }
  ],
  'user-rafi': [
    { skillName: 'HTML', icon: 'H', bg: '#e84393', duration: 'Finished in 1 day 14 hours', completedAt: '2 days ago' },
    { skillName: 'C Programming', icon: 'C', bg: '#0984e3', duration: 'Finished in 2 days 3 hours', completedAt: '5 days ago' },
    { skillName: 'JavaScript', icon: 'JS', bg: '#00b894', duration: 'Finished in 3 days 20 hours', completedAt: '8 days ago' },
    { skillName: 'CSS', icon: 'CS', bg: '#e17055', duration: 'Finished in 1 day 8 hours', completedAt: '12 days ago' },
    { skillName: 'Python', icon: 'PY', bg: '#fdcb6e', duration: 'Finished in 2 days 10 hours', completedAt: '15 days ago' },
    { skillName: 'Git & GitHub', icon: 'GT', bg: '#2d3436', duration: 'Finished in 1 day 2 hours', completedAt: '18 days ago' },
    { skillName: 'SQL & DBs', icon: 'DB', bg: '#a29bfe', duration: 'Finished in 2 days 18 hours', completedAt: '22 days ago' }
  ],
  'user-mehedi': [
    { skillName: 'HTML', icon: 'H', bg: '#e84393', duration: 'Finished in 1 day 20 hours', completedAt: '3 days ago' },
    { skillName: 'CSS', icon: 'CS', bg: '#e17055', duration: 'Finished in 2 days 4 hours', completedAt: '6 days ago' },
    { skillName: 'JavaScript', icon: 'JS', bg: '#00b894', duration: 'Finished in 4 days 2 hours', completedAt: '10 days ago' },
    { skillName: 'React', icon: 'RE', bg: '#6c5ce7', duration: 'Finished in 5 days 12 hours', completedAt: '14 days ago' },
    { skillName: 'Git & GitHub', icon: 'GT', bg: '#2d3436', duration: 'Finished in 1 day 10 hours', completedAt: '19 days ago' },
    { skillName: 'C Programming', icon: 'C', bg: '#0984e3', duration: 'Finished in 3 days 8 hours', completedAt: '24 days ago' }
  ],
  'user-rakib': [
    { skillName: 'HTML', icon: 'H', bg: '#e84393', duration: 'Finished in 1 day 14 hours', completedAt: '1 day ago' },
    { skillName: 'C Programming', icon: 'C', bg: '#0984e3', duration: 'Finished in 2 days 3 hours', completedAt: '4 days ago' },
    { skillName: 'JavaScript', icon: 'JS', bg: '#00b894', duration: 'Finished in 3 days 20 hours', completedAt: '7 days ago' },
    { skillName: 'CSS', icon: 'CS', bg: '#e17055', duration: 'Finished in 1 day 18 hours', completedAt: '11 days ago' }
  ]
};

// Default active challenge for current user (HTML challenge)
const now = new Date();
const deadline = new Date(now.getTime() + (36 * 60 + 12) * 60 * 1000); // 1d 12h remaining
const started = new Date(now.getTime() - 22 * 60 * 60 * 1000); // started 22 hours ago

export const initialActiveProgress: UserProgress = {
  id: 'progress-active-1',
  user_id: 'user-sohan',
  skill_id: 'skill-html',
  started_at: started.toISOString(),
  deadline_at: deadline.toISOString(),
  status: 'in_progress',
  points_awarded: 10,
  steps_completed: [1, 2]
};
