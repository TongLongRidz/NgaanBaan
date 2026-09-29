# NgaanBaan (งานบาน) 📋

ระบบบริหารจัดการโครงการและคันบันบอร์ด (Kanban & Task Management Application) พัฒนาในรูปแบบ **Full-Stack Monorepo** (Next.js + Go) ที่มุ่งเน้นการออกแบบสไตล์ Ergonomic Visual Design, Responsive UI, ระบบความปลอดภัยแบบ HttpOnly Cookie + JWT Access Token, Refresh Token Rotation, SHA-256 Hashing, Reuse Detection, และระบบจัดการงานหลายมุมมอง (Summary, Board, Calendar, Gantt Chart, Settings)

---

## 🚀 ฟีเจอร์หลัก (Key Features)

- 🔒 **HttpOnly Cookie Authentication & Refresh Token Rotation**:
  - การจัดการสิทธิ์เข้าถึงที่ปลอดภัยสูงด้วย **JWT Access Token (อายุ 15 นาที)** ส่งใน JSON Body
  - ออก **Plain Refresh Token** แบบ Cryptographically Random ส่งทาง **HttpOnly Cookie** (`refresh_token`) ป้องกันภัยคุกคาม XSS
  - เก็บค่าวอนเวย์ **SHA-256 Hash** ของ Refresh Token ในตาราง `user_sessions` บนฐานข้อมูล
  - **Token Rotation & Reuse Detection**: ทุกครั้งที่มีการ Refresh จะทำสลับ Refresh Token ตัวใหม่เสมอ หากพบการพยายามใช้ Token ที่ถูก Revoke ไปแล้ว ระบบจะตรวจจับภัยคุกคามและสั่ง **Revoke ทุก Session ทั้งหมดของ User ทันที**
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
  - บันทึกประวัติการเข้าสู่ระบบลง MongoDB (`ngaanbaan_logs.login_audit_logs`) พร้อมบันทึกสาเหตุ (`reason`) ในกรณีที่เข้าสู่ระบบไม่สำเร็จ
- 🎨 **Ergonomic Theme & Clean UI**:
  - รองรับทั้ง **Dark Mode** และ **Light Mode** อย่างสมบูรณ์แบบ
  - ปรับแต่ง **Empty States** ดีไซน์กะทัดรัด ตัวหนังสือและปุ่มสลับสีตามธีมระบบพร้อม Modal สร้างโปรเจกต์ใหม่ในตัว
  - ปรับแต่ง Loader เป็นแบบ Centered Ring Spinner วงหมุนมินิมอลกลางจอที่สลับสีตามธีมระบบโดยอัตโนมัติ
- 🌐 **Bilingual Support (i18n)**:
  - สลับภาษาได้ทันที (ภาษาไทย 🇹🇭 / English 🇬🇧) ผ่านระบบ i18n

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, SweetAlert2
- **Backend**: Go (Golang), Gin Framework, JWT (golang-jwt/v5), REST API, Clean Architecture
- **Database**: 
  - **PostgreSQL 16**: Relational Data, UUID Primary Keys, Email Verifications (`users`, `user_sessions`, `projects`, `tasks`)
  - **MongoDB 7**: Audit Logs (`login_audit_logs`), Activity Feeds & Metadata
- **DevOps & Containers**: Docker, Docker Compose, Makefile

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
kanban-board/
├── .env                        # ไฟล์ตั้งค่า Environment Variables สภาพแวดล้อมจริง
├── .env.example                # ตัวอย่างไฟล์ตั้งค่า Environment Variables (พร้อมคำแนะนำ openssl rand -hex 64)
├── docker-compose.yml          # Docker Compose สั่งรัน PostgreSQL (ngaanbaan_postgres), MongoDB (ngaanbaan_mongodb), Backend, Frontend
├── Makefile                    # คำสั่งลัดจัดการระบบ (make frontend, make backend, make db-up, make db-init, make db-reset)
├── note.md                     # เอกสารวางโครงสร้างและนิยาม Schema ฐานข้อมูลล่าสุด (พร้อมสถานะ ✅)
├── README.md                   # เอกสารอธิบายรายละเอียดและวิธีการใช้งานโปรเจกต์
├── backend/                    # Go Backend Service
│   ├── cmd/
│   │   └── server/             # Entry Point แอปพลิเคชันหลังบ้าน (main.go)
│   ├── internal/               # Domain Models, Handlers, Repositories, Services
│   │   ├── handler/            # API Route Handlers (Login, Refresh, Logout, Projects)
│   │   ├── model/              # Go Struct Data Models (User, UserToken, Project, Task)
│   │   ├── repository/         # Database Operations & Queries (PostgreSQL & MongoDB)
│   │   └── service/            # Business Logic & Helpers (JWT, Email Dispatcher)
│   ├── init.sql                # SQL Schema Migration ล่าสุด (Users, Sessions, Projects, Tasks)
│   ├── Dockerfile              # Container Build Config สำหรับ Go Backend
│   └── go.mod                  # Go Dependencies Specification
└── frontend/                   # Next.js Frontend Web Application
    ├── src/
    │   ├── app/                # Next.js App Router (Pages & Routes)
    │   │   ├── (dashboard)/    # Layout เมนูหลัก (Projects, My Tasks, Notifications)
    │   │   ├── login/          # หน้าเข้าสู่ระบบ / ลงทะเบียน / ยืนยันตัวตนอีเมล (Unified Auth Page)
