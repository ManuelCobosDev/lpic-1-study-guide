import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { CommandCardComponent } from './command-card.component';
import { Command } from '../../../../core/models/command.model';

describe('CommandCardComponent', () => {
  let component: CommandCardComponent;
  let fixture: ComponentFixture<CommandCardComponent>;

  const mockCommand: Command = {
    id: 'tee',
    name: 'tee',
    synopsis: 'tee [OPCIÓN]... [ARCHIVO]...',
    description: 'Copia stdin a archivo y stdout.',
    category: 'Redirecciones y Tuberías',
    subtopicIds: ['103.4'],
    example: 'ls | tee out.txt',
    flags: [{ flag: '-a', description: 'Añadir al archivo' }]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandCardComponent);
    component = fixture.componentInstance;
    component.command = mockCommand;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el nombre del comando y la categoría', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.card-name');
    const category = compiled.querySelector('.category-pill');

    expect(title?.textContent?.trim()).toBe('tee');
    expect(category?.textContent?.trim()).toBe('Redirecciones y Tuberías');
  });

  it('debe mostrar el texto de "Más detalles (1 flags)" cuando isExpanded es false', () => {
    fixture.componentRef.setInput('isExpanded', false);
    fixture.detectChanges();

    const toggleBtn = (fixture.nativeElement as HTMLElement).querySelector('.card-expand-toggle');
    expect(toggleBtn?.textContent?.trim()).toBe('Más detalles (1 flags)');
  });

  it('debe mostrar el texto de "Cerrar detalles" cuando isExpanded es true', () => {
    fixture.componentRef.setInput('isExpanded', true);
    fixture.detectChanges();

    const toggleBtn = (fixture.nativeElement as HTMLElement).querySelector('.card-expand-toggle');
    expect(toggleBtn?.textContent?.trim()).toBe('Cerrar detalles');
  });

  it('debe emitir toggleExpand con el id del comando al hacer clic en el botón', () => {
    vi.spyOn(component.toggleExpand, 'emit');

    const toggleBtn = (fixture.nativeElement as HTMLElement).querySelector('.card-expand-toggle') as HTMLButtonElement;
    toggleBtn.click();

    expect(component.toggleExpand.emit).toHaveBeenCalledWith('tee');
  });

  it('debe emitir copyCommand al pulsar el botón de copiar sinopsis', () => {
    vi.spyOn(component.copyCommand, 'emit');

    const copyBtn = (fixture.nativeElement as HTMLElement).querySelector('.card-code-synopsis .copy-btn-mini') as HTMLButtonElement;
    copyBtn.click();

    expect(component.copyCommand.emit).toHaveBeenCalledWith({
      text: mockCommand.synopsis,
      id: 'syn-tee'
    });
  });
});
