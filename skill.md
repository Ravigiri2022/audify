# Audify — Full Project Specification

> Audio toolkit SaaS. Like ilovepdf but for audio. All 19 tools run entirely in the browser via WebAssembly — your audio never leaves your device. Supabase for auth/storage/DB. Developer API for server-side integrations.

---

## 1. Core Concept

Users land on a tool hub, pick an audio tool, drag-drop their file, configure options, process (client-side), and download. No login required to use tools. Login unlocks file history, batch processing, and API access.

**Privacy angle (marketing differentiator):** "Your audio never leaves your device" — all processing is WebAssembly in the browser. Zero cloud cost for tool usage.

---

## 2. Tech Stack

### Frontend
| Concern | Library |
|---------|---------|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS v3 + CSS variables (single theme source) |
| Components | shadcn/ui (Radix primitives) |
| Icons | Lucide React |
| Animations | Framer Motion |
| Data tables | TanStack Table v8 |
| Data fetching | TanStack Query v5 (React Query) |
| HTTP client | Axios |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Notifications | Sonner (toast) |

### Audio Processing (all client-side WASM)
| Tool | Library |
|------|---------|
| Format conversion, trim, compress, merge, split, normalize, silence, speed, fade, stereo→mono, pitch | `@ffmpeg/ffmpeg` + `@ffmpeg/util` (FFmpeg.wasm) |
| Background noise removal | `rnnoise-wasm` (Mozilla RNNoise neural net) |
| Transcription | `@xenova/transformers` (Whisper tiny/base in-browser via WebGPU/WASM) |
| Waveform visualization | `wavesurfer.js` |
| Audio metadata | `music-metadata-browser` |
| BPM detection | `bpm-detective` + Web Audio API |
| Microphone recording | MediaRecorder API (native) |
| Equalizer | Web Audio API (native) |
| Pitch shift | `soundtouch-js` or FFmpeg.wasm `asetrate` |

### Backend / BaaS
| Concern | Service |
|---------|---------|
| Auth (OAuth only) | Supabase Auth (Google + GitHub providers) |
| Database | Supabase PostgreSQL |
| File storage | Supabase Storage |
| Row-level security | Supabase RLS |
| Local dev | Supabase Docker (already running) |
| Server API routes | Next.js Route Handlers (`/api/v1/...`) |
| Server-side audio (Dev API) | `fluent-ffmpeg` + `ffmpeg-static` + `openai` (Whisper API) |

---

## 3. Project Structure

