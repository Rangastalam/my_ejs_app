🧪 HeisenBlog – A Breaking Bad Themed Blog Application

HeisenBlog is a full-stack, server-side rendered blog application inspired by the Breaking Bad universe — where chemistry meets storytelling.
Users can create, edit, and delete their own blogs in a cinematic UI, featuring AI-generated articles powered by Google’s Gemini API.

🚀 Features

💚 Breaking Bad Themed Interface – Dark, gritty, and immersive UI inspired by the show’s atmosphere.

✍️ Rich Text Editor – Integrated Quill Editor for smooth and intuitive content creation.

🤖 Generate with AI – Uses Gemini API to automatically generate blog content based on a topic prompt.

📝 Full CRUD Functionality – Add, edit, and delete blogs with real-time updates.

🗂️ Server-Side Rendering – Built using EJS templates, all pages are rendered dynamically from the backend.

🔐 User Authentication – (Optional) Secure login using sessions or OAuth (if integrated).

🗃️ PostgreSQL Database – Stores user posts and metadata securely.

⚡ Smooth Animations & Transitions – Engaging UI with hover effects, smoke animations, and cinematic scroll effects.

🧩 Tech Stack
Layer	Technology
Frontend	HTML, CSS, JavaScript, EJS Templates
Backend	Node.js, Express.js
Database	PostgreSQL
AI Integration	Gemini API
Editor	Quill Rich Text Editor
Authentication (optional)	Passport.js / Session-based Auth
🧠 How It Works

User Interface:
The homepage lists all blogs dynamically fetched from the PostgreSQL database.

Blog Creation:
Users can write blogs using the Quill editor or click “Generate with AI” to auto-create a post from a topic prompt.

Blog Rendering:
Posts are rendered server-side using EJS templates for smooth navigation and SEO benefits.

Editing & Deletion:
Only the author can edit or delete their own blogs.

Cinematic Styling:
Breaking Bad-inspired design — smoky visuals, green hues, and typewriter-like typography — to create an immersive storytelling experience.

⚙️ Setup Instructions
1. Clone the repository
git clone https://github.com/<your-username>/HeisenBlog.git
cd HeisenBlog

2. Install dependencies
npm install

3. Configure environment variables

Create a .env file in the root directory:

PORT=3000
DATABASE_URL=your_postgresql_connection_url
GEMINI_API_KEY=your_gemini_api_key

4. Run the application
npm start

5. Open in browser

Visit → http://localhost:3000

🧬 Folder Structure
HeisenBlog/
│
├── public/              # Static assets (CSS, JS, images)
├── views/               # EJS templates
│   ├── partials/        # Header, footer, navbar, etc.
│   ├── home.ejs
│   ├── post.ejs
│   ├── edit.ejs
│   └── new.ejs
│
├── routes/              # Express routes
├── models/              # DB models
├── app.js               # Main Express app
├── package.json
└── README.md

🧠 Future Enhancements

🌐 Add Google OAuth2.0 for login

🧩 Add categories and tags for better blog organization

🎥 Include mini video clips / background animations for immersive feel

💬 Add comment section for user interaction

📊 Integrate analytics to track views and engagement

🧑‍🔬 Creator

👨‍💻 Rishi Karthik
Breaking Bad enthusiast | Full-Stack Developer | AI-integrated Web Systems

“In this world, either you write the story or you become part of someone else’s.”
