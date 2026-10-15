# ODOP Catalogue Maker

Makes multi-page PDF product catalogues for ODOP enterprises (Kota Doria, Kota Stone, Sandstone, Garlic).
41 templates, photo enhance, QR codes, and a small backend for logins, saved catalogues, duplicate checks and Excel export.

## Folders

```
frontend/   what the user sees (plain HTML, CSS and JavaScript, no build step)
  index.html
  css/style.css
  js/
    app.js            form, photos, enhance, classic design
    templates-ui.js   template picker, preview, PDF export
    records-ui.js     login, My catalogues, save to server, duplicate warning
    api.js            talks to the backend
    templates/        the 41 templates (simple, editorial, kotastone, stonecatalogs)
    content/          product-wise text (headlines, uses, promises ...)
    data/             districts and ODOP products
    demo/             demo data and demo photos (see CREDITS.md)
backend/    Node.js server
  src/              app.js, server.js, config.js, db.js, routes/, middleware/, utils/
  scripts/          seed-admin.js (creates the first admin)
  test/             automatic tests
previews/   standalone preview pages of the template designs (for looking only)
```

The backend also serves the `frontend` folder, so one command runs everything.

## Run it

Needs Node.js 22.13 or newer.

```bash
npm run setup      # once: installs the backend packages
npm run seed       # once: creates the first admin (password is printed once)
npm run dev        # starts http://localhost:3000
```

Open http://localhost:3000 and log in. The tool also works without the backend (open `frontend/index.html`
through any static server): login and saving are simply hidden.

### Settings

Copy `backend/.env.example` to `backend/.env` and edit. Useful values: `PORT`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.

## What the backend does

| Address | What |
|---|---|
| `POST /api/auth/login` | log in, returns a token |
| `GET/POST/PUT/DELETE /api/records` | save, open, update, delete a catalogue (photos are stored as files) |
| `GET /api/records/duplicates` | is this Udyam number or mobile already used? |
| `POST/GET /api/records/:id/pdf` | keep the finished PDF on the server |
| `GET /api/export/participants.xlsx` | Excel: participants + products sheet |
| `POST /api/auth/users` (admin) | add a trainer |

Trainers see only their own catalogues. The admin sees all. A Udyam number can be saved only once.

Data lives in `backend/data` (SQLite) and `backend/uploads` (photos, PDFs). Both are ignored by git. Back them up.

## Tests

```bash
npm test
```
