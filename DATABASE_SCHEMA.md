# Database Schema Proposal — Lost-n-found-items

هذا الملف يقترح **قاعدة بيانات مناسبة لتطبيق Lost & Found** بشكل عملي وقابل للتوسع.

## الهدف
تنظيم بيانات:
- المستخدمين
- العناصر المفقودة والموجودة
- صور العناصر
- المطالبات على العناصر
- الرسائل بين المستخدمين
- المواقع والتصنيفات

---

## العلاقات الأساسية

```text
users
 ├─< items
 ├─< claims
 └─< messages

categories
 └─< items

locations
 └─< items

items
 ├─< item_images
 ├─< claims
 └─< messages
```

---

## 1) users
يمثل جميع مستخدمي التطبيق.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| full_name | VARCHAR(100) | الاسم الكامل |
| email | VARCHAR(255) UNIQUE | البريد الإلكتروني |
| password_hash | TEXT | كلمة المرور بعد التشفير |
| phone | VARCHAR(20) NULL | رقم الهاتف |
| profile_image_url | TEXT NULL | صورة المستخدم |
| role | VARCHAR(20) | `user`, `admin` |
| created_at | TIMESTAMP | تاريخ الإنشاء |
| updated_at | TIMESTAMP | آخر تحديث |

---

## 2) categories
تصنيفات العناصر.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| name | VARCHAR(100) UNIQUE | مثال: Electronics, Documents |
| created_at | TIMESTAMP | تاريخ الإنشاء |

أمثلة:
- Electronics
- Documents
- Bags
- Keys
- Clothes
- Accessories
- Other

---

## 3) locations
أماكن فقدان أو العثور على العنصر.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| name | VARCHAR(150) | اسم المكان |
| address | TEXT NULL | عنوان إضافي |
| latitude | DECIMAL(10,7) NULL | خط العرض |
| longitude | DECIMAL(10,7) NULL | خط الطول |
| created_at | TIMESTAMP | تاريخ الإنشاء |

---

## 4) items
الجدول الأساسي للعناصر المفقودة والموجودة.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| user_id | FK -> users.id | صاحب المنشور |
| category_id | FK -> categories.id | تصنيف العنصر |
| location_id | FK -> locations.id NULL | مكان الفقد/العثور |
| type | VARCHAR(10) | `lost` أو `found` |
| status | VARCHAR(20) | `open`, `matched`, `returned`, `closed` |
| title | VARCHAR(150) | عنوان مختصر |
| description | TEXT | وصف العنصر |
| color | VARCHAR(50) NULL | اللون |
| brand | VARCHAR(100) NULL | الماركة |
| identifiable_details | TEXT NULL | علامات مميزة |
| lost_or_found_date | DATE NULL | تاريخ الفقد أو العثور |
| contact_preference | VARCHAR(20) NULL | `chat`, `phone`, `email` |
| is_verified | BOOLEAN DEFAULT FALSE | تم التحقق من المنشور |
| created_at | TIMESTAMP | تاريخ الإنشاء |
| updated_at | TIMESTAMP | آخر تحديث |

### ملاحظات
- `type` يحدد هل العنصر **مفقود** أو **موجود**.
- `status` يساعد على إدارة دورة حياة العنصر.

---

## 5) item_images
صور العنصر الواحد.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| item_id | FK -> items.id | العنصر المرتبط |
| image_url | TEXT | رابط الصورة |
| is_primary | BOOLEAN DEFAULT FALSE | الصورة الرئيسية |
| created_at | TIMESTAMP | تاريخ الإنشاء |

> كل عنصر يمكن أن يملك أكثر من صورة.

---

## 6) claims
عندما يدّعي مستخدم أن العنصر يعود له أو يريد استلامه.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| item_id | FK -> items.id | العنصر المطلوب |
| claimant_user_id | FK -> users.id | الشخص المطالب |
| message | TEXT | شرح أو إثبات الملكية |
| status | VARCHAR(20) | `pending`, `approved`, `rejected`, `resolved` |
| created_at | TIMESTAMP | تاريخ الإنشاء |
| updated_at | TIMESTAMP | آخر تحديث |

---

## 7) messages
رسائل بين المستخدمين داخل التطبيق حول عنصر معين.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| item_id | FK -> items.id | العنصر المرتبط |
| sender_id | FK -> users.id | المرسل |
| receiver_id | FK -> users.id | المستقبل |
| body | TEXT | نص الرسالة |
| is_read | BOOLEAN DEFAULT FALSE | حالة القراءة |
| created_at | TIMESTAMP | تاريخ الإرسال |

---

## 8) notifications (اختياري لكن مفيد)
إشعارات النظام.

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| user_id | FK -> users.id | صاحب الإشعار |
| title | VARCHAR(150) | عنوان الإشعار |
| body | TEXT | محتوى الإشعار |
| type | VARCHAR(30) | `claim`, `message`, `match`, `system` |
| is_read | BOOLEAN DEFAULT FALSE | هل تمت القراءة |
| created_at | TIMESTAMP | تاريخ الإنشاء |

---

## SQL Example (PostgreSQL)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  profile_image_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE items (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'returned', 'closed')),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  color VARCHAR(50),
  brand VARCHAR(100),
  identifiable_details TEXT,
  lost_or_found_date DATE,
  contact_preference VARCHAR(20),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE item_images (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE claims (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## فهارس مقترحة

```sql
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_location_id ON items(location_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_claims_item_id ON claims(item_id);
CREATE INDEX idx_claims_claimant_user_id ON claims(claimant_user_id);
CREATE INDEX idx_messages_item_id ON messages(item_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

---

## اقتراح أسماء الملف داخل المشروع
يمكنك إضافته داخل المشروع بأحد هذه الأسماء:
- `DATABASE_SCHEMA.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/backend/database-schema.md`

---

## ملاحظات تطوير
- إذا كنتم تستخدمون **Firebase** فسيكون هذا مرجعًا منطقيًا لتحويل الجداول إلى Collections.
- إذا كنتم تستخدمون **Supabase / PostgreSQL** فالمخطط أعلاه جاهز كنقطة بداية ممتازة.
- يمكن لاحقًا إضافة جدول `matches` لربط العناصر المفقودة بالعناصر الموجودة تلقائيًا.

---

## اقتراح مستقبلي
إضافة جدول `matches`:

| Field | Type | Notes |
|---|---|---|
| id | UUID / INT PK | المعرف الأساسي |
| lost_item_id | FK -> items.id | العنصر المفقود |
| found_item_id | FK -> items.id | العنصر الموجود |
| confidence_score | DECIMAL(5,2) | نسبة التشابه |
| status | VARCHAR(20) | `suggested`, `confirmed`, `rejected` |
| created_at | TIMESTAMP | تاريخ الإنشاء |

هذا مفيد إذا أردتم لاحقًا بناء نظام مطابقة ذكي.
