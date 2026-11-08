import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APP_VERSION } from '../../../core/constants/version';

export interface StorageKeyAuditItem {
  key: string;
  purpose: string;
  category: string;
  retention: string;
  serverTransmission: string;
}

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './legal-page.component.html',
  styleUrls: ['./legal-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalPageComponent {
  readonly appVersion = APP_VERSION;
  readonly lastUpdated = '8 de noviembre de 2026';
  readonly domainName = 'lpic1.manuelcobos.dev';
  readonly projectOwner = 'Manuel Cobos';
  readonly githubRepoUrl = 'https://github.com/ManuelCobosDev/lpic-1-study-guide';
  readonly githubIssuesUrl = 'https://github.com/ManuelCobosDev/lpic-1-study-guide/issues';

  readonly storageKeysInventory: readonly StorageKeyAuditItem[] = [
    {
      key: 'lpic1.v1.theme',
      purpose: 'Recuerda el modo de color elegido por el usuario (light, dark o system).',
      category: 'Técnica · Interfaz',
      retention: 'Persistente hasta borrado',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.preferences',
      purpose: 'Guarda ajustes de lectura (densidad, tamaño tipográfico, vista por defecto y fecha de último backup).',
      category: 'Técnica · Preferencias',
      retention: 'Persistente hasta borrado',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.progress',
      purpose: 'Registra los subtemas completados, diapositivas consultadas y racha de estudio activa.',
      category: 'Técnica · Servicio principal',
      retention: 'Persistente hasta borrado',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.notes',
      purpose: 'Almacena los apuntes personales escritos por el estudiante en cada subtema.',
      category: 'Técnica · Servicio principal',
      retention: 'Persistente hasta borrado',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.labs_progress',
      purpose: 'Conserva las misiones y pasos verificados en los 42 laboratorios prácticos.',
      category: 'Técnica · Servicio principal',
      retention: 'Persistente hasta borrado',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.exam_active_session',
      purpose: 'Mantiene el estado temporal de un simulacro en curso frente a recargas o cierres accidentales.',
      category: 'Técnica · Sesión activa',
      retention: 'Temporal (durante examen)',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.exam_history',
      purpose: 'Guarda el historial local de calificaciones, tiempos empleados y desglose de simulacros.',
      category: 'Técnica · Servicio principal',
      retention: 'Persistente hasta borrado',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.flashcards_progress',
      purpose: 'Registra la caja Leitner (1 a 5) y la fecha programada de repaso de cada tarjeta de estudio.',
      category: 'Técnica · Servicio principal',
      retention: 'Persistente hasta borrado',
      serverTransmission: 'Ninguna (100% local)'
    },
    {
      key: 'lpic1.v1.backup.pre-import',
      purpose: 'Instantánea de seguridad automática previa a importar un archivo JSON para permitir deshacer cambios.',
      category: 'Técnica · Integridad local',
      retention: 'Temporal local',
      serverTransmission: 'Ninguna (100% local)'
    }
  ];
}

