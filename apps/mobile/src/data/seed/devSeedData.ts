/**
 * Development seed data.
 * 
 * Generates sample opportunities with dates relative to the current time,
 * so the UI always has relevant "urgent" and "upcoming" examples.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Opportunity } from '@applyalert/contracts';
import { opportunityRepository } from '../repository';
import { getLocalToday } from '../../domain/deadline-utils';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function injectSeedData(): Promise<void> {
  const now = new Date();
  const timestamp = now.toISOString();
  
  const seedOpportunities: Opportunity[] = [
    {
      id: uuidv4(),
      title: 'Google Software Engineering Intern, Summer 2027',
      organization: 'Google',
      opportunityType: 'INTERNSHIP',
      summary: '12-week summer internship in Mountain View, CA.',
      location: 'Mountain View, CA',
      funding: { isFunded: true, details: 'Paid internship + housing stipend' },
      applicationUrl: 'https://careers.google.com/',
      source: { type: 'URL', url: 'https://careers.google.com/', rawText: null, fileName: null, mimeType: null, fileRef: null, importedAt: timestamp },
      deadline: {
        kind: 'DATE_ONLY',
        originalText: 'Applications close in 2 days',
        localDate: getLocalToday(addDays(now, 2)),
        localTime: null,
        timezone: null,
        utcInstant: null,
        confidence: 1,
        userConfirmed: true,
        evidence: null,
        alternativeCandidates: []
      },
      status: 'SAVED',
      createdAt: timestamp,
      updatedAt: timestamp,
      appliedAt: null,
      archivedAt: null,
    },
    {
      id: uuidv4(),
      title: 'National Science Foundation Graduate Research Fellowship',
      organization: 'NSF',
      opportunityType: 'FELLOWSHIP',
      summary: '3-year fellowship for graduate study in STEM fields.',
      location: 'Any US Institution',
      funding: { isFunded: true, details: '$37,000 annual stipend' },
      applicationUrl: 'https://www.nsfgrfp.org/',
      source: { type: 'TEXT', url: null, rawText: 'NSF GRFP due next week', fileName: null, mimeType: null, fileRef: null, importedAt: timestamp },
      deadline: {
        kind: 'EXACT_INSTANT',
        originalText: 'October 15, 5:00 PM Eastern Time',
        localDate: getLocalToday(addDays(now, 6)),
        localTime: '17:00:00',
        timezone: 'America/New_York',
        utcInstant: addDays(now, 6).toISOString(),
        confidence: 0.9,
        userConfirmed: true,
        evidence: null,
        alternativeCandidates: []
      },
      status: 'PREPARING',
      createdAt: timestamp,
      updatedAt: timestamp,
      appliedAt: null,
      archivedAt: null,
    },
    {
      id: uuidv4(),
      title: 'Y Combinator W27 Batch',
      organization: 'Y Combinator',
      opportunityType: 'OTHER',
      summary: 'Startup accelerator program.',
      location: 'San Francisco, CA',
      funding: { isFunded: true, details: '$500k standard deal' },
      applicationUrl: 'https://ycombinator.com',
      source: { type: 'URL', url: 'https://ycombinator.com', rawText: null, fileName: null, mimeType: null, fileRef: null, importedAt: timestamp },
      deadline: {
        kind: 'DATE_ONLY',
        originalText: 'Apply by next month',
        localDate: getLocalToday(addDays(now, 20)),
        localTime: null,
        timezone: null,
        utcInstant: null,
        confidence: 1,
        userConfirmed: false,
        evidence: null,
        alternativeCandidates: []
      },
      status: 'SAVED',
      createdAt: timestamp,
      updatedAt: timestamp,
      appliedAt: null,
      archivedAt: null,
    },
    {
      id: uuidv4(),
      title: 'Open Source Grant',
      organization: 'GitHub',
      opportunityType: 'GRANT',
      summary: 'Support for open source maintainers.',
      location: 'Remote',
      funding: { isFunded: true, details: '$10,000' },
      applicationUrl: null,
      source: { type: 'MANUAL', url: null, rawText: null, fileName: null, mimeType: null, fileRef: null, importedAt: timestamp },
      deadline: {
        kind: 'ROLLING',
        originalText: 'Rolling applications',
        localDate: null,
        localTime: null,
        timezone: null,
        utcInstant: null,
        confidence: 1,
        userConfirmed: true,
        evidence: null,
        alternativeCandidates: []
      },
      status: 'SAVED',
      createdAt: timestamp,
      updatedAt: timestamp,
      appliedAt: null,
      archivedAt: null,
    },
    {
      id: uuidv4(),
      title: 'Rhodes Scholarship',
      organization: 'Rhodes Trust',
      opportunityType: 'SCHOLARSHIP',
      summary: 'Postgraduate award to study at the University of Oxford.',
      location: 'Oxford, UK',
      funding: { isFunded: true, details: 'Full tuition and stipend' },
      applicationUrl: 'https://www.rhodeshouse.ox.ac.uk/',
      source: { type: 'URL', url: 'https://www.rhodeshouse.ox.ac.uk/', rawText: null, fileName: null, mimeType: null, fileRef: null, importedAt: timestamp },
      deadline: {
        kind: 'DATE_ONLY',
        originalText: 'Last year',
        localDate: getLocalToday(addDays(now, -30)),
        localTime: null,
        timezone: null,
        utcInstant: null,
        confidence: 1,
        userConfirmed: true,
        evidence: null,
        alternativeCandidates: []
      },
      status: 'APPLIED',
      createdAt: timestamp,
      updatedAt: timestamp,
      appliedAt: addDays(now, -35).toISOString(),
      archivedAt: null,
    },
  ];

  for (const opp of seedOpportunities) {
    await opportunityRepository.create(opp);
  }
}
