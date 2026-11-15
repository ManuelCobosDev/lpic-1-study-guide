import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Config, DriveStep, Driver, PopoverDOM, Side } from 'driver.js';
import { StorageService } from './storage.service';

export interface TourStepConfig {
  readonly id: string;
  readonly route: string;
  readonly selector: string;
  readonly title: string;
  readonly description: string;
  readonly side: Side;
}

export const TOUR_STEPS: readonly TourStepConfig[] = [
  {
    id: 'welcome-header',
    route: '/',
    selector: '.app-header',
    side: 'bottom',
    title: '1/12 · Bienvenido al Aula Virtual LPIC-1',
    description:
      'Todo tu estudio se guarda 100% en tu navegador, sin cuentas. Desde esta barra superior accedes al buscador global instantáneo (Ctrl + K), al cambio de tema claro/oscuro y a Ajustes (preferencias y copias de seguridad).'
  },
  {
    id: 'home-progress',
    route: '/',
    selector: '.hero-card-col',
    side: 'left',
    title: '2/12 · Tu Progreso en Vivo',
    description:
      'Aquí ves de un vistazo tu avance en los exámenes 101-500 y 102-500, tu racha diaria y el acceso directo para retomar exactamente la última lección donde la dejaste.'
  },
  {
    id: 'curriculum-overview',
    route: '/temario',
    selector: '.curriculum-page .exam-banner',
    side: 'bottom',
    title: '3/12 · Temario Oficial (Exámenes 101 y 102)',
    description:
      'El temario se divide en el Examen 101 (Temas 101–104) y el Examen 102 (Temas 105–110). Cada tarjeta muestra el peso oficial LPI, sus subtemas con check de completado y botones directos a la lección o a su laboratorio.'
  },
  {
    id: 'study-formats',
    route: '/estudiar/101.1',
    selector: '.lesson-header',
    side: 'bottom',
    title: '4/12 · Tres Formatos de Estudio en Tiempo Real',
    description:
      'Dentro de cada subtema puedes alternar al instante entre Diapositivas 16:9 interactivas (con atajos de teclado), Lectura Web continua con índice lateral o vista de Impresión / PDF vectorial, además de marcar el subtema como completado.'
  },
  {
    id: 'study-tabs',
    route: '/estudiar/101.1',
    selector: '.lesson-secondary-tabs-section',
    side: 'top',
    title: '5/12 · Práctica, Notas y Chuleta del Subtema',
    description:
      'Bajo cada lección tienes 4 herramientas clave: un Test rápido y mini-flashcards del subtema (pestaña Práctica), acceso a su Laboratorio, Notas personales autoguardadas y la lista de Comandos y Glosario que aparecen en el tema.'
  },
  {
    id: 'labs-catalog',
    route: '/laboratorios',
    selector: '.labs-page-view .filters-section',
    side: 'bottom',
    title: '6/12 · Laboratorios Prácticos Guiados',
    description:
      'Filtra las prácticas por tema, dificultad o estado. Cada laboratorio te guía misión a misión con comandos reales listos para copiar, salida esperada de terminal, pistas y explicación detallada.'
  },
  {
    id: 'simulator-hub',
    route: '/simulador',
    selector: '.mode-card.timed',
    side: 'bottom',
    title: '7/12 · Simulador Oficial de Examen',
    description:
      'Elige entre el Examen 101 o 102 y entrena en dos modalidades: Simulacro Cronometrado (60 preguntas, 90 minutos y escala oficial LPI de 200 a 800 puntos) o Práctica Libre con respuesta explicada al instante y filtro por tema.'
  },
  {
    id: 'commands-catalog',
    route: '/comandos',
    selector: '.commands-page .search-box',
    side: 'bottom',
    title: '8/12 · Catálogo de Comandos, Opciones y Ejemplos',
    description:
      'Busca cualquier comando de Linux o filtra por categoría y tema. Al abrir un comando (en vista tabla o tarjetas) verás su sinopsis, las opciones/flags más preguntadas, ejemplos reales y un enlace directo a la diapositiva exacta donde se explica.'
  },
  {
    id: 'glossary-catalog',
    route: '/glosario',
    selector: '.glossary-page .alpha-index-wrapper',
    side: 'bottom',
    title: '9/12 · Glosario Técnico A–Z Interactivo',
    description:
      'Navega por el índice alfabético o filtra por texto para consultar definiciones rigurosas de siglas, ficheros y demonios. Cada término incluye conceptos relacionados interactivos y enlace directo a la lección.'
  },
  {
    id: 'flashcards-leitner',
    route: '/flashcards',
    selector: '.flashcards-page .step-box',
    side: 'bottom',
    title: '10/12 · Flashcards con Repetición Espaciada (Leitner)',
    description:
      'Memoriza comandos y flags en 2 pasos: elige el ámbito (global, examen o tema) y filtra por Caja Leitner (Cajas 1 a 5 o sin estudiar). Voltea la tarjeta 3D con Espacio y califícala del 1 al 4 (Otra vez, Difícil, Bien, Fácil): si aciertas sube de caja; si fallas vuelve a la Caja 1. Abajo tienes además el explorador completo.'
  },
  {
    id: 'mind-map',
    route: '/mapa-mental',
    selector: '.mind-map-wrapper .map-toolbar',
    side: 'bottom',
    title: '11/12 · Mapa Mental Interactivo',
    description:
      'Explora con zoom y arrastre el árbol completo de objetivos LPIC-1. Puedes buscar nodos, filtrar solo los pendientes, desplegar los comandos y términos de cada subtema y abrir un cajón lateral de resumen al pulsar cualquier nodo.'
  },
  {
    id: 'progress-dashboard',
    route: '/progreso',
    selector: '.stat-cards-grid',
    side: 'bottom',
    title: '12/12 · Analítica de Progreso y Temas Débiles',
    description:
      'Consulta tus lecciones completadas, media de simulacros, tarjetas dominadas en Caja 5, mapa de calor de estudio y detección automática de temas débiles (< 70% de acierto) con recomendación inteligente del siguiente paso.'
  }
];

