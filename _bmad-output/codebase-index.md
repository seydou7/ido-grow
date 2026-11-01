---
project: CVExpress Sénégal
generated: 2026-03-31
generated_by: BMAD Party Mode — Amelia (Dev) + Winston (Architect)
purpose: >
  Complete codebase index for AI agents. Read this before editing any file.
  Prevents duplicate code, wrong file choices, and architecture violations.
---

# 🗂️ CVExpress Sénégal — Codebase Index

> **CRITICAL FOR AGENTS:** This is your map of the codebase. Before creating any file or component:
> 1. Check if it already exists here
> 2. Understand its current state and size
> 3. Follow the patterns documented

---

## 🏗️ Architecture Overview

```
CVExpress Sénégal = React SPA + Supabase Backend + Deno Edge Functions + Gemini AI

┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React 18 + Vite + TypeScript)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │Components│  │  Hooks   │              │
│  │  (11)   │  │  (37+)   │  │  (3)    │              │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘              │
│        └────────────┼─────────────┘                    │
│                     ▼                                   │
│            Supabase JS Client                          │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │   SUPABASE BACKEND   │
          │  ┌────────────────┐  │
          │  │  PostgreSQL DB │  │
          │  │  (5 tables)    │  │
          │  └────────────────┘  │
          │  ┌────────────────┐  │
          │  │  Supabase Auth │  │
          │  └────────────────┘  │
          │  ┌────────────────┐  │
          │  │ Edge Functions │  │
          │  │  (11 Deno fns) │  │
          │  └───────┬────────┘  │
          └──────────┼───────────┘
                     │
          ┌──────────▼──────────┐
          │  Lovable AI Gateway │
          │  (google/gemini-    │
          │  3-flash-preview)   │
          └─────────────────────┘
```

### ⚠️ Architecture Critical Note — TWO AI Call Paths

There are **TWO separate ways** AI is called in this project:

| Path | Used In | API | Auth |
|---|---|---|---|
| **Direct Gemini** (client-side) | `directGeminiService.ts` | `generativelanguage.googleapis.com` | `VITE_GEMINI_API_KEY` |
| **Lovable Gateway** (Edge Functions) | All 11 Edge Functions | `ai.gateway.lovable.dev` | `LOVABLE_API_KEY` (Deno env) |

The Edge Functions use `model: "google/gemini-3-flash-preview"` via Lovable gateway (NOT the standard Gemini API endpoint). The `directGeminiService.ts` uses `gemini-flash-latest` via direct API.

---

## 📄 Pages Index (src/pages/)

| File | Route | Size | Purpose | Key Dependencies |
|---|---|---|---|---|
| `Index.tsx` | `/` | 25KB | Landing page + hero + features | framer-motion, AuthModal |
| `LoginPage.tsx` | `/connexion` | 12KB | Auth — login & register | supabase.auth, react-hook-form |
| `FormPage.tsx` | `/creer` | 7.3KB | Multi-step CV creation form | Step components, supabase |
| `LoadingPage.tsx` | `/generation` | 4.3KB | AI processing animation | framer-motion |
| `PreviewPage.tsx` | `/apercu` | 17KB | CV preview + export + template switch | All CV templates, html2pdf |
| `DashboardPage.tsx` | `/dashboard` | **36KB ⚠️** | Premium user dashboard | supabase, recharts, all features |
| `ImportCVPage.tsx` | `/importer` | 15KB | Upload PDF/photo CV | directGeminiService, html2pdf |
| `AnalysePage.tsx` | `/analyser` | 7.1KB | Job offer analysis | ai-analyze-job Edge Function |
| `ValidatePage.tsx` | `/valider` | 4.9KB | Skills validation | supabase validation tables |
| `ProfilePage.tsx` | `/profil/:slug` | 13KB | Public profile mini-site | supabase, QR code |
| `NotFound.tsx` | `/*` | 0.7KB | 404 page | react-router Link |

> ⚠️ `DashboardPage.tsx` at 36KB is the largest file. Agents should be careful with edits — it's complex and tightly coupled.

---

## 🧩 Components Index

### Root Components (src/components/)

