import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { DOMAINS, TECH } from './data/taxonomy';

const unknownTagMessage = (kind: 'domain' | 'tech', allowed: readonly string[]) =>
  `Unknown ${kind} — register it in src/data/taxonomy.ts first (allowed: ${allowed.join(', ')}).`;

const domainEnum = z.enum(DOMAINS, { message: unknownTagMessage('domain', DOMAINS) });
const techEnum = z.enum(TECH, { message: unknownTagMessage('tech', TECH) });

// Shared by `projects` and `notes` — a note is just a lighter-weight write-up
// using the same fields, so there is one schema to keep in sync, not two.
const writeupSchema = ({ image }: SchemaContext) =>
  z
    .object({
      title: z.string().min(1),
      summary: z
        .string()
        .min(1)
        .max(220, 'Keep summary under 220 characters so index cards stay uniform.'),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      type: z.enum(['project', 'note', 'teardown', 'coursework']),
      domains: z.array(domainEnum).min(1, 'List at least one domain.'),
      tech: z.array(techEnum).default([]),
      // Free text on purpose: resume phrasing and search aliases don't
      // belong to a controlled vocabulary the way domains/tech do.
      skills: z.array(z.string()).default([]),
      keywords: z.array(z.string()).default([]),
      status: z.enum(['complete', 'in-progress', 'archived']),
      featured: z.boolean().default(false),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      repo: z.string().url().optional(),
      draft: z.boolean().default(false),
    })
    .strict()
    .refine((data) => !data.hero || !!data.heroAlt, {
      message: 'heroAlt is required whenever hero is set — alt text is not optional here.',
      path: ['heroAlt'],
    });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: writeupSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: writeupSchema,
});

export const collections = { projects, notes };
