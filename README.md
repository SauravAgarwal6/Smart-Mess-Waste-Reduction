# 🍽️ Smart Mess Waste Reduction Project

A **Full-Stack Web Application** built to help reduce food waste   
This system enables **students** and **admins** to manage mess-related issues efficiently with a secure authentication system and a persistent, database-driven complaint box.

---

## 🚀 Project Overview

The **Smart Mess Waste Reduction Project** aims to streamline communication between students and mess management while promoting food waste reduction.

It provides:
- Secure user authentication.
- Complaint tracking with database persistence.
- Role-based permissions for students and admins.
- Local meal voting and visualization for feedback collection.

---

## 🧩 Features

### 🔐 Core Functionality
- **Secure User Authentication:**  
  Students can register and log in with their unique Roll Number. Passwords are **encrypted (hashed)** before being stored.
  
- **Persistent Complaint System:**  
  Complaints are stored permanently in **MongoDB**, ensuring no data loss.
  
- **Login Gate Protection:**  
  Unauthorized users are redirected to the login page.

- **Role-Based Permissions:**  
  - **Student:** View and delete own complaints.  
  - **Admin:** View and delete any complaint.

---

### 🍛 Local Features
- **Meal Voting (Local):**  
  Students can vote for their preferred **Breakfast**, **Lunch**, or **Dinner**. (Stored in `localStorage`)

- **Vote Visualization:**  
  Dynamic **bar chart** (using Chart.js) displays real-time vote counts.

- **Static Pages:**  
  Includes sections for **About**, **Features**, and **Team**.

---

## 🛠️ Tech Stack

### 🧠 Backend
- **Node.js** – Runtime environment  
- **Express.js** – Web framework  
- **MongoDB Atlas** – NoSQL database  
- **Mongoose** – MongoDB ODM  
- **bcrypt.js** – Password hashing  
- **jsonwebtoken (JWT)** – Secure authentication tokens  
- **cors** – Enable cross-origin requests  
- **dotenv** – Manage environment variables  

### 🎨 Frontend
- **HTML5 / CSS3**
- **JavaScript (ES6+)**
- **Chart.js** – For charts and graphs
- **Font Awesome** – For icons
- **Google Fonts:** Oswald, Fira Sans, Quicksand

---

## 📂 Project Structure

