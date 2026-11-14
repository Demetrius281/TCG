import { site } from './site';

/** WhatsApp message templates by key. Text taken from the current site. */
export const whatsappMessages = {
  consultation:
    'Hi, I’d like a property review.\nLocation: [Google Maps link]\nCurrent status: [finished / under construction / stalled / renting]\nIssue to resolve: ',
  book: 'Hello TCG, I\'d like to book a consultation about a property in Bali.',
} as const;

export type WhatsAppKey = keyof typeof whatsappMessages;

export function whatsappHref(key: WhatsAppKey): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(whatsappMessages[key])}`;
}
