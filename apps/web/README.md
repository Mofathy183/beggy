# 🎒 Beggy Frontend

This is the **frontend** of **Beggy**, a smart travel packing assistant that helps users organize items into bags and suitcases.  
The app is built with **React 19**, **Vite**, and styled using **Tailwind CSS v4** and **DaisyUI**.

---

## 🚀 Features

- 🔐 Session-based authentication (integrated with backend)
- 🧑‍💼 Role-based access control (RBAC) using CASL
- 🧳 Create and manage bags, suitcases, and items
- 🧲 Drag-and-drop support (planned)
- 🔍 Filter and search by bags, users, and items
- 🌦️ Weather widget integration using OpenWeather API
- 📱 Fully responsive UI using Tailwind and DaisyUI
- ⚙️ Dynamic form validation via React Hook Form + Yup
- 🔁 Persistent Redux state with `redux-persist`
- 🎞️ Animated transitions with GSAP
- 🧪 Unit-tested with Vitest + React Testing Library

---

## 🧱 Tech Stack

| Category         | Tools & Libraries                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Framework        | [React 19](https://reactjs.org/), [Vite](https://vitejs.dev/)                                           |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com/), [DaisyUI](https://daisyui.com/)                            |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/), [redux-persist](https://github.com/rt2zz/redux-persist) |
| Forms            | [React Hook Form](https://react-hook-form.com/), [Yup](https://github.com/jquense/yup)                  |
| Routing          | [React Router v6](https://reactrouter.com/)                                                             |
| Animation        | [GSAP](https://greensock.com/gsap/) + [`@gsap/react`](https://www.npmjs.com/package/@gsap/react)        |
| RBAC             | [CASL](https://casl.js.org/v6/en/)                                                                      |
| Testing          | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)                    |
| Code Quality     | ESLint (Airbnb config), Prettier                                                                        |

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/Mofathy183/Beggy-Frontend.git
cd Beggy-Frontend
```

## ⚙️ Getting Started

### 📦 Install Dependencies

```bash
npm install
```

## 🔐 Add Environment Variables

Create a .env file at the root:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## ▶️ Run Development Server

```bash
npm run dev
```

## 🧪 Run all tests

```bash
npm run test
```

## 🧪 Run with test UI

```bash
npm run test:ui
```

## 🧹 Format Code with Prettier

```bash
npm run prettier
```

## 🧪 Lint Code with ESLint (Airbnb Config)

```bash
npm run lint
```
