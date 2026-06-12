# TVET Hub - Deployment Guide

Complete guide for deploying TVET Hub to production.

## Pre-Deployment Checklist ✅

- [ ] Update `JWT_SECRET` and `JWT_REFRESH_SECRET` to secure random values
- [ ] Configure production `DATABASE_URL`
- [ ] Set `NODE_ENV=production`
- [ ] Review and test all API endpoints
- [ ] Run full build: `npm run build`
- [ ] Test production build locally: `npm run start`

## Environment Variables (Production)

Create a `.env.production` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/tvet_hub_prod

# JWT Secrets (MUST be different from dev!)
JWT_SECRET=<generate-with: openssl rand -base64 64>
JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 64>

# App
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://tvethub.et

# Email (optional - for notifications)
RESEND_API_KEY=re_xxxxx

# SMS (optional - for notifications)
AFRO_MESSAGE_API_KEY=xxxxx

# Payments (optional - for subscriptions)
CHAPA_SECRET_KEY=xxxxx

# File Storage (optional - for CVs/certificates)
S3_ACCESS_KEY=xxxxx
S3_SECRET_KEY=xxxxx
S3_BUCKET=tvet-hub-uploads
S3_REGION=us-east-1
```

## Deployment Options

### Option 1: Traditional VPS (Ubuntu Server)

**Recommended for Ethiopian hosting (e.g., Ethio Telecom Data Center)**

#### 1. Server Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tvet_hub_prod;
CREATE USER tvet_admin WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tvet_hub_prod TO tvet_admin;
\q
```

#### 3. Application Deployment

```bash
# Create app directory
sudo mkdir -p /var/www/tvet-hub
sudo chown $USER:$USER /var/www/tvet-hub
cd /var/www/tvet-hub

# Clone repository (or upload via SCP)
git clone <your-repo-url> .

# Install dependencies
npm ci --production

# Set up environment
cp .env.production .env

# Build application
npm run build

# Push database schema
npm run db:push

# Seed initial data (optional)
npm run db:seed

# Start with PM2
pm2 start npm --name "tvet-hub" -- start
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/tvethub.et
server {
    listen 80;
    server_name tvethub.et www.tvethub.et;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tvethub.et /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d tvethub.et -d www.tvethub.et

# Auto-renewal is configured automatically
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://tvet_admin:secure_password@db:5432/tvet_hub_prod
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=tvet_hub_prod
      - POSTGRES_USER=tvet_admin
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

```bash
# Deploy
docker-compose up -d
```

### Option 3: Vercel (Easiest - for MVP/testing)

**⚠️ Note:** Vercel serverless has limitations for ILJC workflow. Use for MVP only.

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add external PostgreSQL (Neon, Supabase, or Railway)
```

### Option 4: Railway / Render

**Good middle ground: easier than VPS, more control than Vercel**

1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push

## Database Migration (Production)

**⚠️ Use migrations for production, not `drizzle-kit push`**

```bash
# Generate migration
npx drizzle-kit generate:pg

# Review migration files in drizzle/ folder

# Apply migration (production)
npx drizzle-kit migrate
```

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View logs
pm2 logs tvet-hub

# Monitor resources
pm2 monit

# Restart app
pm2 restart tvet-hub

# View status
pm2 status
```

### Database Backups

```bash
# Manual backup
pg_dump -U tvet_admin -h localhost tvet_hub_prod > backup_$(date +%Y%m%d).sql

# Automated daily backups (crontab)
0 2 * * * pg_dump -U tvet_admin tvet_hub_prod | gzip > /backups/tvet_$(date +\%Y\%m\%d).sql.gz
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/tvet-hub

# Add:
/var/www/tvet-hub/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
}
```

## Security Hardening

### 1. Firewall

```bash
# UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. PostgreSQL Security

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Set:
listen_addresses = 'localhost'
ssl = on

# Restrict pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Only allow local connections
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

### 4. Rate Limiting (Nginx)

```nginx
# Add to nginx.conf
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    server {
        location /api/ {
            limit_req zone=api_limit burst=20;
        }
    }
}
```

## Performance Optimization

### 1. Database Indexes

Already defined in schema. Verify with:

```sql
-- Check indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### 2. CDN for Static Assets

Configure Next.js to use CDN:

```js
// next.config.ts
const config = {
  assetPrefix: process.env.CDN_URL || '',
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
};
```

### 3. Caching

**Redis for session caching:**

```bash
# Install Redis
sudo apt install -y redis-server

# Configure
sudo systemctl enable redis-server
```

Update `src/lib/cache.ts` to use Redis instead of in-memory caching.

## Scaling Strategy

### Phase 1: Single Server (0-1,000 users)
- Single VPS (4GB RAM, 2 CPU)
- PostgreSQL on same server
- PM2 clustering (4 processes)

### Phase 2: Separated Database (1,000-10,000 users)
- App server (8GB RAM, 4 CPU)
- Database server (16GB RAM, 4 CPU)
- Nginx load balancing

### Phase 3: Horizontal Scaling (10,000+ users)
- Multiple app servers behind load balancer
- PostgreSQL read replicas
- Redis cluster for session storage
- CDN for static assets
- S3 for file storage

### Phase 4: Multi-Region (National Scale)
- Regional app servers (Addis, Adama, Mekelle, etc.)
- Database sharding by institution
- Edge caching with Cloudflare

## Health Checks

```bash
# App health
curl https://tvethub.et/api/health

# Database health
pg_isready -h localhost -p 5432

# Nginx status
sudo systemctl status nginx

# PM2 status
pm2 status
```

## Rollback Procedure

```bash
# 1. Stop current version
pm2 stop tvet-hub

# 2. Restore previous code
git checkout <previous-commit-hash>

# 3. Rebuild
npm run build

# 4. Restore database backup (if schema changed)
psql -U tvet_admin tvet_hub_prod < backup_YYYYMMDD.sql

# 5. Restart
pm2 restart tvet-hub
```

## Support Contacts

For production issues:

- **Technical Lead**: dev@gwptc.edu.et
- **ILJC Officer**: iljc@gwptc.edu.et
- **Emergency**: +251 XXX XXX XXX

---

**Deploy with confidence! 🚀**
