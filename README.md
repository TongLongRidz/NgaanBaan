# NgaanBaanBoard (งานบานบอร์ด) 📋

เครื่องมือบริหารจัดการงานสไตล์คันบันบอร์ด (Kanban Board Task Management Tool) พัฒนาขึ้นในรูปแบบ **Full-Stack Monorepo** (Next.js + Go)

---

## 🚀 ฟีเจอร์หลัก (Features)

- 📌 **Kanban Boards & Workspaces**: สร้างและจัดการบอร์ดสำหรับติดตามสถานะงาน (To Do, In Progress, Done)
- 📝 **Task & Subtask Checklists**: ย่อยงานซับซ้อนด้วยเช็คลิสต์งานย่อย ติดตามความคืบหน้าเรียลไทม์
- 💬 **Activity Log & Audit Trail**: ติดตามประวัติการย้ายสถานะ บันทึกกิจกรรม และคอมเมนต์พูดคุยในงาน
- 🎨 **Modern Design & Dark Mode**: รองรับทั้ง Light และ Dark mode พร้อมการออกแบบสไตล์ Glassmorphism
- 🌐 **Internationalization (i18n)**: รองรับการสลับภาษา (ภาษาไทย / English)
- 📄 **Information Pages**: หน้าเกี่ยวกับเรา (About Us), นโยบายความเป็นส่วนตัว (Privacy Policy), และข้อกำหนดการใช้งาน (Terms of Service)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, AOS (Animate On Scroll)
- **Backend**: Go (Golang), REST API, Clean Architecture
- **Database**: PostgreSQL / MongoDB
- **Containerization**: Docker, Docker Compose

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
kanban-board/
├── frontend/             # Next.js Application
│   ├── src/
│   │   ├── app/          # App Router (pages & routes)
│   │   ├── components/   # UI Components (TopNavbar, SideNavbar, Footer)
│   │   ├── hooks/        # Custom hooks (useTheme, useLanguage)
│   │   └── locales/      # i18n JSON translation files (th.json, en.json)
│   ├── public/           # Static assets
│   └── package.json
└── backend/              # Go Backend Application
    ├── cmd/
    │   └── server/       # Entry point (main.go)
    ├── internal/         # Core domain, handlers, repositories
    └── go.mod
```

---

## 🏃‍♂️ วิธีการรันโปรเจกต์ (Getting Started)

### 1. รันผ่าน Docker Compose (แนะนำ)

```bash
docker-compose up --build
```

### 2. รันแยกส่วนพัฒนา (Development Mode)

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
แอปพลิเคชันจะทำงานที่ [http://localhost:3000](http://localhost:3000)

#### Backend
```bash
cd backend
go run ./cmd/server
```
บริการหลังบ้านจะทำงานที่ [http://localhost:8080](http://localhost:8080)

---

## 📜 License

NgaanBaanBoard © 2026. สงวนลิขสิทธิ์ทั้งหมด (All rights reserved).
