### **WHAT MAKES US DIFFERENT**

**VIDEO DEMO** :- https://www.youtube.com/watch?v=3oODFEEib7c

<img width="2418" height="1114" alt="Image" src="https://github.com/user-attachments/assets/787f8dcd-44fb-4940-957f-48f85bfc729b" />

### **THIS IS HOW WE HAVE DEPLOYED IT**


<img width="3558" height="2085" alt="Image" src="https://github.com/user-attachments/assets/5ad2ed66-5ef4-469c-89a3-fdaa6d40f411" />




### **HOW TO SETUP THE PROJECT LOCALLY**


# 🚀 Project Setup Guide

This document provides instructions to run the project in two ways:
- ✅ Without Docker (run both backend and frontend locally)
- 🐳 With Docker (run backend in a container, frontend locally)

---

## 📦 Setup Without Docker

1. **Clone the Repository**
   ```bash
   git clone <https://github.com/SkullRex001/Tally_Code_Hackthon.git>
   cd <Tally_Code_Hackthon>
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm install
   node index.js
   ```

3. **Start the Frontend** (open a new terminal window)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🐳 Setup With Docker (Backend Only)

> Docker is used only for the backend. The frontend still runs locally.

1. **Clone the Repository**
   ```bash
   git clone <https://github.com/SkullRex001/Tally_Code_Hackthon.git>
   cd <Tally_Code_Hackthon>
   ```

2. **Build Docker Image (Backend)**
   ```bash
   cd backend
   docker build -t my-backend-app .
   ```

3. **Run the Docker Container**
   ```bash
   docker run -d -p 8000:8000 --name backend-container my-backend-app
   ```

4. **Start the Frontend** (open a new terminal window)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## ✅ Access the App

- Backend API: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:5173](http://localhost:5173) *(or as shown in terminal output)*

---

## 🛑 Stop & Remove Docker Container

To stop and clean up the backend Docker container:

```bash
docker stop backend-container
docker rm backend-container
```


