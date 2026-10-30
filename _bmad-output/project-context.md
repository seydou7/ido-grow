---
project: CVExpress Sénégal
generated: 2026-03-31
generated_by: BMAD Party Mode — BMad Master + Mary + Amelia + Winston + Sally
version: "1.0"
status: active
---

# 🧠 CVExpress Sénégal — Project Context for AI Agents

> **CRITICAL:** Every AI agent working on this project MUST read this file first.
> This is your shared brain. Don't guess — it's already documented here.

---

## 📋 Project Identity

| Field | Value |
|---|---|
| **Project Name** | CVExpress Sénégal |
| **Type** | SaaS CV Builder — AI-powered, Sénégal-targeted |
| **Purpose** | Help Senegalese job seekers create professional CVs with AI assistance |
| **Target Market** | Sénégal (Dakar, Thiès, Saint-Louis, etc.) — French-first audience |
| **Monetization** | Freemium — `paid: boolean` field on each CV |
| **Dev URL** | `http://localhost:8080` |
| **Supabase Local** | API: `http://127.0.0.1:54321` / Studio: `http://127.0.0.1:54323` |

---

## 🛠️ Technology Stack (Exact Versions)

### Frontend
| Technology | Version | Notes |
|---|---|---|
| **React** | 18.3.1 | Strict mode NOT enabled |
| **TypeScript** | 5.8.3 | `strict: false`, `noImplicitAny: false` |
| **Vite** | 5.4.19 | Port 8080, SWC compiler |
| **Tailwind CSS** | 3.4.17 | With tailwindcss-animate |
| **shadcn/ui** | (Radix-based) | Full component suite installed |
| **react-router-dom** | 6.30.1 | Client-side routing |
| **@tanstack/react-query** | 5.83.0 | Server state management |
| **framer-motion** | 12.35.1 | Animations |
| **react-hook-form** | 7.61.1 | Form management |
| **zod** | 3.25.76 | Validation schemas |
| **@supabase/supabase-js** | 2.98.0 | Database client |
| **html2pdf.js** | 0.14.0 | PDF export |
| **qrcode.react** | 4.2.0 | QR Code generation |
| **lucide-react** | 0.462.0 | Icon system |
| **date-fns** | 3.6.0 | Date utilities |
| **@dnd-kit** | core 6.3.1 | Drag & drop (experience reordering) |
| **sonner** | 1.7.4 | Toast notifications |
| **recharts** | 2.15.4 | Charts/stats in dashboard |

### Backend (Supabase)
| Component | Details |
|---|---|
| **Database** | PostgreSQL 14.1 via Supabase |
| **Auth** | Supabase Auth (email/password) |
| **Edge Functions** | Deno runtime — 11 functions deployed |
| **AI Provider** | Google Gemini (via direct API in Edge Functions) |
| **Storage** | Supabase Storage (profile photos) |
| **RLS** | Active on ALL tables — `auth.uid()` required |

### AI / Services
| Service | Usage |
|---|---|
| **Google Gemini** | Primary AI — used in `directGeminiService.ts` and all Edge Functions |
| **Gemini 1.5** | Correct model name (NOT 2.5 or 3 — bugs exist with wrong names) |

---

## 🏗️ Project Architecture

### Directory Structure
```
cv-express-senegal/
├── src/
│   ├── App.tsx                    # Root router — all routes defined here
│   ├── pages/                     # 11 pages
│   │   ├── Index.tsx              # Landing page (25KB — complex)
│   │   ├── LoginPage.tsx          # Auth page
│   │   ├── DashboardPage.tsx      # Premium dashboard (36KB — largest file)
│   │   ├── FormPage.tsx           # CV creation form
│   │   ├── PreviewPage.tsx        # CV preview + export (17KB)
│   │   ├── ProfilePage.tsx        # Public profile settings
│   │   ├── ImportCVPage.tsx       # PDF/Photo import
│   │   ├── AnalysePage.tsx        # Job offer analysis
│   │   ├── ValidatePage.tsx       # Skills validation
│   │   ├── LoadingPage.tsx        # Loading state
│   │   └── NotFound.tsx           # 404
│   ├── components/
│   │   ├── cv/                    # 22 CV templates + cvUtils
│   │   ├── form/                  # Form step components
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/
│   │   ├── useAuth.tsx            # Auth state hook
│   │   ├── use-toast.ts           # Toast hook
│   │   └── use-mobile.tsx         # Mobile detection
│   ├── services/
│   │   ├── directGeminiService.ts # Direct Gemini API calls (client-side)
│   │   ├── directCoachService.ts  # AI Coach service
│   │   └── geminiService.ts       # Wrapper
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client instance
│   │       └── types.ts           # Auto-generated DB types
│   ├── types/
│   │   └── cv.ts                  # Core domain types (FormData, AIData, etc.)
│   └── lib/
│       └── utils.ts               # cn() utility and helpers
├── supabase/
│   ├── functions/                 # 11 Edge Functions (Deno)
│   │   ├── ai-quantifier/         # AI Result Quantifier
│   │   ├── ai-linkedin-import/    # LinkedIn profile import
│   │   ├── ai-market-intelligence/ # Senegal market insights
│   │   ├── ai-cover-letter/       # Cover letter generation
│   │   ├── ai-analyze-job/        # Job offer analysis
│   │   ├── ai-coach/              # CV coaching
│   │   ├── ai-parse-cv/           # CV parsing from PDF
│   │   ├── ai-translate-cv/       # CV translation
│   │   ├── ai-voice-parse/        # Voice-to-CV parsing
│   │   ├── generate-cv/           # CV PDF generation
│   │   └── reactive-resume-export/ # Export format
│   └── migrations/               # DB migration files
```

