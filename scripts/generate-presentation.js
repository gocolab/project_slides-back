/**
 * Unified Slide Generation Script
 * 
 * Automates the Planning and Design phases via the REST API.
 * 
 * Usage:
 *   node scripts/generate-presentation.js "Topic Name" 10 "modern-dark"
 */

const API_BASE = 'http://localhost:3006/api/slides';

async function main() {
  const [topic, slideCount = "5", styleId = "modern-dark"] = process.argv.slice(2);

  if (!topic) {
    console.error('Usage: node scripts/generate-presentation.js <topic> [count] [styleId]');
    process.exit(1);
  }

  console.log(`🚀 Starting generation for: "${topic}" (${slideCount} slides, style: ${styleId})`);

  // 1. Create Session
  const sessionRes = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, slideCount, targetAudience: 'General Audience' })
  });
  
  const { sessionId } = await sessionRes.json();
  console.log(`✅ Session created: ${sessionId}`);

  // 2. Planning Phase 1: Style Selection (Interrupt)
  console.log('📝 Starting Planning (Phase 1)...');
  await runSSEPhase(`${API_BASE}/planning`, sessionId, (data) => {
    if (data.event === 'interrupt') {
      console.log('⚖️ Planning interrupted for style selection. Resuming...');
      return true; // Stop reading this stream
    }
    return false;
  });

  // 3. Resume with Style
  const resumeRes = await fetch(`${API_BASE}/sessions/${sessionId}/resume`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ styleId })
  });
  const resumeResult = await resumeRes.json();
  if (!resumeResult.success) throw new Error('Failed to resume session');
  console.log(`✅ Style "${styleId}" selected.`);

  // 4. Planning Phase 2: Outline Generation
  console.log('📝 Generating outline...');
  await runSSEPhase(`${API_BASE}/planning`, sessionId, (data) => {
    if (data.outline_generator) {
      console.log('✅ Outline generated successfully.');
      return true;
    }
    return false;
  });

  // 5. Design Phase: HTML Generation
  console.log('🎨 Generating HTML slides (this may take a few minutes)...');
  await runSSEPhase(`${API_BASE}/design`, sessionId, (data) => {
    if (data.slide_generator) {
      const slides = data.slide_generator.slides;
      slides.forEach(s => console.log(`   └─ Slide ${s.slideIndex} generated: ${s.filename}`));
      if (slides.length >= parseInt(slideCount)) {
        console.log('✅ All slides generated.');
        return true;
      }
    }
    if (data.error) {
       console.error(`❌ Error in design phase: ${data.error}`);
       process.exit(1);
    }
    return false;
  });

  console.log('\n🎉 Generation Complete!');
  console.log(`📂 Output: slides/sessions/${sessionId}/`);
}

/**
 * Shared helper to consume SSE streams
 */
async function runSSEPhase(url, sessionId, onData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep partial line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          const shouldStop = onData(json);
          if (shouldStop) {
            reader.cancel();
            return;
          }
        } catch (e) {
          // Ignore parse errors for non-JSON or partial chunks
        }
      }
    }
  }
}

main().catch(err => {
  console.error('💥 Fatal Error:', err.message);
  process.exit(1);
});
