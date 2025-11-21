// Map of event IDs to their real URLs
const EVENT_LINKS: Record<string, string> = {
  // Sábado 22 - 10:00
  'sat-con-1000':
    'https://etmday.org/programa/escenario-conecta-hacia-donde-va-el-ecosistema-fintech-claves-para-emprendedores-y-pymes/',

  // Sábado 22 - 10:45
  'sat-imp-1045':
    'https://etmday.org/programa/escenario-impacto-crecer-al-ritmo-del-cambio-liderar-con-armonia-en-la-era-de-la-ia/',
  'sat-con-1045':
    'https://etmday.org/programa/escenario-conecta-segundo-congreso-de-mentores-de-chile-en-etmday-impulsando-ecosistemas-transformando-economias/',

  // Sábado 22 - 11:00
  'sat-tall-1100':
    'https://etmday.org/programa/escenario-talleres-emprendedor-se-nace-o-se-hace/',
  'sat-pan-1100':
    'https://etmday.org/programa/escenario-paneles-y-entrevistas-ia-y-talento-humano-potenciando-el-futuro-laboral/',

  // Sábado 22 - 11:30
  'sat-imp-1130':
    'https://etmday.org/programa/escenario-impacto-mas-alla-de-las-medallas-conectando-con-el-proposito/',

  // Sábado 22 - 12:00
  'sat-tall-1200':
    'https://etmday.org/programa/escenario-talleres-como-liderar-equipos-felices/',
  'sat-pan-1200':
    'https://etmday.org/programa/escenario-paneles-y-entrevistas-senior-power-innovacion-con-trayectoria/',

  // Sábado 22 - 12:15
  'sat-imp-1215':
    'https://etmday.org/programa/escenario-impacto-emprende-tu-corazon-el-viaje-de-la-rehabilitacionl-y-el-emprendimiento/',

  // Sábado 22 - 13:00
  'sat-tall-1300':
    'https://etmday.org/programa/escenario-talleres-a-traves-de-su-plataforma-integral-chilat-sirve-de-puente-para-la-cooperacion-entre-empresas-latinoamericanas-y-fabricas-chinas/',
  'sat-pan-1300':
    'https://etmday.org/programa/escenario-paneles-y-entrevistas-cuentame-la-firme/',

  // Sábado 22 - 13:15
  'sat-imp-1315':
    'https://etmday.org/programa/escenario-impacto-sabados-builder-by-apta/',
  'sat-con-1315':
    'https://etmday.org/programa/escenario-conecta-masterclass-sweets-hamilton/',

  // Sábado 22 - 14:00
  'sat-tall-1400':
    'https://etmday.org/programa/escenario-talleres-creacion-de-contenido-para-redes-sociales/',
  'sat-pan-1400':
    'https://etmday.org/programa/escenario-paneles-y-entrevistas-del-campus-a-la-calleemprender-para-transformar/',

  // Sábado 22 - 14:15
  'sat-con-1415':
    'https://etmday.org/programa/escenario-conecta-colormach-experience/',

  // Sábado 22 - 15:00
  'sat-imp-1500':
    'https://etmday.org/programa/escenario-impacto-entrega-de-reconocimientos-innovacion-de-impacto-2025/',
  'sat-tall-1500':
    'https://etmday.org/programa/la-inteligencia-artificial-como-tu-cofundador/',
  'sat-pan-1500':
    'https://etmday.org/programa/escenario-paneles-y-entrevistas-industrias-creativas-el-poder-de-crear/',

  // Sábado 22 - 15:15
  'sat-con-1515':
    'https://etmday.org/programa/escenario-conecta-centro-espacial-nacional-y-su-contribucion-al-desarrollo-de-tecnologias-espaciales/',

  // Sábado 22 - 15:45
  'sat-imp-1545':
    'https://etmday.org/programa/escenario-impacto-fail-historias-de-fracasos-aprendizajes-innovacion-y-liderazgo/',
  'sat-con-1545':
    'https://etmday.org/programa/escenario-conecta-pitch-day-premio-mujer-atomica-2025-2/',

  // Sábado 22 - 16:00
  'sat-tall-1600':
    'https://etmday.org/programa/escenario-talleres-modelo-de-negocios-personal/',
  'sat-pan-1600':
    'https://etmday.org/programa/escenario-paneles-y-entrevistas-influencers-y-creadores-de-contenido/',

  // Sábado 22 - 16:15
  'sat-con-1615':
    'https://etmday.org/programa/escenario-conecta-pitch-day-premio-mujer-atomica-2025/',

  // Sábado 22 - 16:30
  'sat-imp-1630': 'https://etmday.org/programa/ia-amiga-o-enemiga/',

  // Sábado 22 - 16:45
  'sat-con-1645':
    'https://etmday.org/programa/escenario-conecta-red-bull-basement/',

  // Sábado 22 - 17:00
  'sat-tall-1700':
    'https://etmday.org/programa/despegue-primer-vuelo-con-drones/',
  'sat-pan-1700': 'https://etmday.org/programa/entrevista/',

  // Sábado 22 - 17:15
  'sat-imp-1715':
    'https://etmday.org/programa/escenario-impacto-glocal-reverse-pitch-laboratorios-naturales-del-sur-de-chile-buscan-atraer-innovadores-cientificos-y-tecnologico/',

  // Sábado 22 - 17:45
  'sat-con-1745b':
    'https://etmday.org/programa/escenario-conecta-buscando-planetas-gemelos-a-la-tierra-con-los-telescopios-espaciales-de-nasa/',

  // Sábado 22 - 18:00
  'sat-imp-1800':
    'https://etmday.org/programa/escenario-impacto-disciplina-resiliencia-estrategia-y-trabajo-en-equipo-lo-que-la-nfl-me-dejo-para-el-desarrollo-de-negocios/',

  // Sábado 22 - 19:15
  'sat-imp-1915':
    'https://etmday.org/programa/escenario-impacto-musica-en-vivo-amigo-de-artistas/',
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars (except spaces and dashes)
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with -
};

export const generateEtmLink = (
  stage: string,
  title: string,
  eventId?: string
): string => {
  // If we have a direct mapping for this event ID, use it
  if (eventId && EVENT_LINKS[eventId]) {
    return EVENT_LINKS[eventId];
  }

  // Otherwise, fallback to generated link
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
export const getEventEndMinutes = (
  item: any,
  standardDuration = 45
): number => {
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
