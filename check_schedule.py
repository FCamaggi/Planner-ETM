#!/usr/bin/env python3
"""
Verificar que los horarios del sábado coincidan con horarios.md
"""

# Horarios correctos según horarios.md
CORRECT_SCHEDULE = {
    'Escenario Impacto': [
        ('10:00', '10:45', 'Arauco: el futuro presente es en madera'),
        ('10:45', '11:30', 'Nacho Dean: Crecer al ritmo del cambio'),
        ('11:30', '12:15', 'Fernando González y Luciana Aymar'),
        ('12:15', '13:15', 'Teletón: EMPRENDE TU CORAZÓN'),
        ('13:15', '14:15', 'Hub Apta: Sábados BUILDER by APTA'),
        ('15:00', '15:45', 'CORFO: Entrega de Reconocimientos'),
        ('15:45', '16:30', 'Isa Vías: FAIL'),
        ('16:30', '17:15', 'Chris Bannister: IA, amiga o enemiga'),
        ('17:15', '18:00', 'Glocal Reverse Pitch'),
        ('18:00', '19:15', 'Sammis Reyes'),
        ('19:15', 'cierre', 'Show de cierre: Amigo de Artistas'),
    ],
    'Escenario Conecta': [
        ('10:00', '10:45', 'Mastercard'),
        ('10:45', '13:15', 'Segundo Congreso de Mentores'),
        ('13:15', '14:15', 'Sweets Hamilton: Masterclass de galletas'),
        ('14:15', '15:15', 'Carlos Zarhi y José Masihy: ColorMACH Experience'),
        ('15:15', '15:45', 'FACH: Centro Espacial Nacional'),
        ('15:45', '16:15', 'Mujeres Emprendedores: Pitch Day'),
        ('16:15', '16:45', 'ABB: Demo Day InnovABB'),
        ('16:45', '17:15', 'Red Bull: Basement'),
        ('17:15', '17:45', 'Carabineros: por confirmar'),
        ('17:45', '19:15', 'Eduardo Bendek: Buscando planetas gemelos'),
    ],
    'Escenario Talleres': [
        ('11:00', '12:00', 'Ignacio Idalsoaga: Emprendedor'),
        ('12:00', '13:00', 'Teresita Morán: Cómo liderar equipos felices'),
        ('13:00', '14:00', 'Mindy Wang'),
        ('14:00', '15:00', 'Felipe Saavedra: Creación de contenido'),
        ('15:00', '16:00', 'Gustavo Inostroza: La inteligencia artificial'),
        ('16:00', '17:00', 'Tadashi Takaoka: Modelo de negocios personal'),
        ('17:00', '18:00', 'Diego Mendoza: Despegue'),
    ],
    'Escenario Paneles y Entrevistas': [
        ('11:00', '12:00', 'Panel: IA y Talento Humano'),
        ('12:00', '13:00', 'Panel: Senior Power'),
        ('13:00', '14:00', 'Panel: Cuéntame la Firme'),
        ('14:00', '15:00', 'Panel: Del Campus a la Calle'),
        ('15:00', '16:00', 'Panel: Industrias Creativas'),
        ('16:00', '17:00', 'Panel: Influencers y creadores de contenido'),
        ('17:00', '18:00', 'Entrevista: Carolina de Moras'),
    ],
}

import re

def read_data_ts():
    """Lee los eventos del sábado de data.ts"""
    with open('data.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    events = []
    # Buscar todos los eventos del sábado
    in_saturday = False
    current_event = {}
    
    for line in content.split('\n'):
        if '"day": "Sábado 22"' in line:
            in_saturday = True
            current_event = {'day': 'Sábado 22'}
        elif in_saturday:
            if '"id":' in line:
                match = re.search(r'"id":\s*["\']([^"\']+)["\']', line)
                if match:
                    current_event['id'] = match.group(1)
            elif '"time":' in line:
                match = re.search(r'"time":\s*["\']([^"\']+)["\']', line)
                if match:
                    current_event['time'] = match.group(1)
            elif '"stage":' in line:
                match = re.search(r'"stage":\s*["\']([^"\']+)["\']', line)
                if match:
                    current_event['stage'] = match.group(1)
            elif '"title":' in line:
                match = re.search(r'"title":\s*["\']([^"\']+)["\']', line)
                if match:
                    current_event['title'] = match.group(1)
                else:
                    # Título en múltiples líneas
                    match = re.search(r'"title":\s*$', line)
                    if match:
                        current_event['title'] = ''
            elif current_event.get('title') == '' and "'" in line:
                match = re.search(r"'([^']+)'", line)
                if match:
                    current_event['title'] = match.group(1)
            elif '},' in line and 'id' in current_event:
                if all(k in current_event for k in ['id', 'time', 'stage']):
                    events.append(current_event.copy())
                current_event = {}
                in_saturday = False
    
    return events

def verify_schedule():
    """Verifica los horarios"""
    print("\n" + "="*80)
    print("VERIFICACIÓN DE HORARIOS - SÁBADO 22")
    print("="*80 + "\n")
    
    events = read_data_ts()
    
    print(f"Total de eventos encontrados: {len(events)}\n")
    
    # Agrupar por escenario
    by_stage = {}
    for event in events:
        stage = event.get('stage', 'Unknown')
        if stage not in by_stage:
            by_stage[stage] = []
        by_stage[stage].append(event)
    
    # Verificar cada escenario
    issues = []
    
    for stage_name, correct_schedule in CORRECT_SCHEDULE.items():
        print(f"\n{'='*80}")
        print(f"📍 {stage_name}")
        print(f"{'='*80}")
        
        stage_events = sorted(by_stage.get(stage_name, []), key=lambda x: x['time'])
        
        print(f"\nEventos en data.ts: {len(stage_events)}")
        print(f"Eventos esperados: {len(correct_schedule)}\n")
        
        for i, event in enumerate(stage_events):
            time = event.get('time', '?')
            title = event.get('title', '?')[:50]
            event_id = event.get('id', '?')
            
            # Buscar en horarios correctos
            matching = [c for c in correct_schedule if c[0] == time]
            
            if matching:
                status = "✓"
            else:
                status = "⚠️"
                issues.append(f"{stage_name} - {time}: {title}")
            
            print(f"  {status} {time} | {event_id} | {title}...")
    
    if issues:
        print(f"\n{'='*80}")
        print(f"⚠️  PROBLEMAS ENCONTRADOS: {len(issues)}")
        print(f"{'='*80}\n")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print(f"\n{'='*80}")
        print("✅ ¡TODOS LOS HORARIOS ESTÁN CORRECTOS!")
        print(f"{'='*80}\n")

if __name__ == '__main__':
    verify_schedule()
