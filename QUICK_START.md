# 🚀 خطوات سريعة لتفعيل النظام

## ✅ Firebase Config موجود!

الـ config تم إضافته بنجاح ورُفع على GitHub Pages.

---

## 🔧 الخطوات المتبقية (5 دقائق):

### **1. تفعيل Authentication**

1. روح على Firebase Console: **https://console.firebase.google.com/**
2. اختر project "fitlife-e5421"
3. من القائمة الجانبية → **Build** → **Authentication**
4. اضغط **"Get started"** أو **"البدء"**
5. اضغط على **"Email/Password"**
6. فعّل الخيار الأول: **"Email/Password" Enable ✓**
7. اضغط **"Save"** / **"حفظ"**

---

### **2. تفعيل Firestore Database**

1. من القائمة الجانبية → **Build** → **Firestore Database**
2. اضغط **"Create database"** / **"إنشاء قاعدة بيانات"**
3. اختار **"Start in test mode"** / **"البدء في وضع الاختبار"**
4. اختار Location: **europe-west** (أقرب لمصر)
5. اضغط **"Enable"** / **"تفعيل"**

---

### **3. إنشاء حساب المدرب (Trainer Account)**

1. في Firebase Console → **Authentication** → **Users** tab
2. اضغط **"Add user"** / **"إضافة مستخدم"**
3. املأ البيانات:
   - **Email:** اكتب email بتاعك (مثلاً: `trainer@fitlife.com`)
   - **Password:** اختر كلمة سر قوية
4. اضغط **"Add user"**
5. **انسخ الـ User UID** (هتلاقيه في القائمة)

---

### **4. إضافة بيانات المدرب في Database**

1. روح **Firestore Database** → **Data** tab
2. اضغط **"Start collection"** / **"بدء مجموعة"**
3. Collection ID: اكتب `users`
4. اضغط **"Next"**
5. Document ID: **الصق الـ UID اللي نسخته**
6. اضيف الحقول دي:

```
Field name: role        | Type: string    | Value: trainer
Field name: name        | Type: string    | Value: Your Name
Field name: email       | Type: string    | Value: trainer@fitlife.com
Field name: status      | Type: string    | Value: active
Field name: createdAt   | Type: timestamp | Value: [اضغط على الساعة]
```

7. اضغط **"Save"** / **"حفظ"**

---

## ✅ اختبار النظام

بعد الخطوات دي، روح على:

**Admin Dashboard:**
```
https://marwany93.github.io/fitness-website/admin.html
```

**تسجيل دخول بـ:**
- Email: trainer@fitlife.com (أو اللي حطيته)
- Password: الباسورد اللي اخترته

لو دخلت بنجاح - **مبروك! النظام شغال** 🎉

---

## 🎯 إنشاء عميل تجريبي (اختياري)

لو عايز تختبر Client Portal:

1. في **Authentication**, اضيف user تاني:
   - Email: `client@test.com`
   - Password: `test123`
2. انسخ الـ UID
3. في **Firestore** → `users` collection → **Add document**:
   - Document ID: الصق الـ client UID
   - Fields:
```
role: client
name: Test Client
email: client@test.com
phone: +201234567890
package: premium
status: active
createdAt: [timestamp]
```

بعدها جرب تدخل على:
```
https://marwany93.github.io/fitness-website/client.html
```

---

## 🆘 لو في مشكلة

**Error: "Permission denied"**
- تأكد إنك عملت Firestore في **test mode**
- لو مش شغال، روح **Rules** في Firestore واستبدلها بالكود ده:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Error: "User not found"**
- تأكد إنك ضفت document في Firestore بنفس الـ UID

---

## 🎊 خلاص!

بعد ما تعمل الخطوات دي، النظام هيكون جاهز تماماً!

**الموقع الرئيسي:**
https://marwany93.github.io/fitness-website/

**لوحة التحكم:**
https://marwany93.github.io/fitness-website/admin.html

**بوابة العميل:**
https://marwany93.github.io/fitness-website/client.html
