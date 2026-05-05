HiveHaul standalone deploy

1) Create folder: C:\Users\shahv\HiveHaul
2) Copy these files into it:
   - index.html
   - vercel.json
3) Open PowerShell:
   cd C:\Users\shahv\HiveHaul
   git init
   git add .
   git commit -m "HiveHaul standalone"
4) Create new GitHub repo named HiveHaul, then:
   git remote add origin https://github.com/shahvish2004/HiveHaul.git
   git branch -M main
   git push -u origin main
5) Import this new repo in Vercel as a new project.
   Framework Preset: Other
   Build Command: leave blank
   Output Directory: .

Important:
Open index.html and replace:
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY";
with your anon public key from Supabase Settings > API.
