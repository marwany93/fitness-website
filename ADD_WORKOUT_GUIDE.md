# إضافة Workout سريعة - Firebase

## 📝 الخطوات (دقيقتين):

### 1. افتح Firebase Console
```
https://console.firebase.google.com/project/fitlife-e5421/firestore/data
```

### 2. Add Workout Document

1. اضغط **"Start collection"** (لو أول مرة) أو **"Add document"**
2. Collection ID: `workouts`
3. Document ID: **Auto-ID** (اتركه فاضي)

### 3. Fill in the Fields

انسخ القيم دي بالظبط:

**Field 1:**
- Name: `title`
- Type: `string`
- Value: `Full Body Workout`

**Field 2:**
- Name: `titleAr`
- Type: `string`
- Value: `تمرين الجسم الكامل`

**Field 3:**
- Name: `difficulty`
- Type: `string`
- Value: `beginner`

**Field 4:**
- Name: `duration`
- Type: `number`
- Value: `30`

**Field 5 (Array):**
- Name: `exercises`
- Type: `array`
- اضغط **"Add item"**
  - Type: `map`
  - Add fields inside the map:
    - `name` (string): `Push-ups`
    - `nameAr` (string): `تمرين الضغط`
    - `sets` (number): `3`
    - `reps` (number): `10`
    - `notes` (string): `Keep your back straight`

**Field 6:**
- Name: `createdAt`
- Type: `timestamp`
- اضغط الساعة الصغيرة واختار التاريخ الحالي

### 4. Save
اضغط **"Save"** أو **"حفظ"**

---

## ✅ الاختبار

بعد ما تضيف الـ workout:

1. روح على admin dashboard
2. اختار أي متدرب
3. اضغط tab "التمارين / Workouts"
4. اضغط **"تعيين تمرين / Assign Workout"**
5. هيظهرلك prompt فيه الـ workout اللي ضفته
6. اختار رقم 1
7. اكتب ملاحظات (optional)
8. هيتعيّن للمتدرب! ✅

---

## 💡 لإضافة تمارين أكثر

كرر نفس الخطوات وضيف workouts تانية بأسماء مختلفة:
- `Upper Body Strength` - تمارين الجزء العلوي
- `Cardio & HIIT` - كارديو
- `Core & Abs` - البطن
- `Leg Day` - تمارين الأرجل

---

## 🎯 الـ Workout Structure الكامل (نسخ/لصق)

لو عايز تضيف workout كامل بسرعة، استخدم Firebase Console Import:

```json
{
  "title": "Full Body Workout",
  "titleAr": "تمرين الجسم الكامل",
  "difficulty": "beginner",
  "duration": 30,
  "exercises": [
    {
      "name": "Push-ups",
      "nameAr": "تمرين الضغط",
      "sets": 3,
      "reps": 10,
      "notes": "Keep your back straight"
    },
    {
      "name": "Squats",
      "nameAr": "السكوات",
      "sets": 3,
      "reps": 15,
      "notes": "Go deep"
    },
    {
      "name": "Plank",
      "nameAr": "البلانك",
      "sets": 3,
      "reps": 30,
      "notes": "Hold for 30 seconds"
    }
  ],
  "createdAt": "2026-01-13T11:00:00Z"
}
```

---

## ⚡ بعد ما تضيف Workout

**انتظر 2 دقيقة** عشان GitHub Pages يتحدث، بعدين:
- روح `https://marwany93.github.io/fitness-website/admin.html`
- افتح متدرب
- اضغط "Assign Workout"
- هتشوف الـ workout الجديد! 🎉
