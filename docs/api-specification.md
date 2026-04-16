# Slide Generation REST API Specification

REST API for the `slides-grab` 3-stage pipeline (Planning → Design → Export), wrapping the same CLI tools with LangGraph stateful workflows.

## Base URL
`http://localhost:3006/api/slides`

## CLI → API 매핑 비교

| CLI 명령어 | REST API | 비고 |
|:---|:---|:---|
| `slides-grab list-styles` | `GET /planning/styles` | 35개 디자인 스타일 목록 |
| `slides-grab preview-styles` | (프론트엔드 UI) | 스타일 갤러리 브라우저 표시 |
| `slide-outline.md` 작성 | `POST /planning` (SSE) | StyleId 선택 → 아웃라인 자동 생성 |
| 스타일 수동 선택 (Human-in-the-loop) | `PATCH /sessions/{id}/resume` | SSE interrupt 이후 호출 |
| `slides-grab validate` | `POST /design/validate` | Playwright 기반 슬라이드 검증 |
| `slides-grab image` | 디자인 에이전트 내부 | Nano Banana Pro 이미지 생성 |
| `slides-grab pdf` | `POST /export` + `format: "pdf"` | `scripts/html2pdf.js` 래핑 |
| `slides-grab convert` | `POST /export` + `format: "pptx"` | `convert.cjs` 래핑 (Experimental) |

---

## 1. Session Management

### [POST] `/api/slides/sessions`
새 슬라이드 생성 세션을 만듭니다. UUID 기반 sessionId를 반환하며, 이후 모든 단계에서 이 ID를 사용합니다.

**Request Body:**
```json
{
  "topic": "AI Agent Trends 2026",
  "targetAudience": "Tech Executives",
  "slideCount": "5"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3006/api/slides/sessions \
     -H "Content-Type: application/json" \
     -d '{"topic": "AI Agent Trends 2026", "targetAudience": "Tech Executives", "slideCount": "5"}'
```

**Response (200) ✅ Verified:**
```json
{
  "sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a"
}
```

---

### [GET] `/api/slides/sessions/{id}`
LangGraph checkpointer에서 현재 세션 상태를 조회합니다. Planning 완료 후에는 `stage`, `styleId`, `outline`이 포함됩니다.

**Example (cURL):**
```bash
# 초기 상태 (planning 전)
curl http://localhost:3006/api/slides/sessions/1215883c-05a2-4f38-9ea6-28713cfc987a

# Planning 완료 후
curl http://localhost:3006/api/slides/sessions/1215883c-05a2-4f38-9ea6-28713cfc987a
```

**Response (200) - 초기 상태 ✅ Verified:**
```json
{
  "state": {},
  "nextNodes": []
}
```

**Response (200) - Planning 완료 후 ✅ Verified:**
```json
{
  "stage": "design",
  "styleId": "glassmorphism",
  "nextNodes": [],
  "outline_meta": {
    "topic": "AI Agent Trends 2026",
    "targetAudience": "Tech Executives",
    "toneAndMood": "Forward-looking, strategic, insightful, authoritative",
    "style": "glassmorphism",
    "slideCount": "5",
    "aspectRatio": "16:9"
  },
  "slide_count": 5
}
```

---

## 2. Planning Phase

> **CLI 대응**: `slides-grab list-styles` → `slides-grab preview-styles` → 스타일 선택 (Human-in-the-loop) → `slide-outline.md` 생성

### [GET] `/api/slides/planning/styles`
사용 가능한 35개 디자인 스타일 목록을 반환합니다. (`src/design-styles.js` 래핑)

**Example (cURL):**
```bash
curl http://localhost:3006/api/slides/planning/styles
```

**Response (200) ✅ Verified (35개 중 일부):**
```json
{
  "styles": [
    { "id": "glassmorphism", "title": "Glassmorphism", "mood": "Premium · Tech", "bestFor": "SaaS, AI" },
    { "id": "neo-brutalism", "title": "Neo-Brutalism", "mood": "Bold · Startup", "bestFor": "Pitch decks" },
    { "id": "bento-grid", "title": "Bento Grid", "mood": "Modular · Structured", "bestFor": "Product features" },
    { "id": "dark-academia", "title": "Dark Academia", "mood": "Scholarly · Refined", "bestFor": "Education, research" },
    { "id": "modern-dark", "title": "Modern Dark", "mood": "High-impact · Dramatic", "bestFor": "Tech talks, demos" },
    { "id": "corporate-blue", "title": "Corporate Blue", "mood": "Traditional · Professional", "bestFor": "Enterprise, reports" },
    { "id": "warm-neutral", "title": "Warm Neutral", "mood": "Warm · Approachable", "bestFor": "Culture, community" }
  ]
}
```

