# NgaanBaan (งานบาน) 📋

ระบบบริหารจัดการโครงการและคันบันบอร์ด (Kanban & Task Management Application) พัฒนาในรูปแบบ **Full-Stack Monorepo** (Next.js + Go) ที่มุ่งเน้นการออกแบบสไตล์ Ergonomic Visual Design, Responsive UI, และระบบจัดการงานหลายมุมมอง (Summary, Board, Calendar, Gantt Chart, Settings)

---

## 🚀 ฟีเจอร์หลัก (Key Features)

- 📌 **Multi-View Project Workspace**:
  - **Summary**: ภาพรวมความคืบหน้าโครงการ กราฟแสดงสถิติสถานะงาน และ Activity Feeds
  - **Board**: Interactive Kanban board (Drag & Drop, Column Management, Task Detail Modals)
  - **Calendar**: แสดงกำหนดการงานบนปฏิทินตาม `start_date` และ `due_date`
  - **Gantt Chart**: แสดง Timeline การดำเนินงานและระยะเวลาของงานแต่ละชิ้น
  - **Settings**: จัดการสมาชิกในโครงการ (Add/Remove members, Roles: Owner, Editor, Viewer)
- 📝 **Task & Subtask Breakdown**:
  - จัดหมวดหมู่งาน ย่อยงานซับซ้อนด้วย Subtasks และ Checklists
  - กำหนดระดับความสำคัญ (Low, Medium, High, Urgent), Tags, Assignees หลายคน และไฟล์แนบ (Attachments)
- 💬 **Project Activity Feed**:
  - บันทึก กิจกรรมและความเคลื่อนไหวภายในโครงการ (Audit Trail)
- 🎨 **Modern Ergonomic Visual Design**:
  - ปรับปรุง UI สไตล์ Glassmorphism, Accent Glows, Smooth Transitions
  - รองรับทั้ง **Dark Mode** และ **Light Mode**
- 🌐 **Bilingual Support (i18n)**:
  - สลับภาษาได้ทันที (ภาษาไทย 🇹🇭 / English 🇬🇧)
  - บันทึกการตั้งค่าภาษาและธีมผ่าน LocalStorage โดยไม่มีปัญหา Hydration Flicker

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Sonner (Toast notifications)
- **Backend**: Go (Golang), REST API, Clean Architecture
- **Database**: PostgreSQL 16 (Relational Data & UUID Primary Keys), MongoDB 7 (Notifications & Metadata)
- **DevOps & Containers**: Docker, Docker Compose, Makefile

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
kanban-board/
├── .env.example                # ตัวอย่างไฟล์ตั้งค่า Environment Variables
├── docker-compose.yml          # Docker Compose สั่งรัน Postgres, Mongo, Backend, Frontend
├── Makefile                    # คำสั่งลัดจัดการระบบ (make frontend, make backend, make docker-up)
├── note.md                     # เอกสารวางโครงสร้างและนิยาม Schema ฐานข้อมูล
├── backend/                    # Go Backend Service
│   ├── cmd/
│   │   └── server/             # Entry Point แอปพลิเคชันหลังบ้าน (main.go)
│   ├── internal/               # Domain Models, Handlers, Repositories, Services
│   ├── init.sql                # SQL Schema Migration ล่าสุด (Users, Sessions, Projects, Tasks)
│   ├── Dockerfile              # Container Build Config สำหรับ Go Backend
│   └── go.mod                  # Go Dependencies Specification
└── frontend/                   # Next.js Frontend Web Application
    ├── src/
    │   ├── app/                # Next.js App Router (Pages & Routes)
    │   │   ├── (dashboard)/    # Layout เมนูหลัก (Projects, My Tasks, Notifications)
    │   │   ├── login/          # หน้าเข้าสู่ระบบ / ลงทะเบียน (Auth Page)
    │   │   └── outdated/       # ซอร์สโค้ดฟีเจอร์เดิมที่พักการใช้งานไว้ (e.g. Messages)
    │   ├── components/         # Reusable Components
    │   │   ├── project/        # Components ประจำมุมมองโครงการ (Board, Summary, Calendar, Gantt, Activity)
    │   │   └── ui/             # Global UI Components (TopNavbar, SideNavbar, Toast, Modals)
    │   ├── hooks/              # Custom React Hooks (useTheme, useLanguage)
    │   └── locales/            # i18n JSON files (th.json, en.json)
    ├── public/                 # Static Assets (Images, Icons)
    ├── Dockerfile              # Container Build Config สำหรับ Next.js Frontend
    └── package.json            # Node.js Dependencies & Scripts
```

---

## 🏃‍♂️ วิธีการรันโปรเจกต์ (Getting Started)

### 1. การตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env` ก่อนการใช้งาน:

```bash
cp .env.example .env
```

---

### 2. รันโปรเจกต์ผ่าน Docker Compose (แนะนำ) 🐳

สั่งรันฐานข้อมูล (PostgreSQL & MongoDB), Backend (Go) และ Frontend (Next.js) ทั้งหมดได้ด้วยคำสั่งเดียว:

```bash
docker-compose up --build -d
```

หรือใช้คำสั่งลัดผ่าน **Makefile**:

```bash
make docker-up
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **PostgreSQL**: `localhost:5432`

หากต้องการหยุดระบบ:
```bash
make docker-down
```

---

### 3. รันโปรเจกต์แยกตามส่วน (Development Mode) 💻

#### 3.1 เปิดใช้งาน Database (PostgreSQL)

```bash
make db-up
```

#### 3.2 สตาร์ท Go Backend

```bash
cd backend
go run ./cmd/server
```
*(หรือรันผ่าน Makefile ที่ root: `make backend`)*

#### 3.3 สตาร์ท Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```
*(หรือรันผ่าน Makefile ที่ root: `make frontend`)*

เข้าใช้งานหน้าเว็บได้ที่ [http://localhost:3000](http://localhost:3000)

---

## 📜 License

NgaanBaan © 2026. สงวนลิขสิทธิ์ทั้งหมด (All rights reserved).
