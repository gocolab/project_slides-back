/**
 * 슬라이드 타입명 → 페이지 레이아웃 디자인 파일명 매핑
 *
 * 정규화 규칙:
 * - 키는 항상 소문자 + trim 처리된 형태
 * - planNode에서 생성하는 canonical type명을 우선으로 등록
 * - LLM이 생성할 수 있는 변형 형태 추가 (최소화 원칙)
 *
 * 허용되는 canonical type (planNode 프롬프트에도 동일하게 명시):
 * Cover | Contents | Section Divider | Content | Statistics |
 * Quote | Timeline | Diagram | Split Layout | Chart | Team | Closing
 */

/** 타입명 → 파일명 매핑 테이블 (canonical 형태 우선) */
export const SLIDE_TYPE_TO_DESIGN_FILE: Record<string, string> = {
  // ─── Cover ───────────────────────────────────────────────
  'cover':               'cover.html',
  'title slide':         'cover.html',    // LLM 변형 대응

  // ─── Contents (목차) ─────────────────────────────────────
  'contents':            'contents.html',
  'table of contents':   'contents.html', // LLM 변형 대응

  // ─── Section Divider ─────────────────────────────────────
  'section divider':     'section-divider.html',

  // ─── Content (일반 본문) ──────────────────────────────────
  'content':             'content.html',

  // ─── Statistics ──────────────────────────────────────────
  'statistics':          'statistics.html',

  // ─── Quote ───────────────────────────────────────────────
  'quote':               'quote.html',

  // ─── Timeline ────────────────────────────────────────────
  'timeline':            'timeline.html',

  // ─── Diagram ─────────────────────────────────────────────
  'diagram':             'diagram.html',
  'diagram-tldraw':      'diagram-tldraw.html',

  // ─── Split Layout ─────────────────────────────────────────
  'split layout':        'split-layout.html',

  // ─── Chart ───────────────────────────────────────────────
  'chart':               'chart.html',

  // ─── Team ────────────────────────────────────────────────
  'team':                'team.html',

  // ─── Closing ─────────────────────────────────────────────
  'closing':             'closing.html',
};

/**
 * 타입명을 디자인 파일명으로 변환합니다.
 * @param type 슬라이드 타입명 (planNode의 plan[].type 값)
 * @returns 페이지 레이아웃 디자인 파일명 (예: 'cover.html')
 */
export function resolveDesignFile(type: string): string {
  // 1. 정규화: 소문자 + 공백 trim
  const normalized = type.toLowerCase().trim();

  // 2. 매핑 테이블에서 직접 조회
  if (SLIDE_TYPE_TO_DESIGN_FILE[normalized]) {
    return SLIDE_TYPE_TO_DESIGN_FILE[normalized];
  }

  // 3. 언더스코어 → 공백 변환 후 재조회
  const withSpaces = normalized.replace(/_/g, ' ');
  if (SLIDE_TYPE_TO_DESIGN_FILE[withSpaces]) {
    return SLIDE_TYPE_TO_DESIGN_FILE[withSpaces];
  }

  // 4. 폴백: 타입명을 kebab-case로 변환하여 파일명 생성
  const kebab = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${kebab}.html`;
}
