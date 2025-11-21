
import React from 'react';
import { Plus, Check, ExternalLink, Clock, Building2, Users } from 'lucide-react';
import { EtMEvent, STAGE_COLORS } from '../types';
import { generateEtmLink } from '../utils/helpers';

interface EventCardProps {
  event: EtMEvent;
  isSelected: boolean;
  onToggle: (id: string) => void;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isSelected, onToggle, compact = false }) => {
  const stageColorClass = STAGE_COLORS[event.stage] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className={`group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${compact ? 'p-3' : 'p-5'} ${isSelected ? 'border-l-etm-600 bg-etm-50' : 'border-l-transparent border border-gray-100'}`}>
      
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${stageColorClass}`}>
          {event.stage}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(event.id);
          }}
          className={`flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 ${compact ? 'w-6 h-6' : 'w-8 h-8'} ${
            isSelected 
              ? 'bg-etm-600 text-white hover:bg-etm-700' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
          title={isSelected ? "Remover de mi agenda" : "Agregar a mi agenda"}
        >
          {isSelected ? <Check size={compact ? 12 : 16} /> : <Plus size={compact ? 12 : 16} />}
        </button>
      </div>

      <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-gray-900 leading-tight mb-2 group-hover:text-etm-900`}>
        {event.title}
      </h3>

      <div className={`space-y-1.5 text-gray-600 mb-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="flex items-center gap-2">
          <Clock size={compact ? 12 : 14} className="text-etm-500" />
          <span className="font-medium">{event.time} hrs</span>
        </div>
        
        {event.company && (
          <div className="flex items-center gap-2">
            <Building2 size={compact ? 12 : 14} className="text-gray-400" />
            <span className="line-clamp-1">{event.company}</span>
          </div>
        )}
        
        {!compact && event.speakers && event.speakers.length > 0 && (
          <div className="flex items-start gap-2">
            <Users size={14} className="text-gray-400 mt-0.5" />
            <span className="italic line-clamp-2">{event.speakers.join(', ')}</span>
          </div>
        )}
      </div>

      <a 
        href={generateEtmLink(event.stage, event.title)} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-etm-600 hover:text-etm-800 hover:underline transition-colors"
      >
        Ver en etmday.org <ExternalLink size={12} />
      </a>
    </div>
  );
};