```
audify/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                  # Landing page
│   │   │   ├── pricing/page.tsx
│   │   │   └── tools/
│   │   │       ├── page.tsx              # Tool hub grid
│   │   │       └── [tool]/page.tsx       # Individual tool page
│   │   ├── (auth)/
│   │   │   └── auth/
│   │   │       ├── page.tsx              # Sign in
│   │   │       └── callback/route.ts     # Supabase OAuth callback
│   │   ├── (app)/
│   │   │   ├── layout.tsx               # Protected layout
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── library/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx             # Account settings
│   │   │   │   └── api-keys/page.tsx    # Developer API keys
│   │   │   └── batch/page.tsx           # Batch processing (Pro)
│   │   └── api/
│   │       └── v1/                      # Developer REST API
│   │           ├── convert/route.ts
│   │           ├── trim/route.ts
│   │           ├── compress/route.ts
│   │           ├── normalize/route.ts
│   │           ├── noise-remove/route.ts
│   │           ├── transcribe/route.ts
│   │           ├── operations/route.ts
│   │           ├── operations/[id]/route.ts
│   │           └── usage/route.ts
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn base components (auto-generated)
│   │   ├── common/
│   │   │   ├── AudioDropzone/           # Drag-drop upload with file validation
│   │   │   ├── WaveformPlayer/          # WaveSurfer.js wrapper (input + output)
│   │   │   ├── ProcessingOverlay/       # Progress + cancel, shown during WASM work
│   │   │   ├── DownloadButton/          # Download result + save to library
│   │   │   ├── ToolCard/                # Card used on /tools hub
│   │   │   ├── ToolPageLayout/          # Shared layout for all 19 tool pages
│   │   │   ├── FileSizeGuard/           # Shows upgrade prompt if file > plan limit
│   │   │   ├── GuestBanner/             # "Sign in to save history" prompt
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   └── ThemeToggle/
│   │   └── tools/                       # Per-tool specific option panels
│   │       ├── ConverterOptions.tsx
│   │       ├── TrimmerOptions.tsx
│   │       ├── TranscriptionResult.tsx
│   │       └── ... (one per tool)
│   │
│   ├── facades/                         # Facade pattern — wraps all WASM libs
│   │   ├── ffmpeg.facade.ts             # All FFmpeg.wasm operations
│   │   ├── rnnoise.facade.ts            # RNNoise noise removal
│   │   ├── whisper.facade.ts            # Transformers.js Whisper
│   │   ├── wavesurfer.facade.ts         # WaveSurfer.js setup/teardown
│   │   ├── metadata.facade.ts           # music-metadata-browser
│   │   ├── bpm.facade.ts                # BPM detection
│   │   ├── recorder.facade.ts           # MediaRecorder API
│   │   └── index.ts                     # Re-exports
│   │
│   ├── api/                             # Axios layer (client → Supabase/Next API)
│   │   ├── client.ts                    # Axios instance with auth interceptor
│   │   ├── auth.api.ts
│   │   ├── library.api.ts
│   │   ├── usage.api.ts
│   │   ├── apikeys.api.ts
│   │   └── index.ts
│   │
│   ├── store/                           # Zustand stores
│   │   ├── auth.store.ts                # User session, profile, plan
│   │   ├── tool.store.ts                # Active tool state, progress, result
│   │   ├── library.store.ts             # File history
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useFFmpeg.ts                 # FFmpeg.wasm load + singleton
│   │   ├── useWhisper.ts                # Whisper model load + inference
│   │   ├── useAudioTool.ts              # Generic tool state machine hook
│   │   ├── useFileSizeCheck.ts          # Plan limit check
│   │   └── useSupabase.ts              # Supabase client hook
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   └── server.ts               # Server Supabase client (Route Handlers)
│   │   ├── constants.ts                # TOOLS array, plan limits, routes
│   │   └── utils.ts                    # cn(), formatBytes(), formatDuration()
│   │
│   ├── types/
│   │   ├── tool.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   └── styles/
│       └── globals.css                  # All CSS variables (the ONE theme source)
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   ├── 002_operations.sql
│   │   ├── 003_api_keys.sql
│   │   └── 004_rls_policies.sql
│   └── seed.sql
│
├── public/
│   └── tools/                           # Tool icons (SVG)
│
├── .env.local                           # Keys (never commit)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 4. Design System

### Theme — Single Source of Truth (`globals.css`)

```css
:root {
  /* Brand */
  --brand-primary: 250 100% 60%;       /* violet-blue */
  --brand-secondary: 210 100% 56%;

  /* Background layers */
  --bg-base: 222 20% 7%;
  --bg-surface: 222 16% 11%;
  --bg-elevated: 222 14% 15%;
  --bg-border: 222 12% 20%;

  /* Text */
  --text-primary: 0 0% 98%;
  --text-secondary: 222 10% 65%;
  --text-muted: 222 8% 45%;

  /* Semantic */
  --success: 142 76% 45%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
  --info: 199 89% 48%;

  /* Radius */
  --radius: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 3px hsl(0 0% 0% / 0.3);
  --shadow-md: 0 4px 16px hsl(0 0% 0% / 0.4);
  --shadow-glow: 0 0 24px hsl(var(--brand-primary) / 0.15);
}

