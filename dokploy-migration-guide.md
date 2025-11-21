# Dokploy Migration Guide

This guide outlines the steps to migrate your deployment from GitHub Actions (SSH + Docker Compose) to Dokploy.

## 1. Database Setup (Postgres)
Instead of running Postgres in a container manually, use Dokploy's managed Database feature.

1.  Go to your Dokploy Dashboard.
2.  Click on **Databases** -> **Create Database**.
3.  Select **PostgreSQL**.
4.  Name: `sch-kpru-db` (or similar).
5.  Once created, note down the **Internal Connection URL** (for backend) and **External Connection URL** (for local access/migration).
6.  **Migration**:
    *   You can use a tool like DBeaver or `pg_dump`/`psql` to migrate your data from the old VPS to the new Dokploy database.
    *   Alternatively, if starting fresh, the backend will create tables automatically (ensure `dotnet ef database update` is run or configured).

## 2. Backend Deployment
1.  Go to **Applications** -> **Create Application**.
2.  Name: `sch-kpru-backend`.
3.  **Source**: Select your GitHub Repository (`hamhapichai/SCH-KPRU`).
4.  **Branch**: `main`.
5.  **Build Type**: `Dockerfile`.
6.  **Context Path**: `./backend/SchKpruApi`.
7.  **Dockerfile Path**: `Dockerfile`.
8.  **Environment Variables**:
    *   `ASPNETCORE_ENVIRONMENT`: `Production`
    *   `ConnectionStrings__DefaultConnection`: (Use the Internal Connection URL from Step 1)
    *   `Jwt__Key`: (Copy from your `.env.prod` or GitHub Secrets)
    *   `Jwt__Issuer`: `SCH-KPRU`
    *   `Jwt__Audience`: `SCH-KPRU-Users`
    *   `WebhookOptions__N8nBaseUrl`: (Your N8n URL)
9.  **Advanced -> Network**:
    *   Dokploy uses Traefik. You don't need Nginx.
    *   Domain: `api.sch-kpru.blurger.dev` (Recommended to use a subdomain for the API).
    *   Container Port: `8080`.

## 3. Frontend Deployment
1.  Go to **Applications** -> **Create Application**.
2.  Name: `sch-kpru-frontend`.
3.  **Source**: GitHub Repository.
4.  **Branch**: `main`.
5.  **Build Type**: `Dockerfile`.
6.  **Context Path**: `./frontend`.
7.  **Dockerfile Path**: `Dockerfile`.
8.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: `https://api.sch-kpru.blurger.dev` (Point to the Backend Domain set in Step 2).
    *   `NEXT_PUBLIC_APP_ENV`: `production`.
9.  **Advanced -> Network**:
    *   Domain: `sch-kpru.blurger.dev`.
    *   Container Port: `3000`.

## 4. N8n (Optional)
1.  You can deploy N8n as a **Docker Compose** application in Dokploy or a simple **Application** using the `n8n/n8n` image.
2.  Domain: `n8n.sch-kpru.blurger.dev`.

## 5. CI/CD Updates
We will modify your `.github/workflows/cd.yml` to:
1.  **Keep**: Tests (Backend & Frontend).
2.  **Remove**: Build, Push, Deploy, Migrate, Backup steps (Dokploy handles deployment).
3.  **Optional**: Add a webhook trigger to auto-deploy on push (Dokploy has an "Auto Deploy" toggle in the Application settings, which is easier).

