// ============================================================
//  Master Story — services/promptBuilder.js
//  يقبل genre كمصفوفة عربية أو نص أو JSON string
// ============================================================

// ── وصف سياقي لكل تصنيف عربي ─────────────────────────────────
const GENRE_CONTEXT = {
  // التصنيف الأساسي
  'زراعة':       'عالم زراعة (Cultivation) — تطوير القوة عبر التشي، مراحل قوة متصاعدة، كنوز روحية، صراعات الطوائف',
  'ووشيا':       'ووشيا (Wuxia) — فنون قتالية بدون سحر واسع، عشائر، شرف، السيف أقوى من كل شيء',
  'شيانشيا':     'شيانشيا (Xianxia) — الزراعة والخلود، آلهة وخالدون، عوالم عليا ودنيا، الداو بشكل فلسفي',
  'شوانهوان':    'شوانهوان (Xuanhuan) — خيال صيني حر، يجمع عناصر متعددة بحرية إبداعية',
  'فانتازيا':    'فانتازيا — عالم سحري بقوانينه الخاصة، مخلوقات أسطورية، صراع القوى الكبرى',
  'خيال_علمي':  'خيال علمي — مستقبل تقني متقدم، فضاء وكواكب، ذكاء اصطناعي، تساؤلات وجودية',
  'تشويق_غموض': 'تشويق وغموض — أسرار مخفية، وتيرة متصاعدة، كل فصل ينتهي بخطاف',
  'رومانسي':    'رومانسي — علاقات عاطفية عميقة، توتر رومانسي، شخصيات تتطور بمشاعرها',
  'رعب':        'رعب — رعب نفسي متصاعد، أجواء مظلمة، الخوف يُبنى من التفاصيل الصغيرة',
  'مغامرة':     'مغامرة — إيقاع سريع، رحلات واكتشافات، تحديات مستمرة، بطولة تنمو باختبارها',
  'تاريخي':     'تاريخي — دقة تاريخية في العادات والملابس، شخصيات تعكس قيم عصرها',
  'بوليسي':     'بوليسي — جرائم، تحقيق منطقي، أدلة موزعة بذكاء، نهايات مفاجئة',
  // نظام القوة
  'نظام_تشي':   'نظام التشي (Qi) — تطوير الطاقة الداخلية عبر التأمل والتدريب',
  'تنقية_جسد':  'تنقية الجسد (Body Refinement) — تقوية الجسد المادي حتى يصبح أقوى من السلاح',
  'زراعة_روح':  'زراعة الروح (Soul) — تطوير الوعي والقوة الروحية',
  'زراعة_دم':   'زراعة الدم (Bloodline) — وراثة قوة السلالة، دم تنين أو وحش أسطوري',
  'نظام':        'نظام المهام (System) — البطل يملك نظاماً يعطيه مهام ومكافآت',
  'حظ_قدر':     'الحظ والقدر — البطل يجذب المصادفات الإلهية والكنوز عبر قدره',
  'سلالة_وحوش': 'سلالة الوحوش — قوة الدراغون أو الوحوش الأسطورية في عروق البطل',
  // الأنماط
  'إعادة_ولادة': 'إعادة ولادة (Reincarnation) — البطل مات وبعث بذكرياته في جسد جديد',
  'رجوع_زمن':   'رجوع بالزمن (Regression) — البطل رجع لنقطة في الماضي بعد فشل أو موت',
  'انتقال_عالم': 'انتقال لعالم آخر (Isekai) — البطل انتقل من عالمه لعالم مختلف كلياً',
  'بطل_مخفي':   'قوة مخفية (Hidden OP) — البطل أقوى بكثير مما يظهر، يُستهان به في البداية',
  'عبقري':       'عبقري (Genius MC) — البطل يتفوق بذكائه وحنكته لا بالقوة فقط',
  'بطل_شرير':   'بطل شرير (Villain) — البطل يرفض الأخلاق التقليدية ويتبع مساره الخاص',
  'انتقام':      'انتقام (Revenge) — محرك القصة الرئيسي هو الأخذ بالثأر واستعادة الكرامة',
  // البيئة
  'أكاديمية':     'أكاديمية — بيئة تعليمية مع تسلسل هرمي من الطلاب والأساتذة والمنافسة',
  'طوائف':        'طوائف وعشائر — ولاء للجماعة، قوانين داخلية، صراعات بين الفصائل',
  'ممالك':        'ممالك وإمبراطوريات — سياسة وسلطة، دبلوماسية وحرب، أرستقراطية',
  'عوالم_متعددة': 'عوالم متعددة — مستويات وجودية متعددة، ما تحقق في الأدنى بسيط في الأعلى',
  // الجو
  'حريم':         'حريم (Harem) — علاقات متعددة، انجذاب أنثوي متكرر للبطل',
  'كوميدي':       'كوميدي — لحظات مضحكة وخفيفة الدم حتى في المواقف الصعبة',
  'مظلم':         'مظلم (Dark) — لا تتردد في الموت والخسارة والقرارات المؤلمة',
  'إثارة':        'إثارة — وتيرة سريعة، نهايات كل مشهد تشد القارئ للتالي',
  'نفسي':         'نفسي عميق — استكشف المونولوج الداخلي والصراعات الذاتية',
  'حياة_يومية':  'حياة يومية (Slice of Life) — تفاصيل صغيرة وعلاقات يومية',
  'نظام_ألعاب':  'نظام ألعاب (RPG) — إحصائيات ومستويات وتطور القدرات بشكل واضح',
  // المخلوقات
  'وحوش_روحية':  'وحوش روحية (Spirit Beasts) — مخلوقات ذات قوى عجيبة وأهمية في الحبكة',
  'أشباح_شياطين':'أشباح وشياطين — كيانات شريرة أو مبهمة تعيش في ظل البشر',
  'آلهة_خالدين': 'آلهة وخالدون — كائنات تتجاوز البشر بملايين السنوات',
  'أسلحة_أسطورية':'أسلحة أسطورية — سلاح له إرادة أو تاريخ أو قوة تحطم قوانين العالم',
};

