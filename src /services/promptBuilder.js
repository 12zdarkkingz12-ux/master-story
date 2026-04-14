// ============================================================
//  Master Story — services/promptBuilder.js
//  بناء الـ Prompts بالعربي
// ============================================================

const GENRE_CONTEXT = {
  'فانتازيا':        'عالم سحري بقوانينه الخاصة، مخلوقات أسطورية، وصراع بين الخير والشر',
  'خيال_علمي':      'مستقبل تقني، فضاء، ذكاء اصطناعي، وتساؤلات وجودية عن الإنسانية',
  'تشويق_غموض':    'أسرار مخفية، وتيرة متصاعدة، وكل فصل ينتهي بخطاف يجذب للتالي',
  'رومانسي':        'علاقات عاطفية عميقة، توتر رومانسي، وشخصيات تتطور بمشاعرها',
  'رعب':            'رعب نفسي متصاعد، أجواء مظلمة، والخوف يُبنى من التفاصيل الصغيرة',
  'مغامرة':         'إيقاع سريع، رحلات، تحديات مستمرة، وبطولة تنمو باختبارها',
  'تاريخي':         'دقة تاريخية في العادات والملابس، شخصيات تعكس قيم عصرها',
  'واقعي':          'شخصيات عميقة نفسياً، أحداث من الحياة الفعلية، وحوار طبيعي',
  'بوليسي':         'جرائم، تحقيق منطقي، أدلة موزعة بذكاء، ونهايات مفاجئة',
  'إثارة_حرب':     'صراعات عسكرية، مواجهات إنسانية وسط الحرب، وثمن الانتصار',
};

// ── ١. توليد العالم ───────────────────────────────────────────
function buildWorldPrompt(data) {
  const { title, genre, style, darkness } = data;
  const genreCtx = GENRE_CONTEXT[genre] || 'قصة غنية بالتفاصيل';
  const darknessDesc = darkness <= 3 ? 'خفيفة وأملية'
                     : darkness <= 6 ? 'متوازنة بين الظل والنور'
                     : 'داكنة وعميقة';

  return `أنت كاتب روائي عربي محترف. مهمتك بناء عالم قصة متكامل.

## معلومات القصة
- العنوان: ${title}
- النوع الأدبي: ${genre} (${genreCtx})
- أسلوب الكتابة: ${style || 'غير محدد — اختر الأنسب'}
- درجة الظلام: ${darkness}/10 (${darknessDesc})

## المطلوب
اكتب عالم هذه القصة بالتفصيل في الأقسام التالية بالضبط:

### اسم العالم
[اسم مميز للعالم أو البيئة الرئيسية]

### القوانين العامة
[قوانين العالم الأساسية: الفيزياء، السحر، التكنولوجيا، أو النظام الاجتماعي]

### الجغرافيا والبيئة
[وصف الأماكن الرئيسية حيث ستجري الأحداث]

### القوى والفصائل
[المجموعات أو الدول أو القوى المتصارعة في هذا العالم]

### التاريخ المختصر
[ما الذي حدث قبل بدء القصة؟ ما الجروح القديمة؟]

### الجو العام
[كيف يشعر القارئ وهو في هذا العالم؟ ما الصور البصرية الغالبة؟]

### الصراع الجذري
[ما المشكلة الكبرى التي تهدد هذا العالم أو تحرك أحداثه؟]

اكتب بالعربية الفصحى المعاصرة. كن محدداً وغنياً بالتفاصيل. لا تكتب مقدمات أو تعليقات، فقط المحتوى مباشرةً.`;
}

