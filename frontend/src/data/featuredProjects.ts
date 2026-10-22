export interface FeaturedProject {
  title: string;
  description: string;
  tags: string[];
  visual: "football" | "notebook" | "globe" | "pakuni";
  link: string;
  githubUrl?: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    title: "Football Intelligence",
    description: "A football recruitment platform built on 11.7M match events, with explainable player comparisons, squad upgrades, and role-based scouting.",
    tags: ["Python", "FastAPI", "Next.js", "PostgreSQL", "dbt"],
    visual: "football",
    link: "https://footballintelligencesystem.vercel.app",
    githubUrl: "https://github.com/abdullahomarrr/FootballIntellegance",
  },
  {
    title: "Strive",
    description: "An AI math notebook that turns handwritten calculus and proofs into personalized, Socratic guidance, with offline writing and cloud sync.",
    tags: ["JavaScript", "FastAPI", "Gemini", "Supabase", "Tauri"],
    visual: "notebook",
    link: "https://strive-emberhacks.vercel.app",
    githubUrl: "https://github.com/abdullahomarrr/Strive",
  },
  {
    title: "DailyLingo",
    description: "A daily audio geography game: identify languages from real human speech, explore an interactive globe, and unlock clues with every guess.",
    tags: ["TypeScript", "Next.js", "React", "Three.js"],
    visual: "globe",
    link: "https://guess-the-language-eight.vercel.app",
    githubUrl: "https://github.com/abdullahomarrr/DailyLingo",
  },
  {
    title: "PakUni",
    description: "A unified admissions platform simplifying how Pakistani students apply to universities with one profile, one dashboard, and one workflow.",
    tags: ["Python", "JavaScript", "FastAPI", "MongoDB"],
    visual: "pakuni",
    link: "/projects/pakuni",
  },
];