| File | Size | Purpose | Notes |
|---|---|---|---|
| `AuthModal.tsx` | 14KB | Auth modal (login/register) | Used from Index.tsx + nav |
| `CVScoreWidget.tsx` | 3.5KB | CV score display widget | Used in Dashboard + Preview |
| `CVValidationSection.tsx` | 2.9KB | Skills validation UI | Used in ValidatePage |
| `CoachButton.tsx` | 1.4KB | Floating AI coach button | Mounted globally in App.tsx |
| `CoachDrawer.tsx` | 7.6KB | AI coach slide drawer | Triggered by CoachButton |
| `CoverLetterModal.tsx` | 5.6KB | Cover letter generation modal | Uses ai-cover-letter Edge Fn |
| `CustomizationPanel.tsx` | 16KB | Template & color customization | Used in PreviewPage |
| `LanguageSwitcher.tsx` | 2.5KB | Language toggle component | Index + Dashboard |
| `NavLink.tsx` | 0.75KB | Navigation link wrapper | Used in nav areas |
| `ProfileSettings.tsx` | 4.1KB | Profile privacy settings | Used in Dashboard |
| `VoiceMicButton.tsx` | 9.3KB | Voice input button | Uses ai-voice-parse Edge Fn |

### CV Templates (src/components/cv/) — 22 templates + utils

| File | Template ID | Style | Size |
|---|---|---|---|
| `CVExecutive.tsx` | `executive` | Classic executive | 12KB |
| `CVCreative.tsx` | `creative` | Colorful creative | 10KB |
| `CVTech.tsx` | `tech` | Developer dark | 10KB |
| `CVPrestige.tsx` | `prestige` | Luxury premium | 7.5KB |
| `CVTimeline.tsx` | `timeline` | Career timeline | 6.7KB |
| `CVSerenity.tsx` | `serenity` | Soft modern | 6.4KB |
| `CVQuantumPlus.tsx` | `quantum_plus` | Tech + photo | 6.4KB |
| `CVModernist.tsx` | `modernist` | Swiss bold | 6.4KB |
| `CVStudio.tsx` | `studio` | Bold creative | 6.2KB |
| `CVQuantum.tsx` | `quantum` | High-tech | 6.3KB |
| `CVVibrant.tsx` | `vibrant` | Gradient modern | 7.4KB |
| `CVElegant.tsx` | `elegant` | Academic serif | 5.7KB |
| `CVClassicBlue.tsx` | `classic_blue` | Corporate blue | 5.6KB |
| `CVBrutalist.tsx` | `brutalist` | Bold brutalist | 5.4KB |
| `CVAurora.tsx` | `aurora` | Glassmorphism | 6.1KB |
| `CVMagazine.tsx` | `magazine` | Magazine layout | 5.0KB |
| `CVMinimalist.tsx` | `minimalist` | Zen clarity | 4.8KB |
| `CVMetric.tsx` | `metric` | Results-oriented | 4.6KB |
| `CVEthereal.tsx` | `ethereal` | Luxury air | 4.4KB |
| `CVCorporate.tsx` | `corporate` | Management | 4.7KB |
| `CVSignature.tsx` | `signature` | Personal brand | 5.0KB |
| `CVArtisan.tsx` | `artisan` | Human craft | 3.9KB |
| `cvUtils.tsx` | — | Shared utilities | 2.7KB |

**All templates share the same props interface:**
```typescript
{ formData: FormData; aiData?: AIData | null; }
```

### Form Step Components (src/components/form/)

| File | Step | Purpose | Size |
|---|---|---|---|
| `StepPersonal.tsx` | 1 | Personal info + photo | 8KB |
| `StepExperience.tsx` | 2 | Work experiences + drag-n-drop | 6.2KB |
| `StepEducation.tsx` | 3 | Diplomas + education | 2.7KB |
| `StepSkills.tsx` | 4 | Skills + languages + interests | 4.3KB |

---

## 🪝 Hooks Index (src/hooks/)

| File | Export | Purpose |
|---|---|---|
| `useAuth.tsx` | `useAuth()`, `AuthProvider` | Auth context — user, session, loading, signOut |
| `use-toast.ts` | `useToast()` | Toast notification hook (shadcn pattern) |
| `use-mobile.tsx` | `useIsMobile()` | Returns boolean — window width < 768px |

