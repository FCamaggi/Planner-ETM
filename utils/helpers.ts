
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars (except spaces and dashes)
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with -
};

export const generateEtmLink = (stage: string, title: string): string => {
  // Format: https://etmday.org/programa/slug-stage-slug-title/
  return `https://etmday.org/programa/${slugify(stage)}-${slugify(title)}/`;
};

// Convert "10:00" to 600 (minutes) for sorting
export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert 600 to "10:00"
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper to get end time in minutes
export const getEventEndMinutes = (item: any, standardDuration = 45): number => {
  // If it's a custom event with explicit end time
  if (item.endTime) return timeToMinutes(item.endTime);
  
  // For standard events, use the calculated or passed duration
  const start = timeToMinutes(item.time || item.startTime);
  return start + (item.duration || standardDuration);
};

export const checkOverlap = (eventA: any, eventB: any): boolean => {
  const startA = timeToMinutes(eventA.time || eventA.startTime);
  const endA = eventA.endMin; // optimized to use pre-calculated minutes
  
  const startB = timeToMinutes(eventB.time || eventB.startTime);
  const endB = eventB.endMin;

  return startA < endB && startB < endA;
};
