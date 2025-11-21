
import React, { useState, useMemo } from 'react';
import { Calendar, Search, Plus, Sparkles, Trash2, AlertTriangle, Clock, ExternalLink, Coffee, ArrowDown, ArrowRight, Lightbulb, Printer, Pencil, Filter } from 'lucide-react';
import { RAW_DATA } from './data';
import { DAYS, CustomEvent } from './types';
import { EventCard } from './components/EventCard';
import { CustomEventModal, CustomEventData } from './components/CustomEventModal';
import { timeToMinutes, checkOverlap, generateEtmLink, minutesToTime } from './utils/helpers';

const STAGES = [
  "Todos",
  "Escenario Impacto",
  "Escenario Conecta",
  "Escenario Paneles y Entrevistas",
  "Escenario Talleres"
];

export default function App() {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [myScheduleIds, setMyScheduleIds] = useState<Set<string>>(new Set());
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [selectedStage, setSelectedStage] = useState("Todos");
  const [startTimeFilter, setStartTimeFilter] = useState("");
  const [endTimeFilter, setEndTimeFilter] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CustomEventData | null>(null);

  // --- Helpers ---
  const toggleEvent = (id: string) => {
    const newSet = new Set(myScheduleIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setMyScheduleIds(newSet);
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditCustomEvent = (event: CustomEvent) => {
    setEditingEvent({
      id: event.id,
      title: event.title,
      day: event.day,
      startTime: event.startTime,
      endTime: event.endTime,
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomEvent = (data: CustomEventData) => {
    if (data.id) {
      // Edit existing
      setCustomEvents(prev => prev.map(e => e.id === data.id ? { ...e, ...data, isCustom: true } : e));
    } else {
      // Add new
      const newEvent: CustomEvent = {
        id: `custom-${Date.now()}`,
        title: data.title,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        isCustom: true
      };
      setCustomEvents(prev => [...prev, newEvent]);
    }
  };

  const removeCustomEvent = (id: string) => {
    setCustomEvents(customEvents.filter(e => e.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Data Processing ---
  
  // 0. Pre-calculate available start times per day to determine standard event durations
  const dailyStartTimes = useMemo(() => {
    const map = new Map<string, number[]>();
    DAYS.forEach(day => {
      const times = new Set(
         RAW_DATA.schedule
           .filter(e => e.day === day)
           .map(e => timeToMinutes(e.time))
      );
      map.set(day, Array.from(times).sort((a, b) => a - b));
    });
    return map;
  }, []);

  const getStandardDuration = (day: string, time: string) => {
     const times = dailyStartTimes.get(day) || [];
     const start = timeToMinutes(time);
     const idx = times.indexOf(start);
     // If there is a next block, duration is difference. Otherwise default to 45 mins.
     if (idx !== -1 && idx < times.length - 1) {
        return times[idx + 1] - start;
     }
     return 45; 
  };

  // 1. Available Events (Sidebar)
  const availableEvents = useMemo(() => {
    let events = RAW_DATA.schedule.filter(e => e.day === selectedDay);
    
    // Filter by stage
    if (selectedStage !== "Todos") {
      events = events.filter(e => e.stage === selectedStage);
    }
    
    // Filter by time range
    if (startTimeFilter) {
      const startMin = timeToMinutes(startTimeFilter);
      events = events.filter(e => timeToMinutes(e.time) >= startMin);
    }
    
    if (endTimeFilter) {
      const endMin = timeToMinutes(endTimeFilter);
      events = events.filter(e => timeToMinutes(e.time) <= endMin);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.company && e.company.toLowerCase().includes(q)) ||
        e.speakers.some(s => s.toLowerCase().includes(q)) ||
        e.stage.toLowerCase().includes(q)
      );
    }
    
    return events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  }, [selectedDay, searchQuery, selectedStage, startTimeFilter, endTimeFilter]);

  // 2. My Agenda (Main View)
  const agendaItems = useMemo(() => {
    // A. Combine standard selected events and custom events
    const standard = RAW_DATA.schedule
      .filter(e => myScheduleIds.has(e.id))
      .map(e => ({ ...e, startTime: e.time, isCustom: false }));
    
    const custom = customEvents.map(e => ({ 
      ...e, 
      time: e.startTime, 
      stage: 'Custom', 
      speakers: [], 
      company: 'Personal',
      isCustom: true 
    }));
    
    const all = [...standard, ...custom];
    
    // B. Filter for current day and enrich with calculated start/end times
    const dayItems = all
      .filter(i => i.day === selectedDay)
      .map(item => {
        const startMin = timeToMinutes(item.time || item.startTime);
        // Calculate duration based on custom times OR standard schedule flow
        const duration = item.isCustom 
          ? timeToMinutes(item.endTime) - startMin
          : getStandardDuration(item.day, item.time);
        
        return {
          ...item,
          startMin,
          endMin: startMin + duration,
          duration
        };
      });

    // C. Sort
    const sorted = dayItems.sort((a, b) => a.startMin - b.startMin);

    // D. Check Conflicts
    const itemsWithConflicts = sorted.map(item => {
      const conflicts = sorted.filter(other => other.id !== item.id && checkOverlap(item, other));
      return {
        ...item,
        hasConflict: conflicts.length > 0
      };
    });

    // E. Insert Gaps (Free Time)
    const finalTimeline: any[] = [];
    
    // Helper to check for suggestions
    const findSuggestions = (gapStart: number, gapEnd: number) => {
      return RAW_DATA.schedule.filter(e => {
        if (e.day !== selectedDay) return false;
        if (myScheduleIds.has(e.id)) return false; // Already added

        const eStart = timeToMinutes(e.time);
        const eDuration = getStandardDuration(e.day, e.time);
        const eEnd = eStart + eDuration;

        // Criteria: Event must start >= Gap Start AND Event must end <= Gap End
        return eStart >= gapStart && eEnd <= gapEnd;
      });
    };

    for (let i = 0; i < itemsWithConflicts.length; i++) {
      const current = itemsWithConflicts[i];
      finalTimeline.push(current);

      // Check if there is a next item
      if (i < itemsWithConflicts.length - 1) {
        const next = itemsWithConflicts[i + 1];
        
        // Calculate gap
        if (next.startMin > current.endMin) {
          const gapDuration = next.startMin - current.endMin;
          
          if (gapDuration >= 15) {
             const suggestions = findSuggestions(current.endMin, next.startMin);
             
             finalTimeline.push({
               id: `gap-${current.id}-${next.id}`,
               isGap: true,
               duration: gapDuration,
               startTime: minutesToTime(current.endMin),
               endTime: minutesToTime(next.startMin),
               suggestions: suggestions
             });
          }
        }
      }
    }

    return finalTimeline;

  }, [myScheduleIds, customEvents, selectedDay, dailyStartTimes]);


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white">
      
      {/* --- LEFT PANEL: CATALOGUE --- */}
      <aside className="w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full z-20 shadow-xl md:shadow-none print:hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-etm-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-etm-500/30">
                E
             </div>
             <h1 className="font-bold text-lg tracking-tight text-slate-900">EtMDay Planner</h1>
          </div>

          {/* Day Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectedDay === day
                    ? 'bg-white text-etm-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {day.split(' ')[0]} {day.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar charlas, speakers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-etm-500 focus:border-etm-500 outline-none transition-all"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
              <Filter size={14} />
              Filtros
            </div>
            
            {/* Stage Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Escenario</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-etm-500 focus:border-etm-500 outline-none transition-all"
              >
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Filter */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                <input
                  type="time"
                  value={startTimeFilter}
                  onChange={(e) => setStartTimeFilter(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-etm-500 focus:border-etm-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                <input
                  type="time"
                  value={endTimeFilter}
                  onChange={(e) => setEndTimeFilter(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-etm-500 focus:border-etm-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedStage !== "Todos" || startTimeFilter || endTimeFilter) && (
              <button
                onClick={() => {
                  setSelectedStage("Todos");
                  setStartTimeFilter("");
                  setEndTimeFilter("");
                }}
                className="w-full text-xs text-etm-600 hover:text-etm-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {availableEvents.length === 0 ? (
             <div className="text-center py-10 text-gray-400">
               <p>No se encontraron eventos.</p>
             </div>
          ) : (
            availableEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                isSelected={myScheduleIds.has(event.id)}
                onToggle={toggleEvent}
                compact={true}
              />
            ))
          )}
        </div>
      </aside>

      {/* --- RIGHT PANEL: AGENDA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 relative print:w-full print:h-auto print:overflow-visible print:bg-white">
        
        {/* Top Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">{selectedDay}</h2>
            <span className="bg-etm-100 text-etm-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {agendaItems.filter(i => !i.isGap).length} actividades
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-etm-600 hover:bg-etm-50 rounded-lg transition-colors"
              title="Imprimir Agenda"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="bg-etm-600 hover:bg-etm-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-etm-500/20 transition-all"
            >
              <Plus size={16} /> 
              <span className="hidden sm:inline">Bloque Personal</span>
            </button>
          </div>
        </header>
        
        {/* Print Header */}
        <div className="hidden print:block p-6 border-b border-gray-200 mb-4">
           <h1 className="text-2xl font-bold text-slate-900">Mi Agenda - EtMDay 2025</h1>
           <h2 className="text-xl text-etm-600">{selectedDay}</h2>
        </div>

        {/* Print Table View */}
        <div className="hidden print:block p-6">
          {agendaItems.length === 0 ? (
            <p className="text-center text-gray-500">No hay eventos en tu agenda para este día.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-3 font-bold text-sm">Hora</th>
                  <th className="text-left py-2 px-3 font-bold text-sm">Escenario</th>
                  <th className="text-left py-2 px-3 font-bold text-sm">Título</th>
                  <th className="text-left py-2 px-3 font-bold text-sm">Link</th>
                </tr>
              </thead>
              <tbody>
                {agendaItems
                  .filter(item => !item.isGap)
                  .map((item) => {
                    const startStr = minutesToTime(item.startMin);
                    const endStr = minutesToTime(item.endMin);
                    const link = item.isCustom ? '-' : generateEtmLink(item.stage, item.title);
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-2 px-3 text-sm align-top whitespace-nowrap">
                          {startStr} - {endStr}
                        </td>
                        <td className="py-2 px-3 text-sm align-top">
                          {item.isCustom ? 'Personal' : item.stage}
                        </td>
                        <td className="py-2 px-3 text-sm align-top">
                          <div className="font-medium">{item.title}</div>
                          {item.company && item.company !== 'Personal' && (
                            <div className="text-xs text-gray-600 mt-0.5">{item.company}</div>
                          )}
                          {item.speakers && item.speakers.length > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.speakers.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-xs align-top break-all">
                          {link}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>

        {/* Agenda Content */}
        <div className="flex-1 overflow-y-auto p-6 print:hidden print:overflow-visible print:h-auto print:p-0 print:px-6">
          
          {agendaItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 print:hidden">
              <Calendar size={64} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">Tu agenda está vacía para este día</p>
              <p className="text-sm">Selecciona eventos del panel lateral para comenzar</p>
            </div>
          ) : (
            <div className="relative max-w-3xl mx-auto pb-20 print:max-w-none print:pb-0">
              {/* Visual connection line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 print:border-gray-300"></div>

              <div className="space-y-2">
                {agendaItems.map((item) => {
                  
                  // --- GAP RENDER ---
                  if (item.isGap) {
                    return (
                       <div key={item.id} className="relative pl-10 py-2 group/gap print:hidden">
                          <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gray-200 z-10"></div>
                          
                          <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 bg-white/50 hover:border-etm-300 transition-all">
                             <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Coffee size={18} />
                                  <span className="font-medium text-sm">{item.duration} min libres</span>
                                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                      {item.startTime} - {item.endTime}
                                  </span>
                                </div>
                                {item.suggestions && item.suggestions.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs font-medium text-etm-600">
                                    <Lightbulb size={14} />
                                    {item.suggestions.length} sugerencias
                                  </div>
                                )}
                             </div>

                             {/* Suggestions List */}
                             {item.suggestions && item.suggestions.length > 0 && (
                               <div className="mt-3 space-y-2">
                                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Caben en este espacio:</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {item.suggestions.slice(0, 4).map((sugg: any) => (
                                      <div key={sugg.id} className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm hover:border-etm-300 hover:shadow-md transition-all flex justify-between items-center gap-2">
                                         <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1 mb-0.5">
                                              <span className="text-[9px] font-bold uppercase bg-gray-100 text-gray-600 px-1.5 rounded border border-gray-200">
                                                {sugg.time}
                                              </span>
                                              <span className="text-[9px] text-gray-400 truncate max-w-[100px]">{sugg.stage}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-gray-800 leading-tight truncate" title={sugg.title}>
                                              {sugg.title}
                                            </h4>
                                         </div>
                                         <button 
                                            onClick={() => toggleEvent(sugg.id)}
                                            className="text-etm-600 hover:bg-etm-50 p-1.5 rounded-md transition-colors"
                                            title="Agregar este evento"
                                         >
                                           <Plus size={16} />
                                         </button>
                                      </div>
                                    ))}
                                  </div>
                               </div>
                             )}
                          </div>
                       </div>
                    );
                  }

                  // --- EVENT RENDER ---
                  const startStr = minutesToTime(item.startMin);
                  const endStr = minutesToTime(item.endMin);

                  return (
                  <div key={item.id} className="relative pl-10 group break-inside-avoid">
                    
                    {/* Timeline Node */}
                    <div className={`absolute left-[11px] top-5 w-2.5 h-2.5 rounded-full border-2 bg-white z-10 transition-colors print:border-gray-400 ${
                      item.hasConflict ? 'border-amber-500 ring-4 ring-amber-100' : 
                      item.isCustom ? 'border-rose-500 group-hover:border-rose-600' : 'border-etm-600 group-hover:border-etm-700'
                    }`}></div>

                    {/* Card */}
                    <div className={`rounded-xl border transition-all duration-200 mb-4 print:border-gray-300 print:shadow-none ${
                      item.hasConflict 
                        ? 'bg-amber-50 border-amber-200 shadow-sm' 
                        : item.isCustom 
                          ? 'bg-rose-50 border-rose-100 hover:border-rose-200 hover:shadow-md' 
                          : 'bg-white border-gray-200 hover:border-etm-200 hover:shadow-md'
                    }`}>
                      
                      {/* Conflict Warning Banner */}
                      {item.hasConflict && (
                        <div className="bg-amber-100 px-4 py-1.5 rounded-t-xl flex items-center gap-2 text-xs font-bold text-amber-800 border-b border-amber-200 print:hidden">
                          <AlertTriangle size={12} />
                          Tope de horario detectado
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            {/* Time & Badge */}
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <div className={`flex items-center gap-1.5 text-sm font-bold ${item.hasConflict ? 'text-amber-700' : 'text-gray-700'}`}>
                                <Clock size={14} />
                                {startStr} - {endStr}
                              </div>
                              
                              {!item.isCustom && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 print:border-gray-400 print:text-gray-800">
                                  {item.stage}
                                </span>
                              )}
                              {item.isCustom && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full border border-rose-200 print:border-gray-400 print:text-gray-800">
                                  Personal
                                </span>
                              )}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-1">
                              {item.title}
                            </h3>
                            
                            {item.company && item.company !== 'Personal' && (
                              <p className="text-sm text-gray-600 font-medium mb-2">{item.company}</p>
                            )}

                            {/* Speakers */}
                            {item.speakers && item.speakers.length > 0 && (
                              <div className="text-sm text-gray-500 mb-3 flex flex-wrap gap-1">
                                {item.speakers.map((s: string, idx: number) => (
                                  <span key={idx} className="after:content-[','] last:after:content-[''] pr-1">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Link */}
                            {!item.isCustom && (
                               <a 
                               href={generateEtmLink(item.stage, item.title)} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-1 text-xs font-semibold text-etm-600 hover:text-etm-800 hover:underline mt-1 print:text-gray-600 print:no-underline"
                             >
                               <span className="print:hidden">Ver detalles</span>
                               <span className="hidden print:inline">
                                 {generateEtmLink(item.stage, item.title)}
                               </span>
                               <ExternalLink size={12} className="print:hidden" />
                             </a>
                            )}
                          </div>

                          {/* Actions - Hidden on Print */}
                          <div className="flex gap-1 print:hidden">
                            {item.isCustom && (
                              <button
                                onClick={() => handleEditCustomEvent(item)}
                                className="text-gray-300 hover:text-etm-600 hover:bg-etm-50 p-2 rounded-lg transition-all"
                                title="Editar bloque"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => item.isCustom ? removeCustomEvent(item.id) : toggleEvent(item.id)}
                              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                              title="Eliminar de mi agenda"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <CustomEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomEvent}
        initialData={editingEvent}
        defaultDay={selectedDay}
      />
    </div>
  );
}
