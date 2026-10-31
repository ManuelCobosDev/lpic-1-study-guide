import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block, CalloutType } from '../../core/models/block.model';
import { HeadingBlockComponent } from './heading-block.component';
import { ParagraphBlockComponent } from './paragraph-block.component';
import { CodeBlockComponent } from '../ui/code-block/code-block.component';
import { TerminalBlockComponent } from './terminal-block.component';
import { CalloutComponent } from '../ui/callout/callout.component';
import { StepsBlockComponent } from './steps-block.component';
import { TableBlockComponent } from './table-block.component';
import { DiagramViewComponent } from '../diagram/diagram-view.component';
import { QuizInlineBlockComponent } from './quiz-inline-block.component';
import { SlideHtmlBlockComponent } from './slide-html-block.component';
import { DiagramSpec } from '../../core/models/diagram.model';

@Component({
  selector: 'app-block-renderer',
  standalone: true,
  imports: [
    CommonModule,
    HeadingBlockComponent,
    ParagraphBlockComponent,
    CodeBlockComponent,
    TerminalBlockComponent,
    CalloutComponent,
    StepsBlockComponent,
    TableBlockComponent,
    DiagramViewComponent,
    QuizInlineBlockComponent,
    SlideHtmlBlockComponent
  ],
  template: `
    @switch (block().type) {
      @case ('heading') {
        @let b = asHeading(block());
        <app-heading-block [level]="b.level" [text]="b.text" />
      }
      @case ('paragraph') {
        @let b = asParagraph(block());
        <app-paragraph-block [text]="b.text" [highlightQuery]="highlightQuery()" />
      }
      @case ('code') {
        @let b = asCode(block());
        <app-code-block
          [code]="b.code"
          [language]="b.language"
          [filename]="b.title ?? ''"
          [showCopy]="true"
        />
      }
      @case ('terminal') {
        @let b = asTerminal(block());
        <app-terminal-block [lines]="b.lines" />
      }
      @case ('callout') {
        @let b = asCallout(block());
        <app-callout [type]="getCalloutType(b.calloutType)" [title]="b.title ?? ''">
          <p class="m-0 leading-relaxed">{{ b.content }}</p>
        </app-callout>
      }
      @case ('steps') {
        @let b = asSteps(block());
        <app-steps-block [items]="b.items" />
      }
      @case ('table') {
        @let b = asTable(block());
        <app-table-block
          [headers]="b.headers"
          [rows]="b.rows"
          [caption]="b.caption"
        />
      }
      @case ('diagram') {
        @let b = asDiagram(block());
        <app-diagram-view [spec]="asDiagramSpec(b.spec, b.kind, b.alt, b.title, b.caption)" />
      }
      @case ('quiz-inline') {
        @let b = asQuizInline(block());
        <app-quiz-inline-block
          [id]="b.id"
          [question]="b.question"
          [options]="b.options"
          [correct]="b.correct"
          [explanation]="b.explanation"
        />
      }
      @case ('slide-html') {
        @let b = asSlideHtml(block());
        <app-slide-html-block
          [assetPath]="b.assetPath"
          [title]="b.title"
        />
      }
      @case ('list') {
        @let b = asList(block());
        @if (b.ordered) {
          <ol class="list-decimal pl-5 my-3 space-y-1 text-sm sm:text-base text-[var(--text)]">
            @for (item of b.items; track $index) {
              <li>{{ item }}</li>
            }
          </ol>
        } @else {
          <ul class="list-disc pl-5 my-3 space-y-1 text-sm sm:text-base text-[var(--text)]">
            @for (item of b.items; track $index) {
              <li>{{ item }}</li>
            }
          </ul>
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockRendererComponent {
  readonly block = input.required<Block>();
  readonly highlightQuery = input<string>('');

  // Type casts auxiliares para el template
  asHeading(b: Block) { return b as Extract<Block, { type: 'heading' }>; }
  asParagraph(b: Block) { return b as Extract<Block, { type: 'paragraph' }>; }
  asCode(b: Block) { return b as Extract<Block, { type: 'code' }>; }
  asTerminal(b: Block) { return b as Extract<Block, { type: 'terminal' }>; }
  asCallout(b: Block) { return b as Extract<Block, { type: 'callout' }>; }
  asSteps(b: Block) { return b as Extract<Block, { type: 'steps' }>; }
  asTable(b: Block) { return b as Extract<Block, { type: 'table' }>; }
  asDiagram(b: Block) { return b as Extract<Block, { type: 'diagram' }>; }
  asQuizInline(b: Block) { return b as Extract<Block, { type: 'quiz-inline' }>; }
  asSlideHtml(b: Block) { return b as Extract<Block, { type: 'slide-html' }>; }
  asList(b: Block) { return b as Extract<Block, { type: 'list' }>; }

  getCalloutType(type: string): CalloutType {
    if (['tip', 'info', 'warning', 'exam', 'danger'].includes(type)) {
      return type as CalloutType;
    }
    return 'info';
  }

  asDiagramSpec(spec: Record<string, unknown>, kind: string, alt: string, title?: string, caption?: string): DiagramSpec {
    return {
      kind: (spec['kind'] ?? kind) as DiagramSpec['kind'],
      title: (spec['title'] ?? title) as string | undefined,
      caption: (spec['caption'] ?? caption) as string | undefined,
      alt: (spec['alt'] ?? alt) as string,
      direction: spec['direction'] as DiagramSpec['direction'],
      nodes: (spec['nodes'] ?? []) as DiagramSpec['nodes'],
      edges: (spec['edges'] ?? []) as DiagramSpec['edges'],
      groups: spec['groups'] as DiagramSpec['groups'],
      legend: spec['legend'] as boolean | undefined
    };
  }
}
