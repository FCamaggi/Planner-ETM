
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface CustomEventData {
  id?: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface CustomEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomEventData) => void;
  initialData?: CustomEventData | null;
  defaultDay: string;
}

export const CustomEventModal: React.FC<CustomEventModalProps> = ({ isOpen, onClose, onSave, initialData, defaultDay }) => {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(defaultDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDay(initialData.day);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
      } else {
        setTitle('');
        setDay(defaultDay);
        setStartTime('09:00');
        setEndTime('10:00');
      }
    }
  }, [isOpen, initialData, defaultDay]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && startTime && endTime) {
      onSave({ 
        id: initialData?.id, 
        title, 
        day, 
        startTime, 
        endTime 
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-etm-50">
          <h3 className="font-bold text-lg text-etm-900">
            {initialData ? 'Editar Bloque' : 'Agregar Bloque Personal'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la actividad</label>
            <input
              type="text"
              required
              placeholder="Ej: Almuerzo con equipo, Reunión cliente..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etm-500 focus:border-etm-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etm-500 focus:border-etm-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etm-500 focus:border-etm-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-etm-600 text-white rounded-lg hover:bg-etm-700 font-bold shadow-md shadow-etm-500/20 transition-all"
            >
              {initialData ? 'Guardar Cambios' : 'Agregar Bloque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
