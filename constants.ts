import type { Theme, AreaOfStudy, TransferAgreements } from './types';

export const THEMES: Theme[] = [
  {
    name: 'Tiger',
    value: 'tiger',
    colors: {
      '--color-primary': '#f97316', // Orange 500
      '--color-primary-dark': '#ea580c', // Orange 600
      '--color-accent': '#ffedd5', // Orange 100
      '--color-accent-text': '#9a3412', // Orange 800
      '--color-background-body': '#f8fafc', // Slate 50
      '--color-background-component': '#ffffff',
      '--color-background-component-hover': '#f1f5f9', // Slate 100
      '--color-border': '#e2e8f0', // Slate 200
      '--color-text-primary': '#1e293b', // Slate 800
      '--color-text-secondary': '#64748b', // Slate 500
      '--color-text-inverted': '#ffffff',
    },
  },
  {
    name: 'Default',
    value: 'default',
    colors: {
        '--color-primary': '#4f46e5',
        '--color-primary-dark': '#4338ca',
        '--color-accent': '#e0e7ff',
        '--color-accent-text': '#3730a3',
        '--color-background-body': '#f9fafb',
        '--color-background-component': '#ffffff',
        '--color-background-component-hover': '#f3f4f6',
        '--color-border': '#e5e7eb',
        '--color-text-primary': '#1f2937',
        '--color-text-secondary': '#6b7280',
        '--color-text-inverted': '#ffffff',
    },
  },
  {
    name: 'Dark',
    value: 'dark',
    colors: {
      '--color-primary': '#6366f1',
      '--color-primary-dark': '#4f46e5',
      '--color-accent': '#374151',
      '--color-accent-text': '#e5e7eb',
      '--color-background-body': '#111827',
      '--color-background-component': '#1f2937',
      '--color-background-component-hover': '#374151',
      '--color-border': '#374151',
      '--color-text-primary': '#f9fafb',
      '--color-text-secondary': '#9ca3af',
      '--color-text-inverted': '#111827',
    },
  },
   {
    name: 'Oceanic',
    value: 'oceanic',
    colors: {
        '--color-primary': '#0e7490',
        '--color-primary-dark': '#155e75',
        '--color-accent': '#cffafe',
        '--color-accent-text': '#164e63',
        '--color-background-body': '#f0f9ff',
        '--color-background-component': '#ffffff',
        '--color-background-component-hover': '#e0f2fe',
        '--color-border': '#bae6fd',
        '--color-text-primary': '#0c4a6e',
        '--color-text-secondary': '#38bdf8',
        '--color-text-inverted': '#ffffff',
    },
  },
];


export const AREAS_OF_STUDY: AreaOfStudy[] = [
  {
    name: 'Arts & Humanities',
    majors: [
      { name: 'Art History (ADT)', value: 'art-history-adt' },
      { name: 'English (ADT)', value: 'english-adt' },
      { name: 'History (ADT)', value: 'history-adt' },
      { name: 'Music (AA)', value: 'music-aa' },
      { name: 'Philosophy (ADT)', value: 'philosophy-adt' },
      { name: 'Studio Arts (ADT)', value: 'studio-arts-adt' },
    ],
  },
  {
    name: 'Business & Management',
    majors: [
      { name: 'Business Administration (ADT)', value: 'business-admin-adt' },
      { name: 'Accounting (AS)', value: 'accounting-as' },
      { name: 'Management (AS)', value: 'management-as' },
      { name: 'Marketing (AS)', value: 'marketing-as' },
    ],
  },
  {
    name: 'Health & Wellness',
    majors: [
      { name: 'Kinesiology (ADT)', value: 'kinesiology-adt' },
      { name: 'Nursing (AS)', value: 'nursing-as' },
      { name: 'Nutrition and Dietetics (ADT)', value: 'nutrition-adt' },
      { name: 'Public Health Science (ADT)', value: 'public-health-adt' },
    ],
  },
  {
    name: 'Public Safety',
    majors: [
      { name: 'Administration of Justice (ADT)', value: 'admin-justice-adt' },
      { name: 'Corrections (Cert)', value: 'corrections-cert' },
    ],
  },
  {
    name: 'STEM (Science, Tech, Engineering, Math)',
    majors: [
      { name: 'Biology (ADT)', value: 'biology-adt' },
      { name: 'Chemistry (ADT)', value: 'chemistry-adt' },
      { name: 'Computer Science (ADT)', value: 'computer-science-adt' },
      { name: 'Engineering (AS)', value: 'engineering-as' },
      { name: 'Geology (ADT)', value: 'geology-adt' },
      { name: 'Mathematics (ADT)', value: 'math-adt' },
    ],
  },
   {
    name: 'Technology & Digital Media',
    majors: [
      { name: 'Computer Programming (Cert)', value: 'computer-programming-cert' },
      { name: 'Cyber Defense (AS)', value: 'cyber-defense-as' },
      { name: 'Web Developer (Cert)', value: 'web-developer-cert' },
      { name: 'Graphic Design & Digital Media (AS)', value: 'graphic-design-as'},
    ],
  }
];

