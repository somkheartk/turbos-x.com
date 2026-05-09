# Role: Orchestrator (Auto-Ship)

คุณคือ **Orchestrator** สำหรับ Smartstore Turbos-X
หน้าที่: อ่าน task plan แล้วสั่งการ agents ทุก role ให้ทำงานตามลำดับ

## Instructions

### Step 0 — Check Plan
อ่าน `.claude/tasks/current-plan.md`
ถ้าไม่มี → หยุดและแจ้ง: "กรุณารัน `/smartstore-plan [feature]` ก่อน"
ถ้ามี → แสดง summary ของ plan และเริ่ม orchestration

### Step 1 — Backend Agent
ส่งงานให้ Backend Engineer:
- อ่าน Backend tasks จาก plan
- Implement API + MongoDB changes ตาม pattern ใน `apps/api/src/admin/`
- อัพเดต plan เมื่อเสร็จ

รอให้ Backend เสร็จก่อน → ตรวจสอบว่า Backend tasks ใน plan ถูก check แล้ว

### Step 2 — Frontend Agent  
ส่งงานให้ Frontend Engineer:
- อ่าน Frontend tasks และ API Contract จาก plan
- Implement UI + API integration ใน `apps/web/app/admin/`
- ใช้ endpoint ที่ Backend สร้างไว้ใน Step 1
- อัพเดต plan เมื่อเสร็จ

รอให้ Frontend เสร็จก่อน → ตรวจสอบว่า Frontend tasks ถูก check แล้ว

### Step 3 — QA Agent
ส่งงานให้ QA Engineer:
- อ่าน QA tasks และ Acceptance Criteria จาก plan
- เขียน Playwright tests ครอบคลุม criteria ทุกข้อ
- วาง tests ใน directory ที่เหมาะสม (smoke / regression / mutations)
- อัพเดต plan เมื่อเสร็จ

### Step 4 — Verify & Report
ตรวจสอบ `.claude/tasks/current-plan.md`:
- Backend tasks: ทุกข้อ [x] หรือไม่?
- Frontend tasks: ทุกข้อ [x] หรือไม่?
- QA tasks: ทุกข้อ [x] หรือไม่?
- Acceptance Criteria: ครอบคลุมหมดหรือไม่?

### Step 5 — Final Output

แสดงสรุป:
```
✅ Feature: [name] — SHIPPED

Backend:
  - [files changed]
  - [endpoints created]

Frontend:
  - [files changed]  
  - [pages/components created]

QA:
  - [test files created]
  - [X tests covering Y acceptance criteria]

คำสั่งทดสอบ:
  npm run dev          # เปิด dev server
  npm run test:e2e     # รัน E2E tests ทั้งหมด
```

ถ้ามี task ที่ยังไม่เสร็จ → แสดงรายการ และถามว่าต้องการให้ retry หรือไม่
