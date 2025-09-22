
export interface Course {
  code: string;
  name: string;
  units: number;
  description: string;
  prerequisites?: string[];
  corequisites?: string[];
  ge_category?: string[];
  transfer_category?: string[];
}

export type SemesterName = 'Fall' | 'Winter Intersession' | 'Spring' | 'Summer Intersession';

export interface Semesters {
  'Fall': Course[];
  'Winter Intersession': Course[];
  'Spring': Course[];
  'Summer Intersession': Course[];
}

export interface AcademicYear {
  year: number;
  semesters: Semesters;
}

export type SchedulePlan = AcademicYear[];

export interface ThemeColors {
    [key: string]: string;
}

export interface Theme {
  name: string;
  value: string;
  colors: ThemeColors;
}

export interface MajorOption {
  name: string;
  value: string;
}

export interface AreaOfStudy {
  name: string;
  majors: MajorOption[];
}

export interface TransferAgreement {
  [majorName: string]: {
    required: string[];
    electives: string[];
  };
}

export interface TransferAgreements {
  [universityName: string]: TransferAgreement;
}