// ── ٢. توليد الشخصيات ────────────────────────────────────────
function buildCharactersPrompt(data) {
  const { title, genre, world_data, charCount = 4 } = data;
  const worldSummary = extractWorldSummary(world_data);

  return `أنت كاتب روائي عربي محترف. مهمتك بناء شخصيات القصة.

## القصة
- العنوان: ${title}
- النوع: ${genre}

## عالم القصة
${worldSummary}

## المطلوب
أنشئ ${charCount} شخصيات رئيسية لهذه القصة. كل شخصية في هذا الشكل بالضبط:

---
### [اسم الشخصية]
**الدور:** [البطل/الخصم/الحليف/المرشد/الغامض/...]
**العمر:** [رقم أو وصف]
**الشخصية النفسية:** [وصف دقيق لطريقة تفكيره ومشاعره]
**دوافعه:** [ما الذي يريده بعمق؟ ما الذي يخاف منه؟]
**نقطة ضعفه:** [ما الذي يمكن أن يكسره؟]
**تاريخه الخاص:** [ما الذي شكّله قبل بدء القصة؟]
**كيف يتغير:** [أين يبدأ وأين ينتهي في رحلته الداخلية]
---

بعد الشخصيات، أضف قسم:

## شبكة العلاقات
[اكتب الروابط الرئيسية بين الشخصيات: من يثق بمن، من يكره من، من يخفي سراً عن من]

اكتب بالعربية الفصحى المعاصرة. لا مقدمات، المحتوى مباشرةً.`;
}

// ── ٣. توليد الخط الزمني ─────────────────────────────────────
function buildTimelinePrompt(data) {
  const { title, genre, world_data, characters } = data;
  const worldSummary = extractWorldSummary(world_data);
  const charNames    = extractCharacterNames(characters);

  return `أنت كاتب روائي عربي محترف. مهمتك رسم الخط الزمني للقصة.

## القصة
- العنوان: ${title}
- النوع: ${genre}
- الشخصيات الرئيسية: ${charNames}

## عالم القصة
${worldSummary}

## المطلوب
ارسم الخط الزمني للقصة في هذا الشكل بالضبط:

### البداية
[كيف يبدأ العالم؟ ما الوضع الطبيعي قبل أن تتحرك الأحداث؟ ما الحدث الذي يكسر هذا الوضع؟]

### التحول الأول
[ما الحدث الكبير الذي يدفع البطل/الشخصيات للمضي قدماً؟ ما الذي يتغير لا رجعة فيه؟]

### التعقيد والعقبات
[ما التحديات والعوائق التي تتصاعد؟ ما الخسائر؟ أين يصل التوتر لذروته الوسطى؟]

### الأزمة الكبرى
[اللحظة الأصعب. كل شيء يبدو ضائعاً. ما الثمن الحقيقي للمواصلة؟]

### الذروة والمواجهة
[المعركة النهائية أو اللحظة الحاسمة. كيف تتقاطع خيوط القصة كلها هنا؟]

### الخاتمة
[ما الذي يتغير في العالم والشخصيات بعد كل شيء؟ ما الذي يُكسب وما يُخسر؟]

### عدد الفصول المقترح
[اقترح عدداً منطقياً بناءً على حجم القصة]

اكتب بالعربية الفصحى المعاصرة. كن محدداً وملموساً. لا مقدمات.`;
}