---

## 🗃️ Database Schema (Critical for agents)

### Table: `cvs` (Main data table)
```typescript
{
  id: string;               // UUID primary key
  user_id: string | null;   // Foreign key to auth.users
  email: string;            // User email (denormalized)
  form_data: Json;          // FormData object (see types/cv.ts)
  ai_data: Json | null;     // AIData object — populated after AI enhancement
  template: string;         // TemplateName value
  type: "candidat" | "vendeur"; // CV profile type
  cv_name: string | null;   // User-defined CV name
  is_primary: boolean;      // Primary CV for the user
  paid: boolean;            // Freemium flag
  profile_public: boolean;  // Public profile visibility
  profile_slug: string | null; // URL slug for public profile
  show_email: boolean;      // Privacy: show email on public profile
  show_phone: boolean;      // Privacy: show phone on public profile
  created_at: string;       // ISO timestamp
}
```

### Other Tables
| Table | Purpose |
|---|---|
| `validators` | Professionals who validate skills |
| `validation_requests` | Link: CV ↔ skill ↔ validator |
| `validations` | Final validation results with comments |
| `profile_views` | Analytics for public profile views |

### Enum: `cv_type`
```sql
"candidat" | "vendeur"
```
- `candidat` = job seeker profile
- `vendeur` = sales/commercial profile

---

## 📐 Core Domain Types (Always reference these)

### FormData (stored as JSONB in `cvs.form_data`)
```typescript
interface FormData {
  personal: {
    prenom: string;        // First name
    nom: string;           // Last name
    poste: string;         // Target role/position
    email: string;
    telephone: string;
    ville: string;         // Senegalese city — use SENEGAL_CITIES constant
    photo?: string;        // Base64 or URL
    cv_name?: string;
    type?: "candidat" | "vendeur";
  };
  diplomas: {
    id: string;
    diplome: string;
    ecole: string;
    annee: string;
    mention: string;
  }[];
  experiences: {
    id: string;
    poste: string;
    entreprise: string;
    dateDebut: string;   // Format: YYYY or MM/YYYY
    dateFin: string;     // "Présent" for current jobs
    description: string;
  }[];
  noExperience: boolean;   // True for fresh graduates
  skills: string[];
  languages: { langue: string; niveau: string }[];  // niveau from LANGUAGE_LEVELS
  interests: string;       // Free text
}
```

### AIData (stored as JSONB in `cvs.ai_data`)
```typescript
interface AIData {
  summary: string;
  experiences_optimisees: { poste, entreprise, dateDebut, dateFin, description }[];
  competences: string[];
  formation: { diplome, ecole, annee, mention }[];
  langues: { langue: string; niveau: string }[];
}
```

### TemplateName (22 templates)
```typescript
type TemplateName =
  "executive" | "creative" | "prestige" | "tech" | "modernist" |
  "vibrant" | "timeline" | "elegant" | "minimalist" | "aurora" |
  "metric" | "serenity" | "quantum" | "signature" | "quantum_plus" |
  "ethereal" | "corporate" | "artisan" | "studio" | "classic_blue" |
  "brutalist" | "magazine";
```

### Constants
```typescript
SENEGAL_CITIES = ["Dakar", "Thiès", "Saint-Louis", "Kaolack", ...]
LANGUAGE_LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Courant", "Natif"]
```

