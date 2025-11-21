export interface Speaker {
  name: string;
}

export interface EtMEvent {
  id: string;
  day: string;
  time: string;
  stage: string;
  title: string;
  company: string | null;
  speakers: string[];
}

export interface CustomEvent {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  isCustom: true;
}

export type ScheduleItem = EtMEvent | CustomEvent;

export const DAYS = ["Jueves 20", "Viernes 21", "Sábado 22"];

export const STAGE_COLORS: Record<string, string> = {
  "Escenario Impacto": "bg-blue-100 text-blue-800 border-blue-200",
  "Escenario Conecta": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Escenario Paneles y Entrevistas": "bg-violet-100 text-violet-800 border-violet-200",
  "Escenario Talleres": "bg-amber-100 text-amber-800 border-amber-200",
  "Custom": "bg-rose-100 text-rose-800 border-rose-200",
};