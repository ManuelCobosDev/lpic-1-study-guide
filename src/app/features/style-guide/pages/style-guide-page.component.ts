import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  BadgeComponent,
  BadgeVariant,
  ButtonComponent,
  ButtonSize,
  ButtonVariant,
  CalloutComponent,
  CardComponent,
  ChipComponent,
  CodeBlockComponent,
  ContainerComponent,
  DialogComponent,
  EmptyStateComponent,
  InputComponent,
  KbdComponent,
  ProgressBarComponent,
  SelectComponent,
  SelectOption,
  SkeletonComponent,
  StatCardComponent,
  TabItem,
  TabsComponent,
  TextareaComponent
} from '../../../shared/ui';

@Component({
  selector: 'app-style-guide-page',
  standalone: true,
  imports: [
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    ChipComponent,
    KbdComponent,
    ProgressBarComponent,
    StatCardComponent,
    CardComponent,
    CalloutComponent,
    TabsComponent,
    CodeBlockComponent,
    EmptyStateComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    DialogComponent,
    SkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-container>
      <div class="styleguide-page">
        <!-- Encabezado de la Guía de Estilos -->
        <header class="sg-header">
          <div class="sg-header-badge">
            <app-badge variant="primary" [dot]="true">Sistema de Diseño Oficial</app-badge>
          </div>
          <h1 class="sg-title">Guía de Estilos & Primitivas UI</h1>
          <p class="sg-subtitle">
            Catálogo exhaustivo de componentes de interfaz, tokens semánticos, tipografía y estados de interacción según la especificación técnica de LPIC-1 Study Guide.
          </p>
        </header>

        <!-- 1. Paleta de Colores Semánticos -->
        <section class="sg-section" id="colores">
          <h2 class="sg-section-title">1. Tokens de Color Semántico</h2>
          <p class="sg-section-desc">
            Semántica estricta: azul acción/navegación, verde completado/correcto, ámbar simulador/aviso, rojo error/destructivo, sky información.
          </p>

          <div class="sg-colors-grid">
            <div class="sg-color-swatch">
              <div class="swatch-preview swatch-primary" aria-hidden="true"></div>
              <span class="swatch-name">Azure (Primario)</span>
              <span class="swatch-var">--primary</span>
            </div>
            <div class="sg-color-swatch">
              <div class="swatch-preview swatch-success" aria-hidden="true"></div>
              <span class="swatch-name">Emerald (Éxito)</span>
              <span class="swatch-var">--success</span>
            </div>
            <div class="sg-color-swatch">
              <div class="swatch-preview swatch-warning" aria-hidden="true"></div>
              <span class="swatch-name">Amber (Simulador / Aviso)</span>
              <span class="swatch-var">--warning</span>
            </div>
            <div class="sg-color-swatch">
              <div class="swatch-preview swatch-danger" aria-hidden="true"></div>
              <span class="swatch-name">Rose (Peligro / Error)</span>
              <span class="swatch-var">--danger</span>
            </div>
            <div class="sg-color-swatch">
              <div class="swatch-preview swatch-info" aria-hidden="true"></div>
              <span class="swatch-name">Sky (Información)</span>
              <span class="swatch-var">--info</span>
            </div>
            <div class="sg-color-swatch">
              <div class="swatch-preview swatch-surface" aria-hidden="true"></div>
              <span class="swatch-name">Superficie & Bordes</span>
              <span class="swatch-var">--surface / --border</span>
            </div>
          </div>
        </section>

        <!-- 2. Tipografía -->
        <section class="sg-section" id="tipografia">
          <h2 class="sg-section-title">2. Escala Tipográfica</h2>
          <div class="sg-typography-stack">
            <div class="type-row">
              <span class="type-meta">Display · 44/52</span>
              <p class="type-display">LPIC-1 Linux Administrator</p>
            </div>
            <div class="type-row">
              <span class="type-meta">H1 · 32/40</span>
              <h1 class="type-h1">Tema 103: Comandos GNU y Unix</h1>
            </div>
            <div class="type-row">
              <span class="type-meta">H2 · 24/32</span>
              <h2 class="type-h2">103.4 Uso de flujos, tuberías y filtros</h2>
            </div>
            <div class="type-row">
              <span class="type-meta">H3 · 18/26</span>
              <h3 class="type-h3">Redirección estándar y descriptores de archivo</h3>
            </div>
            <div class="type-row">
              <span class="type-meta">Body · 15/24</span>
              <p class="type-body">
                El descriptor de archivo 0 corresponde a la entrada estándar (stdin), el 1 a la salida estándar (stdout) y el 2 al canal de error (stderr).
              </p>
            </div>
            <div class="type-row">
              <span class="type-meta">Small · 13/20</span>
              <p class="type-small">Nota complementaria: use 2&gt;&amp;1 para redirigir el flujo de error estándar al flujo normal de salida.</p>
            </div>
            <div class="type-row">
              <span class="type-meta">Caption · 12/16</span>
              <p class="type-caption">OBJETIVO OFICIAL LPI 103.4 · PESO 4</p>
            </div>
          </div>
        </section>

        <!-- 3. Botones (6 variantes x 4 tamaños en todos sus estados) -->
        <section class="sg-section" id="botones">
          <h2 class="sg-section-title">3. Botón Único (app-button: 6 variantes × 4 tamaños)</h2>
          <p class="sg-section-desc">
            Prueba de las 6 variantes (primary, secondary, ghost, warning, destructive, link) en los 4 tamaños (sm 32px, md 40px, lg 48px, icon 40×40) y estados (normal, hover, disabled, loading).
          </p>

          <div class="sg-buttons-table">
            @for (variant of buttonVariants; track variant) {
              <div class="sg-button-row">
                <div class="sg-row-header">
                  <span class="font-semibold uppercase tracking-wider text-xs">{{ variant }}</span>
                </div>

                <div class="sg-row-content">
                  <!-- Tamaños -->
                  <div class="sg-size-group">
                    <app-button [variant]="variant" size="sm">Small (32px)</app-button>
                    <app-button [variant]="variant" size="md">Medium (40px)</app-button>
                    <app-button [variant]="variant" size="lg">Large CTA (48px)</app-button>
                    <app-button [variant]="variant" size="icon" [ariaLabel]="'Acción icono ' + variant">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </app-button>
                  </div>

                  <!-- Estados Disabled y Loading -->
                  <div class="sg-state-group">
                    <app-button [variant]="variant" size="md" [disabled]="true">Deshabilitado</app-button>
                    <app-button [variant]="variant" size="md" [loading]="true">Cargando</app-button>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- 4. Badges (24 px fijos inalterables) -->
        <section class="sg-section" id="badges">
          <h2 class="sg-section-title">4. Badges (Altura Exacta 24 px)</h2>
          <p class="sg-section-desc">
            Las píldoras de estado deben mantener invariablemente 24 px de alto tanto con texto corto como largo, con y sin dot semántico.
          </p>

          <div class="sg-badges-group">
            <div class="sg-badges-row">
              <span class="sg-label">Con punto indicador (dot):</span>
              <div class="sg-flex-wrap">
                <app-badge variant="neutral" [dot]="true">Pendiente</app-badge>
                <app-badge variant="primary" [dot]="true">En curso</app-badge>
                <app-badge variant="success" [dot]="true">Completado</app-badge>
                <app-badge variant="warning" [dot]="true">Simulacro LPIC-1</app-badge>
                <app-badge variant="danger" [dot]="true">Incorrecto</app-badge>
                <app-badge variant="info" [dot]="true">Información</app-badge>
              </div>
            </div>

            <div class="sg-badges-row">
              <span class="sg-label">Sin punto:</span>
              <div class="sg-flex-wrap">
                <app-badge variant="neutral">Tema 101</app-badge>
                <app-badge variant="primary">Examen 101-500</app-badge>
                <app-badge variant="success">Aprobado</app-badge>
                <app-badge variant="warning">Peso 5</app-badge>
                <app-badge variant="danger">Fallo crítico</app-badge>
                <app-badge variant="info">Linux Kernel</app-badge>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. Chips y Teclas Kbd -->
        <section class="sg-section" id="chips-kbd">
          <h2 class="sg-section-title">5. Chips Interactivos y Teclas Kbd</h2>
          <div class="sg-chips-kbd-grid">
            <div class="sg-subcard">
              <h3 class="sg-subcard-title">Chips (28 px con estados)</h3>
              <div class="sg-flex-wrap">
                <app-chip [selected]="chip1Selected()" (chipToggle)="chip1Selected.set($event)">
                  Filtrar por Tema 103
                </app-chip>
                <app-chip [selected]="chip2Selected()" (chipToggle)="chip2Selected.set($event)">
                  Solo laboratorios
                </app-chip>
                <app-chip [removable]="true" ariaLabel="Etiqueta eliminable" (chipRemove)="handleRemoveChip()">
                  Etiqueta eliminable
                </app-chip>
              </div>
            </div>

            <div class="sg-subcard">
              <h3 class="sg-subcard-title">Teclas de Teclado Kbd</h3>
              <p class="text-sm text-[var(--text-muted)] mb-3">Atajos de navegación rápida:</p>
              <div class="sg-flex-wrap items-center">
                <span>Guardar:</span>
                <app-kbd>Ctrl</app-kbd>
                <span>+</span>
                <app-kbd>S</app-kbd>
                <span class="ml-4">Buscar:</span>
                <app-kbd>/</app-kbd>
                <span class="ml-4">Siguiente diapositiva:</span>
                <app-kbd>→</app-kbd>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. Tarjetas (Cards estándar e interactivas) -->
        <section class="sg-section" id="tarjetas">
          <h2 class="sg-section-title">6. Tarjetas (Cards: radio 16, padding 24, hover reactivo)</h2>
          <div class="sg-cards-grid">
            <app-card>
              <div class="card-inner">
                <div class="flex items-center justify-between mb-3">
                  <app-badge variant="info">Tema 103</app-badge>
                  <span class="text-xs text-[var(--text-muted)]">Subtema 103.4</span>
                </div>
                <h3 class="text-lg font-semibold mb-2">Tarjeta Estándar (Lectura)</h3>
                <p class="text-sm text-[var(--text-muted)] mb-4">
                  Esta tarjeta sirve como contenedor pasivo para contenidos de estudio, pasos de laboratorio o enunciados.
                </p>
                <div class="mt-auto pt-3 border-t border-[var(--border)] text-xs text-[var(--text-subtle)]">
                  Radio 16px · Padding 24px
                </div>
              </div>
            </app-card>

            <app-card [interactive]="true" (cardClick)="cardClicked.set(true)">
              <div class="card-inner">
                <div class="flex items-center justify-between mb-3">
                  <app-badge variant="primary">Clickable</app-badge>
                  <span class="text-xs text-[var(--primary-text)] font-semibold">Interactivo</span>
                </div>
                <h3 class="text-lg font-semibold mb-2">Tarjeta Interactiva (Navegación)</h3>
                <p class="text-sm text-[var(--text-muted)] mb-4">
                  Presenta elevación de 2px y borde primario en hover. Clickea para probar el evento reactivo.
                </p>
                @if (cardClicked()) {
                  <p class="text-xs text-[var(--success)] font-semibold mt-auto">¡Evento cardClick detectado!</p>
                } @else {
                  <p class="text-xs text-[var(--text-muted)] mt-auto">Haz clic para interactuar</p>
                }
              </div>
            </app-card>
          </div>
        </section>

        <!-- 7. Callouts (Avisos de 5 tipos) -->
        <section class="sg-section" id="callouts">
          <h2 class="sg-section-title">7. Callouts (Avisos con barra lateral de 3 px)</h2>
          <app-callout type="tip" title="Consejo de estudio">
            Recuerde que el comando <code>tee -a</code> permite añadir información a un archivo sin sobrescribir el contenido existente.
          </app-callout>

          <app-callout type="info" title="Información técnica">
            La tubería <code>|</code> conecta el descriptor stdout del proceso emisor con el stdin del receptor.
          </app-callout>

          <app-callout type="exam" title="Pregunta típica de examen LPIC-1">
            En el examen 101-500 es frecuente encontrar preguntas sobre la diferencia entre <code>&gt;</code> (sobrescribir) y <code>&gt;&gt;</code> (añadir).
          </app-callout>

          <app-callout type="warning" title="Precaución con comandos destructivos">
            El operador <code>&gt;</code> trunca el archivo destino a 0 bytes de inmediato si tiene permisos de escritura.
          </app-callout>

          <app-callout type="danger" title="Error en ejecución">
            El archivo indicado no existe o no tiene los permisos necesarios para ejecutar la acción.
          </app-callout>
        </section>

        <!-- 8. Tabs, Código y Empty State -->
        <section class="sg-section" id="componentes-estudio">
          <h2 class="sg-section-title">8. Componentes de Estudio (Tabs, CodeBlock, EmptyState)</h2>

          <div class="sg-subcard mb-6">
            <h3 class="sg-subcard-title mb-4">Pestañas Funcionales (Tabs)</h3>
            <app-tabs
              [tabs]="sampleTabs"
              [(activeId)]="activeTabId"
            />
            <div class="p-4 bg-[var(--surface-muted)] rounded-b-lg border-x border-b border-[var(--border)] mt-[-1px]">
              <p class="text-sm">Contenido activo de la pestaña: <strong class="text-[var(--primary-text)]">{{ activeTabId() }}</strong></p>
            </div>
          </div>

          <div class="sg-subcard mb-6">
            <h3 class="sg-subcard-title mb-2">Bloque de Código con Copiado</h3>
            <app-code-block
              filename="pipes-filters.sh"
              language="bash"
              code="cat /etc/passwd | cut -d: -f1,7 | grep '/bin/bash' | sort"
            />
          </div>

          <div class="sg-subcard">
            <h3 class="sg-subcard-title mb-4">Estado Vacío (EmptyState)</h3>
            <app-empty-state
              title="No se encontraron notas de estudio"
              description="Aún no has tomado notas personales para este subtema. Las notas que crees durante la lectura se sincronizarán localmente."
            >
              <app-button variant="primary" size="md">Crear primera nota</app-button>
            </app-empty-state>
          </div>
        </section>

        <!-- 9. Formularios (Input, Select, Textarea) -->
        <section class="sg-section" id="formularios">
          <h2 class="sg-section-title">9. Controles de Formulario</h2>
          <div class="sg-form-grid">
            <div class="sg-form-col">
              <app-input
                label="Nombre de comando"
                placeholder="Ej: grep, awk, sed"
                hint="Nombre exacto del binario para buscar en el glosario"
                [(value)]="commandSearch"
              />

              <app-input
                label="Campo con error de validación"
                [value]="'texto invalido'"
                error="El comando contiene caracteres no permitidos en sintaxis POSIX"
              />
            </div>

            <div class="sg-form-col">
              <app-select
                label="Filtrar por Tema"
                [options]="topicOptions"
                [(value)]="selectedTopic"
                hint="Selecciona un tema para filtrar los recursos"
              />

              <app-textarea
                label="Comentario o reporte de errata"
                placeholder="Describe la inconsistencia detectada en el reactivo..."
                [rows]="3"
                hint="Las erratas se almacenan localmente y se pueden exportar"
              />
            </div>
          </div>
        </section>

        <!-- 10. Diálogos Modales Accesibles -->
        <section class="sg-section" id="dialogos">
          <h2 class="sg-section-title">10. Diálogo Modal Accesible</h2>
          <p class="sg-section-desc">
            Modal con backdrop blur, trampeo de foco, cierre mediante botón accesible, clic exterior o tecla Escape.
          </p>

          <app-button variant="warning" (btnClick)="isDialogOpen.set(true)">
            Abrir Diálogo de Confirmación
          </app-button>

          <app-dialog
            title="¿Reiniciar progreso de estudio?"
            [(open)]="isDialogOpen"
          >
            <p class="text-sm text-[var(--text)] mb-3">
              Esta acción restablecerá todas las respuestas del simulador y el estado de lectura de las diapositivas del Tema 103.
            </p>
            <p class="text-xs text-[var(--danger-text)] font-medium">
              Esta operación no se puede deshacer una vez confirmada.
            </p>

            <div actions class="flex items-center gap-2">
              <app-button variant="ghost" (btnClick)="isDialogOpen.set(false)">Cancelar</app-button>
              <app-button variant="destructive" (btnClick)="isDialogOpen.set(false)">Confirmar reinicio</app-button>
            </div>
          </app-dialog>
        </section>

        <!-- 11. Métricas, Progreso y Skeleton -->
        <section class="sg-section" id="progreso-metricas">
          <h2 class="sg-section-title">11. Métricas de Estudio & Carga</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <app-stat-card
              title="Progreso Tema 103"
              value="85%"
              badgeText="Avanzado"
              tone="success"
              subtitle="17 de 20 lecciones completadas"
            />
            <app-stat-card
              title="Simulacro LPIC-1"
              value="480 / 500"
              badgeText="Aprobado"
              tone="warning"
              subtitle="Nota mínima para aprobar: 500"
            />
            <app-stat-card
              title="Preguntas Practicadas"
              value="142"
              badgeText="Tema 103"
              tone="primary"
              subtitle="Tasa de acierto: 92%"
            />
          </div>

          <div class="sg-subcard mb-6">
            <h3 class="sg-subcard-title mb-4">Barras de Progreso (6 px)</h3>
            <div class="flex flex-col gap-4">
              <div>
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>General: 65%</span>
                  <span>Primario</span>
                </div>
                <app-progress-bar [value]="65" variant="primary" />
              </div>
              <div>
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>Objetivos cubiertos: 100%</span>
                  <span>Éxito</span>
                </div>
                <app-progress-bar [value]="100" variant="success" />
              </div>
              <div>
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>Simulador restante: 40%</span>
                  <span>Aviso</span>
                </div>
                <app-progress-bar [value]="40" variant="warning" />
              </div>
            </div>
          </div>

          <div class="sg-subcard">
            <h3 class="sg-subcard-title mb-3">Skeletons de Carga Asíncrona</h3>
            <div class="flex flex-col gap-3">
              <app-skeleton height="24px" width="40%" />
              <app-skeleton height="16px" width="90%" />
              <app-skeleton height="16px" width="75%" />
              <div class="flex gap-4 mt-2">
                <app-skeleton height="40px" width="120px" rounded="sm" />
                <app-skeleton height="40px" width="120px" rounded="sm" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </app-container>
  `,
  styles: [`
    .styleguide-page {
      padding: 40px 0 80px 0;
    }

    .sg-header {
      margin-bottom: 48px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 32px;
    }

    .sg-header-badge {
      margin-bottom: 12px;
    }

    .sg-title {
      font-size: 32px;
      line-height: 40px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 12px 0;
    }

    .sg-subtitle {
      font-size: 16px;
      line-height: 26px;
      color: var(--text-muted);
      max-width: 800px;
      margin: 0;
    }

    .sg-section {
      margin-bottom: 64px;
      padding-top: 16px;
    }

    .sg-section-title {
      font-size: 24px;
      line-height: 32px;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 8px 0;
    }

    .sg-section-desc {
      font-size: 14px;
      line-height: 22px;
      color: var(--text-muted);
      margin: 0 0 24px 0;
    }

    /* Colores */
    .sg-colors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .sg-color-swatch {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background-color: var(--surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    .swatch-preview {
      height: 52px;
      width: 100%;
      border-radius: var(--radius-xs);
      border: 1px solid var(--border);
      margin-bottom: 8px;
    }

    .swatch-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 2px;
    }

    .swatch-var {
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .swatch-primary {
      background-color: var(--primary);
    }

    .swatch-success {
      background-color: var(--success);
    }

    .swatch-warning {
      background-color: var(--warning);
    }

    .swatch-danger {
      background-color: var(--danger);
    }

    .swatch-info {
      background-color: var(--info);
    }

    .swatch-surface {
      background-color: var(--surface-muted);
    }

    /* Tipografia */
    .sg-typography-stack {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    .type-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }

    .type-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .type-meta {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-subtle);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .type-display {
      font-size: 44px;
      line-height: 52px;
      font-weight: 800;
      margin: 0;
      color: var(--text);
    }

    .type-h1 {
      font-size: 32px;
      line-height: 40px;
      font-weight: 700;
      margin: 0;
      color: var(--text);
    }

    .type-h2 {
      font-size: 24px;
      line-height: 32px;
      font-weight: 600;
      margin: 0;
      color: var(--text);
    }

    .type-h3 {
      font-size: 18px;
      line-height: 26px;
      font-weight: 600;
      margin: 0;
      color: var(--text);
    }

    .type-body {
      font-size: 15px;
      line-height: 24px;
      margin: 0;
      color: var(--text);
    }

    .type-small {
      font-size: 13px;
      line-height: 20px;
      margin: 0;
      color: var(--text-muted);
    }

    .type-caption {
      font-size: 12px;
      line-height: 16px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 0;
      color: var(--text-subtle);
    }

    /* Botones */
    .sg-buttons-table {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sg-button-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 20px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }

    .sg-row-header {
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding-bottom: 6px;
    }

    .sg-row-content {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .sg-size-group,
    .sg-state-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    /* Badges */
    .sg-badges-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    .sg-badges-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sg-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .sg-flex-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    /* Subcards y Layouts */
    .sg-chips-kbd-grid,
    .sg-cards-grid,
    .sg-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .sg-subcard {
      padding: 24px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    .sg-subcard-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 12px 0;
    }

    .card-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sg-form-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
  `]
})
export class StyleGuidePageComponent {
  readonly buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'warning', 'destructive', 'link'];
  readonly buttonSizes: ButtonSize[] = ['sm', 'md', 'lg', 'icon'];
  readonly badgeVariants: BadgeVariant[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

  // Estados interactivos
  readonly chip1Selected = signal<boolean>(true);
  readonly chip2Selected = signal<boolean>(false);
  readonly cardClicked = signal<boolean>(false);
  readonly isDialogOpen = signal<boolean>(false);

  readonly commandSearch = signal<string>('grep');
  readonly selectedTopic = signal<string>('103');

  readonly activeTabId = signal<string>('teoria');

  readonly sampleTabs: TabItem[] = [
    { id: 'teoria', label: 'Teoría Oficial', badge: 19 },
    { id: 'practica', label: 'Práctica Guiada', badge: 6 },
    { id: 'preguntas', label: 'Preguntas LPIC-1', badge: 43 },
    { id: 'comandos', label: 'Comandos Clave' }
  ];

  readonly topicOptions: SelectOption[] = [
    { value: '101', label: 'Tema 101: Arquitectura del sistema' },
    { value: '102', label: 'Tema 102: Instalación de Linux y paquetes' },
    { value: '103', label: 'Tema 103: Comandos GNU y Unix' },
    { value: '104', label: 'Tema 104: Dispositivos y sistemas de ficheros' }
  ];

  handleRemoveChip(): void {
    // Demo de remoción
  }
}