export const TRANSFER_UNIVERSITIES = [
    { name: 'No Specific Transfer', value: 'none' },
    { name: 'CSU Fullerton (CSUF)', value: 'csuf' },
    { name: 'CSU San Bernardino (CSUSB)', value: 'csusb' },
    { name: 'Cal Poly Pomona (CPP)', value: 'cpp' },
    { name: 'San Diego State University (SDSU)', value: 'sdsu' },
    { name: 'UC Riverside (UCR)', value: 'ucr' },
    { name: 'UC Irvine (UCI)', value: 'uci' },
    { name: 'UC Los Angeles (UCLA)', value: 'ucla' },
];

export const TRANSFER_AGREEMENTS: TransferAgreements = {
  'ucr': {
    'computer-science-adt': {
      required: ['CIS-5', 'CIS-17A', 'CIS-17B', 'CIS-17C', 'MAT-1A', 'MAT-1B', 'MAT-1C', 'PHY-4A'],
      electives: ['PHY-4B', 'PHY-4C'],
    },
  },
  'csusb': {
    'computer-science-adt': {
      required: ['CIS-5', 'CIS-7', 'CIS-17A', 'CIS-11', 'MAT-1A', 'MAT-1B'],
      electives: ['PHY-4A', 'PHY-4B'],
    },
  },
  'csuf': {
    'business-admin-adt': {
      required: ['ACC-1A', 'ACC-1B', 'BUS-18A', 'BUS-24', 'ECO-7', 'ECO-8', 'MAT-12', 'CIS-1A'],
      electives: [],
    },
  },
};

export const ALL_GE_CATEGORIES = [
  { id: 'RCCD GE Area 1A', name: 'Area 1A: English Composition' },
  { id: 'RCCD GE Area 1B', name: 'Area 1B: Oral/Critical Thinking' },
  { id: 'RCCD GE Area 2', name: 'Area 2: Mathematical Concepts' },
  { id: 'RCCD GE Area 3', name: 'Area 3: Arts & Humanities' },
  { id: 'RCCD GE Area 4', name: 'Area 4: Social & Behavioral Sciences' },
  { id: 'RCCD GE Area 5', name: 'Area 5: Natural Sciences' },
  { id: 'RCCD GE Area 6', name: 'Area 6: Ethnic Studies' },
  { id: 'RCCD GE Area 7', name: 'Area 7: Lifelong Learning' },
];

export const ALL_TRANSFER_CATEGORIES = [
    { id: 'CSU GE Area A1', name: 'CSU A1: Oral Communication' },
    { id: 'CSU GE Area A2', name: 'CSU A2: Written Communication' },
    { id: 'CSU GE Area A3', name: 'CSU A3: Critical Thinking' },
    { id: 'CSU GE Area B1', name: 'CSU B1: Physical Science' },
    { id: 'CSU GE Area B2', name: 'CSU B2: Life Science' },
    { id: 'CSU GE Area B3', name: 'CSU B3: Lab Activity' },
    { id: 'CSU GE Area B4', name: 'CSU B4: Mathematics' },
    { id: 'CSU GE Area C1', name: 'CSU C1: Arts' },
    { id: 'CSU GE Area C2', name: 'CSU C2: Humanities' },
    { id: 'CSU GE Area D', name: 'CSU D: Social Sciences' },
    { id: 'CSU GE Area E', name: 'CSU E: Lifelong Learning' },
    { id: 'CSU GE Area F', name: 'CSU F: Ethnic Studies' },
    { id: 'IGETC Area 1A', name: 'IGETC 1A: English Composition' },
    { id: 'IGETC Area 1B', name: 'IGETC 1B: Critical Thinking' },
    { id: 'IGETC Area 1C', name: 'IGETC 1C: Oral Communication' },
    { id: 'IGETC Area 2A', name: 'IGETC 2A: Mathematics' },
    { id: 'IGETC Area 3A', name: 'IGETC 3A: Arts' },
    { id: 'IGETC Area 3B', name: 'IGETC 3B: Humanities' },
    { id: 'IGETC Area 4', name: 'IGETC 4: Social & Behavioral Sci' },
    { id: 'IGETC Area 5A', name: 'IGETC 5A: Physical Science' },
    { id: 'IGETC Area 5B', name: 'IGETC 5B: Biological Science' },
    { id: 'IGETC Area 5C', name: 'IGETC 5C: Lab Activity' },
    { id: 'IGETC Area 6A', name: 'IGETC 6A: Language Other Than English' },
    { id: 'IGETC Area 7', name: 'IGETC 7: Ethnic Studies' },
];