[data-theme="light"] {
  --bg-base: 0 0% 98%;
  --bg-surface: 0 0% 100%;
  --bg-elevated: 222 20% 96%;
  --bg-border: 222 15% 88%;
  --text-primary: 222 25% 8%;
  --text-secondary: 222 15% 35%;
  --text-muted: 222 10% 55%;
}
```

All Tailwind colors reference these variables. No hardcoded hex values anywhere.

### Typography
- Font: `Geist` (Next.js default) or `Inter` via `next/font`
- Scale: Tailwind defaults (text-sm/base/lg/xl/2xl/3xl/4xl)
- Weights: 400 (body), 500 (label), 600 (heading), 700 (display)

### Animation Tokens (Framer Motion)
```ts
// lib/motion.ts
export const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }
export const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 } }
export const scaleIn = { initial: { scale: 0.96, opacity: 0 }, animate: { scale: 1, opacity: 1 } }
export const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
export const spring = { type: "spring", stiffness: 300, damping: 30 }
```

---

## 5. Pages & Routes

### `/` — Landing Page
- Navbar (logo, Tools, Pricing, Sign In)
- Hero: headline + subheadline + CTA button → `/tools`
- "Zero cloud" badge: animated lock icon with tagline
- Tool grid (all 19 tools as animated cards)
- Feature section: 3 columns (Privacy-first / 19 Tools / Instant Download)
- Social proof: processing count stat (pulled from DB, cached)
- Pricing preview → `/pricing`
- Footer

### `/tools` — Tool Hub
- Search/filter bar
- Category tabs: Convert · Edit · Enhance · Analyze · Create
- Responsive grid of ToolCards (icon, name, description, "Try free" button)
- Each card links to `/tools/[tool]`

### `/tools/[tool]` — Individual Tool Page
Same `ToolPageLayout` used for all 19. Structure:
1. Tool header (icon, name, description)
2. `AudioDropzone` — drag/drop or click, accepts audio/* + video/* where applicable
3. Tool-specific options panel (collapsible on mobile)
4. `WaveformPlayer` — shows input file waveform
5. "Process" button → triggers WASM facade
6. `ProcessingOverlay` — progress bar, step label, cancel button
7. `WaveformPlayer` — shows output waveform (after processing)
8. `DownloadButton` + "Save to Library" (if logged in)
9. `GuestBanner` (if not logged in)
10. Related tools section

### `/auth` — Sign In
- Centered card
- "Continue with Google" button
- "Continue with GitHub" button
- No email/password — OAuth only
- Redirect to `/dashboard` on success

### `/dashboard` — User Dashboard (protected)
- Welcome header with avatar
- Stats row: Operations today / Files saved / Storage used
- Quick-launch: 6 most used tools (personalized)
- Recent files table (TanStack Table): filename, tool, date, size, download, delete
- Usage chart (recharts or lightweight canvas)

### `/library` — File Library (protected)
- Full TanStack Table with: filename, tool used, input size, output size, processed at, expires at, download, delete
- Search, filter by tool, sort by date/size
- Bulk delete
- Pro badge if files near expiry on free plan

### `/batch` — Batch Processing (Pro only)
- Multi-file upload dropzone
- Select tool + shared options
- Queue table: filename, status (queued/processing/done/error), progress, download
- Processes files sequentially (FFmpeg.wasm is single-threaded)
- Gate: redirect to `/pricing` if user is on free plan

### `/settings` — Account Settings (protected)
- Profile section: avatar, display name
- Connected accounts: Google / GitHub (show which is linked)
- Danger zone: delete account
- Theme toggle (dark/light)

### `/settings/api-keys` — Developer API (protected, Pro)
- Intro: base URL, auth header format
- Create API key: give it a name → returns key once (show-and-copy modal)
- Table of existing keys: name, created, last used, revoke
- Usage stats: requests today / this month
- Link to API docs (static `/docs/api` page or external)

### `/pricing` — Pricing
- Free vs Pro comparison table
- CTA: "Get Pro" → Stripe (placeholder in v1, Stripe keys added later)
- FAQ accordion

---

## 6. All 19 Tools — Specification

Tool slugs used in `/tools/[tool]` route:

```ts
// lib/constants.ts
export const TOOLS = [
  { slug: "convert",        name: "Format Converter",       category: "Convert",  icon: "ArrowLeftRight" },
  { slug: "trim",           name: "Audio Trimmer",          category: "Edit",     icon: "Scissors" },
  { slug: "compress",       name: "Audio Compressor",       category: "Edit",     icon: "Package" },
  { slug: "merge",          name: "Audio Merger",           category: "Edit",     icon: "Merge" },
  { slug: "split",          name: "Audio Splitter",         category: "Edit",     icon: "Split" },
  { slug: "normalize",      name: "Volume Normalizer",      category: "Enhance",  icon: "SlidersHorizontal" },
  { slug: "silence-remove", name: "Silence Remover",        category: "Enhance",  icon: "VolumeX" },
  { slug: "speed",          name: "Speed Changer",          category: "Edit",     icon: "Gauge" },
  { slug: "pitch",          name: "Pitch Shifter",          category: "Enhance",  icon: "MusicNote" },
  { slug: "fade",           name: "Fade In / Out",          category: "Edit",     icon: "Sunrise" },
  { slug: "stereo-mono",    name: "Stereo to Mono",         category: "Convert",  icon: "Combine" },
  { slug: "noise-remove",   name: "Noise Remover",          category: "Enhance",  icon: "Wind" },
  { slug: "transcribe",     name: "Transcription",          category: "Analyze",  icon: "FileText" },
  { slug: "metadata",       name: "Metadata Viewer",        category: "Analyze",  icon: "Info" },
  { slug: "bpm",            name: "BPM Detector",           category: "Analyze",  icon: "Activity" },
  { slug: "equalizer",      name: "Equalizer",              category: "Enhance",  icon: "BarChart2" },
  { slug: "waveform",       name: "Waveform Visualizer",    category: "Analyze",  icon: "AudioLines" },
  { slug: "recorder",       name: "Audio Recorder",         category: "Create",   icon: "Mic" },
  { slug: "vocal-remove",   name: "Vocal Remover",          category: "Enhance",  icon: "Music" },
] as const
```

### Processing Details Per Tool

| Tool | WASM / API | Key Options | Output |
|------|------------|-------------|--------|
| Format Converter | FFmpeg.wasm | Target format (mp3/wav/flac/ogg/m4a/aac/opus), bitrate | Converted file |
| Audio Trimmer | FFmpeg.wasm | Start time, end time (waveform scrub handles) | Trimmed file |
| Audio Compressor | FFmpeg.wasm | Target bitrate (32–320 kbps), format | Compressed file |
| Audio Merger | FFmpeg.wasm | Up to 10 files, crossfade duration | Single merged file |
| Audio Splitter | FFmpeg.wasm | Split by: equal parts N / by timestamps / by silence | N output files (zip) |
| Volume Normalizer | FFmpeg.wasm `loudnorm` | Target LUFS (-14 for streaming, -23 for broadcast) | Normalized file |
| Silence Remover | FFmpeg.wasm `silenceremove` | Silence threshold dB, min duration | File with silences cut |
| Speed Changer | FFmpeg.wasm `atempo` | Speed multiplier 0.5×–4× (no pitch change) | Speed-changed file |
| Pitch Shifter | FFmpeg.wasm `asetrate`+`atempo` | Semitones ±12 | Pitch-shifted file |
| Fade In / Out | FFmpeg.wasm `afade` | Fade in duration, fade out duration, curve type | Faded file |
| Stereo to Mono | FFmpeg.wasm `amerge` | — | Mono file |
| Noise Remover | RNNoise.wasm | Strength (low/med/high maps to threshold) | Cleaned file |
| Transcription | Transformers.js (Whisper tiny/base) | Language (auto-detect or select), model size | Text + SRT + VTT |
| Metadata Viewer | music-metadata-browser | — | JSON display + export |
| BPM Detector | bpm-detective + Web Audio API | — | BPM value + confidence |
| Equalizer | Web Audio API (BiquadFilter nodes) | 8-band EQ sliders, preset selector | Processed file |
| Waveform Visualizer | WaveSurfer.js | Color theme, show peaks | PNG export + player |
| Audio Recorder | MediaRecorder API | Quality (low/med/high), format | Recorded file |
| Vocal Remover | FFmpeg.wasm (stereo phase cancel) | Strength | Instrumental track |

> Note: Vocal Remover via phase cancellation works on stereo files where vocals are center-panned. Show a quality disclaimer. Future upgrade: Demucs WASM (heavy, opt-in).

---

## 7. Facade Pattern

Each processing library is wrapped in a facade. Components never import WASM libs directly. This isolates library-specific initialization, loading state, and error handling.

### FFmpeg Facade (`facades/ffmpeg.facade.ts`)
```ts
class FFmpegFacade {
  private ffmpeg: FFmpeg | null = null
  private loaded = false

