import type { CollectionEntry } from 'astro:content';

type Tour = CollectionEntry<'tours'>['data'];

export interface TourBadge {
  label: string;
  icon?: string;
  className: string;
}

const CUSTOM_BADGES: Record<string, { label: string; icon?: string }> = {
  'bronx-gospel': { label: 'Más Popular', icon: 'i-fire' },
  'tour-privado-espanol': { label: 'Privado' }
};

export function getTourBadge(tour: Tour): TourBadge | null {
  const custom = CUSTOM_BADGES[tour.id];
  if (custom) return { ...custom, className: 'badge-orange' };

  if (tour.premium) return { label: 'Premium', icon: 'i-star', className: 'badge-glow' };

  const isFree = !tour.premium && tour.category === 'free';
  if (isFree) return { label: 'Gratuito', className: 'free-badge' };

  return null;
}
