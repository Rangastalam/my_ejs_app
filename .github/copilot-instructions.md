# Copilot Instructions for BreakingBlog (Capstone_project_1)

## Project Overview
- This is a Breaking Bad–themed blog app using Node.js, Express.js, and EJS.
- Features include Google OAuth login (Passport.js), animated smoke effects, and a dark UI.
- Blog posts are stored in-memory (see `index.js`), with user authentication and session management.

## Key Files & Structure
- `index.js`: Main Express app, routes, Passport strategies, session, and blog logic.
- `views/`: EJS templates for all pages. `index.ejs` is the homepage, `register.ejs` and `login.ejs` for auth.
- `public/`: Static assets (CSS, images, JS). Custom styles and animations are here.
- `.env`: Required for Google OAuth and session secrets.

## Developer Workflows
- **Start app:** `node index.js` (or use `npm start` if defined in `package.json`).
- **Install dependencies:** `npm install`
- **Environment setup:** Add `.env` with `CLIENT_ID`, `CLIENT_SECRET`, `SESSION_SECRET`.
- **Google OAuth:** Configure Passport in `index.js` and set up callback routes.
- **Session/Flash:** Uses `express-session` and `connect-flash` for error messaging.

## Patterns & Conventions
- **Routes:** All main routes are defined in `index.js`. Auth routes use Passport middleware.
- **Flash messages:** Error messages for login/register are passed via `req.flash('error')` and rendered in EJS.
- **Blog posts:** Stored in arrays (`data`, `newdata`) in-memory. Posts are rendered as cards in EJS.
- **UI Theme:** All UI/UX follows Breaking Bad style—use green/yellow/black, smoke effects, and bold typography.
- **Animations:** CSS keyframes and Animate.css for transitions and scroll effects.
- **Search:** Homepage includes a search bar for filtering blog cards (see EJS/JS in `index.ejs`).

## Integration Points
- **Google OAuth:** Passport.js strategy in `index.js`, credentials from `.env`.
- **Session:** `express-session` with cookie settings for login persistence.
- **Flash:** `connect-flash` for error handling in auth flows.

## Examples
- To show a login error: `req.flash('error', 'Invalid credentials'); res.redirect('/login');` and in EJS: `<%= message[0] %>`
- To add a blog post: POST to `/add` with `{ title, content }`.
- To search posts: Use the search bar in `index.ejs` (JS filters cards by title/content).

## Tips for AI Agents
- Always check `index.js` for route logic and Passport configuration.
- When updating UI, follow the Breaking Bad theme and animation conventions in `public/styles/` and EJS files.
- For new features, maintain the session/flash/message pattern for user feedback.
- Reference `.env` for secrets and credentials.

---

If any section is unclear or missing, please provide feedback to improve these instructions.
