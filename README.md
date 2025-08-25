# DIMS — Dominion1st (Dashboard + Doctrines + Glossary + AI)

## Deploy (Netlify)
1. Push this folder to a new GitHub repo.
2. In Netlify: **Add new site → Import from Git** → pick this repo.
3. In **Site settings → Environment variables**, add:
   - `OPENAI_API_KEY` = your key
4. Deploy. You’ll have:
   - Dashboard with **⚡ DIMS Brief** + **🕊️ PROPHESY!** buttons
   - **📜 Dominion1st Doctrines** editor (print/export/import)
   - **📖 Glossary** editor (tooltips feed)

## Publish content updates
- Doctrines: in the editor **Export JSON**, replace `teachings/teachings.json`, commit → Netlify redeploys.
- Glossary: in the editor **Export JSON**, replace `glossary/glossary.json`, commit → redeploy.
