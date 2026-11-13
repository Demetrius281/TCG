import { site } from './site';

/** WhatsApp message templates by key. Text taken from the current site. */
export const whatsappMessages = {
  consultation:
    'Hi, I’d like a property review.\nLocation: [Google Maps link]\nCurrent status: [finished / under construction / stalled / renting]\nIssue to resolve: ',
} as const;

export type WhatsAppKey = keyof typeof whatsappMessages;

export function whatsappHref(key: WhatsAppKey): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(whatsappMessages[key])}`;
}
