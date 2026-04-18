# slides-grab validate 동작 과정 및 주요 구성

`slides-grab validate` (alias: `lint`)는 생성된 슬라이드 HTML 파일이 프레임워크의 설계 규칙(720pt x 405pt 사이즈, 로컬 에셋 사용, 레이아웃 정합성 등)을 준수하는지 검사하는 **Playwright 기반의 자동화 검증 도구**입니다.

## 1. 주요 동작 프로세스

validation 프로세스는 크게 **CLI 파싱 -> 브라우저 실행 -> 슬라이드 스캔 -> 결과 리포트**의 4단계로 진행됩니다.

### 단계별 흐름
1.  **CLI 호출**: `slides-grab validate --slides-dir <path>` 명령이 실행되면 `bin/ppt-agent.js`를 거쳐 `scripts/validate-slides.js`가 구동됩니다.
2.  **브라우저 환경 구축**: Playwright(Chromium)를 헤드리스 모드로 실행하고, 슬라이드 표준 해상도에 맞춘 뷰포트를 설정합니다.
3.  **슬라이드 로드 및 실행**:
    *   각 `slide-*.html` 파일을 브라우저 탭으로 띄웁니다.
    *   `document.fonts.ready`를 기다려 웹 폰트 로드 완료를 보장합니다.
4.  **인페이지 검사 (In-page Inspection)**: `page.evaluate`를 통해 브라우저 내부에서 JavaScript를 실행하여 DOM 구조와 계산된 스타일(Computed Styles)을 분석합니다.
5.  **결과 집계**: 발견된 이슈를 `critical` (에러)과 `warning` (경고)으로 분류하여 요약 리포트를 출력합니다.

---

## 2. 주요 검증 규칙 (Validation Rules)

`src/validation/core.js`의 `inspectSlide` 함수에서 수행되는 주요 검사 항목들입니다.

### A. 환경 및 의존성 (Environment)
- **Tailwind CDN**: 슬라이드 헤더에 `https://cdn.tailwindcss.com` 스크립트가 포함되어 있는지 확인합니다.
- **Editor Residue**: 편집기 런타임에서 주입하는 `<base>` 태그나 디버그용 `<script>`가 파일에 남아있는지 체크합니다. (배포/변환 전 제거 필수)

### B. 레이아웃 및 렌더링 (Layout)
- **Overflow Check**: 요소의 Bounding Box가 슬라이드 프레임(`720pt x 405pt`)을 벗어나는지 확인합니다.
- **Text Clipping**: 텍스트 요소의 `scrollHeight`가 `clientHeight`보다 커서 글자가 잘리는 현상을 감지합니다.
- **Sibling Overlap (Warning)**: 형제 요소들끼리 겹치는 경우 경고를 발생시켜 가독성 이슈를 예고합니다.

### C. 에셋 컨트랙트 (Asset Contract)
- **Local Asset Existence**: `./assets/` 경로로 지정된 이미지/비디오 파일이 실제 파일 시스템에 존재하는지 확인합니다.
- **Remote URL Blocking**: `http(s)://` 형태의 외부 에셋 URL 사용을 금지합니다 (PDF/PPTX 변환 안정성을 위해 로컬 다운로드 권장).
- **Background Usage**: `body` 외의 요소에서 `background-image`를 사용하는 것을 제한합니다 (대신 `<img>` 태그 사용 권장).

---

## 3. 핵심 코드 구현

### `scripts/validate-slides.js` (실행 엔트리)
```javascript
export async function validateSlides(slidesDir, { selectedSlides = [] } = {}) {
  const slideFiles = selectSlideFiles(await findSlideFiles(slidesDir), selectedSlides, slidesDir);
  
  // Playwright 브라우저 실행
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 슬라이드별 스캔 실행
    const slides = await scanSlides(page, slidesDir, slideFiles);
    return createValidationResult(slides);
  } finally {
    await browser.close();
  }
}
```

### `src/validation/core.js` (DOM 검사 로직)
```javascript
// page.evaluate 내부에서 실행되는 텍스트 클리핑 검사 로직 일부
const textElements = Array.from(document.querySelectorAll(textSelector));
for (const element of textElements) {
  if (!isVisible(element)) continue;
  
  const clipped = element.scrollHeight > element.clientHeight;
  if (clipped) {
    critical.push({
      code: 'text-clipped',
      message: 'Text element is clipped because scrollHeight is larger than clientHeight.',
      element: elementPath(element),
      metrics: { scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }
    });
  }
}
```

---

## 4. AI 에이전트 활용 프롬프트

에이전트(Claude/Codex)는 슬라이드를 생성하거나 수정할 때 `validate` 결과를 참고하여 스스로 코드를 교정합니다.

### Design Skill 워크플로우 (Stage 2)
`skills/slides-grab-design/SKILL.md`에 정의된 핵심 지침입니다:
> 10. Run `slides-grab validate --slides-dir <path>` after generation or edits.
> 11. If validation fails, **automatically fix the source slide HTML (Tailwind classes)** and re-run validation until it passes.

### Editor Codex Prompt (`src/editor/editor-codex-prompt.md`)
편집기 사용 시 에이전트에게 전달되는 전용 프롬프트입니다:
> ## Edit Workflow
> 1. Read the target slide HTML file.
> 2. Apply the user's edit request using Tailwind CSS.
> 3. **Run `slides-grab validate --slides-dir <path>` after editing.**
> 4. **If validation fails, fix the HTML/CSS and re-run until it passes.**

---

## 5. 요약 및 기대 효과
- **일관성 보장**: 모든 슬라이드가 표준 규격(16:9)을 준수하도록 강제합니다.
- **무중단 변환**: PPTX/PDF 변환 단계에서 발생할 수 있는 렌더링 에러를 사전에 차단합니다.
- **에이전트 자기 교정**: 에이전트에게 명확한 피드백 루프를 제공하여 고품질 결과물을 유도합니다.