// ── تحويل genre لمصفوفة (من أي شكل) ─────────────────────────
function parseGenreArray(genre) {
  if (!genre) return [];
  if (Array.isArray(genre)) return genre;
  if (typeof genre === 'string') {
    const trimmed = genre.trim();
    // JSON string
    if (trimmed.startsWith('[')) {
      try { const p = JSON.parse(trimmed); if (Array.isArray(p)) return p; } catch(_) {}
    }
    // comma-separated
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// ── بناء وصف التصنيف للـ Prompt ──────────────────────────────
function buildGenreDescription(genre) {
  const tags = parseGenreArray(genre);
  if (!tags.length) return '- النوع: غير محدد';

  const lines = tags
    .map(t => GENRE_CONTEXT[t])
    .filter(Boolean);

  if (!lines.length) return `- التصنيفات: ${tags.join(' | ')}`;

  return lines.map((l, i) => `- ${i === 0 ? '**التصنيف الأساسي**' : '**إضافي**'}: ${l}`).join('\n');
}

// ── مساعدات استخراج النص ─────────────────────────────────────
function extractWorldSummary(world_data) {
  if (!world_data) return 'غير محدد';
  // FIX #10: handle string directly
  if (typeof world_data === 'string') return world_data.substring(0, 1800);
  if (world_data.raw) return String(world_data.raw).substring(0, 1800);
  return JSON.stringify(world_data).substring(0, 1800);
}

function extractCharactersSummary(characters) {
  if (!characters) return 'غير محدد';
  if (typeof characters === 'string') return characters.substring(0, 1800);
  if (Array.isArray(characters)) return characters.join('\n').substring(0, 1800);
  return JSON.stringify(characters).substring(0, 1800);
}

function extractTimelineSummary(timeline) {
  if (!timeline) return 'غير محدد';
  if (typeof timeline === 'string') return timeline.substring(0, 1200);
  if (timeline.raw) return String(timeline.raw).substring(0, 1200);
  return JSON.stringify(timeline).substring(0, 1200);
}

function extractCharacterNames(characters) {
  if (!characters) return 'شخصيات متعددة';
  const text = typeof characters === 'string' ? characters : JSON.stringify(characters);
  const matches = text.match(/###\s+(.+)/g);
  if (matches) return matches.slice(0, 5).map(m => m.replace(/###\s+/, '')).join('، ');
  return 'شخصيات متعددة';
}

function formatPreviousSummaries(summaries) {
  if (!summaries?.length) return '';
  return summaries.map(s =>
    `**الفصل ${s.chapter_num}** (${s.title || 'بلا عنوان'}): ${s.summary || 'بلا ملخص'}`
  ).join('\n');
}

// ── ١. توليد العالم ───────────────────────────────────────────
function buildWorldPrompt(data) {
  const { title, genre, style, darkness } = data;
  const genreDesc    = buildGenreDescription(genre);
  const darknessDesc = darkness <= 3 ? 'خفيفة وأملية'
                     : darkness <= 6 ? 'متوازنة بين الظل والنور'
                     : 'داكنة وعميقة وقاسية';

  return `أنت كاتب روائي عربي محترف متخصص في أدب الخيال. مهمتك بناء عالم قصة متكامل.

## معلومات القصة
- العنوان: ${title}
${genreDesc}
- أسلوب الكتابة: ${style || 'اختر الأنسب للتصنيف'}
- درجة الظلام: ${darkness}/10 (${darknessDesc})

## المطلوب
اكتب عالم هذه القصة بالتفصيل في الأقسام التالية بالضبط:

### اسم العالم
[اسم مميز للعالم أو البيئة الرئيسية، يعكس طابع التصنيف]

### القوانين العامة
[قوانين العالم الأساسية: التشي، السحر، التكنولوجيا، أو النظام الاجتماعي — بحسب التصنيف]

### الجغرافيا والبيئة
[وصف الأماكن الرئيسية حيث ستجري الأحداث]

### القوى والفصائل
[الطوائف أو الدول أو القوى المتصارعة]

### التاريخ المختصر
[ما الذي حدث قبل بدء القصة؟ ما الجروح القديمة؟]

### الجو العام
[كيف يشعر القارئ وهو في هذا العالم؟]

### الصراع الجذري
[ما المشكلة الكبرى التي تهدد هذا العالم أو تحرك أحداثه؟]

اكتب بالعربية الفصحى المعاصرة. التزم بطابع التصنيف. لا مقدمات، المحتوى مباشرةً.`;
}

// ── ٢. توليد الشخصيات ────────────────────────────────────────
function buildCharactersPrompt(data) {
  const { title, genre, world_data, charCount = 4 } = data;
  const genreDesc    = buildGenreDescription(genre);
  const worldSummary = extractWorldSummary(world_data);

  return `أنت كاتب روائي عربي محترف. مهمتك بناء شخصيات القصة.

## القصة
- العنوان: ${title}
${genreDesc}

## عالم القصة
${worldSummary}

## المطلوب
أنشئ ${charCount} شخصيات رئيسية لهذه القصة. كل شخصية في هذا الشكل:

---
### [اسم الشخصية]
**الدور:** [البطل/الخصم/الحليف/المرشد/الغامض/...]
**العمر:** [رقم أو وصف]
**مستوى القوة/القدرة:** [مرحلته في الزراعة أو قدراته في السياق المناسب]
**الشخصية النفسية:** [وصف دقيق لطريقة تفكيره ومشاعره]
**دوافعه:** [ما الذي يريده بعمق؟ ما الذي يخاف منه؟]
**نقطة ضعفه:** [ما الذي يمكن أن يكسره؟]
**تاريخه الخاص:** [ما الذي شكّله قبل بدء القصة؟]
**كيف يتغير:** [أين يبدأ وأين ينتهي في رحلته الداخلية]
---

بعد الشخصيات، أضف قسم:
## شبكة العلاقات
[الروابط الرئيسية: من يثق بمن، من يكره من، من يخفي سراً عن من]

اكتب بالعربية الفصحى المعاصرة. لا مقدمات، المحتوى مباشرةً.`;
}

// ── ٣. توليد الخط الزمني ─────────────────────────────────────
function buildTimelinePrompt(data) {
  const { title, genre, world_data, characters } = data;
  const genreDesc    = buildGenreDescription(genre);
  const worldSummary = extractWorldSummary(world_data);
  const charNames    = extractCharacterNames(characters);

  return `أنت كاتب روائي عربي محترف. مهمتك رسم الخط الزمني للقصة.

## القصة
- العنوان: ${title}
- الشخصيات الرئيسية: ${charNames}
${genreDesc}

## عالم القصة
${worldSummary}

## المطلوب

### البداية
[الوضع قبل تحرك الأحداث؟ الحدث الذي يكسر هذا الوضع؟]

### التحول الأول
[الحدث الكبير الذي يدفع البطل للمضي قدماً؟]

### التعقيد والعقبات
[التحديات والعواقب، الخسائر، ذروة وسطى]

### الأزمة الكبرى
[اللحظة الأصعب — كل شيء يبدو ضائعاً]

### الذروة والمواجهة
[المواجهة النهائية، تقاطع كل خيوط القصة]

### الخاتمة
[ما الذي يتغير في العالم والشخصيات؟]

### عدد الفصول المقترح
[اقترح عدداً منطقياً بناءً على حجم القصة]

اكتب بالعربية الفصحى المعاصرة. لا مقدمات.`;
}

// ── ٤. توليد فصل ─────────────────────────────────────────────
function buildChapterPrompt(data) {
  const { story, chapterNum, chapterNotes, prevSummaries, chapterTitle } = data;

  const genreDesc    = buildGenreDescription(story.genre);
  const worldSummary = extractWorldSummary(story.world_data);
  const charSummary  = extractCharactersSummary(story.characters);
  const timelineSum  = extractTimelineSummary(story.timeline);
  const prevChaps    = formatPreviousSummaries(prevSummaries);
  const darknessDesc = story.darkness <= 3 ? 'خفيف'
                     : story.darkness <= 6 ? 'متوازن'
                     : 'داكن وقاسٍ';

  return `أنت كاتب روائي عربي محترف. مهمتك كتابة الفصل ${chapterNum} من رواية "${story.title}".

## معلومات الرواية
${genreDesc}
- **الأسلوب:** ${story.style || 'أدبي معاصر'}
- **درجة الظلام:** ${story.darkness}/10 (${darknessDesc})

## عالم القصة
${worldSummary}

## الشخصيات الرئيسية
${charSummary}

## الخط الزمني
${timelineSum}

${prevChaps ? `## الفصول السابقة (ملخصات)\n${prevChaps}\n` : ''}

## الفصل المطلوب
- **رقم الفصل:** ${chapterNum}
${chapterTitle ? `- **عنوان مقترح:** ${chapterTitle}` : ''}
${chapterNotes ? `- **ملاحظات المؤلف:** ${chapterNotes}` : ''}

## تعليمات
- اكتب الفصل كاملاً بلغة روائية عربية جميلة
- الطول المثالي: 1200–2000 كلمة
- ابدأ بـ: **الفصل ${chapterNum}: [العنوان]**
- الحوار يعكس شخصية كل شخص بدقة
- الوصف حسي وملموس
- انتهِ بشكل يفتح الباب للفصل التالي

ابدأ الآن:`;
}

// ── ٥. توليد ملخص ───────────────────────────────────────────
function buildSummaryPrompt(chapterContent, chapterNum) {
  return `لخّص الفصل ${chapterNum} في فقرة واحدة لا تتجاوز 120 كلمة.
ركّز على: الأحداث الرئيسية، التغييرات في الشخصيات، النقاط المهمة للسياق.
لا تبدأ بـ "في هذا الفصل".

نص الفصل:
${chapterContent.substring(0, 6000)}`;
}

module.exports = {
  buildWorldPrompt, buildCharactersPrompt,
  buildTimelinePrompt, buildChapterPrompt, buildSummaryPrompt,
};
