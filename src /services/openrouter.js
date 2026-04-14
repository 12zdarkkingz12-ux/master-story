// ============================================================
//  Master Story — services/openrouter.js
//  التعامل مع OpenRouter API (عادي + Streaming)
// ============================================================
const { getConfig } = require('./supabase');

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// النماذج المجانية المتاحة افتراضياً
const FREE_MODELS = [
  { id: 'meta-llama/llama-4-scout:free',          name: 'Llama 4 Scout (مجاني) — ممتاز للفصول' },
  { id: 'meta-llama/llama-4-maverick:free',        name: 'Llama 4 Maverick (مجاني) — إبداعي' },
  { id: 'google/gemma-3-27b-it:free',              name: 'Gemma 3 27B (مجاني) — سريع للأفكار' },
  { id: 'google/gemma-3-12b-it:free',              name: 'Gemma 3 12B (مجاني) — خفيف وسريع' },
  { id: 'deepseek/deepseek-r1:free',               name: 'DeepSeek R1 (مجاني) — تفصيل عميق' },
  { id: 'microsoft/phi-4-reasoning:free',          name: 'Phi 4 Reasoning (مجاني) — منطقي' },
  { id: 'qwen/qwen3-235b-a22b:free',               name: 'Qwen 3 235B (مجاني) — ضخم وقوي' },
];

async function getApiKey() {
  // أولاً من .env، ثم من قاعدة البيانات
  const envKey = process.env.OPENROUTER_API_KEY;
  if (envKey && !envKey.includes('your_key')) return envKey;
  return await getConfig('openrouter_key') || '';
}

async function getModel() {
  return await getConfig('openrouter_model') || 'meta-llama/llama-4-scout:free';
}

// ── توليد عادي (للويزرد والأفكار القصيرة) ────────────────────
async function generate(prompt, options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('مفتاح OpenRouter غير موجود. اذهب للإعدادات وأضفه.');
  }

  const model     = options.model || await getModel();
  const maxTokens = options.maxTokens || 3000;
  const start     = Date.now();

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${apiKey}`,
      'Content-Type':   'application/json',
      'HTTP-Referer':   'https://master-story.onrender.com',
      'X-Title':        'Master Story',
    },
    body: JSON.stringify({
      model,
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  maxTokens,
      temperature: options.temperature || 0.85,
      top_p:       0.95,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter Error ${response.status}: ${err}`);
  }

  const data    = await response.json();
  const text    = data.choices?.[0]?.message?.content || '';
  const elapsed = Date.now() - start;

  return { text, model, elapsed };
}

// ── توليد بـ Streaming (للفصول الطويلة) ──────────────────────
async function streamGenerate(prompt, options = {}, onChunk, onDone) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('مفتاح OpenRouter غير موجود. اذهب للإعدادات وأضفه.');
  }

  const model     = options.model || await getModel();
  const maxTokens = options.maxTokens || 4000;
  const start     = Date.now();

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${apiKey}`,
      'Content-Type':   'application/json',
      'HTTP-Referer':   'https://master-story.onrender.com',
      'X-Title':        'Master Story',
    },
    body: JSON.stringify({
      model,
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  maxTokens,
      temperature: options.temperature || 0.88,
      top_p:       0.95,
      stream:      true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter Error ${response.status}: ${err}`);
  }

  let fullText = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;

      try {
        const parsed  = JSON.parse(payload);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          if (onChunk) onChunk(content);
        }
      } catch (_) {}
    }
  }

  const elapsed = Date.now() - start;
  if (onDone) onDone(fullText, elapsed, model);
  return { text: fullText, model, elapsed };
}

// ── اختبار الاتصال ────────────────────────────────────────────
async function testConnection(apiKey, model) {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  'https://master-story.onrender.com',
      'X-Title':       'Master Story',
    },
    body: JSON.stringify({
      model:      model || 'google/gemma-3-12b-it:free',
      messages:   [{ role: 'user', content: 'قل "تم الاتصال بنجاح" فقط' }],
      max_tokens: 20,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`خطأ ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'تم';
}

module.exports = { generate, streamGenerate, testConnection, FREE_MODELS };
