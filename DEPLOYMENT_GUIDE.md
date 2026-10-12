# CampusConnect – Complete Free Online Deployment Guide

This guide walks you through deploying **CampusConnect** online completely free so anyone (instructors, evaluators, students) can access the app from any smartphone or computer anywhere in the world.

---

## 🏗️ Architecture Overview

| Component | Technology | Free Online Hosting Platform |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo Web) | **Vercel** (Free, Global CDN, SSL) |
| **Backend** | Node.js + Express REST API | **Render** or **Railway** (Free Tier) |
| **Database** | Microsoft SQL Server | **Railway** (Docker MS SQL) or **Azure Free Tier** |

---

## ⚡ Step 1: Push Project to GitHub

1. Open PowerShell in the project directory:
   ```powershell
   cd "d:\Development\University Projects\SDP 03\CampusConnect"
   git init
   git add .
   git commit -m "Initial commit of CampusConnect with MS SQL and React Native"
   ```
2. Create a new repository on [GitHub.com](https://github.com/new) (e.g. `CampusConnect`).
3. Push your code:
   ```powershell
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/CampusConnect.git
   git branch -M main
   git push -u origin main
   ```

---

## 🗄️ Step 2: Deploy MS SQL Server & Backend (on Railway or Render)

### Option A: Railway (Recommended — Runs MS SQL Server & Node.js together)
1. Go to [railway.app](https://railway.app) and sign up with GitHub.
2. Click **"New Project"** $\rightarrow$ **"Deploy from GitHub repo"** $\rightarrow$ Select `CampusConnect`.
3. Add a Database Service:
   - Click **+ New** $\rightarrow$ **Docker Image**.
   - Image name: `mcr.microsoft.com/mssql/server:2022-latest`.
   - In Variables, set:
     - `ACCEPT_EULA` = `Y`
     - `SA_PASSWORD` = `CampusConnect2026!`
     - `MSSQL_PID` = `Express`
4. In your Backend Service, set Variables:
   - `DB_SERVER` = *(Railway MS SQL service private domain)*
   - `DB_USER` = `sa`
   - `DB_PASSWORD` = `CampusConnect2026!`
   - `DB_NAME` = `CampusConnectDB`
   - `DB_PORT` = `1433`
   - `DB_ENCRYPT` = `false`
   - `DB_TRUST_CERT` = `true`
   - `JWT_SECRET` = `campus_connect_jwt_secret_key_sdp03_bubt_2026!`
5. In **Settings** $\rightarrow$ **Networking**, click **Generate Domain** (e.g., `https://campusconnect-api.up.railway.app`).
   *On first boot, the backend automatically initializes all tables and seed data!*

---

### Option B: Render (Web Service)
1. Go to [render.com](https://render.com) and create an account.
2. Click **New +** $\rightarrow$ **Web Service** $\rightarrow$ Connect your GitHub repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `DB_SERVER` = *(Your Cloud MS SQL host)*
   - `DB_USER` = `campus_admin`
   - `DB_PASSWORD` = `CampusConnect2026!`
   - `DB_NAME` = `CampusConnectDB`
   - `DB_PORT` = `1433`
   - `JWT_SECRET` = `campus_connect_jwt_secret_key_sdp03_bubt_2026!`
5. Click **Create Web Service**. Your API will be live at `https://your-app-name.onrender.com`.

---

## 📱 Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New Project"** $\rightarrow$ Select your `CampusConnect` repository.
3. Configure Project Settings:
   - **Root Directory**: Click *Edit* and select **`mobile`**.
   - **Framework Preset**: Other
   - **Build Command**: `npx expo export -p web`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - Key: `EXPO_PUBLIC_API_URL`
   - Value: `https://your-backend-service-url.up.railway.app/api` *(or your Render URL)*
5. Click **"Deploy"**.

✅ **Done!** Vercel gives you an immediate live HTTPS link (e.g. `https://campusconnect-bubt.vercel.app`) that works on any smartphone, tablet, and computer globally!

---

## ⚡ Instant Alternative: Share Live Now with Cloudflare Tunnel (Zero Setup)

If you want to share a live public HTTPS URL **right now** directly from your running computer without setting up cloud databases:

1. Install Cloudflare tunnel:
   ```powershell
   winget install --id Cloudflare.cloudflared
   ```
2. In one terminal, expose your frontend:
   ```powershell
   cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare gives you a free secure public link (e.g., `https://xxxx.trycloudflare.com`) that you can send to your teacher or team immediately!
