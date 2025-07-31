# 🧪 BreakingBlog - A Breaking Bad Themed Blog Application

A stylish and experimental blog web app built with **Node.js**, **Express.js**, and **EJS**, featuring a Breaking Bad–inspired UI with **Google OAuth login**, **smoke animations**, and a dark aesthetic. Users can create and view blog posts in an immersive interface that pays homage to the iconic show.

---

## 💻 Features

- 🎭 Breaking Bad–themed frontend with animated smoke effects
- 🔐 Secure login page with Google Sign-In (using Passport.js & OAuth 2.0)
- 📝 Add and read blog posts dynamically (in-memory storage)
- 🌒 Dark mode toggle for a cinematic experience
- 💨 Smooth animations and styled components for modern UX

---

## 🧩 Tech Stack

- **Frontend:** HTML5, CSS3, EJS Templates
- **Backend:** Node.js, Express.js
- **Authentication:** Google OAuth 2.0, Passport.js
- **Styling & Animations:** CSS keyframes, dark mode toggle, responsive design
- **Templating:** Embedded JavaScript (EJS)

---


## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/rangastalam/my_ejs_app.git
cd breakingblog

# Install dependencies
npm install

# Add your Google OAuth credentials
touch .env
# Add the following:
# CLIENT_ID=your_client_id
# CLIENT_SECRET=your_client_secret
# SESSION_SECRET=your_random_session_secret

# Run the app
node app.js