const TOUR_COMPLETED_KEY = 'tour_completed';
const ELEMENT_WAIT_TIMEOUT_MS = 4500;
const SCROLL_SETTLE_DELAY_MS = 160;

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  private driverInstance: Driver | null = null;
  private activeRunId = 0;
  private isTransitioning = false;

  readonly isActive = signal<boolean>(false);
  readonly currentStepIndex = signal<number>(0);
  readonly hasCompletedTour = signal<boolean>(
    this.storage.getItem(TOUR_COMPLETED_KEY) === 'true'
  );

  async startTour(startIndex = 0): Promise<void> {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(TOUR_STEPS.length - 1, startIndex));

    if (this.driverInstance) {
      this.activeRunId++;
      const previous = this.driverInstance;
      this.driverInstance = null;
      if (previous.isActive()) {
        previous.destroy();
      }
    }

    const runId = ++this.activeRunId;
    this.isTransitioning = false;

    const { driver } = await import('driver.js');
    if (runId !== this.activeRunId) {
      return;
    }

    this.driverInstance = driver(this.buildDriverConfig(runId));
    this.isActive.set(true);

    await this.moveToStep(clampedIndex, runId, true);
  }

  stopTour(): void {
    this.activeRunId++;
    this.isTransitioning = false;

    const instance = this.driverInstance;
    this.driverInstance = null;
    if (instance?.isActive()) {
      instance.destroy();
    }

    this.isActive.set(false);
    this.markCompleted();
  }

  async moveToStep(index: number, expectedRunId = this.activeRunId, isInitial = false): Promise<void> {
    const step = TOUR_STEPS[index];
    if (!step) {
      this.stopTour();
      return;
    }
    if (expectedRunId !== this.activeRunId || !this.driverInstance) {
      return;
    }

    this.isTransitioning = true;

    try {
      const currentPath = this.normalizeUrlPath(this.router.url);
      if (currentPath !== step.route) {
        const navigated = await this.router.navigateByUrl(step.route);
        if (!navigated || expectedRunId !== this.activeRunId || !this.driverInstance) {
          return;
        }
      }

      const targetElement = await this.waitForElement(step.selector, ELEMENT_WAIT_TIMEOUT_MS, expectedRunId);
      if (!targetElement || expectedRunId !== this.activeRunId || !this.driverInstance) {
        if (expectedRunId === this.activeRunId && !targetElement) {
          this.stopTour();
        }
        return;
      }

      this.scrollToTarget(step, targetElement);
      await this.delay(this.prefersReducedMotion() ? 20 : SCROLL_SETTLE_DELAY_MS);

      if (expectedRunId !== this.activeRunId || !this.driverInstance) {
        return;
      }

      this.currentStepIndex.set(index);
      if (isInitial) {
        this.driverInstance.drive(index);
      } else {
        this.driverInstance.moveTo(index);
      }
    } finally {
      if (expectedRunId === this.activeRunId) {
        this.isTransitioning = false;
      }
    }
  }

  private buildDriverConfig(runId: number): Config {
    const steps: DriveStep[] = TOUR_STEPS.map((step) => ({
      element: step.selector,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: 'center'
      }
    }));

    return {
      steps,
      animate: !this.prefersReducedMotion(),
      duration: 280,
      smoothScroll: !this.prefersReducedMotion(),
      scrollIntoView: false,
      allowClose: true,
      overlayClickBehavior: 'close',
      overlayOpacity: 0.56,
      stagePadding: 8,
      stageRadius: 12,
      popoverOffset: 14,
      disableActiveInteraction: false,
      allowKeyboardControl: true,
      popoverClass: 'lpic1-tour-popover',
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Finalizar ✓',
      closeBtnLabel: 'Cerrar tour guiado',
      showButtons: ['next', 'previous', 'close'],
      onPopoverRender: (popover, opts) => {
        const activeIdx = opts.index ?? this.currentStepIndex();
        this.decoratePopover(popover, activeIdx);
      },
      onNextClick: (_el, _step, opts) => {
        if (this.isTransitioning || runId !== this.activeRunId) return;
        const idx = opts.index ?? this.currentStepIndex();
        if (idx + 1 < TOUR_STEPS.length) {
          void this.moveToStep(idx + 1, runId);
        } else {
          this.stopTour();
        }
      },
      onPrevClick: (_el, _step, opts) => {
        if (this.isTransitioning || runId !== this.activeRunId) return;
        const idx = opts.index ?? this.currentStepIndex();
        if (idx > 0) {
          void this.moveToStep(idx - 1, runId);
        }
      },
      onDoneClick: () => {
        this.stopTour();
      },
      onDestroyed: () => {
        if (runId === this.activeRunId) {
          this.activeRunId++;
        }
        this.driverInstance = null;
        this.isTransitioning = false;
        this.isActive.set(false);
        this.markCompleted();
      }
    };
  }

  private decoratePopover(popover: PopoverDOM, stepIndex: number): void {
    popover.wrapper.setAttribute('role', 'dialog');
    popover.wrapper.setAttribute('aria-modal', 'false');

    const total = TOUR_STEPS.length;
    const progressPercent = Math.round(((stepIndex + 1) / total) * 100);

    let track = popover.wrapper.querySelector<HTMLElement>('.lpic1-tour-progress-track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'lpic1-tour-progress-track';
      track.setAttribute('aria-hidden', 'true');

      const fill = document.createElement('div');
      fill.className = 'lpic1-tour-progress-fill';
      track.appendChild(fill);
      popover.wrapper.prepend(track);
    }

    const fillEl = track.querySelector<HTMLElement>('.lpic1-tour-progress-fill');
    if (fillEl) {
      fillEl.style.width = `${progressPercent}%`;
    }
  }

  private scrollToTarget(step: TourStepConfig, element: Element): void {
    if (typeof window === 'undefined') return;

    const behavior: ScrollBehavior = this.prefersReducedMotion() ? 'auto' : 'smooth';
    if (step.selector === '.app-header') {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    if (typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        behavior,
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  private async waitForElement(
    selector: string,
    timeoutMs: number,
    expectedRunId: number
  ): Promise<Element | null> {
    if (typeof document === 'undefined') return null;

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (expectedRunId !== this.activeRunId) {
        return null;
      }

      const el = document.querySelector(selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return el;
        }
      }

      await this.delay(50);
    }

    return null;
  }

  private normalizeUrlPath(url: string): string {
    const clean = (url.split('?')[0] ?? '').split('#')[0] ?? '';
    return clean === '' ? '/' : clean;
  }

  private markCompleted(): void {
    this.storage.setItem(TOUR_COMPLETED_KEY, 'true');
    this.hasCompletedTour.set(true);
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