// ── ٤. توليد فصل ─────────────────────────────────────────────
function buildChapterPrompt(data) {
  const {
    story, chapterNum, chapterNotes,
    prevSummaries, chapterTitle
  } = data;

  const worldSummary = extractWorldSummary(story.world_data);
  const charSummary  = extractCharactersSummary(story.characters);
  const timelineSum  = extractTimelineSummary(story.timeline);
  const prevChaps    = formatPreviousSummaries(prevSummaries);
  const darknessDesc = story.darkness <= 3 ? 'خفيفة'
                     : story.darkness <= 6 ? 'متوازنة'
                     : 'داكنة وقاسية';

  return `أنت كاتب روائي عربي محترف. مهمتك كتابة الفصل ${chapterNum} من رواية "${story.title}".

## معلومات الرواية
- **النوع:** ${story.genre}
- **الأسلوب:** ${story.style || 'أدبي معاصر'}
- **درجة الظلام:** ${story.darkness}/10 (${darknessDesc})

## عالم القصة
${worldSummary}

## الشخصيات الرئيسية
${charSummary}

## الخط الزمني العام
${timelineSum}

${prevChaps ? `## الفصول السابقة (ملخصات)\n${prevChaps}\n` : ''}

## الفصل المطلوب
- **رقم الفصل:** ${chapterNum}
${chapterTitle ? `- **عنوان مقترح:** ${chapterTitle}` : ''}
${chapterNotes ? `- **ملاحظات المؤلف:** ${chapterNotes}` : ''}

## تعليمات الكتابة
- اكتب الفصل كاملاً بلغة روائية عربية جميلة وسردية
- الطول المثالي: 1200–2000 كلمة
- ابدأ بسطر العنوان: **الفصل ${chapterNum}: [العنوان]**
- لا تكسر الاتساق مع العالم والشخصيات المذكورين
- احرص على أن ينتهي الفصل بشكل يفتح الباب للفصل التالي
- الحوار يعكس شخصية كل شخص بدقة
- الوصف حسي وملموس، لا مجرد إخبار

ابدأ الفصل الآن مباشرةً:`;
}

// ── ٥. توليد ملخص الفصل (بعد الاعتماد) ─────────────────────
function buildSummaryPrompt(chapterContent, chapterNum) {
  return `لخّص الفصل ${chapterNum} من الرواية في فقرة واحدة لا تتجاوز 120 كلمة.

ركّز على: الأحداث الرئيسية، التغييرات في الشخصيات، والنقاط المهمة للسياق.
لا تبدأ بـ "في هذا الفصل" أو أي مقدمة.

نص الفصل:
${chapterContent.substring(0, 6000)}`;
}

// ── مساعدات الاستخراج ─────────────────────────────────────────

function extractWorldSummary(worldData) {
  if (!worldData || typeof worldData !== 'object') return 'العالم غير محدد بعد';
  if (typeof worldData === 'string') return worldData;
  const parts = [];
  if (worldData.raw)         return worldData.raw;
  if (worldData.name)        parts.push(`الاسم: ${worldData.name}`);
  if (worldData.laws)        parts.push(`القوانين: ${worldData.laws}`);
  if (worldData.geography)   parts.push(`الجغرافيا: ${worldData.geography}`);
  if (worldData.conflict)    parts.push(`الصراع: ${worldData.conflict}`);
  if (worldData.atmosphere)  parts.push(`الجو: ${worldData.atmosphere}`);
  return parts.join('\n') || JSON.stringify(worldData).substring(0, 1000);
}

function extractCharacterNames(characters) {
  if (!Array.isArray(characters)) return 'شخصيات متنوعة';
  return characters.map(c => c.name || c).filter(Boolean).join('، ') || 'شخصيات متنوعة';
}

function extractCharactersSummary(characters) {
  if (!characters) return 'الشخصيات غير محددة بعد';
  if (typeof characters === 'string') return characters;
  if (Array.isArray(characters)) {
    return characters.map(c => {
      if (typeof c === 'string') return c;
      return `• ${c.name || '؟'} (${c.role || 'دور غير محدد'}): ${c.personality || ''} | الدافع: ${c.motivation || ''}`;
    }).join('\n');
  }
  if (characters.raw) return characters.raw;
  return JSON.stringify(characters).substring(0, 2000);
}

function extractTimelineSummary(timeline) {
  if (!timeline) return 'الخط الزمني غير محدد بعد';
  if (typeof timeline === 'string') return timeline;
  if (timeline.raw) return timeline.raw;
  const parts = [];
  if (timeline.beginning) parts.push(`البداية: ${timeline.beginning}`);
  if (timeline.turning)   parts.push(`التحول: ${timeline.turning}`);
  if (timeline.climax)    parts.push(`الذروة: ${timeline.climax}`);
  if (timeline.ending)    parts.push(`النهاية: ${timeline.ending}`);
  return parts.join('\n') || JSON.stringify(timeline).substring(0, 1000);
}

function formatPreviousSummaries(summaries) {
  if (!summaries || summaries.length === 0) return '';
  return summaries.map(s =>
    `**الفصل ${s.chapter_num}${s.title ? ': ' + s.title : ''}**\n${s.summary || 'بدون ملخص'}`
  ).join('\n\n');
}

module.exports = {
  buildWorldPrompt,
  buildCharactersPrompt,
  buildTimelinePrompt,
  buildChapterPrompt,
  buildSummaryPrompt,
  GENRE_CONTEXT,
};