│   │   │   └── reset-password/ # หน้าตั้งรหัสผ่านใหม่ผ่านลิงก์อีเมล (Reset Password Page)
    │   │   └── outdated/       # ซอร์สโค้ดฟีเจอร์เดิมที่พักการใช้งานไว้
    │   ├── components/         # Reusable Components
    │   │   ├── project/        # Components ประจำมุมมองโครงการ (Board, Summary, Calendar, Gantt, Activity)
    │   │   └── ui/             # Global UI Components (TopNavbar, SideNavbar, EmptyProjectState)
    │   ├── hooks/              # Custom React Hooks (useTheme, useLanguage)
    │   └── locales/            # i18n JSON files (th.json, en.json)
    ├── public/                 # Static Assets (Images, Icons)
    ├── Dockerfile              # Container Build Config สำหรับ Next.js Frontend
    └── package.json            # Node.js Dependencies & Scripts
```

---

## 🛠️ คำสั่ง Makefile ทั้งหมด (Makefile Commands)

สามารถใช้คำสั่งลัดผ่าน **Makefile** เพื่อจัดการระบบได้อย่างสะดวกรวดเร็ว:

| คำสั่ง (Command) | คำอธิบายรายละเอียด |
|---|---|
| `make help` | แสดงเมนูและคำอธิบายคำสั่ง Makefile ทั้งหมด |
| `make frontend` | สตาร์ท Next.js Frontend Development Server ([http://localhost:3000](http://localhost:3000)) |
| `make backend` | สตาร์ท Go Backend Development Server ([http://localhost:8080](http://localhost:8080)) |
| `make db-up` | สตาร์ทคอนเทนเนอร์ฐานข้อมูล PostgreSQL และ MongoDB ผ่าน Docker Compose |
| `make db-down` | หยุดการทำงานของคอนเทนเนอร์ฐานข้อมูล |
| `make db-init` | รันอัปเดตและสร้าง Schema ฐานข้อมูลลงใน PostgreSQL ด้วย `backend/init.sql` |
| `make db-reset` | หยุดคอนเทนเนอร์ ลบ Volume ข้อมูลเดิมทั้งหมด และสตาร์ทคอนเทนเนอร์ใหม่เริ่มต้นสดใหม่ |
| `make docker-up` | สตาร์ทบริการทั้งหมด (Databases, Backend, Frontend) ผ่าน Docker Compose |
| `make docker-down` | หยุดการทำงานของบริการทั้งหมดใน Docker Compose |

---

## 🏃‍♂️ วิธีการรันโปรเจกต์ (Getting Started)

### 1. การตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env` ก่อนการใช้งาน:

```bash
cp .env.example .env
```

> 🔑 **คำแนะนำความปลอดภัยสำหรับ JWT Secret:**
> รันคำสั่งด้านล่างนี้ใน Terminal เพื่อสร้างคีย์สุ่มแบบปลอดภัย 256-bit แล้วนำค่าที่ได้ไปใส่ที่ `JWT_SECRET` ในไฟล์ `.env`:
> ```bash
> openssl rand -hex 64
> ```

---

### 2. รันโปรเจกต์ผ่าน Docker Compose (แนะนำ) 🐳

สั่งรันฐานข้อมูล (PostgreSQL & MongoDB), Backend (Go) และ Frontend (Next.js) ทั้งหมดได้ด้วยคำสั่งเดียว:

```bash
make docker-up
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Email Dispatch Tester**: [http://localhost:3000/email-test](http://localhost:3000/email-test)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **PostgreSQL**: `localhost:5435` (Database: `ngaanbaan_db`, User: `ngaanbaan_user`)
- **MongoDB**: `localhost:27010` (Database: `ngaanbaan_logs`, User: `ngaanbaan_mongo_user`)

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

*(หากต้องการนำเข้า Schema ตารางฐานข้อมูลใหม่ ให้รัน `make db-init` หรือหากต้องการล้างข้อมูลเก่าทั้งหมดเริ่มใหม่ให้รัน `make db-reset`)*

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
