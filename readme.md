### **WHAT MAKES US DIFFERENT**

**VIDEO DEMO** :- https://www.youtube.com/watch?v=3oODFEEib7c

<!-- 1) _Beautiful and Simple UI_
![Screenshot (4852)](https://github.com/user-attachments/assets/3fbc9384-929d-43a9-85fe-9c3bbdae866f)

2) _One click run button_

   
![Screenshot 2024-08-11 121754](https://github.com/user-attachments/assets/19ea2734-0915-4388-833e-d88412275571)


3) _Your own file system_
   
![Screenshot 2024-08-11 121336](https://github.com/user-attachments/assets/f2b8f8ca-3400-4c35-aea9-93ca36b859bd)

4) _Terminal Access_

   
![Screenshot 2024-08-11 121405](https://github.com/user-attachments/assets/474e100c-122f-420e-addb-00b73ef9f4ff)

5) **We provide you the ability to make any project in our playground** -->
<img width="2418" height="1114" alt="Image" src="https://github.com/user-attachments/assets/787f8dcd-44fb-4940-957f-48f85bfc729b" />




### **HOW TO SETUP THE PROJECT LOCALLY**


# 🚀 Project Setup Guide

This document provides instructions to run the project in two ways:
- ✅ Without Docker (run both backend and frontend locally)
- 🐳 With Docker (run backend in a container, frontend locally)

---

## 📦 Setup Without Docker

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd <your-project-folder>
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