  async load(onProgress?: (p: number) => void): Promise<void>
  async convert(input: File, outputFormat: string, bitrate?: number): Promise<Blob>
  async trim(input: File, start: number, end: number): Promise<Blob>
  async compress(input: File, bitrate: number): Promise<Blob>
  async merge(inputs: File[], crossfade?: number): Promise<Blob>
  async split(input: File, timestamps: number[]): Promise<Blob[]>
  async normalize(input: File, targetLufs: number): Promise<Blob>
  async removeSilence(input: File, thresholdDb: number, minDuration: number): Promise<Blob>
  async changeSpeed(input: File, multiplier: number): Promise<Blob>
  async shiftPitch(input: File, semitones: number): Promise<Blob>
  async fade(input: File, fadeIn: number, fadeOut: number): Promise<Blob>
  async stereoToMono(input: File): Promise<Blob>
  async removeVocals(input: File): Promise<Blob>
  terminate(): void
}

export const ffmpegFacade = new FFmpegFacade() // singleton
```

### RNNoise Facade (`facades/rnnoise.facade.ts`)
```ts
class RNNoiseFacade {
  async load(): Promise<void>
  async denoise(input: File, strength: 'low' | 'medium' | 'high'): Promise<Blob>
}
export const rnNoiseFacade = new RNNoiseFacade()
```

### Whisper Facade (`facades/whisper.facade.ts`)
```ts
class WhisperFacade {
  private pipeline: any = null

