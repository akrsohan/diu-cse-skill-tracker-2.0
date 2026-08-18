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
      title: 'Semantic HTML5 Architecture',
      description: 'Master semantic tags (<header>, <nav>, <main>, <article>, <section>, <footer>) for clean document outlines and accessibility.',
      step_order: 1,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics'
    },
    {
      id: 'step-html-2',
      skill_id: 'skill-html',
      title: 'Accessible Forms & Validation',
      description: 'Building robust accessible forms with proper labels, fieldsets, ARIA attributes, and HTML5 native constraint validation.',
      step_order: 2,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Learn/Forms'
    },
    {
      id: 'step-html-3',
      skill_id: 'skill-html',
      title: 'SEO Meta Tags & Open Graph',
      description: 'Optimizing page discoverability with title tags, meta descriptions, viewport settings, and social sharing Open Graph tags.',
      step_order: 3,
      resource_link: 'https://ogp.me/'
    }
  ],
  'skill-c': [
    {
      id: 'step-c-1',
      skill_id: 'skill-c',
      title: 'Pointers & Memory Allocation',
      description: 'Deep dive into memory addresses, pointer arithmetic, stack vs heap allocation, malloc, calloc, and free.',
      step_order: 1,
      resource_link: 'https://www.tutorialspoint.com/cprogramming/c_pointers.htm'
    },
    {
      id: 'step-c-2',
      skill_id: 'skill-c',
      title: 'Structures & Linked Lists',
      description: 'Designing custom data types with structs and implementing dynamic singly and doubly linked lists in C.',
      step_order: 2,
      resource_link: 'https://www.geeksforgeeks.org/data-structures/linked-list/'
    },
    {
      id: 'step-c-3',
      skill_id: 'skill-c',
      title: 'File I/O & Preprocessor Directives',
      description: 'Reading and writing binary/text files securely using fopen, fread, fwrite, and utilizing macros.',
      step_order: 3,
      resource_link: 'https://en.cppreference.com/w/c/io'
    }
  ],
  'skill-js': [
    {
      id: 'step-js-1',
      skill_id: 'skill-js',
      title: 'Asynchronous JavaScript & Event Loop',
      description: 'Mastering callbacks, Promises, async/await, call stack, task queue, and microtask queue execution.',
      step_order: 1,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop'
    },
    {
      id: 'step-js-2',
      skill_id: 'skill-js',
      title: 'Closures & Scope Chain',
      description: 'Understanding lexical scoping, closures, IIFE, execution context, and memory management in JS.',
      step_order: 2,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'
    },
    {
      id: 'step-js-3',
      skill_id: 'skill-js',
      title: 'DOM Manipulation & Event Bubbling',
      description: 'Dynamic element creation, querying, event delegation, bubbling, and capture phases.',
      step_order: 3,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events'
    },
    {
      id: 'step-js-4',
      skill_id: 'skill-js',
      title: 'ES6+ Features & Modules',
      description: 'Arrow functions, destructuring, spread/rest operators, ES modules (import/export), and optional chaining.',
      step_order: 4,
      resource_link: 'https://javascript.info/es-modern'
    }
  ],
  'skill-css': [
    {
      id: 'step-css-1',
      skill_id: 'skill-css',
      title: 'Flexbox Layout Mastery',
      description: 'Aligning items, flex-direction, wrapping, justification, and building fluid responsive navigation bars.',
      step_order: 1,
      resource_link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/'
    },
    {
      id: 'step-css-2',
      skill_id: 'skill-css',
      title: 'CSS Grid System',
      description: 'Two-dimensional grid layouts, template areas, auto-fit, auto-fill, and complex dashboard framing.',
      step_order: 2,
      resource_link: 'https://css-tricks.com/snippets/css/complete-guide-grid/'
    },
    {
      id: 'step-css-3',
      skill_id: 'skill-css',
      title: 'Animations & Custom Properties',
      description: 'CSS variables, keyframe animations, transition timing functions, and smooth micro-interactions.',
      step_order: 3,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations'
    }
  ],
  'skill-python': [
    {
      id: 'step-py-1',
      skill_id: 'skill-python',
      title: 'Pythonic Data Structures & Comprehensions',
      description: 'Mastering lists, dictionaries, sets, tuples, list/dict comprehensions, and generator expressions.',
      step_order: 1,
      resource_link: 'https://docs.python.org/3/tutorial/datastructures.html'
    },
    {
      id: 'step-py-2',
      skill_id: 'skill-python',
      title: 'Object-Oriented Programming in Python',
      description: 'Classes, dunder methods, inheritance, polymorphism, properties, and encapsulation.',
      step_order: 2,
      resource_link: 'https://docs.python.org/3/tutorial/classes.html'
    },
    {
      id: 'step-py-3',
      skill_id: 'skill-python',
      title: 'File Handling & Error Management',
      description: 'Context managers (with statement), try/except/finally blocks, and custom exception handling.',
      step_order: 3,
      resource_link: 'https://docs.python.org/3/tutorial/errors.html'
    }
  ],
  'skill-react': [
    {
      id: 'step-react-1',
      skill_id: 'skill-react',
      title: 'React Hooks Deep Dive',
      description: 'useState, useEffect, useContext, useMemo, useCallback, and custom hook creation.',
      step_order: 1,
      resource_link: 'https://react.dev/reference/react'
    },
    {
      id: 'step-react-2',
      skill_id: 'skill-react',
      title: 'State Architecture & lifting',
      description: 'Managing complex application state, immutability, prop drilling solutions, and Context API.',
      step_order: 2,
      resource_link: 'https://react.dev/learn/managing-state'
    },
    {
      id: 'step-react-3',
      skill_id: 'skill-react',
      title: 'Component Lifecycle & Performance',
      description: 'Avoiding unnecessary re-renders with React.memo, virtualization, and lazy loading.',
      step_order: 3,
      resource_link: 'https://react.dev/reference/react/memo'
    },
    {
      id: 'step-react-4',
      skill_id: 'skill-react',
      title: 'Side Effects & API Integration',
      description: 'Fetching data with async/await inside useEffect, handling loading/error states, and cleanup functions.',
      step_order: 4,
      resource_link: 'https://react.dev/learn/synchronizing-with-effects'
    }
  ],
  'skill-git': [
    {
      id: 'step-git-1',
      skill_id: 'skill-git',
      title: 'Core Git Commands & Staging',
      description: 'git init, add, commit, status, log, diff, gitignore configuration, and git stash.',
      step_order: 1,
      resource_link: 'https://git-scm.com/doc'
    },
    {
      id: 'step-git-2',
      skill_id: 'skill-git',
      title: 'Branching & Merge Conflicts',
      description: 'Creating branches, switching, merging, rebasing, and resolving merge conflicts cleanly.',
      step_order: 2,
      resource_link: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell'
    },
    {
      id: 'step-git-3',
      skill_id: 'skill-git',
      title: 'GitHub Collaboration & PRs',
      description: 'Forking, pulling requests, code reviews, issues, tags, and release management.',
      step_order: 3,
      resource_link: 'https://docs.github.com/en/get-started'
    }
  ],
  'skill-sql': [
    {
      id: 'step-sql-1',
      skill_id: 'skill-sql',
      title: 'Relational Schema Design & DDL',
      description: 'Primary keys, foreign keys, constraints (UNIQUE, NOT NULL), CREATE/ALTER tables, and normalization.',
      step_order: 1,
      resource_link: 'https://www.postgresql.org/docs/current/ddl.html'
    },
    {
      id: 'step-sql-2',
      skill_id: 'skill-sql',
      title: 'Advanced Joins & Aggregations',
      description: 'INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN, GROUP BY, HAVING, and aggregate functions.',
      step_order: 2,
      resource_link: 'https://www.postgresql.org/docs/current/queries-table-expressions.html'
    },
    {
      id: 'step-sql-3',
      skill_id: 'skill-sql',
      title: 'Indexing & Query Performance',
      description: 'B-Tree indexes, EXPLAIN ANALYZE, query optimization, and transaction management (ACID).',
      step_order: 3,
      resource_link: 'https://www.postgresql.org/docs/current/indexes.html'
    }
  ]
};

export const initialBadges: Badge[] = [
  {
    id: 'badge-novice',
    name: 'First Step',
    description: 'Complete your first skill roadmap challenge',
    icon_symbol: '🌱',
    bg_color: '#00b894',
    criteria_type: 'first_challenge',
    unlocked: true
  },
  {
    id: 'badge-streak-5',
    name: 'Consistency Star',
    description: 'Maintain a 5-day active learning streak',
    icon_symbol: '🔥',
    bg_color: '#e17055',
    criteria_type: 'streak_5',
    unlocked: false
  },
  {
    id: 'badge-master-3',
    name: 'Track Master',
    description: 'Successfully complete 3 skill roadmaps',
    icon_symbol: '🏆',
    bg_color: '#fdcb6e',
    criteria_type: 'completions_3',
    unlocked: false
  },
  {
    id: 'badge-elite',
    name: 'DIU Elite Coder',
    description: 'Earn 300+ total challenge points',
    icon_symbol: '⚡',
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
  'user-sohan': [],
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
