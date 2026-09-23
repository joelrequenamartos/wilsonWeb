import type { CollectionEntry } from 'astro:content';

type Tour = CollectionEntry<'tours'>['data'];

export interface TourBadge {
  label: string;
  icon?: string;
  className: string;
}

const CUSTOM_BADGES: Record<string, { label: string; icon?: string; className: string }> = {
  'bronx-gospel': { label: 'Más Popular', icon: 'i-fire', className: 'badge-orange' },
  'tour-privado-espanol': { label: 'Privado', className: 'badge-silver' }
};

export function getTourBadge(tour: Tour): TourBadge | null {
  const custom = CUSTOM_BADGES[tour.id];
  if (custom) return custom;

  if (tour.premium) return { label: 'Premium', icon: 'i-star', className: 'badge-glow' };

  const isFree = !tour.premium && tour.category === 'free';
  if (isFree) return { label: 'Gratuito', className: 'free-badge' };

  return null;
}