---

## 🎨 CV Templates System (22 templates)

All templates are in `src/components/cv/` and follow this interface:
```typescript
// Every CV template receives IDENTICAL props:
interface CVTemplateProps {
  formData: FormData;
  aiData?: AIData | null;
}
```

Template files use **Tailwind CSS classes only** (no inline styles unless necessary for dynamic values).

| Template File | Name | Style |
|---|---|---|
| CVExecutive | executive | Classic executive |
| CVCreative | creative | Creative colorful |
| CVPrestige | prestige | Luxury |
| CVTech | tech | Developer style |
| CVModernist | modernist | Swiss minimalist |
| CVVibrant | vibrant | Gradient modern |
| CVTimeline | timeline | Infographic path |
| CVElegant | elegant | Academic serif |
| CVMinimalist | minimalist | Zen/Scandi |
| CVAurora | aurora | Glassmorphism |
| CVMetric | metric | Results-oriented |
| CVSerenity | serenity | Soft premium |
| CVQuantum | quantum | High-tech |
| CVSignature | signature | Personal branding |
| CVQuantumPlus | quantum_plus | Enhanced tech+photo |
| CVEthereal | ethereal | Luxury air |
| CVCorporate | corporate | Management |
| CVArtisan | artisan | Human craft |
| CVStudio | studio | Bold creative blocks |
| CVClassicBlue | classic_blue | Corporate blue |
| CVBrutalist | brutalist | Bold brutalist |
| CVMagazine | magazine | Magazine layout |

---

## ⚙️ Supabase Edge Functions (AI Layer)

All Edge Functions are **Deno** runtime and use **Google Gemini 1.5** as the AI provider.

| Function | Endpoint | Purpose |
|---|---|---|
| `ai-quantifier` | `/functions/v1/ai-quantifier` | Transform experience descriptions into quantified results |
| `ai-linkedin-import` | `/functions/v1/ai-linkedin-import` | Import profile data from LinkedIn URL |
| `ai-market-intelligence` | `/functions/v1/ai-market-intelligence` | Senegal job market insights + training recommendations |
| `ai-cover-letter` | `/functions/v1/ai-cover-letter` | Generate tailored cover letter |
| `ai-analyze-job` | `/functions/v1/ai-analyze-job` | Analyze job offer compatibility |
| `ai-coach` | `/functions/v1/ai-coach` | Interactive CV coaching |
| `ai-parse-cv` | `/functions/v1/ai-parse-cv` | Parse PDF/photo CV |
| `ai-translate-cv` | `/functions/v1/ai-translate-cv` | Translate CV to another language |
| `ai-voice-parse` | `/functions/v1/ai-voice-parse` | Parse voice input to CV fields |
| `generate-cv` | `/functions/v1/generate-cv` | Generate PDF from CV data |
| `reactive-resume-export` | `/functions/v1/reactive-resume-export` | Export to JSON format |

---

## 🔐 TypeScript Configuration Rules

**CRITICAL — Agents must know these settings:**

```json
{
  "strict": false,
  "noImplicitAny": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false,
  "noFallthroughCasesInSwitch": false
}
```

- ✅ TypeScript is **non-strict** — `any` types are acceptable when needed
- ✅ Unused variables/parameters do NOT cause errors
- ✅ Path alias `@/*` maps to `src/*` — always use `@/` for imports
- ✅ Module format: ESNext with bundler resolution

---

## 🧩 Code Conventions & Patterns

