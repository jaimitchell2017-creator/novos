# NOVOS local-first + .napp update

This update removes the dependency on Supabase and makes the App Builder local-first.

## What changed
- Local accounts and usernames.
- Native NOVOS `.napp` package format v1.
- Import/export `.napp` files.
- GitHub repository ZIP import with static scanning.
- Local permissions manifest.
- Local NOVOS AI Builder using Transformers.js/ONNX/WASM.
- No Pollinations or paid API is required.
- Mobile/touch improvements.
- Experimental Debian-based NOVOS ISO workflow with broad firmware packages.

## Important limitation
The AI is not literally trained from scratch inside the browser. It uses a small open model locally. Training a new foundation model from scratch is a separate, much larger ML project. The App Builder is designed so the model can be replaced later.

`.napp` v1 is JSON-based so it is easy to inspect and validate. A later v2 can move the same manifest/files into a ZIP container without changing the manifest contract.

## Build
```bash
npm install
npm run web:build
```

For the ISO, push the repository to GitHub and run **Build NOVOS ISO** from Actions.
