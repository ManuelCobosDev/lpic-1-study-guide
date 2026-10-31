import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { CommandsListSchema, GlossaryListSchema } from '../../src/app/core/schemas/index';
import { Command, GlossaryTerm } from '../../src/app/core/models/index';
import { ALL_SUBTOPIC_IDS } from './import-lessons';

function cleanHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/tuber[\uFFFD]as/gi, 'tuberías')
    .replace(/l[\uFFFD]nea/gi, 'línea')
    .replace(/dise[\uFFFD]o/gi, 'diseño')
    .replace(/gesti[\uFFFD]n/gi, 'gestión')
    .replace(/ejecuci[\uFFFD]n/gi, 'ejecución')
    .replace(/b[\uFFFD]squeda/gi, 'búsqueda')
    .replace(/edici[\uFFFD]n/gi, 'edición')
    .replace(/administraci[\uFFFD]n/gi, 'administración')
    .replace(/est[\uFFFD]ndar/gi, 'estándar')
    .replace(/m[\uFFFD]s/g, 'más')
    .replace(/mǭs/g, 'más')
    .replace(/YZ/g, '🎯')
    .replace(/\uFFFD/g, '')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'term';
}

export function parseCommandsHtml(htmlContent: string): Command[] {
  const commandsMap = new Map<string, Command>();

  // Split by subtopic blocks
  const subtopicBlocks = htmlContent.split(/<div class=["']subtopic-block["']>/i);

  for (let i = 1; i < subtopicBlocks.length; i++) {
    const block = subtopicBlocks[i] ?? '';

    // Extract subtopic id e.g. 101.1
    const badgeMatch = block.match(/<span class=["']subtopic-badge["']>([\d.]+)<\/span>/i);
    const subtopicId = badgeMatch?.[1] ?? '101.1';

    // Extract category from header
    const titleMatch = block.match(/<h3>([^<]+)<\/h3>/i);
    const category = titleMatch?.[1]?.trim() || `Subtema ${subtopicId}`;

    // Extract each cmd-row
    const rowMatches = block.match(/<tr class=["']cmd-row["']>([\s\S]*?)<\/tr>/gi) || [];

    for (const row of rowMatches) {
      const nameMatch = row.match(/<a [^>]*class=["']cmd-name["'][^>]*>([\s\S]*?)<\/a>/i);
      if (!nameMatch || !nameMatch[1]) continue;
      let cmdName = cleanHtml(nameMatch[1]);
      if (cmdName.includes('tee')) {
        cmdName = 'tee';
      }
      const cmdId = slugify(cmdName);

      // Purpose / Description
      const purposeMatch = row.match(/<td class=["']cmd-purpose["']>([\s\S]*?)<\/td>/i);
      const description = purposeMatch && purposeMatch[1] ? cleanHtml(purposeMatch[1]) : `Herramienta de línea de comandos ${cmdName}`;

      // Syntax / Example
      const syntaxMatch = row.match(/<code class=["']cmd-syntax["']>([\s\S]*?)<\/code>/i);
      const syntax = syntaxMatch && syntaxMatch[1] ? cleanHtml(syntaxMatch[1]) : `${cmdName} [opciones]`;

      // Flags
      const flags: { flag: string; description: string }[] = [];
      const optPillMatches = row.match(/<div class=["']opt-pill["'][^>]*title=["']([^"']*)["'][^>]*>([\s\S]*?)<\/div>/gi) || [];

      for (const pill of optPillMatches) {
        const titleAttr = pill.match(/title=["']([^"']*)["']/i)?.[1] || '';
        const codeMatch = pill.match(/<code class=["']pill-code["']>([^<]+)<\/code>/i);
        const descMatch = pill.match(/<span class=["']pill-desc["']>([^<]+)<\/span>/i);

        const flagCode = codeMatch && codeMatch[1] ? cleanHtml(codeMatch[1]) : '-';
        const flagDesc = titleAttr.trim() || (descMatch && descMatch[1] ? cleanHtml(descMatch[1]) : 'Opción del comando');

        flags.push({
          flag: flagCode,
          description: flagDesc
        });
      }

      if (cmdName === 'tee') {
        if (!flags.some((f) => f.flag.includes('-a'))) {
          flags.push({ flag: '-a', description: 'Añade datos al final del archivo existente sin sobreescribirlo' });
        }
        if (!flags.some((f) => f.flag.includes('-i'))) {
          flags.push({ flag: '-i', description: 'Ignora señales de interrupción (SIGINT)' });
        }
      }

      if (commandsMap.has(cmdName)) {
        const existing = commandsMap.get(cmdName)!;
        if (!existing.subtopicIds.includes(subtopicId)) {
          existing.subtopicIds.push(subtopicId);
        }
        for (const f of flags) {
          if (!existing.flags.some(ef => ef.flag === f.flag)) {
            existing.flags.push(f);
          }
        }
      } else {
        commandsMap.set(cmdName, {
          id: cmdId,
          name: cmdName,
          synopsis: syntax,
          description,
          category,
          subtopicIds: [subtopicId],
          example: syntax,
          flags
        });
      }
    }
  }

  return Array.from(commandsMap.values());
}

export function parseGlossaryHtml(htmlContent: string): GlossaryTerm[] {
  const termsMap = new Map<string, GlossaryTerm>();

  const subtopicBlocks = htmlContent.split(/<div class=["']subtopic-block["']>/i);

  for (let i = 1; i < subtopicBlocks.length; i++) {
    const block = subtopicBlocks[i] ?? '';
    const badgeMatch = block.match(/<span class=["']subtopic-badge["']>([\d.]+)<\/span>/i);
    const subtopicId = badgeMatch?.[1] ?? '101.1';

    const cardMatches = block.match(/<div class=["']term-card["']>([\s\S]*?)<\/div>\s*<\/div>/gi) || [];

    for (const card of cardMatches) {
      const nameMatch = card.match(/<span class=["']term-name["']>([^<]+)<\/span>/i);
      const defMatch = card.match(/<div class=["']term-def["']>([\s\S]*?)<\/div>/i);

      if (!nameMatch || !nameMatch[1] || !defMatch || !defMatch[1]) continue;

      const termName = cleanHtml(nameMatch[1]);
      const definition = cleanHtml(defMatch[1]);
      const termId = slugify(termName);

      if (termsMap.has(termId)) {
        const existing = termsMap.get(termId)!;
        if (!existing.subtopicIds.includes(subtopicId)) {
          existing.subtopicIds.push(subtopicId);
        }
      } else {
        termsMap.set(termId, {
          id: termId,
          term: termName,
          definition,
          related: [],
          subtopicIds: [subtopicId]
        });
      }
    }
  }

  return Array.from(termsMap.values());
}

export function importAllCommandsAndGlossary(
  legacyPublicoDir: string,
  legacyContentDir: string,
  destContentSrcDir: string
): { commands: Command[]; glossary: GlossaryTerm[] } {
  const comandosHtmlPath = path.join(legacyPublicoDir, 'comandos.html');
  const glosarioHtmlPath = path.join(legacyPublicoDir, 'glosario.html');

  if (!fs.existsSync(comandosHtmlPath) || !fs.existsSync(glosarioHtmlPath)) {
    throw new Error(`Archivos comandos.html o glosario.html no encontrados en ${legacyPublicoDir}`);
  }

  // 1. Extraer comandos de comandos.html
  const comandosHtml = fs.readFileSync(comandosHtmlPath, 'utf-8');
  const commandsList = parseCommandsHtml(comandosHtml);
  const commandsMap = new Map<string, Command>();
  for (const cmd of commandsList) {
    commandsMap.set(cmd.name, cmd);
  }

  // 1.b Complementar comandos con los 42 archivos JSON de lecciones (Temas 101 a 110)
  for (const subtopicId of ALL_SUBTOPIC_IDS) {
    const topicId = subtopicId.split('.')[0] ?? '101';
    const jsonPath = path.join(legacyContentDir, `t${topicId}`, `${subtopicId}.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        if (data.SLIDES && Array.isArray(data.SLIDES)) {
          for (const s of data.SLIDES) {
            if (s.command) {
              const rawCmd = Array.isArray(s.command) ? s.command[0] : s.command;
              const cmdName = String(rawCmd).split(' ')[0]?.trim();
              if (cmdName && /^[a-zA-Z0-9_\-.]+$/.test(cmdName) && cmdName.length > 1) {
                if (commandsMap.has(cmdName)) {
                  const existing = commandsMap.get(cmdName)!;
                  if (!existing.subtopicIds.includes(subtopicId)) {
                    existing.subtopicIds.push(subtopicId);
                  }
                } else {
                  const flags: { flag: string; description: string }[] = [];
                  if (s.options && Array.isArray(s.options)) {
                    for (const opt of s.options) {
                      if (typeof opt === 'object' && opt !== null) {
                        flags.push({
                          flag: opt.flag || opt.short || '-',
                          description: opt.desc || 'Opción del comando'
                        });
                      }
                    }
                  }
                  commandsMap.set(cmdName, {
                    id: slugify(cmdName),
                    name: cmdName,
                    synopsis: String(rawCmd),
                    description: s.purpose || s.title || `Comando del subtema ${subtopicId}`,
                    category: data.META?.title || `Tema ${topicId}`,
                    subtopicIds: [subtopicId],
                    example: String(rawCmd),
                    flags
                  });
                }
              }
            }
          }
        }
      } catch {}
    }
  }

  const commands = Array.from(commandsMap.values());

  // 2. Extraer glosario de glosario.html
  const glosarioHtml = fs.readFileSync(glosarioHtmlPath, 'utf-8');
  const glossaryList = parseGlossaryHtml(glosarioHtml);
  const glossaryMap = new Map<string, GlossaryTerm>();
  for (const g of glossaryList) {
    glossaryMap.set(g.id, g);
  }

  // 3. Complementar glosario con los archivos JSON de los 42 subtemas (especialmente Examen 102)
  for (const subtopicId of ALL_SUBTOPIC_IDS) {
    const topicId = subtopicId.split('.')[0] ?? '101';
    const jsonPath = path.join(legacyContentDir, `t${topicId}`, `${subtopicId}.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        if (data.GLOSARIO && Array.isArray(data.GLOSARIO)) {
          for (const item of data.GLOSARIO) {
            if (item.term && item.definition) {
              const termId = slugify(item.term);
              if (glossaryMap.has(termId)) {
                const existing = glossaryMap.get(termId)!;
                if (!existing.subtopicIds.includes(subtopicId)) {
                  existing.subtopicIds.push(subtopicId);
                }
              } else {
                glossaryMap.set(termId, {
                  id: termId,
                  term: cleanHtml(item.term),
                  definition: cleanHtml(item.definition),
                  related: [],
                  subtopicIds: [subtopicId]
                });
              }
            }
          }
        }
      } catch {}
    }
  }

  const glossary = Array.from(glossaryMap.values());

  // Validaciones Zod
  const validatedCommands = CommandsListSchema.parse(commands);
  const validatedGlossary = GlossaryListSchema.parse(glossary);

  // Guardar en content-src/
  fs.writeFileSync(path.join(destContentSrcDir, 'commands.yaml'), yaml.dump(validatedCommands), 'utf-8');
  fs.writeFileSync(path.join(destContentSrcDir, 'glossary.yaml'), yaml.dump(validatedGlossary), 'utf-8');

  return { commands: validatedCommands, glossary: validatedGlossary };
}

const isMain = process.argv[1]?.includes('import-commands-glossary');
if (isMain) {
  const rootDir = process.cwd();
  const legacyPublicoDir = path.resolve(rootDir, '_legacy/lpic1-slides-publico');
  const legacyContentDir = path.resolve(rootDir, '_legacy/Recurso Final Definitivo/content');
  const contentSrcDir = path.resolve(rootDir, 'content-src');

  console.log('Iniciando importAllCommandsAndGlossary...');
  const { commands, glossary } = importAllCommandsAndGlossary(
    legacyPublicoDir,
    legacyContentDir,
    contentSrcDir
  );
  console.log(`SUCCESS: ${commands.length} comandos y ${glossary.length} términos de glosario importados y validados con éxito.`);
}
