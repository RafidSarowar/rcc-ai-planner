import React, { useState } from 'react';
import type { Course } from '../types';
import { InformationCircleIcon, ChevronDownIcon, KeyIcon, LinkIcon, AcademicCapIcon, BuildingLibraryIcon } from './Icons';

interface CourseCardProps {
  course: Course;
}

const InfoTag: React.FC<{ text: string, className?: string }> = ({ text, className }) => (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
        {text}
    </span>
);


export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background-component-hover rounded-lg border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded-lg"
        aria-expanded={isOpen}
        aria-controls={`course-details-${course.code}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <p className="text-sm font-medium text-primary">{course.code}</p>
            <h5 className="font-bold text-text-primary">{course.name}</h5>
          </div>
          <span className="text-xs font-semibold bg-primary text-white px-2 py-1 rounded-full whitespace-nowrap self-center">
            {course.units} Units
          </span>
        </div>
        
        <div className="flex items-center justify-center mt-2 pt-1">
           <span className="text-xs text-text-secondary mr-2">Details</span>
           <ChevronDownIcon
              className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
        </div>

      </button>

      <div
        id={`course-details-${course.code}`}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
          <div className="flex items-start text-sm text-text-secondary">
            <InformationCircleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-text-secondary/80" />
            <p>{course.description}</p>
          </div>
          
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="flex items-start text-sm">
              <KeyIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-text-primary mr-1">Prerequisites:</span>
                {course.prerequisites.map(req => (
                  <InfoTag key={req} text={req} className="bg-gray-200 text-gray-800" />
                ))}
              </div>
            </div>
          )}

          {course.corequisites && course.corequisites.length > 0 && (
            <div className="flex items-start text-sm">
              <LinkIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-sky-600" />
               <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-text-primary mr-1">Corequisites:</span>
                {course.corequisites.map(req => (
                  <InfoTag key={req} text={req} className="bg-gray-200 text-gray-800" />
                ))}
              </div>
            </div>
          )}
          
          {course.ge_category && course.ge_category.length > 0 && (
            <div className="flex items-start text-sm">
                <AcademicCapIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-text-primary mr-1">General Ed:</span>
                    {course.ge_category.map(cat => (
                        <InfoTag key={cat} text={cat} className="bg-green-100 text-green-800" />
                    ))}
                </div>
            </div>
          )}

          {course.transfer_category && course.transfer_category.length > 0 && (
            <div className="flex items-start text-sm">
                <BuildingLibraryIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-600" />
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-text-primary mr-1">Transfer:</span>
                    {course.transfer_category.map(cat => (
                        <InfoTag key={cat} text={cat} className="bg-indigo-100 text-indigo-800" />
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};