---

### [POST] `/api/slides/planning` (SSE)
Planning 에이전트를 시작합니다. SSE(Server-Sent Events) 스트림으로 응답합니다.

**2단계로 동작합니다:**
1. 첫 번째 호출 → 스타일 목록 나열 후 `interrupt` 이벤트로 일시 정지 (Human-in-the-loop)
2. `PATCH /resume` 후 재호출 → 아웃라인 생성 완료

**Request Body:**
```json
{
  "sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a"
}
```

**Example (cURL - 1차 호출: 스타일 선택 요청):**
```bash
curl --max-time 15 -X POST http://localhost:3006/api/slides/planning \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a"}'
```

**SSE Response (1차) ✅ Verified:**
```
data: {"style_selector":{"messages":[{"lc":1,"type":"constructor","id":["langchain_core","messages","AIMessage"],"kwargs":{"content":"Available styles:\nglassmorphism: Glassmorphism\nneo-brutalism: Neo-Brutalism\n...(35개)\n\nPlease select a style ID."}}]}}

data: {"__interrupt__":[]}

data: {"event":"interrupt","message":"Waiting for human approval"}
```

**Example (cURL - 2차 호출: resume 후 아웃라인 생성):**
```bash
# 1. 먼저 스타일 선택 (PATCH resume)
curl -X PATCH http://localhost:3006/api/slides/sessions/1215883c-05a2-4f38-9ea6-28713cfc987a/resume \
     -H "Content-Type: application/json" \
     -d '{"styleId": "glassmorphism"}'

# 2. 재호출 → 아웃라인 생성 완료
curl --max-time 40 -X POST http://localhost:3006/api/slides/planning \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a"}'
```

**SSE Response (2차 - 아웃라인 생성 완료) ✅ Verified:**
```json
{
  "outline_generator": {
    "outline": {
      "meta": {
        "topic": "AI Agent Trends 2026",
        "targetAudience": "Tech Executives",
        "toneAndMood": "Forward-looking, strategic, insightful, authoritative",
        "style": "glassmorphism",
        "slideCount": "5",
        "aspectRatio": "16:9"
      },
      "slides": [
        {
          "slideNumber": 1,
          "type": "Title",
          "title": "AI Agent Trends 2026: Navigating the Autonomous Future",
          "keyMessage": "Understanding the transformative shifts in AI agent technology...",
          "details": ["A Strategic Outlook for Tech Executives"]
        },
        {
          "slideNumber": 2,
          "type": "Introduction/Context",
          "title": "The Rise of Autonomous AI Agents",
          "keyMessage": "AI agents are evolving from assistants to proactive, decision-making entities...",
          "details": ["Brief overview of current AI agent capabilities", "The leap towards greater autonomy", "Market growth and projected adoption"]
        }
      ]
    },
    "styleMetadata": {
      "id": "glassmorphism",
      "title": "Glassmorphism",
      "mood": "Premium · Tech",
      "bestFor": "SaaS, AI"
    },
    "stage": "design"
  }
}
```

---

### [PATCH] `/api/slides/sessions/{id}/resume`
Human-in-the-loop: 사용자가 스타일을 선택한 후 Planning 그래프를 재개합니다.

**Request Body:**
```json
{
  "styleId": "glassmorphism"
}
```

**Example (cURL):**
```bash
curl -X PATCH http://localhost:3006/api/slides/sessions/1215883c-05a2-4f38-9ea6-28713cfc987a/resume \
     -H "Content-Type: application/json" \
     -d '{"styleId": "glassmorphism"}'
```

**Response (200) ✅ Verified:**
```json
{
  "success": true,
  "message": "State updated, ready to resume"
}
```

---

## 3. Design Phase

> **CLI 대응**: HTML 슬라이드 직접 작성 → `slides-grab validate` → `slides-grab edit` (반복)

