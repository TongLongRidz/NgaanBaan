# NgaanBaan (งานบาน) 📋

ระบบบริหารจัดการโครงการและคันบันบอร์ด (Kanban & Task Management Application) พัฒนาในรูปแบบ **Full-Stack Monorepo** (Next.js + Go) ที่มุ่งเน้นการออกแบบสไตล์ Ergonomic Visual Design, Responsive UI, ระบบความปลอดภัยแบบ HttpOnly Cookie, ระบบยืนยันตัวตน 2 ชั้น (Email Verification System), และระบบจัดการงานหลายมุมมอง (Summary, Board, Calendar, Gantt Chart, Settings)

---

## 🚀 ฟีเจอร์หลัก (Key Features)

- 🔒 **HttpOnly Cookie Authentication & Security**:
  - เปลี่ยนการจัดการ Session Token จาก LocalStorage มาเป็น **HttpOnly Cookie** (`user_session_id`) ป้องกันภัยคุกคาม XSS
  - รองรับระบบ Logout ปลอดภัย ปลดล็อก session และล้าง Cookie ทันทีที่สั่งออกจากระบบ
- ✉️ **Dual-Method Email Verification System**:
  - **รหัส OTP 6 หลัก**: กรอกรหัส OTP 6 ตัวอักษรเพื่อยืนยันตัวตนเปิดใช้งานบัญชี
  - **ลิงก์ยืนยันตัวตน (Verification Link)**: คลิกยืนยันผ่าน Token URL เพื่อเปิดใช้งานบัญชีทันที
  - **Clean & Professional HTML Template**: ธีมอีเมลแบบไร้ Emoji ดูน่าเชื่อถือ ทันสมัย พร้อมส่วนย่อแสดงเวลาหมดอายุ 15 นาที
  - **Email Dispatch Tester (`/email-test`)**: หน้าทดสอบส่งอีเมล ปรับแต่ง Mail Title, Header, Content และทดสอบส่งจริงไปยัง Inbox พร้อมระบบ Live Preview
- 📌 **Multi-View Project Workspace**:
  - **Summary**: ภาพรวมความคืบหน้าโครงการ กราฟแสดงสถิติสถานะงาน และ Activity Feeds
  - **Board**: Interactive Kanban board (Column Management, Task Detail Modals)
  - **Calendar**: แสดงกำหนดการงานบนปฏิทินตาม `start_date` และ `due_date`
  - **Gantt Chart**: แสดง Timeline การดำเนินงานและระยะเวลาของงานแต่ละชิ้น
  - **Settings**: จัดการสมาชิกในโครงการ (Add/Remove members, Roles: Owner, Editor, Viewer)
- 📝 **Task & Subtask Breakdown**:
  - จัดหมวดหมู่งาน ย่อยงานซับซ้อนด้วย Subtasks และ Checklists
  - กำหนดระดับความสำคัญ (Low, Medium, High, Urgent), Tags, Assignees หลายคน และไฟล์แนบ (Attachments)
- 🛡️ **Security Audit Trail (MongoDB)**:
  - บันทึกประวัติการเข้าสู่ระบบลง MongoDB (`kanban_logs.login_audit_logs`) พร้อมบันทึกสาเหตุ (`reason`) ในกรณีที่เข้าสู่ระบบไม่สำเร็จ
- 🎨 **Ergonomic Theme & Clean UI**:
  - รองรับทั้ง **Dark Mode** และ **Light Mode** อย่างสมบูรณ์แบบ
  - ปรับปรุง Loader เป็นแบบ Centered Ring Spinner วงหมุนมินิมอลกลางจอที่สลับสีตามธีมระบบโดยอัตโนมัติ ไร้ข้อความกวนสายตา
- 🌐 **Bilingual Support (i18n)**:
  - สลับภาษาได้ทันที (ภาษาไทย 🇹🇭 / English 🇬🇧) ผ่านระบบ i18n

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, SweetAlert2
- **Backend**: Go (Golang), Gin Framework, REST API, Clean Architecture
- **Database**: 
  - **PostgreSQL 16**: Relational Data, UUID Primary Keys, Email Verifications (`email_verifications`, `users`, `user_sessions`)
  - **MongoDB 7**: Audit Logs (`login_audit_logs`), Activity Feeds & Metadata
- **DevOps & Containers**: Docker, Docker Compose, Makefile

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
kanban-board/
├── .env.example                # ตัวอย่างไฟล์ตั้งค่า Environment Variables
├── docker-compose.yml          # Docker Compose สั่งรัน Postgres, Mongo, Backend, Frontend
├── Makefile                    # คำสั่งลัดจัดการระบบ (make frontend, make backend, make db-up, make db-init)
├── note.md                     # เอกสารวางโครงสร้างและนิยาม Schema ฐานข้อมูลล่าสุด
├── README.md                   # เอกสารอธิบายรายละเอียดและวิธีการใช้งานโปรเจกต์
├── backend/                    # Go Backend Service
│   ├── cmd/
│   │   └── server/             # Entry Point แอปพลิเคชันหลังบ้าน (main.go)
│   ├── internal/               # Domain Models, Handlers, Repositories, Services
│   ├── init.sql                # SQL Schema Migration ล่าสุด (Users, Email Verifications, Projects, Tasks)
│   ├── Dockerfile              # Container Build Config สำหรับ Go Backend
│   └── go.mod                  # Go Dependencies Specification
└── frontend/                   # Next.js Frontend Web Application
    ├── src/
    │   ├── app/                # Next.js App Router (Pages & Routes)
    │   │   ├── (dashboard)/    # Layout เมนูหลัก (Projects, My Tasks, Notifications)
    │   │   ├── login/          # หน้าเข้าสู่ระบบ / ลงทะเบียน / ยืนยันตัวตนอีเมล (Unified Auth Page)
    │   │   ├── email-test/     # หน้าทดสอบส่งอีเมลและ Live HTML Template Tester
    │   │   └── outdated/       # ซอร์สโค้ดฟีเจอร์เดิมที่พักการใช้งานไว้
    │   ├── components/         # Reusable Components
    │   │   ├── project/        # Components ประจำมุมมองโครงการ (Board, Summary, Calendar, Gantt, Activity)
    │   │   └── ui/             # Global UI Components (TopNavbar, SideNavbar, Email VerificationCard)
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
- **Email Dispatch Tester**: [http://localhost:3000/email-test](http://localhost:3000/email-test)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **PostgreSQL**: `localhost:5435`
- **MongoDB**: `localhost:27010`

หากต้องการหยุดระบบ:
```bash
make docker-down
```

---

### 3. รันโปรเจกต์แยกตามส่วน (Development Mode) 💻

#### 3.1 เปิดใช้งาน Database Containers (PostgreSQL & MongoDB)

```bash
make db-up
```

*(หากต้องการสร้าง/Reset Schema ตารางฐานข้อมูลด้วย `init.sql` สามารถใช้คำสั่ง `make db-init`)*

#### 3.2 สตาร์ท Go Backend

```bash
make backend
```

*(หรือ `cd backend && go run ./cmd/server`)*

#### 3.3 สตาร์ท Next.js Frontend

```bash
make frontend
```

*(หรือ `cd frontend && npm run dev`)*

เข้าใช้งานหน้าเว็บได้ที่ [http://localhost:3000](http://localhost:3000)

---

## 📜 License

NgaanBaan © 2026. สงวนลิขสิทธิ์ทั้งหมด (All rights reserved).
