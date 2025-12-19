# 🎬 Movies App (React Native + Expo)

A **full-featured Movies Application** built using **React Native & Expo**, integrated with **TMDB API**, supporting **user & admin roles**, authentication, watchlists, multilingual support, and more.

---

## 🚀 Features Overview

### 👤 User Authentication
- User **Sign Up / Login**
- **OTP verification via Email**
- **Forgot Password** (email reset link – web-based limitation noted)
- Secure authentication flow

---

### 🏠 Home & Browsing
- Movies fetched from **TMDB API**
- **Infinite scrolling** with pagination
- **Loading indicator** while fetching data
- **Search bar** for movies
- **Genre picker** to filter movies by category
- **Released & Unreleased dates** displayed

---

### 🎥 Movie Details Screen
- Movie **poster & description**
- **Trailer integration**
- Complete movie information view

---

### ⭐ Watchlist
- Add / Remove movies from watchlist
- Watchlist synced with user account

---

### 🎨 UI & UX
- **Day / Night (Dark Mode) Toggle**
- **Multilingual Support**
- Responsive & clean UI
- **Burger Menu** with:
  - Account
  - Watchlist
  - Logout

---

### 👤 User Profile
- View account details
- **Update password** (updates account securely)
- **Upload profile picture**

---

## 🛠️ Admin Panel Features

- **Admin Login** (direct login)
- Dashboard showing:
  - Total users count
  - Total watchlist items
- View users list with:
  - Email
  - Role (User / Admin)
  - Joined date

### 🔍 User Detail View (Admin)
- Email
- Role
- Joined date
- Watchlist items
- User feedbacks

---

### 📝 Feedback System
- Users can **send feedback**
- Admin can **view all feedbacks**

---

## 🧑‍💻 Tech Stack

- **React Native**
- **Expo**
- **TMDB API**
- **Firebase Authentication**
- **Firebase Firestore**
- **Firebase Storage**
- **Context API & Hooks**

---

## 📸 Screenshots

> Create a `screenshots/` folder in the root of your project and add images with the following names:

### 🔐 Authentication
![Login Screen](<img width="352" height="638" alt="image" src="https://github.com/user-attachments/assets/299cfa4e-2dd3-44a4-b702-4a81d19fcf2d" />
)
![Signup Screen](<img width="327" height="677" alt="image" src="https://github.com/user-attachments/assets/b7d4390b-80c7-459b-8397-2ba6240c6f33" />
)

### 🏠 Home Screen
![Home Screen](<img width="337" height="717" alt="image" src="https://github.com/user-attachments/assets/344d7248-8cdb-46b2-a2ff-32d686faf19c" />
)

### 🎥 Movie Details
![Movie Details](<img width="357" height="711" alt="image" src="https://github.com/user-attachments/assets/3b40e977-e7c7-4976-af9d-13328dec653c" />
)

### ⭐ Watchlist
![Watchlist](<img width="328" height="677" alt="image" src="https://github.com/user-attachments/assets/731e1512-1a5e-4b05-b0a2-979e300df40e" />
)

### 👤 Profile
![Profile](<img width="347" height="703" alt="image" src="https://github.com/user-attachments/assets/d17cf34c-5962-4f6c-a4e7-698952e3f7a6" />
)

### 🛠️ Admin Panel
![Admin Dashboard](<img width="352" height="713" alt="image" src="https://github.com/user-attachments/assets/6ee97d7c-73aa-450c-9e3d-3699e2ea48fa" />
)

---

## ⚠️ Known Limitation

- Password reset uses a **web-based email link**, which does not fully redirect inside the mobile app due to Expo limitations.

---

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Shahjee10/your-repo-name.git

# Install dependencies
npm install

# Start the app
npx expo start
