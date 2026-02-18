# Deploy Guide — SCH-KPRU บน Dokploy

## สารบัญ
1. [ภาพรวม](#ภาพรวม)
2. [Prerequisites](#prerequisites)
3. [1. สร้าง PostgreSQL Database](#1-สร้าง-postgresql-database)
4. [2. Deploy Backend (API)](#2-deploy-backend-api)
5. [3. Deploy Frontend](#3-deploy-frontend)
6. [4. ตั้งค่า Domain & SSL](#4-ตั้งค่า-domain--ssl)
7. [5. ตรวจสอบหลัง Deploy](#5-ตรวจสอบหลัง-deploy)
8. [หมายเหตุ N8n](#หมายเหตุ-n8n)

---

## ภาพรวม

| Service  | Image/Source        | Port | Domain ตัวอย่าง              |
|----------|---------------------|------|-------------------------------|
| Database | PostgreSQL (managed)| 5432 | (internal)                    |
| Backend  | Dockerfile          | 8080 | `api.sch-kpru.yourdomain.com` |
| Frontend | Dockerfile          | 3000 | `sch-kpru.yourdomain.com`     |
| N8n      | (แยก deploy)        | 5678 | `n8n.sch-kpru.yourdomain.com` |

---

## Prerequisites

- Dokploy ติดตั้งบน server เรียบร้อย
- Domain ชี้ A record มาที่ server IP แล้ว
- Git repository เข้าถึงได้จาก Dokploy (GitHub / GitLab / self-hosted)

---

## 1. สร้าง PostgreSQL Database

1. ไปที่ **Dokploy → Databases → Create Database**
2. เลือก **PostgreSQL**
3. ตั้งชื่อ: `sch-kpru-db`
4. กำหนด:
   - **Database Name**: `sch-kpru`
   - **Username**: `sch-kpru-user`
   - **Password**: (สุ่มเอง ให้แข็งแรง)
5. กด **Deploy**
6. หลัง deploy เสร็จ ไปดู **Connection String** ที่ Dokploy สร้างให้ เก็บไว้ใช้ใน step ถัดไป

> **หมายเหตุ:** Connection string จะอยู่ในรูปแบบ  
> `Host=<internal-host>;Database=sch-kpru;Username=sch-kpru-user;Password=<password>`

---

## 2. Deploy Backend (API)

### 2.1 สร้าง Application

1. ไปที่ **Dokploy → Applications → Create Application**
2. **Source**: เลือก Git repository → branch `main`
3. **Build Type**: `Dockerfile`
4. **Dockerfile Path**: `backend/SchKpruApi/Dockerfile`
5. **Build Context**: `backend/SchKpruApi`

### 2.2 ตั้งค่า Environment Variables

ไปที่ tab **Environment** แล้วใส่ค่าต่อไปนี้:

```env
# Database
DB_CONNECTION_STRING=Host=<db-internal-host>;Database=sch-kpru;Username=sch-kpru-user;Password=<password>

# JWT
JWT_SECRET=<สุ่ม random string ยาว 64 ตัวอักษรขึ้นไป>
JWT_ISSUER=SchKpruApi
JWT_AUDIENCE=SchKpruClient

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# Webhook / N8n
WebhookOptions__Enabled=true
WebhookOptions__N8nBaseUrl=https://n8n.sch-kpru.yourdomain.com
WebhookOptions__ComplaintNewPath=/webhook/complaint/new
WebhookOptions__RewriteFormalPath=/webhook/text/rewrite-formal

# AWS S3
AWS__AccessKey=<access-key>
AWS__SecretKey=<secret-key>
AWS__Region=<region>
AWS__ServiceURL=<s3-endpoint>
AWS__ForcePathStyle=true
AWS__S3BucketName=<bucket-name>
```

> **สำคัญ:** ใช้ `__` (double underscore) แทน `:` สำหรับ nested config ใน ASP.NET Core

### 2.3 ตั้งค่า Port

- **Container Port**: `8080`

### 2.4 Deploy

กด **Deploy** รอจน status เป็น `Running`

---

## 3. Deploy Frontend

### 3.1 สร้าง Application

1. ไปที่ **Dokploy → Applications → Create Application**
2. **Source**: เลือก Git repository → branch `main`
3. **Build Type**: `Dockerfile`
4. **Dockerfile Path**: `frontend/Dockerfile`
5. **Build Context**: `frontend`

### 3.2 ตั้งค่า Build Arguments

> ⚠️ **ต้องใส่ใน Build Arguments ไม่ใช่ Environment Variables**  
> เพราะ `NEXT_PUBLIC_*` จะถูก bake เข้า bundle ตอน build time

ไปที่ tab **Build Arguments**:

```
NEXT_PUBLIC_API_URL=https://api.sch-kpru.yourdomain.com
NEXT_PUBLIC_APP_ENV=production
```

### 3.3 ตั้งค่า Port

- **Container Port**: `3000`

### 3.4 Deploy

กด **Deploy** รอจน status เป็น `Running`

---

## 4. ตั้งค่า Domain & SSL

Dokploy ใช้ **Traefik** จัดการ domain และ SSL (Let's Encrypt) อัตโนมัติ

### Backend

1. ไปที่ Application backend → tab **Domains**
2. **Add Domain**:
   - **Host**: `api.sch-kpru.yourdomain.com`
   - **Port**: `8080`
   - **HTTPS**: เปิด (Dokploy ออก cert ให้อัตโนมัติ)

### Frontend

1. ไปที่ Application frontend → tab **Domains**
2. **Add Domain**:
   - **Host**: `sch-kpru.yourdomain.com`
   - **Port**: `3000`
   - **HTTPS**: เปิด

---

## 5. ตรวจสอบหลัง Deploy

### Health Check Backend

```
GET https://api.sch-kpru.yourdomain.com/health
```

ควรได้ response `200 OK`

### ตรวจสอบ Database Migration

Backend จะ run `dotnet ef database update` อัตโนมัติตอน startup ดู log ใน Dokploy:

```
✅ Migration applied
✅ Data seeded
```

### CORS

ถ้าเปลี่ยน domain ต้องแก้ไฟล์ [backend/SchKpruApi/Program.cs](../backend/SchKpruApi/Program.cs) บรรทัด `WithOrigins(...)` ให้ตรงกับ domain จริง แล้ว redeploy:

```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://sch-kpru.yourdomain.com"  // ← แก้ตรงนี้
)
```

---

## หมายเหตุ N8n

N8n ควร deploy แยกต่างหาก (สามารถใช้ Dokploy ได้เช่นกัน)

- ใช้ image: `n8nio/n8n`
- Port: `5678`
- Domain ตัวอย่าง: `n8n.sch-kpru.yourdomain.com`

หลังจาก N8n พร้อมแล้ว ให้อัปเดต env ของ Backend:

```env
WebhookOptions__N8nBaseUrl=https://n8n.sch-kpru.yourdomain.com
```

และ import workflow จากไฟล์ใน `n8n/` ของ repo นี้

---

## สรุป Checklist

- [ ] PostgreSQL database สร้างแล้ว ได้ connection string
- [ ] Backend deploy แล้ว — env vars ครบ โดยเฉพาะ `DB_CONNECTION_STRING`, `JWT_SECRET`
- [ ] Frontend deploy แล้ว — **Build Arguments** `NEXT_PUBLIC_API_URL` ถูกต้อง
- [ ] Domain และ SSL ตั้งค่าแล้วทั้ง backend และ frontend
- [ ] เรียก `/health` แล้วได้ `200 OK`
- [ ] Login เข้าระบบได้ปกติ
- [ ] N8n webhook ทำงานได้
