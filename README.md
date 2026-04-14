# 🌙 Master Story v2.0

منصة كتابة الروايات بالذكاء الاصطناعي — مبنية على Node.js + Supabase + OpenRouter

---

## هيكل الملفات

```
master-story/
├── server.js               ← نقطة الدخول
├── package.json
├── render.yaml             ← إعداد Render
├── schema.sql              ← قاعدة البيانات
├── .env.example            ← نسخه إلى .env
│
├── src/
│   ├── middleware/
│   │   └── auth.js         ← حماية المسارات
│   ├── routes/
│   │   ├── auth.js         ← تسجيل الدخول/الخروج
│   │   ├── stories.js      ← إدارة القصص
│   │   ├── chapters.js     ← إدارة الفصول
│   │   ├── generate.js     ← التوليد بالذكاء الاصطناعي
│   │   └── settings.js     ← الإعدادات
│   └── services/
│       ├── supabase.js     ← اتصال قاعدة البيانات
│       ├── openrouter.js   ← OpenRouter API
│       └── promptBuilder.js← بناء الـ Prompts
│
└── public/
    ├── index.html          ← تسجيل الدخول
    ├── dashboard.html      ← لوحة القصص
    ├── wizard.html         ← إنشاء قصة جديدة
    ├── generate.html       ← توليد الفصول
    ├── story.html          ← تفاصيل وتعديل القصة
    ├── library.html        ← قراءة القصص
    ├── settings.html       ← الإعدادات
    ├── css/style.css
    └── js/api.js
```

---

## خطوات التثبيت

### ١. Supabase

1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com)
2. افتح **SQL Editor** والصق محتوى `schema.sql` كاملاً ثم شغّله
3. من **Project Settings → API** احفظ:
   - `Project URL` → يذهب في `SUPABASE_URL`
   - `anon public key` → يذهب في `SUPABASE_KEY`

### ٢. OpenRouter

1. أنشئ حساباً على [openrouter.ai](https://openrouter.ai)
2. من [Keys](https://openrouter.ai/keys) أنشئ مفتاحاً جديداً
3. احفظه في `OPENROUTER_API_KEY`
   
> النماذج المنتهية بـ `:free` مجانية تماماً بدون رصيد

### ٣. Render

1. ارفع المشروع على GitHub (مستودع خاص)
2. على [render.com](https://render.com) أنشئ **Web Service** جديد
3. اربطه بالمستودع
4. الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** 18+
5. أضف متغيرات البيئة:

| المفتاح | القيمة |
|---------|--------|
| `APP_PASSWORD` | كلمة مرور من اختيارك |
| `SESSION_SECRET` | نص عشوائي طويل |
| `SUPABASE_URL` | رابط مشروع Supabase |
| `SUPABASE_KEY` | مفتاح Supabase |
| `OPENROUTER_API_KEY` | مفتاح OpenRouter |
| `NODE_ENV` | production |

### ٤. أول تشغيل

1. ادخل الموقع بكلمة المرور التي حددتها
2. اذهب لـ **الإعدادات** وتأكد من حفظ مفتاح OpenRouter
3. اختبر الاتصال بزر "اختبار الاتصال"
4. ابدأ بإنشاء قصتك الأولى! 🌙

---

## للتشغيل المحلي

```bash
# نسخ ملف البيئة
cp .env.example .env
# عدّل .env بقيمك الحقيقية

# تثبيت الحزم
npm install

# تشغيل بوضع التطوير
npm run dev
# أو للإنتاج
npm start
```

ثم افتح: `http://localhost:3000`

---

## مسار العمل

```
قصة جديدة (Wizard)
    ↓
١. الفكرة → العنوان + النوع + درجة الظلام
٢. العالم → توليد أو كتابة يدوية
٣. الشخصيات → توليد مع الروابط
٤. الخط الزمني → بداية → ذروة → نهاية
٥. حفظ → جاهزة لتوليد الفصول
    ↓
توليد فصل (Generate)
    ↓
١. اختيار القصة
٢. ملاحظات اختيارية
٣. توليد بـ Streaming (تشاهد النص يكتب)
٤. معاينة + اعتماد أو إعادة
٥. الفصل يُحفظ وملخصه يُولَّد تلقائياً
٦. الفصل التالي يبدأ بسياق كامل
```

---

## النماذج المجانية المتاحة

| النموذج | الاستخدام المثالي |
|---------|------------------|
| `meta-llama/llama-4-scout:free` | فصول طويلة — جودة عالية |
| `meta-llama/llama-4-maverick:free` | كتابة إبداعية |
| `google/gemma-3-27b-it:free` | أفكار وويزرد |
| `deepseek/deepseek-r1:free` | تفصيل عميق |
| `qwen/qwen3-235b-a22b:free` | نموذج ضخم قوي |

---

*Master Story v2.0 — كُتب للكتّاب العرب 🌙*
