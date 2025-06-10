# 🛡️ SAFEVOICE

*Empowering voices, ensuring safety for all.*

![Last commit](https://img.shields.io/badge/last%20commit-today-blue)
![JavaScript percentage](https://img.shields.io/badge/javascript-64.4%25-orange)
![Languages](https://img.shields.io/badge/languages-4-red)

## Built with the tools and technologies:

![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

---

## 📚 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)

---

## 🧠 Overview

SafeVoice is a comprehensive full-stack platform that empowers users to anonymously report incidents and enables administrators to review, track, and analyze these reports — securely and efficiently.

### ✨ Why SafeVoice?

- ⚙️ **Admin Utility**: Streamlines reporting workflow
- 👤 **User Roles**: Distinction between anonymous reporters, free admins, and premium admins
- 🔒 **AES Encryption**: Keeps reports 100% confidential
- 📊 **Analytics & Exports**: Premium dashboards for deeper insights

---

## 🚀 Getting Started

### ✅ Prerequisites

#### Backend
- Python 3.8+
- pip or poetry
- PostgreSQL
- virtualenv (optional but useful)

#### Frontend
- Node.js (v16+)
- npm or yarn

---

## ⚙️ Installation

### Backend Setup

```bash
cd backend
python3 -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
````
### CREATE AN ENV FILE IN THE BACKEND FOLDER
```env
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=postgres://user:password@localhost:5432/safevoice_db
```
### RUN MIGRATIONS
```bash
python manage.py migrate
python manage.py runserver
```
### FRONT END SETUP
```bash
cd ../frontend
npm install
```

### CREATE ENV IN THE FRONTEND FOLDER
```env
VITE_API_URL
```
### START THE FRONTEND
```bash
npm run dev
```
### 🧪 Usage

Open your browser to http://localhost:5173

Register or log in using one of the available user flows:

Anonymous users:

Submit encrypted reports

Receive a token ID for tracking

Admins:

Review, filter, and update reports via dashboard

become an admin by making an application

create a superuser and login as the super user to view requests
```bash
python manage.py createsuperuser
```