### File Naming
- **Pages**: `PascalCase` + `Page.tsx` suffix (e.g., `DashboardPage.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `CVAurora.tsx`, `AuthModal.tsx`)
- **Hooks**: `camelCase` starting with `use` (e.g., `useAuth.tsx`)
- **Services**: `camelCase` + `Service.ts` (e.g., `directGeminiService.ts`)
- **Types**: `camelCase.ts` (e.g., `cv.ts`)
- **Utilities**: `camelCase` in `src/lib/`

### Import Order Convention
```typescript
// 1. React + framework
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 2. External libraries
import { useQuery } from "@tanstack/react-query";

// 3. Internal — use @/ alias always
import { supabase } from "@/integrations/supabase/client";
import { FormData, AIData } from "@/types/cv";
import { Button } from "@/components/ui/button";
```

### State Management Pattern
- **Local UI state**: `useState` hooks
- **Server/DB state**: `@tanstack/react-query` (`useQuery`, `useMutation`)
- **Auth state**: `useAuth()` hook from `@/hooks/useAuth`
- **No Redux / Zustand** — keep it simple

### Supabase Access Pattern
```typescript
// Always use the client from:
import { supabase } from "@/integrations/supabase/client";

// Query pattern
const { data, error } = await supabase
  .from("cvs")
  .select("*")
  .eq("user_id", user.id);

// Auth check
const { data: { user } } = await supabase.auth.getUser();
```

### Toast Notifications
```typescript
import { toast } from "sonner";
toast.success("Message de succès");
toast.error("Message d'erreur");
```

### Form Pattern
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Always use react-hook-form + zod for form validation
```

---

## 🌍 Senegal-Specific Context (Critical for Product Decisions)

### Target Users
- **Candidat**: Job seekers in Senegal (fresh graduates, experienced professionals)
- **Vendeur**: Sales/commercial professionals with product-oriented CV needs
- **Language**: French is primary — some users may be bilingual (French/Wolof)

### Local Market Context
- Connectivity: Variable — optimize for 3G/4G mobile connections
- Devices: Mobile-first (many users access via smartphone)
- Key cities: Dakar (dominant), Thiès, Saint-Louis, Kaolack
- Key sectors: Telecoms, Finance, NGOs, Government, Trade
- Platforms used by recruiters: LinkedIn, Jobartoo, Jobiko, Rekrute

### UI Language Rules
- **All UI labels in French**
- Field names: `prenom`, `nom`, `poste`, `ville` (French, not English)
- Error messages: French
- Template content examples: Use Senegalese names, companies, universities

---

## 🧪 Testing Setup

| Tool | Purpose |
|---|---|
| **Vitest** | Test runner (configured in `vitest.config.ts`) |
| **@testing-library/react** | Component testing |
| **jsdom** | DOM environment for tests |
| **@testing-library/jest-dom** | Custom matchers |

```bash
npm run test        # Run all tests once
npm run test:watch  # Watch mode
```

Test files location: `src/test/`

---

## 🚀 Development Workflow

```bash
# Start dev server
npm run dev         # → http://localhost:8080

# Start Supabase locally
supabase start      # Requires Docker

# Run Supabase functions locally
supabase functions serve

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## ⚠️ Known Issues & Critical Gotchas

### 1. Gemini Model Names
```
❌ WRONG: "gemini-2.5-pro", "gemini-3"
✅ CORRECT: "gemini-1.5-pro", "gemini-1.5-flash"
```
Using wrong model names silently fails. Always verify before calling.

### 2. JSONB Data Access
`form_data` and `ai_data` are stored as `JSON` (not typed objects) in Supabase. Cast after fetching:
```typescript
const formData = cv.form_data as FormData;
const aiData = cv.ai_data as AIData | null;
```

### 3. RLS (Row Level Security)
All tables have RLS enabled. Every query MUST have a valid `auth.uid()`. Anonymous queries will fail silently or return empty arrays.

### 4. CV Type Discrimination
Always check `type: "candidat" | "vendeur"` before rendering — Vendeur profiles may have different field requirements.

### 5. Template Name Mapping
The `template` field in DB uses underscore notation (`quantum_plus`, `classic_blue`) while some UI code may use camelCase. Always normalize to underscore when storing.

### 6. PDF Export
Uses `html2pdf.js` for client-side export. CV templates must be render-safe (no complex CSS transforms that break PDF rendering).

### 7. `is_primary` Flag
Each user can have multiple CVs but only one `is_primary: true`. Always handle multi-CV lists in Dashboard.

---

## 📋 Sprint 1 Status (as of 2026-03-31)

| Feature | Status | Notes |
|---|---|---|
| Dashboard Premium | 🔄 In progress | `DashboardPage.tsx` (36KB) |
| Architecture Multi-Profils | ✅ Done | `type: candidat/vendeur` in DB |
| Sauvegarde Temps Réel | ✅ Done | Supabase realtime |
| Profil Personnel V0 | 🔄 In progress | `ProfilePage.tsx` |
| AI Quantifier | ✅ Done | Edge function deployed |
| LinkedIn Import | ✅ Done | Edge function deployed |
| Market Intelligence | ✅ Done | Edge function deployed |

---

## 📚 Useful References

- **ROADMAP**: `cv-express-senegal/ROADMAP.md`
- **Memory/History**: `cv-express-senegal/memory.md`
- **DB Types**: `src/integrations/supabase/types.ts`
- **Core CV Types**: `src/types/cv.ts`
- **Supabase Config**: `supabase/config.toml`
