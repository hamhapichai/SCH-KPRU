# SCH-KPRU Production Deployment Guide

## 🚀 ขั้นตอนการ Deploy ขึ้น Production

### 1. เตรียม VPS และติดตั้งซอฟต์แวร์ที่จำเป็น

```bash
# อัพเดต system
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# ติดตั้ง Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ติดตั้ง Make
sudo apt install make -y

# ติดตั้ง Git
sudo apt install git -y

# รีบูทเพื่อให้ Docker permissions มีผล
sudo reboot
```

### 2. Clone โปรเจกต์และเตรียมไฟล์

```bash
# Clone โปรเจกต์
git clone https://github.com/hamhapichai/SCH-KPRU.git
cd SCH-KPRU

# สร้างไฟล์ environment
cp .env.prod.example .env.prod
```

### 3. แก้ไขไฟล์ .env.prod

แก้ไขไฟล์ `.env.prod` ดังนี้:

```bash
# แก้ไขด้วย nano หรือ vim
nano .env.prod
```

**ค่าที่ต้องแก้ไขให้เหมาะสม:**

```bash
# Database - ใส่รหัสผ่านที่ปลอดภัย
POSTGRES_PASSWORD=your_very_secure_password_here

# JWT Secret - สร้างด้วยคำสั่ง: openssl rand -hex 32
JWT_SECRET=your_generated_jwt_secret_here

# URLs - เปลี่ยนเป็น domain ของคุณ
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# อื่นๆ ตามต้องการ
OPENAI_API_KEY=your_openai_key_if_using_ai
```

### 4. ตั้งค่า Nginx สำหรับ Domain และ SSL

แก้ไขไฟล์ `nginx/nginx.conf`:

```bash
nano nginx/nginx.conf
```

เปลี่ยน `server_name localhost;` เป็น:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 5. สร้าง SSL Certificate (แนะนำ Let's Encrypt)

```bash
# ติดตั้ง Certbot
sudo apt install certbot -y

# สร้าง SSL cert (ทำหลังจาก deploy แล้ว)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### 6. เปิด Firewall

```bash
# เปิด ports ที่จำเป็น
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 7. Deploy Application

```bash
# ตรวจสอบ environment variables
make check-env

# Build และ start services
make deploy-prod

# หรือทำทีละขั้นตอน
make prod-build
make prod-up
```

### 8. ตั้งค่า SSL/HTTPS

หลังจาก deploy เสร็จแล้ว:

```bash
# Copy SSL certificates จาก Let's Encrypt
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*

# Enable HTTPS ใน nginx config
# แก้ไข nginx/nginx.conf ให้ uncomment HTTPS server block
nano nginx/nginx.conf

# Restart nginx
make restart-nginx
```

### 9. ตั้งค่า Auto-renewal สำหรับ SSL

```bash
# เพิ่ม cron job สำหรับ renew SSL
sudo crontab -e

# เพิ่มบรรทัดนี้
0 12 * * * /usr/bin/certbot renew --quiet && docker restart sch-kpru-nginx-prod
```

### 10. ตั้งค่า Backup อัตโนมัติ

```bash
# สร้าง script สำหรับ backup
mkdir -p ~/backups

# เพิ่ม cron job สำหรับ backup
crontab -e

# เพิ่มบรรทัดนี้ (backup ทุกคืนเวลา 2:00)
0 2 * * * cd /path/to/SCH-KPRU && make backup-all
```

## 🔧 คำสั่งที่มีประโยชน์

### ตรวจสอบสถานะ

```bash
# ดูสถานะ services
make status

# ดู logs
make prod-logs

# ดู logs แยกตาม service
make logs-backend
make logs-frontend
make logs-db

# ตรวจสอบ health
make health
```

### จัดการ Database

```bash
# Backup database
make db-backup

# Restore database
make db-restore FILE=backup_file.sql

# เข้า database shell
make db-shell
```

### อัพเดทแอป

```bash
# Pull โค้ดใหม่
git pull origin main

# Rebuild และ restart
make prod-build
make prod-restart

# หรือ rebuild เฉพาะ service
make rebuild-backend
make rebuild-frontend
```

### Emergency Commands

```bash
# หยุด services ฉุกเฉิน
make emergency-stop

# ล้างทุกอย่างใหม่
make emergency-clean
```

## 🌐 URLs หลังจาก Deploy

- **Main Application**: https://yourdomain.com
- **API Documentation**: https://yourdomain.com/swagger
- **Health Check**: https://yourdomain.com/health

## 🛡️ Security Checklist

- [ ] เปลี่ยน default passwords ทั้งหมด
- [ ] ตั้งค่า JWT secret ที่ปลอดภัย
- [ ] ใช้ HTTPS/SSL
- [ ] ตั้งค่า Firewall
- [ ] ตั้งค่า rate limiting
- [ ] สำรอง database เป็นประจำ
- [ ] อัพเดท system เป็นประจำ
- [ ] Monitor logs เป็นประจำ

## 📊 Monitoring

```bash
# ดู resource usage
make monitor

# ดู disk usage
make disk-usage

# ดู logs แบบ real-time
make prod-logs
```

## 🔄 Auto-renewal SSL Script

สร้างไฟล์ `/home/user/renew-ssl.sh`:

```bash
#!/bin/bash
cd /path/to/SCH-KPRU
certbot renew --quiet
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
docker restart sch-kpru-nginx-prod
```

```bash
chmod +x /home/user/renew-ssl.sh
```

## 🚨 Troubleshooting

### ถ้า containers ไม่ start

```bash
# ดู logs เพื่อหาปัญหา
docker-compose -f docker-compose.prod.yml logs

# ตรวจสอบ disk space
df -h

# ตรวจสอบ memory
free -h
```

### ถ้า database ไม่เชื่อมต่อได้

```bash
# ตรวจสอบ postgres container
docker exec sch-kpru-postgres-prod pg_isready -U sch_kpru_user

# ดู postgres logs
make logs-db
```

### ถ้า SSL มีปัญหา

```bash
# ตรวจสอบ certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# ทดสอบ SSL
curl -I https://yourdomain.com
```