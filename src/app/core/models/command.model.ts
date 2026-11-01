export interface CommandFlag {
  flag: string;
  description: string;
}

export interface Command {
  id: string; // normalizado, ej: 'tee'
  name: string;
  synopsis: string;
  description: string;
  category: string;
  subtopicIds: string[];
  example: string;
  flags: CommandFlag[];
  short?: string;
  aliases?: string[];
  explainedIn?: string[];
  sinExplicacion?: string;
}

