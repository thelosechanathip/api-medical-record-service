# API Medical Record Audit

## วิธีติดตั้งใช้งาน API
### 1. Clone project api-medical-record-service:
```
git clone https://github.com/thelosechanathip/api-medical-record-service.git
```

### 2. ติดตั้ง dependencies:
```
npm install
```
หรือ
```
npm i
```

### 3. Generate Prisma
```
npx prisma generate
```

### 4. สร้าง file .env โดยอ้างอิงจาก .env.example

### 5. Set ข้อมูลเบื้องต้น
แก้ไขข้อมูลให้ตรงกับที่โรงพยาบาลใช้งานใน PATH: prisma/seed.js แล้ว RUN คำสั่งด้านล่างเพื่อบันทึกข้อมูลเบื้องต้น
```
npx prisma db push
npx prisma db seed
```

### 6. Set Database บน .env และเริ่มทดสอบการใช้งาน
⁉️ หมายเหตุ ⁉️ ระบบนี้ใช้งานฐานข้อมูล 3 ฐาน ดังนี้:

    1. Backoffice
    2. HOSxP
    3. medical_record

### หมายเหตุก่อน Compiler
```
npm ci
npx prisma generate
npm run build:bundle
npm run build:obf
npm prune --omit=dev
```