**Auth Pattern:**
```typescript
const { user, session, loading, signOut } = useAuth();
// user is null if not authenticated
// loading = true during initial session check
```

---

## ⚙️ Services Index (src/services/)

| File | Exported Functions | AI Model Used | Notes |
|---|---|---|---|
| `directGeminiService.ts` | `parseCVWithGemini(file)`, `generateAIOptimizations(formData)` | `gemini-flash-latest` (direct API) | Client-side — uses `VITE_GEMINI_API_KEY` |
| `directCoachService.ts` | Coach-related functions | Gemini | Used by CoachDrawer |
| `geminiService.ts` | Wrapper functions | Gemini | Thin wrapper over directGeminiService |
| `diagnoseGemini.ts` | `diagnoseGemini()` | — | Debug tool for Gemini connectivity |

---

## 🚀 Edge Functions Index (supabase/functions/)

All functions use **Deno runtime** + **Lovable AI Gateway** (`ai.gateway.lovable.dev`).
**JWT Verification:** Most functions have `verify_jwt = false` (no auth required to call).

| Function | Status | Input | Output | JWT |
|---|---|---|---|---|
| `ai-quantifier` | ✅ Active | `{poste, entreprise, description}` | `{quantifiedDescription: string}` | ❌ Not checked |
| `ai-linkedin-import` | ✅ Active | `{url: string}` | FormData-compatible JSON | ❌ Not checked |
| `ai-market-intelligence` | ✅ Active | `{poste, skills[]}` | `{insights: [{title, reason, provider}]}` | ❌ Not checked |
| `ai-cover-letter` | ✅ Active | CV data | Cover letter text | ❌ Not checked |
| `ai-analyze-job` | ✅ Active | Job offer + CV | Compatibility analysis | ❌ Not checked |
| `ai-coach` | ✅ Active | CV data + question | Coach response | ❌ Not checked |
| `ai-parse-cv` | ✅ Active | CV file/base64 | Parsed FormData | ❌ Not checked |
| `ai-translate-cv` | ✅ Active | FormData + target lang | Translated FormData | ❌ Not checked |
| `ai-voice-parse` | ✅ Active | Audio/text | FormData fields | ❌ Not checked |
| `generate-cv` | ✅ Active | FormData + template | PDF | ❌ Not checked |
| `reactive-resume-export` | ✅ Active | FormData | JSON export | ❌ Not checked |

**Important:** `ai-quantifier` and `ai-linkedin-import` are **NOT** in `config.toml` with `verify_jwt = false` explicitly — they may need to be added if JWT issues arise.

### Edge Function Call Pattern (from Frontend)
```typescript
const { data, error } = await supabase.functions.invoke('ai-quantifier', {
  body: { poste, entreprise, description }
});
```

---

## 🗃️ Database Migrations History

| Migration | Date | Content |
|---|---|---|
| `20260308092546_*.sql` | 2026-03-08 | Initial schema setup |
| `20260308112635_*.sql` | 2026-03-08 | Tables: cvs, validators, validations, requests |
| `20260308115741_*.sql` | 2026-03-08 | RLS policies |
| `20260308140105_*.sql` | 2026-03-08 | profile_views table |
| `20260323000000_*.sql` | 2026-03-23 | Added `user_id` column to `cvs` |
| `20260324000000_*.sql` | 2026-03-24 | Multi-profile support (`is_primary`, `cv_name`, `type`) |
| `20260324000001_*.sql` | 2026-03-24 | Link orphan CVs to users |

---

## 🔑 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=http://127.0.0.1:54321   # Local dev
VITE_SUPABASE_PUBLISHABLE_KEY=...           # Supabase anon key
VITE_GEMINI_API_KEY=...                     # Google Gemini direct API key
```

### Edge Functions (Deno env — set via Supabase dashboard)
```
LOVABLE_API_KEY=...    # Lovable AI gateway key — required by ALL Edge Functions
```

---

## 🧪 Test Setup

| File | Purpose |
|---|---|
| `src/test/setup.ts` | Global test setup (vitest + jsdom) |
| `src/test/example.test.ts` | Example test — currently placeholder |

**Run tests:** `npm run test` or `npm run test:watch`

> ⚠️ Test coverage is currently **minimal**. Only a placeholder test exists. No component tests.

---

## 🔗 Key Data Flows

### Flow 1: CV Creation
```
FormPage → [StepPersonal → StepExperience → StepEducation → StepSkills]
  → LoadingPage (AI optimization via directGeminiService)
  → PreviewPage (select template + export PDF)
  → Supabase cvs table (auto-save)
