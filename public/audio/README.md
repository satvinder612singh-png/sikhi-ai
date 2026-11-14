# Learn Sikhi — Local Audio Drop-Folder (`public/audio/`)

Any `.mp3`, `.m4a`, `.wav`, or `.ogg` audio file placed inside this directory is **automatically discovered** by `/api/local-audio` and merged into the website's Persistent Bottom Audio Player, `/live-kirtan`, and `/granths` audio library.

## Folder Structure

- `public/audio/kirtan/` — Place Puratan Kirtan, Nitnem Bani, or Katha `.mp3` files here.
- `public/audio/instrumental/` — Place Sitar, Veena, Dilruba, Taus, Rabab, or Tanpura `.mp3` files here for **Background Reading Mode (25% volume)**.

## Naming Convention (Automatic Title Formatting)

Files are automatically formatted into readable track titles:
- Example: `public/audio/kirtan/Bhai_Avtar_Singh_-_Raag_Asa_Shabad.mp3`
  - **Title**: `Bhai Avtar Singh — Raag Asa Shabad`
  - **Category**: `Puratan Kirtan Masters`
- Example: `public/audio/instrumental/Dilruba_Raag_Yaman_Alaap.mp3`
  - **Title**: `Dilruba Raag Yaman Alaap`
  - **Category**: `Background Raag Instrumentals`
