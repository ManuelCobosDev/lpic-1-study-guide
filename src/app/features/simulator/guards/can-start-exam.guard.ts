import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';

/**
 * Guard funcional que protege la ruta de examen (/simulador/examen):
 * - Permite el paso si ya hay una sesión activa en curso (ej. tras recargar la página).
 * - Permite el paso si existen preguntas disponibles en el banco del currículo.
 * - Bloquea y redirige a /simulador si no hay preguntas disponibles.
 */
export const canStartExamGuard: CanActivateFn = async () => {
  const examService = inject(ExamService);
  const router = inject(Router);

  // 1. Si hay sesión activa en curso, permitir el paso inmediatamente
  if (examService.hasActiveSession()) {
    return true;
  }

  // 2. Comprobar si hay preguntas disponibles para generar un nuevo examen
  const hasQuestions = await examService.hasAvailableQuestions();
  if (hasQuestions) {
    return true;
  }

  // 3. Si no hay preguntas, bloquear el inicio y redirigir al hub del simulador
  return router.createUrlTree(['/simulador'], {
    queryParams: { error: 'no_questions' }
  });
};

