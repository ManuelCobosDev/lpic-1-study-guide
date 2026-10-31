import { Routes } from '@angular/router';

const loadStub = () =>
  import('./shared/layout/not-implemented-page/not-implemented-page.component').then(
    (m) => m.NotImplementedPageComponent
  );

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
        loadComponent: loadStub,
        title: 'Laboratorios y Prácticas',
        data: { title: 'Laboratorios', breadcrumb: 'Laboratorios', phase: 'Fase 7' }
      },
      {
        path: ':id',
        loadComponent: loadStub,
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
        loadComponent: loadStub,
        title: 'Simulador de Examen LPIC-1',
        data: { title: 'Simulador', breadcrumb: 'Simulador', phase: 'Fase 8' }
      },
      {
        path: 'examen',
        loadComponent: loadStub,
        title: 'Modo Simulacro Real',
        data: { title: 'Simulacro', breadcrumb: 'Simulacro', phase: 'Fase 8' }
      },
      {
        path: 'practica',
        loadComponent: loadStub,
        title: 'Modo Práctica Guiada',
        data: { title: 'Práctica', breadcrumb: 'Práctica', phase: 'Fase 8' }
      },
      {
        path: 'resultados',
        loadComponent: loadStub,
        title: 'Resultados del Examen',
        data: { title: 'Resultados', breadcrumb: 'Resultados', phase: 'Fase 8' }
      }
    ]
  },
  {
    path: 'comandos',
    loadComponent: loadStub,
    title: 'Comandos Linux LPIC-1',
    data: { title: 'Comandos', breadcrumb: 'Comandos', phase: 'Fase 9' }
  },
  {
    path: 'glosario',
    loadComponent: loadStub,
    title: 'Glosario de Términos',
    data: { title: 'Glosario', breadcrumb: 'Glosario', phase: 'Fase 9' }
  },
  {
    path: 'flashcards',
    loadComponent: loadStub,
    title: 'Flashcards de Repaso (Leitner)',
    data: { title: 'Flashcards', breadcrumb: 'Flashcards', phase: 'Fase 9' }
  },
  {
    path: 'mapa-mental',
    loadComponent: loadStub,
    title: 'Mapa Mental Interactivo',
    data: { title: 'Mapa Mental', breadcrumb: 'Mapa Mental', phase: 'Fase 10' }
  },
  {
    path: 'buscar',
    loadComponent: loadStub,
    title: 'Buscador Global',
    data: { title: 'Búsqueda', breadcrumb: 'Buscar', phase: 'Fase 6' }
  },
  {
    path: 'progreso',
    loadComponent: loadStub,
    title: 'Progreso de Estudio',
    data: { title: 'Progreso', breadcrumb: 'Progreso', phase: 'Fase 10' }
  },
  {
    path: 'erratas',
    loadComponent: loadStub,
    title: 'Fe de Erratas',
    data: { title: 'Erratas', breadcrumb: 'Erratas', phase: 'Fase 10' }
  },
  {
    path: 'ajustes',
    loadComponent: loadStub,
    title: 'Ajustes y Copia de Seguridad',
    data: { title: 'Ajustes', breadcrumb: 'Ajustes', phase: 'Fase 10' }
  },
  {
    path: 'acerca-de',
    loadComponent: loadStub,
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
    loadComponent: loadStub,
    title: 'Página no encontrada (404)',
    data: { title: '404 · Página no encontrada', breadcrumb: '404', phase: 'Fase 10' }
  }
];
