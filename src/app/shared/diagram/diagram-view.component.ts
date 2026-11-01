import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramScene, DiagramSpec, DiagramTone } from '../../core/models/diagram.model';
import { layoutDiagram } from '../../core/engines/diagram/layout.engine';

@Component({
  selector: 'app-diagram-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <figure class="diagram-figure my-6" [attr.aria-label]="scene().alt">
      @if (scene().title) {
        <h3 class="diagram-title text-sm font-bold text-[var(--text)] mb-2">
          {{ scene().title }}
        </h3>
      }

      <div class="diagram-canvas-container overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
        <svg
          [attr.viewBox]="scene().viewBox"
          [attr.width]="scene().width"
          [attr.height]="scene().height"
          class="diagram-svg max-w-full h-auto block mx-auto select-none font-sans"
          role="img"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="descId"
        >
          <title [id]="titleId">{{ scene().title ?? 'Diagrama LPIC-1' }}</title>
          <desc [id]="descId">{{ scene().alt }}</desc>

          <defs>
            <!-- Marcadores de flecha para aristas por tono -->
            @for (tone of supportedTones; track tone) {
              <marker
                [id]="'arrow-' + tone"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" [attr.fill]="getMarkerFill(tone)" />
              </marker>
            }

            <!-- Filtro de sombra sutil para nodos -->
            <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.08" />
            </filter>
          </defs>

          <!-- 1. Grupos envolventes -->
          @for (grp of scene().groups; track grp.id) {
            <g class="diagram-group">
              <rect
                [attr.x]="grp.x"
                [attr.y]="grp.y"
                [attr.width]="grp.width"
                [attr.height]="grp.height"
                rx="10"
                class="fill-transparent stroke-[var(--border-strong)] stroke-dash-2"
                stroke-dasharray="4 4"
                stroke-width="1.5"
              />
              <text
                [attr.x]="grp.x + 8"
                [attr.y]="grp.y + 14"
                class="text-[11px] font-mono font-semibold fill-[var(--text-muted)]"
              >
                {{ grp.label }}
              </text>
            </g>
          }

          <!-- 2. Aristas (Edges) -->
          @for (edge of scene().edges; track edge.from + '-' + edge.to) {
            <g class="diagram-edge">
              <path
                [attr.d]="edge.path"
                [attr.stroke]="getStrokeColor(edge.tone)"
                [attr.stroke-width]="edge.primary ? 2.5 : 1.5"
                [attr.stroke-dasharray]="edge.style === 'dashed' ? '4 3' : null"
                fill="none"
                [attr.marker-end]="edge.markerEnd"
              />
              @if (edge.label && edge.labelPos) {
                <g [attr.transform]="'translate(' + edge.labelPos.x + ',' + edge.labelPos.y + ')'">
                  <rect
                    x="-4"
                    y="-11"
                    [attr.width]="edge.label.length * 7 + 10"
                    height="16"
                    rx="4"
                    class="fill-[var(--surface)] stroke-[var(--border)] stroke-1"
                  />
                  <text
                    x="1"
                    y="1"
                    class="text-[11px] font-sans font-medium fill-[var(--text-muted)]"
                    text-anchor="start"
                  >
                    {{ edge.label }}
                  </text>
                </g>
              }
            </g>
          }

          <!-- 3. Nodos -->
          @for (node of scene().nodes; track node.id) {
            <g
              class="diagram-node transition-transform duration-150"
              [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
              filter="url(#node-shadow)"
            >
              <!-- Forma del nodo (box, pill, cylinder) -->
              @if (node.shape === 'pill') {
                <rect
                  x="0"
                  y="0"
                  [attr.width]="node.width"
                  [attr.height]="node.height"
                  [attr.rx]="node.height / 2"
                  [attr.fill]="getNodeFill(node.tone)"
                  [attr.stroke]="getNodeStroke(node.tone)"
                  stroke-width="1.5"
                />
              } @else if (node.shape === 'cylinder') {
                <rect
                  x="0"
                  y="0"
                  [attr.width]="node.width"
                  [attr.height]="node.height"
                  rx="6"
                  [attr.fill]="getNodeFill(node.tone)"
                  [attr.stroke]="getNodeStroke(node.tone)"
                  stroke-width="1.5"
                />
                <ellipse
                  [attr.cx]="node.width / 2"
                  cy="6"
                  [attr.rx]="node.width / 2 - 2"
                  ry="4"
                  fill="none"
                  [attr.stroke]="getNodeStroke(node.tone)"
                  stroke-width="1.2"
                />
              } @else {
                <rect
                  x="0"
                  y="0"
                  [attr.width]="node.width"
                  [attr.height]="node.height"
                  rx="8"
                  [attr.fill]="getNodeFill(node.tone)"
                  [attr.stroke]="getNodeStroke(node.tone)"
                  stroke-width="1.5"
                />
              }

              <!-- Badge numerado opcional (ej. paso 1, 2, 3) -->
              @if (node.badge) {
                <g transform="translate(6, 6)">
                  <circle cx="10" cy="10" r="10" [attr.fill]="getNodeStroke(node.tone)" />
                  <text
                    x="10"
                    y="14"
                    text-anchor="middle"
                    class="text-[11px] font-bold fill-[var(--surface)]"
                  >
                    {{ node.badge }}
                  </text>
                </g>
              }

              <!-- Texto del nodo (etiqueta y subetiqueta) -->
              <text
                [attr.x]="node.badge ? 32 : node.width / 2"
                [attr.y]="node.sublabel ? (node.height / 2) - 3 : (node.height / 2) + 4"
                [attr.text-anchor]="node.badge ? 'start' : 'middle'"
                class="text-[13px] font-semibold"
                [attr.fill]="getTextColor(node.tone)"
              >
                {{ node.label }}
              </text>

              @if (node.sublabel) {
                <text
                  [attr.x]="node.badge ? 32 : node.width / 2"
                  [attr.y]="(node.height / 2) + 13"
                  [attr.text-anchor]="node.badge ? 'start' : 'middle'"
                  class="text-[11px] font-normal"
                  [attr.fill]="getTextColor(node.tone)"
                  opacity="0.85"
                >
                  {{ node.sublabel }}
                </text>
              }
            </g>
          }

          <!-- 4. Leyenda opcional abajo -->
          @if (scene().legend; as legendItems) {
            <g [attr.transform]="'translate(16, ' + (scene().height - 24) + ')'">
              <text x="0" y="11" class="text-[11px] font-mono font-medium fill-[var(--text-muted)]">
                Leyenda:
              </text>
              @for (item of legendItems; track item.tone; let idx = $index) {
                <g [attr.transform]="'translate(' + (60 + idx * 90) + ', 0)'">
                  <rect
                    x="0"
                    y="2"
                    width="12"
                    height="12"
                    rx="3"
                    [attr.fill]="getNodeFill(item.tone)"
                    [attr.stroke]="getNodeStroke(item.tone)"
                    stroke-width="1.2"
                  />
                  <text x="18" y="12" class="text-[11px] font-sans fill-[var(--text)]">
                    {{ item.label }}
                  </text>
                </g>
              }
            </g>
          }
        </svg>

        <!-- Representación accesible oculta para lectores de pantalla -->
        <ol class="sr-only">
          @for (n of scene().nodes; track n.id) {
            <li>
              <strong>{{ n.label }}</strong>
              @if (n.sublabel) { - {{ n.sublabel }} }
            </li>
          }
        </ol>
      </div>

      @if (scene().caption) {
        <figcaption class="diagram-caption text-xs text-[var(--text-muted)] mt-2 italic text-center">
          {{ scene().caption }}
        </figcaption>
      }
    </figure>
  `,
  styles: [`
    :host {
      display: block;
    }
    .diagram-svg {
      color-scheme: light dark;
    }
    @media print {
      .diagram-canvas-container {
        border-color: var(--color-slate-800);
        background: var(--surface) !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagramViewComponent {
  readonly spec = input<DiagramSpec | DiagramScene | null>(null);

  readonly supportedTones: DiagramTone[] = [
    'neutral',
    'primary',
    'success',
    'warning',
    'danger',
    'info'
  ];

  readonly titleId = 'diagram-title-' + Math.random().toString(36).substring(2, 9);
  readonly descId = 'diagram-desc-' + Math.random().toString(36).substring(2, 9);

  readonly scene = computed<DiagramScene>(() => {
    const inputVal = this.spec();
    if (!inputVal) {
      return {
        width: 320,
        height: 120,
        viewBox: '0 0 320 120',
        nodes: [],
        edges: [],
        groups: [],
        alt: 'Diagrama vacío'
      };
    }

    // Si ya viene como DiagramScene (tiene viewBox y nodes array procesado)
    if ('viewBox' in inputVal && Array.isArray((inputVal as DiagramScene).nodes)) {
      return inputVal as DiagramScene;
    }

    return layoutDiagram(inputVal as DiagramSpec);
  });

  getNodeFill(tone: DiagramTone): string {
    switch (tone) {
      case 'primary':
        return 'var(--primary-soft)';
      case 'success':
        return 'var(--success-soft)';
      case 'warning':
        return 'var(--warning-soft)';
      case 'danger':
        return 'var(--danger-soft)';
      case 'info':
        return 'var(--info-soft)';
      case 'neutral':
      default:
        return 'var(--surface-muted)';
    }
  }

  getNodeStroke(tone: DiagramTone): string {
    switch (tone) {
      case 'primary':
        return 'var(--primary)';
      case 'success':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'danger':
        return 'var(--danger)';
      case 'info':
        return 'var(--info)';
      case 'neutral':
      default:
        return 'var(--border-strong)';
    }
  }

  getTextColor(tone: DiagramTone): string {
    switch (tone) {
      case 'primary':
        return 'var(--primary-text)';
      case 'success':
        return 'var(--success-text)';
      case 'warning':
        return 'var(--warning-text)';
      case 'danger':
        return 'var(--danger-text)';
      case 'info':
        return 'var(--info-text)';
      case 'neutral':
      default:
        return 'var(--text)';
    }
  }

  getStrokeColor(tone: DiagramTone): string {
    return this.getNodeStroke(tone);
  }

  getMarkerFill(tone: DiagramTone): string {
    return this.getNodeStroke(tone);
  }
}