## 6. Final Switch
1.  Once Dokploy services are running and healthy, update your DNS records (A records) to point to your Dokploy VPS IP.
2.  Dokploy (Traefik) will automatically handle SSL Certificates (Let's Encrypt).

---

# คู่มือการย้ายไปใช้ Dokploy (Thai Version)

คู่มือนี้จะแนะนำขั้นตอนการย้ายระบบจาก GitHub Actions (SSH + Docker Compose) ไปยัง Dokploy

## 1. การตั้งค่าฐานข้อมูล (Database Setup)
แทนที่จะรัน Postgres ด้วย Docker Compose แบบเดิม เราจะใช้ฟีเจอร์ Database ของ Dokploy

1.  ไปที่ Dokploy Dashboard
2.  คลิกที่ **Databases** -> **Create Database**
3.  เลือก **PostgreSQL**
4.  ตั้งชื่อ: `sch-kpru-db`
5.  เมื่อสร้างเสร็จ ให้จดค่า **Internal Connection URL** (สำหรับ Backend) และ **External Connection URL** (สำหรับต่อจากเครื่องเราเพื่อย้ายข้อมูล)
6.  **การย้ายข้อมูล (Migration)**:
    *   ใช้โปรแกรมเช่น DBeaver หรือคำสั่ง `pg_dump`/`psql` เพื่อดึงข้อมูลจาก VPS เก่ามาใส่ใน Database ใหม่ของ Dokploy
    *   หรือถ้าจะเริ่มใหม่ Backend จะสร้างตารางให้เองอัตโนมัติ (ตราบใดที่โค้ดมีการรัน migration)

## 2. การ Deploy Backend
1.  ไปที่ **Applications** -> **Create Application**
2.  ตั้งชื่อ: `sch-kpru-backend`
3.  **Source**: เลือก GitHub Repository ของคุณ (`hamhapichai/SCH-KPRU`)
4.  **Branch**: `main`
5.  **Build Type**: `Dockerfile`
6.  **Context Path**: `./backend/SchKpruApi`
7.  **Dockerfile Path**: `Dockerfile`
8.  **Environment Variables**:
    *   `ASPNETCORE_ENVIRONMENT`: `Production`
    *   `ConnectionStrings__DefaultConnection`: (ใช้ Internal Connection URL จากข้อ 1)
    *   `Jwt__Key`: (ก๊อปปี้จาก `.env.prod` เดิม หรือจาก GitHub Secrets)
    *   `Jwt__Issuer`: `SCH-KPRU`
    *   `Jwt__Audience`: `SCH-KPRU-Users`
    *   `WebhookOptions__N8nBaseUrl`: (URL ของ N8n)
9.  **Advanced -> Network**:
    *   Dokploy ใช้ Traefik จัดการเรื่อง Network ให้ ไม่ต้องใช้ Nginx เองแล้ว
    *   Domain: `api.sch-kpru.blurger.dev`
    *   Container Port: `8080`

## 3. การ Deploy Frontend
1.  ไปที่ **Applications** -> **Create Application**
2.  ตั้งชื่อ: `sch-kpru-frontend`
3.  **Source**: GitHub Repository
4.  **Branch**: `main`
5.  **Build Type**: `Dockerfile`
6.  **Context Path**: `./frontend`
7.  **Dockerfile Path**: `Dockerfile`
8.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: `https://api.sch-kpru.blurger.dev` (ชี้ไปที่ Domain ของ Backend ที่ตั้งในข้อ 2)
    *   `NEXT_PUBLIC_APP_ENV`: `production`
9.  **Advanced -> Network**:
    *   Domain: `sch-kpru.blurger.dev`
    *   Container Port: `3000`

## 4. N8n (ทางเลือก)
1.  สามารถ Deploy N8n โดยใช้ **Docker Compose** ใน Dokploy หรือสร้าง **Application** ใหม่โดยใช้ image `n8n/n8n`
2.  Domain: `n8n.sch-kpru.blurger.dev`

## 5. อัปเดต CI/CD
เราได้แก้ไขไฟล์ `.github/workflows/cd.yml` เป็น `ci.yml` แล้ว:
1.  **เก็บไว้**: การรัน Test (Backend & Frontend)
2.  **ลบออก**: ขั้นตอน Build, Push, Deploy, Migrate, Backup (เพราะ Dokploy จะจัดการเรื่อง Deploy ให้)
3.  **เพิ่มเติม**: สามารถตั้งค่า Webhook ใน Dokploy ให้ Auto Deploy เมื่อมีการ Push โค้ดใหม่ได้ (เปิด "Auto Deploy" ในหน้าตั้งค่า Application)

## 6. ขั้นตอนสุดท้าย
1.  เมื่อ Service ทุกอย่างใน Dokploy รันขึ้นมาและสถานะเป็น Healthy (สีเขียว)
2.  ให้อัปเดต DNS Records (A Records) ให้ชี้มาที่ IP ของเครื่อง VPS ที่ลง Dokploy ไว้
3.  Dokploy (Traefik) จะจัดการเรื่อง HTTPS/SSL ให้เองอัตโนมัติ