  async load(modelSize: 'tiny' | 'base', onProgress?: (p: number) => void): Promise<void>
  async transcribe(input: File, language?: string): Promise<{
    text: string
    chunks: { start: number; end: number; text: string }[]
  }>
}
export const whisperFacade = new WhisperFacade()
```

---

## 8. State Management (Zustand)

### `store/auth.store.ts`
```ts
interface AuthStore {
  user: User | null
  profile: Profile | null   // plan, avatar, name
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  signOut: () => Promise<void>
}
```

### `store/tool.store.ts`
```ts
type ToolStatus = 'idle' | 'loading_wasm' | 'processing' | 'done' | 'error'

interface ToolStore {
  status: ToolStatus
  progress: number         // 0–100
  progressLabel: string
  inputFile: File | null
  outputBlob: Blob | null
  outputFilename: string
  errorMessage: string | null
  setInputFile: (file: File) => void
  setProgress: (p: number, label?: string) => void
  setResult: (blob: Blob, filename: string) => void
  setError: (msg: string) => void
  reset: () => void
}
```

### `store/library.store.ts`
```ts
interface LibraryStore {
  files: LibraryFile[]
  isLoading: boolean
  fetchFiles: () => Promise<void>
  deleteFile: (id: string) => Promise<void>
}
```

---

## 9. API Layer (Axios)

### `api/client.ts`
```ts
const client = axios.create({ baseURL: '/api' })

// Attach Supabase session token on every request
client.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`
  }
  return config
})
```

### `api/library.api.ts`
```ts
export const libraryApi = {
  getFiles: () => client.get<LibraryFile[]>('/library'),
  deleteFile: (id: string) => client.delete(`/library/${id}`),
  saveFile: (payload: SaveFilePayload) => client.post('/library', payload),
}
```

### `api/usage.api.ts`
```ts
export const usageApi = {
  getStats: () => client.get<UsageStats>('/usage'),
  logOperation: (op: LogOperationPayload) => client.post('/usage/log', op),
}
```

### `api/apikeys.api.ts`
```ts
export const apiKeysApi = {
  list: () => client.get<ApiKey[]>('/api-keys'),
  create: (name: string) => client.post<{ key: string; id: string }>('/api-keys', { name }),
  revoke: (id: string) => client.delete(`/api-keys/${id}`),
}
```

---

## 10. Supabase Setup

### Local Docker
```bash
# Already running. Commands for reference:
supabase start
supabase status   # get local URLs + keys
```

### Auth Configuration
In Supabase Dashboard → Authentication → Providers:
- Enable **Google**: provide `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- Enable **GitHub**: provide `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
- Add redirect URL: `http://localhost:3000/auth/callback` (dev) + production URL

### Database Schema

#### `profiles` (extends `auth.users`)
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  operations_today int not null default 0,
  last_reset_date date not null default current_date,
  storage_used_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create profile on sign-up
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

