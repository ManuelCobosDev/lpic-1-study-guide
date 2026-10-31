import { Injectable, signal } from '@angular/core';
import {
  CurriculumManifest,
  Lesson,
  Lab,
  Question,
  Command,
  GlossaryTerm,
  Errata
} from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly baseUrl = '/content';
  private cachedManifest: CurriculumManifest | null = null;
  private readonly cachedLessons = new Map<string, Lesson>();
  private readonly cachedLabs = new Map<string, Lab>();
  private readonly cachedQuestions = new Map<string, Question[]>();
  private cachedCommands: Command[] | null = null;
  private cachedGlossary: GlossaryTerm[] | null = null;
  private cachedErrata: Errata[] | null = null;

  readonly manifest = signal<CurriculumManifest | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  async getManifest(): Promise<CurriculumManifest> {
    if (this.cachedManifest) {
      return this.cachedManifest;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const res = await fetch(`${this.baseUrl}/manifest.json`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar el manifiesto de contenido.`);
      }
      const data = (await res.json()) as CurriculumManifest;
      this.cachedManifest = data;
      this.manifest.set(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al cargar manifest';
      this.error.set(msg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async getLesson(subtopicId: string): Promise<Lesson> {
    const cached = this.cachedLessons.get(subtopicId);
    if (cached) {
      return cached;
    }

    try {
      const res = await fetch(`${this.baseUrl}/lessons/${subtopicId}.json`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar la lección ${subtopicId}`);
      }
      const data = (await res.json()) as Lesson;
      this.cachedLessons.set(subtopicId, data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Error al cargar lección ${subtopicId}`;
      this.error.set(msg);
      throw err;
    }
  }

  async getLab(labId: string): Promise<Lab> {
    const cached = this.cachedLabs.get(labId);
    if (cached) {
      return cached;
    }

    // Normalizamos el nombre del archivo si se proporciona con formato '103.4' o 'lab-103-4'
    const filename = labId.startsWith('lab-') ? `${labId}.json` : `lab-${labId.replace('.', '-')}.json`;

    try {
      const res = await fetch(`${this.baseUrl}/labs/${filename}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar el laboratorio ${labId}`);
      }
      const data = (await res.json()) as Lab;
      this.cachedLabs.set(labId, data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Error al cargar laboratorio ${labId}`;
      this.error.set(msg);
      throw err;
    }
  }

  async getQuestions(topicId: string): Promise<Question[]> {
    const cached = this.cachedQuestions.get(topicId);
    if (cached) {
      return cached;
    }

    try {
      const res = await fetch(`${this.baseUrl}/questions/${topicId}.json`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar las preguntas del tema ${topicId}`);
      }
      const data = (await res.json()) as { topicId: string; questions: Question[] };
      this.cachedQuestions.set(topicId, data.questions);
      return data.questions;
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Error al cargar preguntas del tema ${topicId}`;
      this.error.set(msg);
      throw err;
    }
  }

  async getCommands(): Promise<Command[]> {
    if (this.cachedCommands) {
      return this.cachedCommands;
    }

    try {
      const res = await fetch(`${this.baseUrl}/commands.json`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar el catálogo de comandos`);
      }
      const data = (await res.json()) as Command[];
      this.cachedCommands = data;
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar comandos';
      this.error.set(msg);
      throw err;
    }
  }

  async getGlossary(): Promise<GlossaryTerm[]> {
    if (this.cachedGlossary) {
      return this.cachedGlossary;
    }

    try {
      const res = await fetch(`${this.baseUrl}/glossary.json`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar los términos del glosario`);
      }
      const data = (await res.json()) as GlossaryTerm[];
      this.cachedGlossary = data;
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar glosario';
      this.error.set(msg);
      throw err;
    }
  }

  async getErrata(): Promise<Errata[]> {
    if (this.cachedErrata) {
      return this.cachedErrata;
    }

    try {
      const res = await fetch(`${this.baseUrl}/errata.json`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar la lista de erratas`);
      }
      const data = (await res.json()) as Errata[];
      this.cachedErrata = data;
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar erratas';
      this.error.set(msg);
      throw err;
    }
  }
}