```

### Flow 2: CV Import (Photo/PDF)
```
ImportCVPage
  → directGeminiService.parseCVWithGemini(file)  [direct API call]
  → Populates FormData
  → Redirects to PreviewPage
```

### Flow 3: AI Features (Dashboard)
```
DashboardPage
  → supabase.functions.invoke('ai-quantifier', {poste, entreprise, description})
  → supabase.functions.invoke('ai-market-intelligence', {poste, skills})
  → supabase.functions.invoke('ai-linkedin-import', {url})
```

### Flow 4: Public Profile
```
ProfilePage (/profil/:slug)
  → supabase.from('cvs').select().eq('profile_slug', slug)
  → Renders CV template (read-only)
  → profile_views insert (analytics)
```

### Flow 5: Auth Flow
```
Index → AuthModal → supabase.auth.signInWithPassword/signUp
  → AuthContext updates → redirect to /dashboard
```

---

## ⚠️ Known Technical Debt & Gotchas

### 1. DashboardPage.tsx is oversized (36KB)
- Contains too much logic in one file
- Mixing: AI feature calls, CV list management, stats, profile settings
- **Recommendation:** Future refactor into sub-components

### 2. No JWT on Edge Functions by default
- `ai-quantifier` and `ai-linkedin-import` are NOT in `config.toml` with jwt config
- Anyone can call these endpoints without auth → potential abuse risk

### 3. ai-linkedin-import is a Simulation
- Does NOT actually scrape LinkedIn (impossible without API)
- Generates realistic fake data based on the URL/username
- Document this clearly in any UX copy

### 4. Gemini API Key exposed in client code
```typescript
// directGeminiService.ts line 3 — hardcoded fallback:
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCsvlcIo3Z...";
```
- API key is in source code as fallback → security risk for production

### 5. IDs generated client-side (not DB)
```typescript
id: Math.random().toString(36).substr(2, 9)  // In directGeminiService
```
- Not using crypto.randomUUID() — potential collision risk

### 6. Languages always default to French
```typescript
languages: [{ langue: "Français", niveau: "Natif" }]  // Hardcoded in parseCVWithGemini
```
- Doesn't extract language data from imported CVs

### 7. Template "journey" Referenced but Missing
```
memory.md mentions "Journey" template — no CVJourney.tsx file found in src/components/cv/
May have been renamed to CVTimeline.tsx
```

---

## 📐 Component Creation Checklist

When creating a NEW component for this project:

```typescript
// 1. File location
src/components/[ComponentName].tsx          // Standalone component
src/components/cv/CV[TemplateName].tsx      // New CV template
src/components/form/Step[Name].tsx          // New form step

// 2. Import pattern
import { supabase } from "@/integrations/supabase/client";
import { FormData, AIData } from "@/types/cv";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// 3. New CV Template props (MANDATORY)
interface Props {
  formData: FormData;
  aiData?: AIData | null;
}

// 4. Register new template in:
//    - src/types/cv.ts → TemplateName union type
//    - PreviewPage.tsx → template selector
//    - CustomizationPanel.tsx → template list
```

---

## 🔍 Quick Search Guide

| "I want to..." | Go to... |
|---|---|
| Modify routing | `src/App.tsx` |
| Add auth logic | `src/hooks/useAuth.tsx` |
| Change AI prompts | `supabase/functions/[function]/index.ts` |
| Add a new template | `src/components/cv/CV[Name].tsx` + register in `types/cv.ts` |
| Add DB field | New migration in `supabase/migrations/` |
| Change form steps | `src/components/form/Step*.tsx` |
| Modify landing page | `src/pages/Index.tsx` |
| Modify dashboard | `src/pages/DashboardPage.tsx` ⚠️ (large file) |
| Add toast notification | `import { toast } from "sonner"` |
| Access current user | `const { user } = useAuth()` |
| Call Supabase | `import { supabase } from "@/integrations/supabase/client"` |
| Call Edge Function | `supabase.functions.invoke('function-name', { body: {...} })` |
