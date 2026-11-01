import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeBlockComponent } from './code-block.component';

@Component({
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <app-code-block
      [code]="code()"
      [language]="language()"
      [filename]="filename()"
    />
  `
})
class TestHostComponent {
  readonly code = signal<string>('tar -czvf backup.tar.gz /etc');
  readonly language = signal<string>('bash');
  readonly filename = signal<string>('backup.sh');
}

describe('CodeBlockComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe renderizar el codigo, archivo y lenguaje en la cabecera', () => {
    const codeEl = fixture.nativeElement.querySelector('.code-body');
    const filenameEl = fixture.nativeElement.querySelector('.code-filename');
    const langEl = fixture.nativeElement.querySelector('.code-lang');

    expect(codeEl.textContent).toContain('tar -czvf backup.tar.gz /etc');
    expect(filenameEl.textContent).toBe('backup.sh');
    expect(langEl.textContent).toBe('bash');
  });

  it('debe actualizar el contenido reactivamente si cambia el input', () => {
    host.code.set('grep -rn "root" /etc/');
    fixture.detectChanges();
    const codeEl = fixture.nativeElement.querySelector('.code-body');
    expect(codeEl.textContent).toContain('grep -rn "root" /etc/');
  });

  it('debe mostrar el boton de copiar y manejar el clic sin error', async () => {
    const copyBtn = fixture.nativeElement.querySelector('.copy-btn');
    expect(copyBtn).toBeTruthy();

    // Simular clic sin romper si navigator.clipboard no esta en el entorno de vitest
    copyBtn.click();
    fixture.detectChanges();
    expect(copyBtn).toBeTruthy();
  });
});

