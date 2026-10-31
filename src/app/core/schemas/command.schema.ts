import { z } from 'zod';

export const CommandFlagSchema = z.object({
  flag: z.string().min(1),
  description: z.string().min(1)
});

export const CommandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  synopsis: z.string(),
  description: z.string().min(1),
  category: z.string().min(1),
  subtopicIds: z.array(z.string().min(1)),
  example: z.string(),
  flags: z.array(CommandFlagSchema)
});

export const CommandsListSchema = z.array(CommandSchema);

