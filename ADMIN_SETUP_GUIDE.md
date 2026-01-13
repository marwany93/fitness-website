# 👑 Admin Role Setup Guide

## 🎯 Quick Setup (5 دقائق)

### **1. Create Admin Role in Firebase**

1. افتح Firebase Console → **Firestore Database**
2. روح على **collection `users`**
3. search for your user document (بتاع المدرب)
4. افتح الـ document
5. اضغط **"Edit"** أو **"تعديل"**
6. أضف/عدّل Field:
   - Name: `role`
   - Type: `string`
   - Value: `admin`
7. **Save** / **حفظ**

---

### **2. Test Admin Access**

1. افتح: `https://marwany93.github.io/fitness-website/admin.html`
2. سجل دخول
3. اعمل **Hard Refresh**: `Ctrl + Shift + R`
4. افتح **Console** (F12)
5. لو شفت `👑 Admin mode activated` → **تمام!** ✅

---

### **3. Check Admin Features**

**يجب تظهر دي:**
- ✅ زر "إنشاء تمرين / Create Workout" في Workout Library
- ✅ التمارين الموجودة في المكتبة
- ✅ القدرة على إضافة عملاء

**مش هتظهر لو Trainer بس:**
- ❌ زر Create Workout (hidden)
- ✅ قراءة التمارين فقط

---

## 🏋️ Create Your First Workout

### من Admin Dashboard:

1. اضغط **"الت مارين /  Workouts"** في Sidebar
2. اضغط **"إنشاء تمرين / Create Workout"**
3.املأ البيانات:
   - **العنوان بالعربي**: تمرين الصدر والكتف
   - **English Title**: Chest & Shoulder Workout
   - **المستوى**: Intermediate
   - **المدة**: 45 دقيقة

4. اضغط **"إضافة تمرين / Add Exercise"**
5. املأ تفاصيل التمرين:
   - **الاسم بالعربي**: تمرين البنش برس
   - **English Name**: Bench Press
   - **Sets**: 4
   - **Reps**: 10
   - **ملاحظات**: Use proper form

6. **كرر** الخطوة 4-5 لإضافة تمارين أكثر
7. اضغط **"حفظ التمرين / Save Workout"**

**Done!** ✅ التمرين هيظهر في المكتبة فوراً!

---

## 👥 Role Comparison Table

| Feature | Admin 👑 | Trainer 👨‍🏫 | Client 👤 |
|---------|----------|------------|-----------|
| Add Clients | ✅ | ✅ | ❌ |
| Add Trainers | ✅ | ❌ | ❌ |
| Create Workouts | ✅ | ❌ | ❌ |
| Assign Workouts | ✅ | ✅ | ❌ |
| View Workouts | ✅ | ✅ (read-only) | ✅ (assigned only) |
| Messaging | ✅ | ✅ | ✅ |
| View All Clients | ✅ | ✅ (own clients) | ❌ |

---

## 🔐 Update Existing Users

### To Make Trainer → Admin:

Firebase Console → Firestore → `users` collection:

```javascript
// Find trainer document
// Add/Update field:
{
  "role": "admin"  // Change from "trainer" to "admin"
}
```

### To Make Client → Trainer:

```javascript
{
  "role": "trainer"  // Change from "client" to "trainer"
}
```

---

## 🧪 Testing Checklist

### As Admin:
- [ ] Login to admin.html
- [ ] See "Create Workout" button ✅
- [ ] Create a new workout
- [ ] Verify workout appears in library
- [ ] Assign workout to client
- [ ] Add a client
- [ ] Send messages

### As Trainer:
- [ ] Login to admin.html
- [ ] DON'T see "Create Workout" button ❌
- [ ] Can view workouts (read-only)
- [ ] Can assign existing workouts
- [ ] Can add clients
- [ ] Can send messages

---

## 📊 Workout Library Features

### ✅ What You Can Do:

**View Workouts:**
- List of all workouts
- Difficulty levels (Beginner/Inter mediate/Advanced)
- Exercise count
- Duration

**Create Workout (Admin Only):**
- Bilingual titles (Arabic + English)
- Choose difficulty
- Set duration
- Add multiple exercises
- Each exercise has:
  * Name (Arabic + English)
  * Sets & Reps
  * Notes/Instructions
- Dynamic add/remove exercises

**Use Workouts:**
- Click to assign to clients
- View exercise details
- Track client progress

---

## 🚨 Troubleshooting

### "Create Workout" button not showing:

1. **Check role في Firebase:**
   - Users collection → Your document
   - Confirm `role: "admin"`

2. **Clear cache:**
   - Hard refresh: `Ctrl + Shift + R`
   - Or clear browser cache

3. **Check console:**
   - Press F12
   - Look for: `👑 Admin mode activated`
   - If not, role setup failed

### Workout not saving:

1. **Check Firestore Rules:**
   - Make sure admin can write to `workouts` collection

2. **Check all required fields:**
   - Title (both languages)
   - Difficulty
   - Duration
   - At least 1 exercise

---

## 🎉 Next Steps

Once admin is working:

1. ✅ Create 5-10 standard workouts
2. ✅ Test assigning them to clients
3. ✅ Get client feedback
4. ✅ Create more targeted workouts
5. ✅ Build workout templates library

---

**System is now production-ready with role-based access!** 🚀

Admin can manage everything, trainers can use existing workouts, clients get personalized programs!
