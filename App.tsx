import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ScheduleDisplay from './components/ScheduleDisplay';
import ErrorAlert from './components/ErrorAlert';
import LoadingSpinner from './components/LoadingSpinner';
import RequirementsChecklist from './components/RequirementsChecklist';
import { generateSchedule } from './services/geminiService';
import { AREAS_OF_STUDY, TRANSFER_UNIVERSITIES } from './constants';
import type { SchedulePlan } from './types';

function App() {
  // Form state
  const [major, setMajor] = useState('computer-science-adt');
  const [transferUniversity, setTransferUniversity] = useState('ucr');
  const [years, setYears] = useState(2);
  const [startTerm, setStartTerm] = useState('Fall');
  const [minUnits, setMinUnits] = useState(12);
  const [maxUnits, setMaxUnits] = useState(16);
  const [includeWinter, setIncludeWinter] = useState(true);
  const [includeSummer, setIncludeSummer] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // App state
  const [schedulePlan, setSchedulePlan] = useState<SchedulePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSchedulePlan(null);

    try {
      const plan = await generateSchedule({
        major,
        transferUniversity,
        years,
        startTerm,
        unitsPerTerm: { min: minUnits, max: maxUnits },
        includeWinter,
        includeSummer,
        additionalNotes,
      });
      setSchedulePlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [major, transferUniversity, years, startTerm, minUnits, maxUnits, includeWinter, includeSummer, additionalNotes]);

  return (
    <div className="min-h-screen bg-background-body text-text-primary font-sans">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-text-primary mb-2">
            Welcome to TigerTracks
          </h2>
          <p className="text-center text-text-secondary mb-8">
            Chart your course to graduation and transfer. Let our AI assistant build your personalized academic plan.
          </p>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-background-component rounded-xl border border-border shadow-md space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Major Selection */}
                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-text-primary mb-1">Major / Area of Study</label>
                  <select id="major" value={major} onChange={e => setMajor(e.target.value)} className="w-full p-2 border border-border rounded-md bg-background-body focus:ring-2 focus:ring-primary focus:border-primary">
                    {AREAS_OF_STUDY.map(area => (
                      <optgroup label={area.name} key={area.name}>
                        {area.majors.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {/* Transfer University */}
                 <div>
                  <label htmlFor="transfer" className="block text-sm font-medium text-text-primary mb-1">Transfer Institution</label>
                  <select id="transfer" value={transferUniversity} onChange={e => setTransferUniversity(e.target.value)} className="w-full p-2 border border-border rounded-md bg-background-body focus:ring-2 focus:ring-primary focus:border-primary">
                    {TRANSFER_UNIVERSITIES.map(uni => <option key={uni.value} value={uni.value}>{uni.name}</option>)}
                  </select>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                    <label htmlFor="years" className="block text-sm font-medium text-text-primary mb-1">Plan Duration</label>
                    <select id="years" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full p-2 border border-border rounded-md bg-background-body focus:ring-2 focus:ring-primary focus:border-primary">
                      <option value={1}>1 Year</option>
                      <option value={2}>2 Years</option>
                      <option value={3}>3 Years</option>
                    </select>
                 </div>
                 <div>
                    <label htmlFor="startTerm" className="block text-sm font-medium text-text-primary mb-1">Starting Term</label>
                    <select id="startTerm" value={startTerm} onChange={e => setStartTerm(e.target.value)} className="w-full p-2 border border-border rounded-md bg-background-body focus:ring-2 focus:ring-primary focus:border-primary">
                      <option>Fall</option>
                      <option>Spring</option>
                    </select>
                 </div>
                 <div>
                    <label htmlFor="minUnits" className="block text-sm font-medium text-text-primary mb-1">Min Units</label>
                    <input type="number" id="minUnits" value={minUnits} onChange={e => setMinUnits(Number(e.target.value))} className="w-full p-2 border border-border rounded-md bg-background-body focus:ring-2 focus:ring-primary focus:border-primary" />
                 </div>
                 <div>
                    <label htmlFor="maxUnits" className="block text-sm font-medium text-text-primary mb-1">Max Units</label>
                    <input type="number" id="maxUnits" value={maxUnits} onChange={e => setMaxUnits(Number(e.target.value))} className="w-full p-2 border border-border rounded-md bg-background-body focus:ring-2 focus:ring-primary focus:border-primary" />
                 </div>
            </div>
            
            <div className="space-y-3">
               <label className="block text-sm font-medium text-text-primary">Additional Options</label>
               <div className="flex items-center space-x-8">
                   <div className="flex items-center">
                       <input id="include-winter" type="checkbox" checked={includeWinter} onChange={e => setIncludeWinter(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                       <label htmlFor="include-winter" className="ml-2 block text-sm text-text-secondary">Include Winter Intersession</label>
                   </div>
                    <div className="flex items-center">
                       <input id="include-summer" type="checkbox" checked={includeSummer} onChange={e => setIncludeSummer(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                       <label htmlFor="include-summer" className="ml-2 block text-sm text-text-secondary">Include Summer Intersession</label>
                   </div>
               </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-1">Additional Notes</label>
              <textarea id="notes" value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={3} className="w-full p-2 border border-border rounded-md bg-background-body focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g., I have already taken ENG-1A, I prefer morning classes..."></textarea>
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isLoading ? <><LoadingSpinner /> Generating Plan...</> : 'Generate My Schedule'}
              </button>
            </div>
          </form>

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <LoadingSpinner />
                <span className="text-lg text-text-secondary ml-2">Generating your academic plan...</span>
              </div>
            </div>
          )}
          {error && <ErrorAlert message={error} />}
          
          {schedulePlan && (
            <>
              <RequirementsChecklist plan={schedulePlan} />
              <ScheduleDisplay plan={schedulePlan} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;