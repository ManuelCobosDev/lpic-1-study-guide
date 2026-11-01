export interface ExtractedUnitFormat {
  mono: boolean;
  bold: string[];
  italic: string[];
}

export interface ExtractedUnitTokens {
  commands: string[];
  flags: string[];
  paths: string[];
  vars: string[];
  numbers: string[];
  terms: string[];
  acronyms: string[];
}

export interface ExtractedUnitFigure {
  file: string;
  caption: string;
}

export interface ExtractedUnit {
  id: string;
  objective: string;
  topic: string;
  kind: string;
  lesson: string;
  section: string;
  page: number;
  order: number;
  text: string;
  format: ExtractedUnitFormat;
  tokens: ExtractedUnitTokens;
  figure?: ExtractedUnitFigure;
}

export interface LedgerTokenWaiver {
  token: string;
  unit: string;
  reason: string;
}

export interface LedgerAuthorContent {
  slide?: number;
  block?: number;
  reason: string;
}

export interface Ledger {
  objective: string;
  omit?: Record<string, string>;
  tokenWaivers?: LedgerTokenWaiver[];
  authorContent?: LedgerAuthorContent[];
}

export interface SubtopicValidation {
  validadoPor: string;
  fecha: string;
  commit: string;
  hash: string;
}

export type ValidationsRegistry = Record<string, SubtopicValidation>;

export interface CoverageFailure {
  rule: number;
  title: string;
  message: string;
  details?: string[];
}

export interface CoverageReportData {
  objectiveId: string;
  topicId: string;
  totalUnits: number;
  mappedUnitsCount: number;
  omittedUnitsCount: number;
  unmappedUnits: ExtractedUnit[];
  totalTokensCount: number;
  coveredTokensCount: number;
  waivedTokensCount: number;
  missingTokensByUnit: Record<string, string[]>;
  waiversPercentage: number;
  slideCount: number;
  authorBlocksCount: number;
  questionsCount: number;
  flashcardsCount: number;
  failures: CoverageFailure[];
  passed: boolean;
}

