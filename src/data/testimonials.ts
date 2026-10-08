import raw from './testimonials.json';

// Content lives in testimonials.json (editable through the CMS); this file only adds types.
// The Testimonials section is hidden while the list is empty. Only add real quotes you have permission to use.
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company?: string;
  /** Optional measurable result mentioned in the quote. */
  result?: string;
}

export const testimonials: Testimonial[] = (raw as Testimonial[]).filter((t) => t.quote.trim() !== '');
