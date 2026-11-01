import { Routes } from '@angular/router';
import { canStartExamGuard } from './features/simulator/guards/can-start-exam.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home-page.component').then((m) => m.HomePageComponent),
    title: 'LPIC-1 Study Guide · Aula Virtual',
    data: { title: 'Inicio · LPIC-1 Study Guide', breadcrumb: 'Inicio', phase: 'Fase 4' }
  },
  {
    path: 'temario',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/curriculum/pages/curriculum-page.component').then(
            (m) => m.CurriculumPageComponent
          ),
        title: 'Temario Oficial LPIC-1',
        data: { title: 'Temario LPIC-1', breadcrumb: 'Temario', phase: 'Fase 4' }
      },
      {
        path: ':examen',
        loadComponent: () =>
          import('./features/curriculum/pages/exam-page.component').then((m) => m.ExamPageComponent),
        title: 'Examen LPIC-1',
        data: { title: 'Examen', breadcrumb: 'Examen', phase: 'Fase 4' }
      },
      {
        path: ':examen/:tema',
        loadComponent: () =>
          import('./features/curriculum/pages/topic-detail-page.component').then(
            (m) => m.TopicDetailPageComponent
          ),
        title: 'Tema de Estudio',
        data: { title: 'Tema', breadcrumb: 'Tema', phase: 'Fase 4' }
      }
    ]
  },
  {
    path: 'estudiar/:subtema',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/study/pages/lesson-page.component').then(
            (m) => m.LessonPageComponent
          ),
        title: 'Estudiar Subtema',
        data: { title: 'Estudiar', breadcrumb: 'Estudiar', phase: 'Fase 5' }
      },
      {
        path: 'imprimir',
        loadComponent: () =>
          import('./features/study/pages/lesson-print-page.component').then(
            (m) => m.LessonPrintPageComponent
          ),
        title: 'Imprimir Lección / PDF',
        data: { title: 'Imprimir', breadcrumb: 'Imprimir', phase: 'Fase 5' }
      }
    ]
  },
  {
    path: 'laboratorios',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/labs/pages/labs-page.component').then(
            (m) => m.LabsPageComponent
          ),
        title: 'Laboratorios y Prácticas LPIC-1',
        data: { title: 'Laboratorios', breadcrumb: 'Laboratorios', phase: 'Fase 7' }
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/labs/pages/lab-detail-page.component').then(
            (m) => m.LabDetailPageComponent
          ),
        title: 'Práctica de Laboratorio',
        data: { title: 'Práctica', breadcrumb: 'Práctica', phase: 'Fase 7' }
      }
    ]
  },
  {
    path: 'simulador',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/simulator/pages/simulator-hub-page.component').then(
            (m) => m.SimulatorHubPageComponent
          ),
        title: 'Simulador de Examen LPIC-1',
        data: { title: 'Simulador', breadcrumb: 'Simulador', phase: 'Fase 8' }
      },
      {
        path: 'examen',
        loadComponent: () =>
          import('./features/simulator/pages/simulator-exam-page.component').then(
            (m) => m.SimulatorExamPageComponent
          ),
        canActivate: [canStartExamGuard],
        title: 'Modo Simulacro Real',
        data: { title: 'Simulacro', breadcrumb: 'Simulacro', phase: 'Fase 8' }
      },
      {
        path: 'practica',
        loadComponent: () =>
          import('./features/simulator/pages/simulator-practice-page.component').then(
            (m) => m.SimulatorPracticePageComponent
          ),
        title: 'Modo Práctica Guiada',
        data: { title: 'Práctica', breadcrumb: 'Práctica', phase: 'Fase 8' }
      },
      {
        path: 'resultados',
        loadComponent: () =>
          import('./features/simulator/pages/simulator-results-page.component').then(
            (m) => m.SimulatorResultsPageComponent
          ),
        title: 'Resultados del Examen',
        data: { title: 'Resultados', breadcrumb: 'Resultados', phase: 'Fase 8' }
      }
    ]
  },
  {
    path: 'comandos',
    loadComponent: () =>
      import('./features/commands/pages/commands-page.component').then(
        (m) => m.CommandsPageComponent
      ),
    title: 'Comandos Linux LPIC-1',
    data: { title: 'Comandos', breadcrumb: 'Comandos', phase: 'Fase 9' }
  },
  {
    path: 'glosario',
    loadComponent: () =>
      import('./features/glossary/pages/glossary-page.component').then(
        (m) => m.GlossaryPageComponent
      ),
    title: 'Glosario de Términos',
    data: { title: 'Glosario', breadcrumb: 'Glosario', phase: 'Fase 9' }
  },
  {
    path: 'flashcards',
    loadComponent: () =>
      import('./features/flashcards/pages/flashcards-page.component').then(
        (m) => m.FlashcardsPageComponent
      ),
    title: 'Flashcards de Repaso (Leitner)',
    data: { title: 'Flashcards', breadcrumb: 'Flashcards', phase: 'Fase 9' }
  },
  {
    path: 'mapa-mental',
    loadComponent: () =>
      import('./features/mind-map/pages/mind-map-page.component').then(
        (m) => m.MindMapPageComponent
      ),
    title: 'Mapa Mental Interactivo',
    data: { title: 'Mapa Mental', breadcrumb: 'Mapa Mental', phase: 'Fase 10' }
  },
  {
    path: 'buscar',
    loadComponent: () =>
      import('./features/search/pages/search-page.component').then(
        (m) => m.SearchPageComponent
      ),
    title: 'Buscador Global LPIC-1',
    data: { title: 'Buscador', breadcrumb: 'Buscar', phase: 'Fase 6' }
  },
  {
    path: 'progreso',
    loadComponent: () =>
      import('./features/progress/pages/progress-page.component').then(
        (m) => m.ProgressPageComponent
      ),
    title: 'Progreso de Estudio',
    data: { title: 'Progreso', breadcrumb: 'Progreso', phase: 'Fase 10' }
  },
  {
    path: 'erratas',
    loadComponent: () =>
      import('./features/errata/pages/errata-page.component').then(
        (m) => m.ErrataPageComponent
      ),
    title: 'Fe de Erratas',
    data: { title: 'Erratas', breadcrumb: 'Erratas', phase: 'Fase 10' }
  },
  {
    path: 'ajustes',
    loadComponent: () =>
      import('./features/settings/pages/settings-page.component').then(
        (m) => m.SettingsPageComponent
      ),
    title: 'Ajustes y Copia de Seguridad',
    data: { title: 'Ajustes', breadcrumb: 'Ajustes', phase: 'Fase 10' }
  },
  {
    path: 'acerca-de',
    loadComponent: () =>
      import('./features/about/pages/about-page.component').then(
        (m) => m.AboutPageComponent
      ),
    title: 'Acerca de LPIC-1 Study Guide',
    data: { title: 'Acerca de', breadcrumb: 'Acerca de', phase: 'Fase 10' }
  },
  {
    path: 'guia-estilos',
    loadComponent: () =>
      import('./features/style-guide/pages/style-guide-page.component').then(
        (m) => m.StyleGuidePageComponent
      ),
    title: 'Guía de Estilos y Componentes · LPIC-1',
    data: { title: 'Guía de Estilos', breadcrumb: 'Guía de Estilos', phase: 'Fase 3' }
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/layout/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      ),
    title: 'Página no encontrada (404)',
    data: { title: '404 · Página no encontrada', breadcrumb: '404', phase: 'Fase 10' }
  }
];
