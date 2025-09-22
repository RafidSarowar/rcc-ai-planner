import React, { useState } from 'react';
import type { SchedulePlan, SemesterName, Course } from '../types';
import { CourseCard } from './CourseCard';
import { ChevronDownIcon } from './Icons';

interface ScheduleDisplayProps {
  plan: SchedulePlan;
}

const SEMESTER_ORDER: SemesterName[] = ['Fall', 'Winter Intersession', 'Spring', 'Summer Intersession'];

const SemesterSection: React.FC<{ title: string; courses: Course[] }> = ({ title, courses }) => {
  const totalUnits = courses.reduce((sum, course) => sum + (course.units || 0), 0);

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-text-primary">{title}</h4>
        <span className="text-sm font-medium bg-accent text-accent-text px-2.5 py-0.5 rounded-full">
          {totalUnits} Units
        </span>
      </div>
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 px-3 bg-background-component-hover rounded-lg border border-dashed border-border">
            <p className="text-sm text-text-secondary">No courses scheduled for this term.</p>
        </div>
      )}
    </div>
  );
};

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ plan }) => {
  const [openYear, setOpenYear] = useState<number>(1);

  const toggleYear = (year: number) => {
    setOpenYear(openYear === year ? -1 : year);
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl md:text-2xl font-bold text-text-primary pb-2 border-b-2 border-primary/30">Your Generated Academic Plan</h3>
      {plan.map((academicYear) => (
        <div key={academicYear.year} className="border border-border rounded-xl bg-background-component shadow-sm overflow-hidden">
          <button
            onClick={() => toggleYear(academicYear.year)}
            className="w-full flex justify-between items-center p-4 text-left bg-background-component hover:bg-background-component-hover focus:outline-none focus:ring-2 focus:ring-primary"
            aria-expanded={openYear === academicYear.year}
            aria-controls={`year-panel-${academicYear.year}`}
          >
            <h3 className="text-xl font-bold text-text-primary">Year {academicYear.year}</h3>
            <ChevronDownIcon
              className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${openYear === academicYear.year ? 'rotate-180' : ''}`}
            />
          </button>
          {openYear === academicYear.year && (
            <div id={`year-panel-${academicYear.year}`} className="p-4 md:p-6 border-t border-border bg-background-body">
                {SEMESTER_ORDER.map(semesterName => (
                    <SemesterSection 
                        key={semesterName}
                        title={`${semesterName}${semesterName.includes('Intersession') ? '' : ' Term'}`}
                        courses={academicYear.semesters[semesterName] || []}
                    />
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScheduleDisplay;
