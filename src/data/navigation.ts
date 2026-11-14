import type { WhatsAppKey } from './whatsapp';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export const isGroup = (item: NavItem): item is NavGroup => 'items' in item;

const buyers: NavGroup = {
  label: 'Buyers',
  items: [
    { label: 'Preliminary Due Diligence', href: '/due-diligence' },
    { label: 'Acquisition Advisory', href: '/acquisition-advisory' },
  ],
};

const owners: NavGroup = {
  label: 'Owners',
  items: [
    { label: 'Distressed Property Buyout', href: '/distressed-property-buyout' },
    { label: 'Go-to-Market for Developers', href: '/go-to-market' },
    { label: 'Land Monetization Strategy', href: '/land' },
  ],
};

/** Header and mobile menu. Buyers and Owners are dropdowns with no page of their own. */
export const headerNav: NavItem[] = [
  { label: 'Platform', href: '/platform' },
  buyers,
  owners,
  { label: 'Regulations', href: '/regulations' },
  { label: 'Blog', href: '/blog' },
];

export const headerCta: { label: string; message: WhatsAppKey } = {
  label: 'Book a Consultation',
  message: 'consultation',
};

export const footerServices: NavGroup[] = [
  buyers,
  { label: 'Owners and Developers', items: owners.items },
];

export const footerResources: NavLink[] = [
  { label: 'Regulations', href: '/regulations' },
  { label: 'Platform', href: '/platform' },
  { label: 'Blog', href: '/blog' },
];

export const footerLegal: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Conflict of Interest Policy', href: '/terms#conflict-of-interest' },
];
