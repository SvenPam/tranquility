import { z } from "zod";

const focus = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

export const page = z.object({
  title: z.string().min(1),
  altTitle: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  heroImage: z.string().regex(/^\/media\/\d+\/[^?#]+$/).optional(),
  heroFocus: focus.optional(),
  theme: z.enum(["", "light", "dark"]).optional(),
  leadingSpacer: z.boolean().optional(),
  ogImage: z.string().optional(),
  layout: z.string().optional(),
  permalink: z.union([z.string(), z.literal(false)]).optional(),
  eleventyExcludeFromCollections: z.boolean().optional(),
}).strict();

export const TOPICS = ["None", "Project", "Personal", "Interesting", "TIL", "Guide", "Site", "Cooking"];

export const article = page.extend({
  date: z.date(),
  updated: z.date().optional(),
  topic: z.enum(TOPICS),
  tags: z.array(z.string().min(1)).default([]),
}).strict();
