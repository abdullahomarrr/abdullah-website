import {defineCollection,z} from 'astro:content';
const writing=defineCollection({
  type:'content',
  schema:z.object({
    title:z.string(),
    description:z.string(),
    date:z.coerce.date(),
    topic:z.string().default('notes'),
    draft:z.boolean().default(true),
  }),
});
export const collections={writing};
