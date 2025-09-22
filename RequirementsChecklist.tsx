import React from 'react';
import type { SchedulePlan } from '../types';
import { ALL_GE_CATEGORIES, ALL_TRANSFER_CATEGORIES } from '../constants';
import { AcademicCapIcon } from './Icons';

interface RequirementsChartProps {
  plan: SchedulePlan;
}

interface DonutChartProps {
    title: string;
    fulfilled: number;
    total: number;
    colorClass: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ title, fulfilled, total, colorClass }) => {
    const percentage = total > 0 ? (fulfilled / total) * 100 : 0;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        className="text-gray-200"
                        style={{ color: 'var(--color-border)'}}
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    {/* Foreground circle */}
                    <circle
                        className={colorClass}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-text-primary">{fulfilled}</span>
                    <span className="text-sm text-text-secondary">of {total}</span>
                </div>
            </div>
            <p className="mt-3 text-base font-semibold text-text-primary text-center">{title}</p>
        </div>
    );
};


const RequirementsChecklist: React.FC<RequirementsChartProps> = ({ plan }) => {
  const { geFulfilled, transferFulfilled } = React.useMemo(() => {
    const allCourses = plan.flatMap(year => Object.values(year.semesters).flat());
    const fulfilledSet = new Set<string>();
    allCourses.forEach(course => {
      course.ge_category?.forEach(cat => fulfilledSet.add(cat));
      course.transfer_category?.forEach(cat => fulfilledSet.add(cat));
    });

    const geFulfilledCount = ALL_GE_CATEGORIES.filter(req => fulfilledSet.has(req.id)).length;
    const transferFulfilledCount = ALL_TRANSFER_CATEGORIES.filter(req => fulfilledSet.has(req.id)).length;

    return { geFulfilled: geFulfilledCount, transferFulfilled: transferFulfilledCount };
  }, [plan]);

  const geTotal = ALL_GE_CATEGORIES.length;
  const transferTotal = ALL_TRANSFER_CATEGORIES.length;

  return (
    <div className="mt-8">
       <h3 className="text-xl md:text-2xl font-bold text-text-primary pb-2 border-b-2 border-primary/30 mb-6 flex items-center">
         <AcademicCapIcon className="w-6 h-6 mr-3 text-primary" />
         Requirements Fulfillment
       </h3>
       <div className="p-4 md:p-6 border border-border rounded-xl bg-background-component shadow-sm">
         <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <DonutChart 
                title="General Education"
                fulfilled={geFulfilled}
                total={geTotal}
                colorClass="text-green-500"
            />
            <DonutChart 
                title="Transfer Requirements"
                fulfilled={transferFulfilled}
                total={transferTotal}
                colorClass="text-indigo-500"
            />
         </div>
         <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 mt-6 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-text-secondary">GE Fulfilled</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span className="text-sm text-text-secondary">Transfer Fulfilled</span>
            </div>
             <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-gray-200" style={{ backgroundColor: 'var(--color-border)'}}></span>
                <span className="text-sm text-text-secondary">Remaining</span>
            </div>
         </div>
       </div>
    </div>
  );
};

export default RequirementsChecklist;