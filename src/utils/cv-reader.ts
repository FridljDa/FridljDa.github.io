import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { logger } from './logger';

const CV_YAML_PATH = path.join(process.cwd(), 'public/uploads/cv.yaml');

type CvEntry = {
  company?: string;
  position?: string;
  institution?: string;
  area?: string;
  degree?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  title?: string;
  name?: string;
  date?: string;
  url?: string;
  authors?: string[];
  journal?: string;
  highlights?: string[];
};

function sectionTitle(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatEntryBlock(entry: CvEntry, type: 'experience' | 'education' | 'teaching' | 'publication' | 'certification' | 'project'): string {
  const parts: string[] = [];
  const loc = entry.location ? ` | ${entry.location}` : '';
  const date = [entry.start_date, entry.end_date].filter(Boolean).join(' — ') || entry.date;

  if (type === 'experience' || type === 'teaching') {
    const role = entry.position ?? entry.title;
    const org = entry.company ?? entry.institution;
    if (role) parts.push(`**${role}**`);
    if (org) parts.push(`*${org}*${loc}`);
  } else if (type === 'education') {
    const inst = entry.institution ?? entry.company;
    const deg = entry.degree && entry.area ? `${entry.degree} in ${entry.area}` : entry.degree ?? entry.area;
    if (inst) parts.push(`**${inst}**`);
    if (deg) parts.push(`*${deg}*${loc}`);
  } else if (type === 'publication') {
    if (entry.title) parts.push(`**${entry.title}**`);
    if (entry.authors?.length) parts.push(`Authors: ${entry.authors.join(', ')}`);
    if (entry.journal) parts.push(`*${entry.journal}*`);
    if (entry.url) parts.push(`[Link](${entry.url})`);
  } else if (type === 'certification') {
    parts.push(`**${entry.name}**${entry.date ? ` — ${entry.date}` : ''}`);
    if (entry.url) parts.push(`[Credential](${entry.url})`);
  } else if (type === 'project') {
    parts.push(`**${entry.name}**${entry.date ? ` (${entry.date})` : ''}${entry.location ? ` — ${entry.location}` : ''}`);
  }

  if (date && type !== 'publication' && type !== 'certification' && type !== 'project') {
    parts.push(`*${date}*`);
  }
  if (entry.highlights?.length) {
    parts.push(entry.highlights.map((h) => `- ${h}`).join('\n'));
  }
  return parts.join('\n\n');
}

export function cvYamlToMarkdown(): string {
  let raw: string;
  try {
    raw = fs.readFileSync(CV_YAML_PATH, 'utf-8');
  } catch (error) {
    logger.error('Failed to read cv.yaml:', error instanceof Error ? error.message : String(error));
    return '';
  }

  let parsed: { cv?: { name?: string; location?: string; website?: string; sections?: Record<string, unknown> } };
  try {
    parsed = yaml.load(raw) as typeof parsed;
  } catch (error) {
    logger.error('Failed to parse cv.yaml:', error instanceof Error ? error.message : String(error));
    return '';
  }

  const cv = parsed?.cv;
  if (!cv?.sections) return '';

  const sections = cv.sections as Record<string, unknown>;
  const out: string[] = [];

  out.push(`# ${cv.name ?? 'CV'}`);
  if (cv.location) out.push(`*${cv.location}*`);
  if (cv.website) out.push(`Website: ${cv.website}`);
  out.push('');

  const summary = sections.summary;
  if (Array.isArray(summary) && summary.length > 0) {
    out.push('## Summary');
    out.push(summary.join('\n\n'));
    out.push('');
  }

  const experienceKeys = ['software_development_experience', 'data_science_experience'] as const;
  for (const key of experienceKeys) {
    const entries = sections[key];
    if (!Array.isArray(entries) || entries.length === 0) continue;
    out.push(`## ${sectionTitle(key)}`);
    for (const entry of entries as CvEntry[]) {
      out.push(formatEntryBlock(entry, 'experience'));
      out.push('');
    }
  }

  const education = sections.education;
  if (Array.isArray(education) && education.length > 0) {
    out.push('## Education');
    for (const entry of education as CvEntry[]) {
      out.push(formatEntryBlock(entry, 'education'));
      out.push('');
    }
  }

  const certifications = sections.certifications;
  if (Array.isArray(certifications) && certifications.length > 0) {
    out.push('## Certifications');
    for (const entry of certifications as CvEntry[]) {
      out.push(formatEntryBlock(entry, 'certification'));
      out.push('');
    }
  }

  const teaching = sections.teaching_experience;
  if (Array.isArray(teaching) && teaching.length > 0) {
    out.push('## Teaching Experience');
    for (const entry of teaching as CvEntry[]) {
      out.push(formatEntryBlock(entry, 'teaching'));
      out.push('');
    }
  }

  const publications = sections.publications;
  if (Array.isArray(publications) && publications.length > 0) {
    out.push('## Publications');
    for (const entry of publications as CvEntry[]) {
      out.push(formatEntryBlock(entry, 'publication'));
      out.push('');
    }
  }

  const projects = sections.projects;
  if (Array.isArray(projects) && projects.length > 0) {
    out.push('## Projects');
    for (const entry of projects as CvEntry[]) {
      out.push(formatEntryBlock(entry, 'project'));
      out.push('');
    }
  }

  const skills = sections.skills;
  if (Array.isArray(skills) && skills.length > 0) {
    out.push('## Skills');
    for (const item of skills as { label?: string; details?: string }[]) {
      if (item.label) out.push(`### ${item.label}`);
      if (item.details) out.push(item.details);
      out.push('');
    }
  }

  return out.join('\n').trim();
}
