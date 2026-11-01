import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Question } from '../../../../core/models/question.model';
import { FlashcardItem, LeitnerRating } from '../../../../core/models/flashcard.model';
import { LessonExercise } from '../../../../core/models/practice.model';
import { PracticeService } from '../../../../core/services/practice.service';
import { WikiRefService } from '../../../../core/services/wiki-ref.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-practice-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonComponent
  ],
  template: `
    <div
      class="practice-tab-container space-y-12"
      (mouseover)="onMouseOver($event)"
      (mouseout)="onMouseOut($event)"
      (focus)="onFocusIn($event)"
      (blur)="onFocusOut($event)"
    >
      <!-- ========================================== -->
      <!-- BLOQUE A: TEST RÁPIDO (≤ 10 PREGUNTAS)      -->
      <!-- ========================================== -->
      <section
        class="quick-quiz-section p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-6"
        data-testid="quick-quiz"
        aria-labelledby="quick-quiz-title"
      >
        <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[var(--border)]">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-text)] flex items-center justify-center text-xl shadow-xs shrink-0" aria-hidden="true">
              🎯
            </span>
            <div>
              <h3 id="quick-quiz-title" class="text-base sm:text-lg font-extrabold text-[var(--text)] tracking-tight">
                Test Rápido del Subtema
              </h3>
              <p class="text-xs text-[var(--text-muted)]">
                Evaluación inmediata de conocimientos clave con retroalimentación explicativa.
              </p>
            </div>
          </div>

          <!-- Historial de puntuación -->
          @if (savedQuizResult(); as res) {
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono">
              <span class="text-[var(--text-muted)]">Mejor resultado:</span>
              <span class="font-bold text-[var(--primary-text)]">{{ res.best }} / {{ res.totalQuestions }}</span>
              <span class="text-[var(--text-subtle)]">({{ res.attempts }} {{ res.attempts === 1 ? 'intento' : 'intentos' }})</span>
            </div>
          }
        </div>

        @if (quizQuestions().length === 0) {
          <div class="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)]">
            No hay preguntas de test registradas para este subtema en el banco oficial.
          </div>
        } @else if (quizFinished()) {
          <!-- Resumen de Fin de Test -->
          <div class="quiz-summary-card p-6 sm:p-8 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-center space-y-4 max-w-lg mx-auto">
            <div class="text-4xl" aria-hidden="true">
              {{ quizScore() >= (activeQuizQuestions().length * 0.7) ? '🎉' : '📚' }}
            </div>
            <div class="space-y-1">
              <h4 class="text-lg font-extrabold text-[var(--text)]">
                Test completado: {{ quizScore() }} de {{ activeQuizQuestions().length }} correctas
              </h4>
              <p class="text-xs text-[var(--text-muted)]">
                {{ quizScore() >= (activeQuizQuestions().length * 0.7)
                  ? '¡Excelente trabajo! Has demostrado dominio de las áreas evaluadas.'
                  : 'Sigue repasando las diapositivas y las explicaciones para afianzar conceptos.' }}
              </p>
            </div>

            <div class="pt-2">
              <app-button variant="primary" size="md" (click)="restartQuiz()">
                <span>🔄 Repetir test</span>
              </app-button>
            </div>
          </div>
        } @else if (currentQuestion(); as q) {
          <!-- Pregunta Activa -->
          <div class="question-card space-y-5">
            <div class="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>Pregunta {{ currentQuestionIndex() + 1 }} de {{ activeQuizQuestions().length }}</span>
              <span class="px-2 py-0.5 rounded-md bg-[var(--surface-muted)] uppercase text-[10px] font-bold">
                {{ q.type === 'single' ? 'Opción única' : (q.type === 'multiple' ? 'Opción múltiple' : 'Completar') }}
              </span>
            </div>

            <div class="question-prompt text-sm sm:text-base font-semibold text-[var(--text)] leading-relaxed">
              {{ q.prompt }}
            </div>

            <!-- Opciones según tipo -->
            @if (q.type === 'single' || q.type === 'multiple') {
              <div class="options-list space-y-2.5" role="group" aria-label="Opciones de respuesta">
                @for (opt of q.options; track opt.id) {
                  <button
                    type="button"
                    class="option-item-btn w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-start gap-3 select-none"
                    [class.border-[var(--primary)]]="isOptionSelected(opt.id) && !isAnswerChecked()"
                    [class.bg-[var(--primary-soft)]]="isOptionSelected(opt.id) && !isAnswerChecked()"
                    [class.border-emerald-500]="isAnswerChecked() && isOptionCorrect(q, opt.id)"
                    [class.bg-emerald-500/10]="isAnswerChecked() && isOptionCorrect(q, opt.id)"
                    [class.border-red-500]="isAnswerChecked() && isOptionSelected(opt.id) && !isOptionCorrect(q, opt.id)"
                    [class.bg-red-500/10]="isAnswerChecked() && isOptionSelected(opt.id) && !isOptionCorrect(q, opt.id)"
                    [class.border-[var(--border)]]="!isOptionSelected(opt.id) && (!isAnswerChecked() || !isOptionCorrect(q, opt.id))"
                    [disabled]="isAnswerChecked()"
                    (click)="toggleOption(opt.id, q.type)"
                  >
                    <span
                      class="w-5 h-5 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 border mt-0.5"
                      [class.bg-[var(--primary)]]="isOptionSelected(opt.id) && !isAnswerChecked()"
                      [class.text-white]="isOptionSelected(opt.id) && !isAnswerChecked()"
                      [class.border-[var(--primary)]]="isOptionSelected(opt.id) && !isAnswerChecked()"
                      [class.bg-emerald-600]="isAnswerChecked() && isOptionCorrect(q, opt.id)"
                      [class.text-white]="isAnswerChecked() && isOptionCorrect(q, opt.id)"
                      [class.border-emerald-600]="isAnswerChecked() && isOptionCorrect(q, opt.id)"
                      [class.border-[var(--border)]]="!isOptionSelected(opt.id)"
                    >
                      {{ opt.id.toUpperCase() }}
                    </span>
                    <span class="flex-1 leading-snug">{{ opt.text }}</span>
                  </button>
                }
              </div>
            } @else if (q.type === 'fill') {
              <div class="fill-input-area space-y-2">
                <input
                  type="text"
                  class="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] text-sm font-mono focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  placeholder="Escribe aquí tu respuesta exacta (comando, ruta o término)..."
                  [(ngModel)]="fillAnswer"
                  [disabled]="isAnswerChecked()"
                  (keydown.enter)="checkAnswer()"
                />
              </div>
            }

            <!-- Acciones de Comprobación -->
            @if (!isAnswerChecked()) {
              <div class="pt-2">
                <app-button
                  variant="primary"
                  size="md"
                  [disabled]="!hasUserAnswered(q)"
                  (click)="checkAnswer()"
                >
                  <span>Comprobar respuesta</span>
                </app-button>
              </div>
            } @else {
              <!-- Retroalimentación Inmediata -->
              <div class="feedback-panel p-5 rounded-2xl border space-y-3"
                [class.bg-emerald-500/10]="isCurrentQuestionCorrect()"
                [class.border-emerald-500/30]="isCurrentQuestionCorrect()"
                [class.bg-red-500/10]="!isCurrentQuestionCorrect()"
                [class.border-red-500/30]="!isCurrentQuestionCorrect()"
              >
                <div class="flex items-center gap-2 font-bold text-sm"
                  [class.text-emerald-700]="isCurrentQuestionCorrect()"
                  [class.dark:text-emerald-300]="isCurrentQuestionCorrect()"
                  [class.text-red-700]="!isCurrentQuestionCorrect()"
                  [class.dark:text-red-300]="!isCurrentQuestionCorrect()"
                >
                  <span>{{ isCurrentQuestionCorrect() ? '✓ ¡Respuesta Correcta!' : '✕ Respuesta Incorrecta' }}</span>
                </div>

                @if (q.explanation) {
                  <div class="text-xs sm:text-sm text-[var(--text)] leading-relaxed pt-1" [innerHTML]="q.explanation"></div>
                }

                @if (q.explainedIn) {
                  <div class="pt-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs font-semibold hover:border-[var(--primary)] hover:text-[var(--primary-text)] transition-colors cursor-pointer"
                      (click)="jumpToSlide.emit(getSlideNumberFromLocation(q.explainedIn))"
                    >
                      <span>📖 Ver en diapositiva {{ q.explainedIn }}</span>
                    </button>
                  </div>
                }
              </div>

              <div class="pt-2 flex justify-end">
                <app-button variant="primary" size="md" (click)="nextQuestion()">
                  <span>{{ currentQuestionIndex() < activeQuizQuestions().length - 1 ? 'Siguiente pregunta →' : 'Ver resultado final →' }}</span>
                </app-button>
              </div>
            }
          </div>
        }
      </section>

      <!-- ========================================== -->
      <!-- BLOQUE B: MINI-FLASHCARDS (≤ 10 TARJETAS)   -->
      <!-- ========================================== -->
      <section
        class="mini-flashcards-section p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-6"
        data-testid="mini-flashcards"
        aria-labelledby="mini-flashcards-title"
      >
        <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[var(--border)]">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-text)] flex items-center justify-center text-xl shadow-xs shrink-0" aria-hidden="true">
              🗂️
            </span>
            <div>
              <h3 id="mini-flashcards-title" class="text-base sm:text-lg font-extrabold text-[var(--text)] tracking-tight">
                Mini-Flashcards de Repaso Espaciado
              </h3>
              <p class="text-xs text-[var(--text-muted)]">
                Tarjetas de memoria de este subtema ordenadas según el sistema Leitner.
              </p>
            </div>
          </div>

          <a
            [routerLink]="['/flashcards']"
            [queryParams]="{ subtema: subtopicId() }"
            class="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary-text)] hover:underline"
          >
            <span>Ver biblioteca completa →</span>
          </a>
        </div>

        @if (flashcardItems().length === 0) {
          <div class="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)]">
            No hay tarjetas de memoria registradas para este subtema.
          </div>
        } @else if (flashcardsFinished()) {
          <div class="flashcards-summary-card p-6 sm:p-8 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-center space-y-4 max-w-lg mx-auto">
            <div class="text-4xl" aria-hidden="true">✨</div>
            <div class="space-y-1">
              <h4 class="text-lg font-extrabold text-[var(--text)]">
                ¡Sesión de tarjetas completada!
              </h4>
              <p class="text-xs text-[var(--text-muted)]">
                Has repasado las {{ flashcardItems().length }} tarjetas programadas para este subtema.
              </p>
            </div>
            <div class="pt-2">
              <app-button variant="primary" size="md" (click)="restartFlashcards()">
                <span>Repasar de nuevo</span>
              </app-button>
            </div>
          </div>
        } @else if (currentFlashcard(); as card) {
          <!-- Tarjeta Activa -->
          <div class="flashcard-study-container max-w-xl mx-auto space-y-4">
            <div class="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>Tarjeta {{ currentFlashcardIndex() + 1 }} de {{ flashcardItems().length }}</span>
              <span class="px-2 py-0.5 rounded-md bg-[var(--surface-muted)] uppercase text-[10px] font-bold">
                {{ card.type === 'command' ? 'Comando' : 'Glosario' }}
              </span>
            </div>

            <!-- Tarjeta con Volteo -->
            <div
              tabindex="0"
              class="flashcard-card min-h-[220px] p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] shadow-sm hover:border-[var(--primary)] transition-all cursor-pointer flex flex-col justify-between"
              (click)="toggleFlashcardFlip()"
              (keydown.space)="$event.preventDefault(); toggleFlashcardFlip()"
              (keydown.enter)="toggleFlashcardFlip()"
              role="button"
              [attr.aria-label]="isCardFlipped() ? 'Reverso de tarjeta. Clic para voltear.' : 'Anverso de tarjeta. Clic para voltear.'"
            >
              @if (!isCardFlipped()) {
                <!-- Anverso -->
                <div class="space-y-3">
                  <span class="text-xs font-mono font-bold text-[var(--primary-text)] uppercase tracking-wider block">
                    {{ card.frontSubtitle || 'LPIC-1' }}
                  </span>
                  <h4 class="text-2xl font-black text-[var(--text)] tracking-tight">
                    {{ card.frontTitle }}
                  </h4>
                  @if (card.prompt) {
                    <p class="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed pt-1">
                      {{ card.prompt }}
                    </p>
                  }
                </div>
                <div class="text-[11px] font-mono text-[var(--text-subtle)] text-right pt-4">
                  Pulsa o haz clic para voltear ↵
                </div>
              } @else {
                <!-- Reverso -->
                <div class="space-y-3">
                  <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Respuesta / Definición
                  </span>
                  <h4 class="text-xl font-bold text-[var(--text)]">
                    {{ card.backTitle }}
                  </h4>
                  <p class="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                    {{ card.backDescription }}
                  </p>
                  @if (card.backSyntax) {
                    <div class="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-[var(--primary-text)]">
                      {{ card.backSyntax }}
                    </div>
                  }
                  @if (card.backExample) {
                    <div class="text-xs font-mono text-[var(--text-muted)]">
                      Ej: <code>{{ card.backExample }}</code>
                    </div>
                  }
                </div>
                <div class="text-[11px] font-mono text-[var(--text-subtle)] text-right pt-4">
                  Evalúa tu recuerdo abajo ↓
                </div>
              }
            </div>

            <!-- Botones de Calificación Leitner (1-4) -->
            @if (isCardFlipped()) {
              <div class="rating-buttons-grid grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <button
                  type="button"
                  class="p-2.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  (click)="rateFlashcard('again')"
                >
                  <span>1. Otra vez</span>
                  <span class="text-[10px] opacity-75 font-mono">Reiniciar</span>
                </button>
                <button
                  type="button"
                  class="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  (click)="rateFlashcard('hard')"
                >
                  <span>2. Difícil</span>
                  <span class="text-[10px] opacity-75 font-mono">Misma caja</span>
                </button>
                <button
                  type="button"
                  class="p-2.5 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  (click)="rateFlashcard('good')"
                >
                  <span>3. Bien</span>
                  <span class="text-[10px] opacity-75 font-mono">+1 caja</span>
                </button>
                <button
                  type="button"
                  class="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  (click)="rateFlashcard('easy')"
                >
                  <span>4. Fácil</span>
                  <span class="text-[10px] opacity-75 font-mono">+2 cajas</span>
                </button>
              </div>
            } @else {
              <div class="text-center pt-2">
                <app-button variant="secondary" size="md" (click)="toggleFlashcardFlip()">
                  <span>Voltear tarjeta</span>
                </app-button>
              </div>
            }
          </div>
        }
      </section>

      <!-- ========================================== -->
      <!-- BLOQUE C: ACORDEÓN DE EJERCICIOS DEL MANUAL-->
      <!-- ========================================== -->
      <section
        class="manual-exercises-accordion p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-6"
        data-testid="manual-exercises"
        aria-labelledby="manual-exercises-title"
      >
        <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[var(--border)]">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-text)] flex items-center justify-center text-xl shadow-xs shrink-0" aria-hidden="true">
              📖
            </span>
            <div>
              <h3 id="manual-exercises-title" class="text-base sm:text-lg font-extrabold text-[var(--text)] tracking-tight">
                Ejercicios Oficiales del Manual
              </h3>
              <p class="text-xs text-[var(--text-muted)]">
                Ejercicios guiados y de exploración del temario oficial con respuestas contrastadas y toma de notas.
              </p>
            </div>
          </div>

          <div class="text-xs font-mono text-[var(--text-muted)]">
            {{ completedExercisesCount() }} / {{ exercises().length }} completados
          </div>
        </div>

        @if (exercises().length === 0) {
          <div class="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)]">
            No hay ejercicios registrados para este subtema.
          </div>
        } @else {
          <div class="exercises-accordion-list space-y-4">
            @for (ex of exercises(); track ex.id; let idx = $index) {
              <div
                class="exercise-item-card rounded-2xl border transition-all"
                [class.border-[var(--primary)]]="openExerciseId() === ex.id"
                [class.border-[var(--border)]]="openExerciseId() !== ex.id"
                [class.bg-[var(--surface-muted)]]="openExerciseId() === ex.id"
                [class.bg-[var(--surface)]]="openExerciseId() !== ex.id"
              >
                <!-- Cabecera del Acordeón -->
                <button
                  type="button"
                  class="exercise-header w-full p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none text-left bg-transparent border-none"
                  (click)="toggleExerciseAccordion(ex.id)"
                  [attr.aria-expanded]="openExerciseId() === ex.id"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <span
                      class="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase shrink-0"
                      [class.bg-blue-500/15]="ex.kind === 'guiado'"
                      [class.text-blue-600]="ex.kind === 'guiado'"
                      [class.dark:text-blue-400]="ex.kind === 'guiado'"
                      [class.bg-purple-500/15]="ex.kind === 'exploratorio'"
                      [class.text-purple-600]="ex.kind === 'exploratorio'"
                      [class.dark:text-purple-400]="ex.kind === 'exploratorio'"
                    >
                      {{ ex.kind === 'guiado' ? 'Guiado' : 'Exploración' }}
                    </span>
                    <span class="text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                      {{ ex.title || ('Ejercicio ' + (idx + 1)) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 shrink-0">
                    @if (isExerciseDone(ex.id)) {
                      <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>✓</span>
                        <span class="hidden sm:inline">Hecho</span>
                      </span>
                    }
                    <span class="text-xs font-mono text-[var(--text-muted)]">
                      {{ openExerciseId() === ex.id ? '▲' : '▼' }}
                    </span>
                  </div>
                </button>

                <!-- Contenido Expandido del Ejercicio -->
                @if (openExerciseId() === ex.id) {
                  <div class="exercise-body p-4 sm:p-5 pt-0 space-y-4 border-t border-[var(--border)]">
                    <!-- Enunciado -->
                    <div class="statement-box pt-3 text-xs sm:text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
                      {{ ex.statement }}
                    </div>

                    <!-- Cuadro de Notas / Solución Personal -->
                    <div class="notes-field space-y-1.5">
                      <label [for]="'note-' + ex.id" class="text-xs font-mono font-semibold text-[var(--text-muted)]">
                        Tu solución / apuntes personales (guardado local automático):
                      </label>
                      <textarea
                        [id]="'note-' + ex.id"
                        rows="3"
                        class="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs sm:text-sm font-mono leading-relaxed focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        placeholder="Escribe aquí tus comandos o respuesta para comprobarla..."
                        [value]="getExerciseNote(ex.id)"
                        (input)="onExerciseNoteInput(ex.id, $event)"
                      ></textarea>
                    </div>

                    <!-- Controles de Respuesta Oficial y Marcado Hecho -->
                    <div class="flex items-center justify-between gap-3 flex-wrap pt-2">
                      <button
                        type="button"
                        class="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs font-semibold hover:border-[var(--primary)] hover:text-[var(--primary-text)] transition-colors cursor-pointer"
                        (click)="toggleShowAnswer(ex.id)"
                      >
                        <span>{{ isAnswerVisible(ex.id) ? 'Ocultar respuesta oficial' : 'Ver respuesta oficial' }}</span>
                      </button>

                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none"
                        [class.bg-emerald-600]="isExerciseDone(ex.id)"
                        [class.text-white]="isExerciseDone(ex.id)"
                        [class.border-emerald-600]="isExerciseDone(ex.id)"
                        [class.bg-[var(--surface)]]="!isExerciseDone(ex.id)"
                        [class.border-[var(--border)]]="!isExerciseDone(ex.id)"
                        [class.text-[var(--text)]]="!isExerciseDone(ex.id)"
                        (click)="toggleExerciseDone(ex.id)"
                      >
                        <span>{{ isExerciseDone(ex.id) ? '✓ Completado' : 'Marcar como hecho' }}</span>
                      </button>
                    </div>

                    <!-- Respuesta Oficial Revelable -->
                    @if (isAnswerVisible(ex.id)) {
                      <div class="official-answer-panel p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-2">
                        <span class="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                          Respuesta oficial del manual:
                        </span>
                        <div class="text-xs sm:text-sm text-[var(--text)] leading-relaxed whitespace-pre-line font-mono">
                          {{ ex.answer }}
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PracticeTabComponent implements OnInit {
  private readonly practiceService = inject(PracticeService);
  private readonly wikiRefService = inject(WikiRefService);

  readonly subtopicId = input.required<string>();
  readonly questions = input<Question[]>([]);
  readonly flashcards = input<FlashcardItem[]>([]);
  readonly exercises = input<LessonExercise[]>([]);
  readonly jumpToSlide = output<number>();
  readonly rateCard = output<{ cardId: string; rating: LeitnerRating }>();

  // ===============================
  // ESTADO BLOQUE A: TEST RÁPIDO
  // ===============================
  readonly activeQuizQuestions = computed(() => {
    const list = this.questions();
    return list.slice(0, 10);
  });
  readonly quizQuestions = computed(() => this.activeQuizQuestions());
  readonly currentQuestionIndex = signal<number>(0);
  readonly currentQuestion = computed(() => this.activeQuizQuestions()[this.currentQuestionIndex()] ?? null);
  readonly selectedOptions = signal<string[]>([]);
  fillAnswer = '';
  readonly isAnswerChecked = signal<boolean>(false);
  readonly isCurrentQuestionCorrect = signal<boolean>(false);
  readonly quizScore = signal<number>(0);
  readonly quizFinished = signal<boolean>(false);

  readonly savedQuizResult = computed(() => {
    return this.practiceService.getQuickQuizResult(this.subtopicId());
  });

  // ===============================
  // ESTADO BLOQUE B: MINI-FLASHCARDS
  // ===============================
  readonly flashcardItems = computed(() => this.flashcards());
  readonly currentFlashcardIndex = signal<number>(0);
  readonly currentFlashcard = computed(() => this.flashcardItems()[this.currentFlashcardIndex()] ?? null);
  readonly isCardFlipped = signal<boolean>(false);
  readonly flashcardsFinished = signal<boolean>(false);

  // ===============================
  // ESTADO BLOQUE C: EJERCICIOS
  // ===============================
  readonly openExerciseId = signal<string | null>(null);
  readonly visibleAnswers = signal<Record<string, boolean>>({});

  readonly completedExercisesCount = computed(() => {
    const exs = this.exercises();
    return exs.filter((e) => this.isExerciseDone(e.id)).length;
  });

  ngOnInit(): void {
    if (this.exercises().length > 0) {
      this.openExerciseId.set(this.exercises()[0]?.id ?? null);
    }
  }

  // --- MÉTODOS BLOQUE A: TEST RÁPIDO ---
  isOptionSelected(optionId: string): boolean {
    return this.selectedOptions().includes(optionId);
  }

  isOptionCorrect(q: Question, optionId: string): boolean {
    return q.correct.includes(optionId);
  }

  toggleOption(optionId: string, type: 'single' | 'multiple'): void {
    if (this.isAnswerChecked()) return;
    if (type === 'single') {
      this.selectedOptions.set([optionId]);
    } else {
      const current = this.selectedOptions();
      if (current.includes(optionId)) {
        this.selectedOptions.set(current.filter((id) => id !== optionId));
      } else {
        this.selectedOptions.set([...current, optionId]);
      }
    }
  }

  hasUserAnswered(q: Question): boolean {
    if (q.type === 'fill') {
      return this.fillAnswer.trim().length > 0;
    }
    return this.selectedOptions().length > 0;
  }

  checkAnswer(): void {
    const q = this.currentQuestion();
    if (!q || this.isAnswerChecked()) return;

    let isCorrect = false;
    if (q.type === 'single') {
      isCorrect = this.selectedOptions().length === 1 && q.correct.includes(this.selectedOptions()[0]!);
    } else if (q.type === 'multiple') {
      const sel = [...this.selectedOptions()].sort();
      const cor = [...q.correct].sort();
      isCorrect = sel.length === cor.length && sel.every((val, idx) => val === cor[idx]);
    } else if (q.type === 'fill') {
      const ans = this.fillAnswer.trim().toLowerCase();
      const accepted = (q.acceptedAnswers ?? q.correct).map((a) => a.trim().toLowerCase());
      isCorrect = accepted.includes(ans);
    }

    this.isCurrentQuestionCorrect.set(isCorrect);
    if (isCorrect) {
      this.quizScore.update((s) => s + 1);
    }
    this.isAnswerChecked.set(true);
  }

  nextQuestion(): void {
    const nextIdx = this.currentQuestionIndex() + 1;
    if (nextIdx < this.activeQuizQuestions().length) {
      this.currentQuestionIndex.set(nextIdx);
      this.selectedOptions.set([]);
      this.fillAnswer = '';
      this.isAnswerChecked.set(false);
    } else {
      // Fin del quiz
      this.quizFinished.set(true);
      this.practiceService.recordQuickQuizResult(
        this.subtopicId(),
        this.quizScore(),
        this.activeQuizQuestions().length
      );
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex.set(0);
    this.selectedOptions.set([]);
    this.fillAnswer = '';
    this.isAnswerChecked.set(false);
    this.quizScore.set(0);
    this.quizFinished.set(false);
  }

  getSlideNumberFromLocation(loc: string): number {
    const match = loc.match(/#(\d+)/);
    return match && match[1] ? parseInt(match[1], 10) : 1;
  }

  // --- MÉTODOS BLOQUE B: MINI-FLASHCARDS ---
  toggleFlashcardFlip(): void {
    this.isCardFlipped.update((v) => !v);
  }

  rateFlashcard(rating: LeitnerRating): void {
    const card = this.currentFlashcard();
    if (!card) return;

    this.rateCard.emit({ cardId: card.id, rating });

    const nextIdx = this.currentFlashcardIndex() + 1;
    if (nextIdx < this.flashcardItems().length) {
      this.currentFlashcardIndex.set(nextIdx);
      this.isCardFlipped.set(false);
    } else {
      this.flashcardsFinished.set(true);
    }
  }

  restartFlashcards(): void {
    this.currentFlashcardIndex.set(0);
    this.isCardFlipped.set(false);
    this.flashcardsFinished.set(false);
  }

  // --- MÉTODOS BLOQUE C: EJERCICIOS ---
  toggleExerciseAccordion(exId: string): void {
    this.openExerciseId.update((current) => (current === exId ? null : exId));
  }

  isAnswerVisible(exId: string): boolean {
    return !!this.visibleAnswers()[exId];
  }

  toggleShowAnswer(exId: string): void {
    this.visibleAnswers.update((map) => ({
      ...map,
      [exId]: !map[exId]
    }));
  }

  getExerciseNote(exId: string): string {
    return this.practiceService.getExerciseNote(exId);
  }

  onExerciseNoteInput(exId: string, event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.practiceService.saveExerciseNote(exId, val);
  }

  isExerciseDone(exId: string): boolean {
    return this.practiceService.isExerciseCompleted(exId);
  }

  toggleExerciseDone(exId: string): void {
    this.practiceService.toggleExerciseCompleted(exId);
  }

  // --- WIKIPEDIA POPOVER HOVER ---
  onMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      const from = event.relatedTarget as Node | null;
      if (from && anchor.contains(from)) return;
      this.wikiRefService.onTargetEnter(anchor);
    }
  }

  onMouseOut(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      const to = event.relatedTarget as Node | null;
      if (to && anchor.contains(to)) return;
      this.wikiRefService.onTargetLeave();
    }
  }

  onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      this.wikiRefService.onTargetEnter(anchor);
    }
  }

  onFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      this.wikiRefService.onTargetLeave();
    }
  }
}

