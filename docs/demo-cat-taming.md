# Demo: 냥이 길들이기 강좌 (13 Slides)

This document records the E2E slide generation process for a 13-slide "Cat Taming Course" using the Slide Generation REST API.

## Session Information
- **Session ID**: `72521322-f289-40a0-9a5d-5eaf05c75214`
- **Topic**: 냥이 길들이기 강좌
- **Style**: `warm-neutral`

---

## Step 1: Create Session
**Command:**
```bash
curl -X POST http://localhost:3006/api/slides/sessions \
     -H "Content-Type: application/json" \
     -d '{"topic": "냥이 길들이기 강좌", "targetAudience": "집사 후보 및 입문 집사", "slideCount": "13"}'
```
**Response:**
```json
{
  "sessionId": "72521322-f289-40a0-9a5d-5eaf05c75214"
}
```

---

## Step 2: Planning (Style Selection)
**Command:**
```bash
curl -X POST http://localhost:3006/api/slides/planning \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "72521322-f289-40a0-9a5d-5eaf05c75214"}'
```
**SSE Event (Interrupt):**
```
data: {"event":"interrupt","message":"Waiting for human approval"}
```

---

## Step 3: Select Style & Resume
**Command:**
```bash
curl -X PATCH http://localhost:3006/api/slides/sessions/72521322-f289-40a0-9a5d-5eaf05c75214/resume \
     -H "Content-Type: application/json" \
     -d '{"styleId": "warm-neutral"}'
```
**Response:**
```json
{
  "success": true,
  "message": "State updated, ready to resume"
}
```

---

## Step 4: Planning Resume (Outline Generation)
**Command:**
```bash
curl -X POST http://localhost:3006/api/slides/planning \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "72521322-f289-40a0-9a5d-5eaf05c75214"}'
```
**Result**: 13-slide outline generated successfully.

---

## Step 5: Design Phase (HTML Generation)
**Command:**
```bash
curl -X POST http://localhost:3006/api/slides/design \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "72521322-f289-40a0-9a5d-5eaf05c75214"}'
```
**Status**: Generating 13 HTML slides (Sequential with Playwright validation).
- 현재 2/13 슬라이드 생성 완료 (진행 중)
- 생성된 파일: `slides/sessions/72521322-f289-40a0-9a5d-5eaf05c75214/` 디렉터리 내 `slide-01.html` ~ `slide-13.html`

*(배경 작업으로 생성이 계속 진행됩니다. 모든 슬라이드 생성 완료 후 해당 디렉터리를 확인해 주세요.)*