### [POST] `/api/slides/design` (SSE)
Design 에이전트를 시작합니다. Planning 완료 후 세션의 outline과 styleMetadata를 사용해 각 슬라이드의 HTML을 생성하고 검증합니다.

- Gemini 모델로 슬라이드 HTML 생성 (per slide)
- `scripts/validate-slides.js` (Playwright)로 각 슬라이드 검증
- 결과를 `slides/sessions/{sessionId}/` 디렉터리에 저장

**Request Body:**
```json
{
  "sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a"
}
```

**Example (cURL):**
```bash
curl --max-time 120 -N -X POST http://localhost:3006/api/slides/design \
     -H "Content-Type: application/json" \
     -H "Accept: text/event-stream" \
     -d '{"sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a"}'
```

**SSE Response (진행 중):**
```
data: {"slide_generator":{"slides":[{"slideIndex": 1, "filename": "slide-01.html", "html": "<!DOCTYPE html>...", "validationResult": {...}}]}}
```

> ⚠️ **현재 이슈**: `design.stream(null, config)` 호출 시 이미 완료된 그래프는 빈 스트림을 반환. 세션 재사용 시 `stage` 리셋 필요.

---

### [POST] `/api/slides/design/validate`
특정 슬라이드에 대해 수동으로 검증을 실행합니다. (`scripts/validate-slides.js` 직접 호출)

**Request Body:**
```json
{
  "sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a",
  "slides": ["slide-01.html", "slide-02.html"]
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3006/api/slides/design/validate \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a", "slides": ["slide-01.html"]}'
```

---

## 4. Export Phase

> **CLI 대응**: `slides-grab pdf` → `scripts/html2pdf.js` / `slides-grab convert` → `convert.cjs`

### [POST] `/api/slides/export`
HTML 슬라이드를 PDF 또는 PPTX로 변환합니다. 비동기로 처리되며 `sessionId`가 jobId로 사용됩니다.

**Request Body:**
```json
{
  "sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a",
  "format": "pdf"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3006/api/slides/export \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a", "format": "pdf"}'
```

**Response (200) ✅ Verified:**
```json
{
  "sessionId": "1215883c-05a2-4f38-9ea6-28713cfc987a",
  "status": "processing"
}
```

---

### [GET] `/api/slides/export/{jobId}`
내보내기 상태를 폴링하고 다운로드 URL을 확인합니다.

**Example (cURL):**
```bash
curl http://localhost:3006/api/slides/export/1215883c-05a2-4f38-9ea6-28713cfc987a
```

**Response (200) ✅ Verified (처리 중):**
```json
{
  "status": "processing"
}
```

**Response (200) - 완료 시:**
```json
{
  "status": "completed",
  "downloadUrl": "/api/slides/export/download?path=/slides/sessions/1215883c.../output.pdf"
}
```

---

## 완전한 E2E 플로우 예시 (cURL)

```bash
# 1. 세션 생성
SESSION_ID=$(curl -s -X POST http://localhost:3006/api/slides/sessions \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI Agent Trends 2026", "targetAudience": "Tech Executives", "slideCount": "5"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['sessionId'])")

echo "Session: $SESSION_ID"

# 2. Planning 시작 (스타일 목록 + interrupt)
curl --max-time 15 -X POST http://localhost:3006/api/slides/planning \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\"}"

# 3. 스타일 선택 (Human-in-the-loop)
curl -X PATCH "http://localhost:3006/api/slides/sessions/$SESSION_ID/resume" \
  -H "Content-Type: application/json" \
  -d '{"styleId": "glassmorphism"}'

# 4. Planning 재개 (아웃라인 생성)
curl --max-time 40 -X POST http://localhost:3006/api/slides/planning \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\"}"

# 5. 상태 확인
curl "http://localhost:3006/api/slides/sessions/$SESSION_ID"

# 6. 디자인 시작 (HTML 슬라이드 생성)
curl --max-time 180 -N -X POST http://localhost:3006/api/slides/design \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d "{\"sessionId\": \"$SESSION_ID\"}"

# 7. 내보내기
curl -X POST http://localhost:3006/api/slides/export \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"format\": \"pdf\"}"

# 8. 내보내기 상태 확인
curl "http://localhost:3006/api/slides/export/$SESSION_ID"
```