#### `operations`
```sql
create table operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  tool text not null,
  input_filename text not null,
  output_filename text,
  input_size_bytes bigint,
  output_size_bytes bigint,
  processing_ms int,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  storage_path text,          -- Supabase Storage path (nullable if not saved)
  expires_at timestamptz,     -- null = not saved, 24h free, 30d pro
  created_at timestamptz not null default now()
);
```

#### `api_keys`
```sql
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  key_hash text not null unique,    -- bcrypt hash of the actual key
  key_prefix text not null,         -- first 8 chars for display (e.g. "aud_abc1")
  last_used_at timestamptz,
  is_active bool not null default true,
  created_at timestamptz not null default now()
);
```

#### `api_usage`
```sql
create table api_usage (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id) on delete cascade not null,
  endpoint text not null,
  status_code int,
  created_at timestamptz not null default now()
);
```

### RLS Policies
```sql
-- profiles: users see/edit only their own
alter table profiles enable row level security;
create policy "own profile" on profiles for all using (auth.uid() = id);

-- operations: users see only their own
alter table operations enable row level security;
create policy "own operations" on operations for all using (auth.uid() = user_id);

-- api_keys: users manage only their own
alter table api_keys enable row level security;
create policy "own api keys" on api_keys for all using (auth.uid() = user_id);
```

### Storage Buckets
```sql
-- Create via Supabase Dashboard or CLI
-- Bucket: "audio-files"
-- Public: false
-- File size limit: 52428800 (50MB free) enforced in app logic
```

Storage path convention: `{user_id}/{operation_id}/{filename}`

---

## 11. Developer REST API

Base URL: `/api/v1`
Auth: `Authorization: Bearer <api_key>` header

All endpoints validate the API key, check the user's plan, and log to `api_usage`.

### Middleware (`api/v1/_middleware.ts`)
1. Extract Bearer token
2. Hash token, lookup in `api_keys` table
3. Fetch profile, check plan === 'pro'
4. Check rate limit (100 req/day free, 10000/day pro — stored in Redis or simple DB counter)
5. Attach `userId` to request context

### Endpoints

#### `POST /api/v1/convert`
```
Body (multipart/form-data):
  file: audio file
  format: "mp3" | "wav" | "flac" | "ogg" | "m4a" | "aac" | "opus"
  bitrate?: number (kbps)

Response: audio/[format] binary
```

#### `POST /api/v1/trim`
```
Body: file, start (seconds), end (seconds)
Response: audio binary
```

#### `POST /api/v1/compress`
```
Body: file, bitrate (kbps, default 128)
Response: audio binary
```

#### `POST /api/v1/normalize`
```
Body: file, target_lufs (default -14)
Response: audio binary
```

#### `POST /api/v1/noise-remove`
```
Body: file, strength ("low" | "medium" | "high")
Response: audio binary
Note: server-side uses FFmpeg afftdn/anlmdn filter
```

#### `POST /api/v1/transcribe`
```
Body: file, language? (ISO 639-1, default "auto")
Response: { text: string, srt: string, vtt: string, chunks: [...] }
Note: server-side uses OpenAI Whisper API
```

#### `GET /api/v1/operations`
```
Query: page, limit, tool
Response: { data: Operation[], total: number }
```

#### `GET /api/v1/usage`
```
Response: { today: number, month: number, plan: string, limit: number }
```

### Server-side Audio (for Dev API only)
```ts
// Uses fluent-ffmpeg + ffmpeg-static for Node.js processing
// Whisper transcription via openai SDK (requires OPENAI_API_KEY)
// RNNoise server-side: FFmpeg afftdn filter as fallback
```

---

## 12. Pricing & Plans

| Feature | Free | Pro ($9/mo) |
|---------|------|-------------|
| All 19 tools | Yes | Yes |
| Max file size | 50 MB | 500 MB |
| Operations/day (UI) | 10 | Unlimited |
| File history | 24 hours | 30 days |
| Batch processing | No | Yes |
| Developer API | No | Yes (10,000 req/day) |
| Storage | — | Up to 5 GB |

Stripe integration: add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `STRIPE_PRO_PRICE_ID` later. For v1, Pro toggle is manual (Supabase dashboard).

