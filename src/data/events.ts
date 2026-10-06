// Eventos de ejemplo en Nueva York (se sustituirán por reales).
export type EventItem = { date: string; title: string; kind: string; place: string; image: string };
export const rawEvents: EventItem[] = [
  { date: '2026-10-10', title: 'Concierto de jazz al aire libre', kind: 'Concierto', place: 'Harlem', image: '/images/gospel.jpg' },
  { date: '2026-10-17', title: 'Atardecer en Roosevelt Island', kind: 'Experiencia', place: 'Roosevelt Island', image: '/images/roosvelt2.jpg' },
  { date: '2026-10-24', title: 'Mercadillo de otoño', kind: 'Mercado', place: 'Brooklyn', image: '/images/parque1.jpg' },
  { date: '2026-10-31', title: 'Desfile de Halloween', kind: 'Desfile', place: 'Greenwich Village', image: '/images/actor.jpg' },
  { date: '2026-11-01', title: 'Maratón de Nueva York', kind: 'Deporte', place: 'Cinco distritos', image: '/images/tour-privado.jpg' },
  { date: '2026-11-07', title: 'Noche de museos', kind: 'Cultura', place: 'Manhattan', image: '/images/wilson-guide.jpg' },
  { date: '2026-11-14', title: 'Festival gastronómico', kind: 'Gastronomía', place: 'El Bronx', image: '/images/bronxvertical.jpg' },
  { date: '2026-11-21', title: 'Encendido de luces de invierno', kind: 'Festival', place: 'Midtown', image: '/images/estatua.jpg' }
].sort((a, b) => a.date.localeCompare(b.date));

