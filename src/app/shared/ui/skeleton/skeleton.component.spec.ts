import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent, SkeletonRadius } from './skeleton.component';

@Component({
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <app-skeleton
      [width]="width()"
      [height]="height()"
      [rounded]="rounded()"
    />
  `
})
class TestHostComponent {
  readonly width = signal<string>('200px');
  readonly height = signal<string>('30px');
  readonly rounded = signal<SkeletonRadius>('full');
}

describe('SkeletonComponent', () => {
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

  it('debe aplicar anchura, altura, radio variable y aria-hidden', () => {
    const el = fixture.nativeElement.querySelector('.skeleton-pulse');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('30px');
    expect(el.style.borderRadius).toBe('var(--radius-full)');
  });

  it('debe actualizarse reactivamente cuando cambian las dimensiones', () => {
    host.width.set('50%');
    host.height.set('10px');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.skeleton-pulse');
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('10px');
  });
});