---

## 13. Environment Variables

```env
# .env.local — fill these in before deploy

# Supabase (from `supabase status`)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>

# OAuth (Supabase Auth providers)
# Configure in: Supabase Dashboard → Auth → Providers
# These are set in Supabase, NOT in .env.local directly
# GOOGLE_CLIENT_ID + SECRET → paste in Supabase dashboard
# GITHUB_CLIENT_ID + SECRET → paste in Supabase dashboard

# OpenAI (for Developer API transcription endpoint only)
OPENAI_API_KEY=<your key>

# Stripe (v1: leave blank, add when billing is ready)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 14. Key Implementation Notes

### FFmpeg.wasm Loading
- FFmpeg.wasm MUST be loaded from `/public` or a CDN (not bundled). In `next.config.ts`, set `headers` for `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin` — required for SharedArrayBuffer (FFmpeg.wasm needs it).
- Load FFmpeg lazily (only when user first uses a tool). Show a one-time "Loading audio engine (3MB)..." message.
- After first load, keep singleton alive in the facade — do not re-initialize.

### Whisper in Browser
- `@xenova/transformers` downloads model from HuggingFace CDN on first use, cached in browser Cache API.
- Model sizes: `tiny` = ~75MB (fast, good), `base` = ~145MB (slower, better).
- Show download progress on first run. After that, instant load from cache.
- Use a Web Worker to avoid blocking UI during inference. Transformers.js supports this natively.

### AudioDropzone
- Accept: `audio/*`, also `video/mp4`, `video/mkv`, `video/webm` (FFmpeg can extract audio from video)
- Validate file size against user's plan limit before processing
- Read file as ArrayBuffer for WASM processing

### File Download
- `URL.createObjectURL(blob)` → trigger download via anchor click
- Revoke URL after download with `URL.revokeObjectURL`

### Guest Mode
- Tools work without login
- No file history saved for guests
- Show `GuestBanner` after processing: "Sign in to save this file and access your history"
- Track guest usage in `localStorage` (simple counter) for soft rate limiting

### ToolPageLayout
All 19 tool pages use this single component:
```tsx
<ToolPageLayout tool={tool}>
  <ToolOptions /> {/* tool-specific options panel */}
</ToolPageLayout>
```
The layout handles: dropzone, waveform players, processing overlay, download button, guest banner, file size check.

---

## 15. Deployment Checklist

### Local Dev
```bash
# 1. Start Supabase
supabase start

# 2. Run migrations
supabase db push

# 3. Install deps
npm install

# 4. Fill .env.local (Supabase URLs from `supabase status`)

# 5. Run dev server
npm run dev
```

### Required next.config.ts
```ts
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      ],
    }]
  },
  webpack(config) {
    // Needed for ffmpeg.wasm
    config.resolve.alias['fs'] = false
    return config
  },
}
```

### Production (Vercel)
1. `vercel` CLI deploy or connect GitHub repo
2. Add all env vars in Vercel dashboard
3. Switch Supabase from local Docker to cloud project
4. Add production URL to Supabase → Auth → Redirect URLs
5. Enable Google/GitHub OAuth with production callback URL

---

## 16. Build Order (Implementation Sequence)

1. **Project scaffold** — `npx create-next-app`, install all deps, configure Tailwind + shadcn + theme tokens
2. **Supabase setup** — run migrations, configure OAuth providers locally
3. **Auth flow** — sign in page, callback route, session in Zustand
4. **ToolPageLayout + AudioDropzone** — the shell all tool pages share
5. **FFmpeg facade + first tool** — Format Converter (validates the whole WASM pipeline)
6. **Remaining FFmpeg tools** — 10 more tools, each ~20-50 lines using the facade
7. **RNNoise facade** — Noise Remover
8. **Whisper facade** — Transcription (Web Worker setup)
9. **Metadata, BPM, Equalizer, Recorder, Waveform** — smaller standalone tools
10. **Dashboard + Library** — auth-protected pages, TanStack Table
11. **Developer API** — Route Handlers, API key management
12. **Landing + Pricing pages** — marketing pages with Framer Motion
13. **Batch processing page**
14. **Polish** — loading skeletons, error boundaries, mobile responsiveness
