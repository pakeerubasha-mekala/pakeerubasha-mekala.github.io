import raw from './profile.json';

// Content lives in profile.json (editable through the CMS); this file only adds types.
export interface Profile {
  name: string;
  headline: string;
  photo: string;
  /** GitHub repo that builds and hosts this site; used for the live deploy status. */
  repo: string;
  location: string;
  languages: string[];
  summary: string;
  email?: string;
  /** Scheduling link (Calendly, Cal.com...). The "Book a call" button shows only when this is set. */
  bookingUrl?: string;
  links: {
    github?: string;
    linkedin: string;
    stackoverflow?: string;
  };
}

export const profile: Profile = raw;
