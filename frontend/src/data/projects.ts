export interface HowItWorksItem {
  title: string;
  detail: string;
}

export interface MetricItem {
  title: string;
  description: string;
}

export interface ProjectData {
  slug: string;
  name: string;
  tagline: string;
  year: string;
  tags: string[];
  accentColor?: string;
  liveUrl?: string;
  githubUrl?: string;
  overview: string[];
  problem: string[];
  howItWorks: HowItWorksItem[];
  metrics: MetricItem[];
}

export const projects: Record<string, ProjectData> = {
  pyko: {
    slug: "pyko",
    name: "Pyko",
    tagline:
      "An AI-powered academic productivity platform that syncs with university LMS systems to help students track performance, identify weak areas, and get structured next-step recommendations.",
    year: "2025 — Present",
    tags: [
      "Python",
      "TypeScript",
      "FastAPI",
      "MongoDB Atlas",
      "AWS",
      "OAuth",
      "AI Copilot",
    ],
    liveUrl: "https://pyko.ca",
    overview: [
      "Automatic LMS sync with Canvas and D2L",
      "Unified cross-course view of assignments and grades",
      "Deterministic analytics engine for performance insights",
      "AI copilot that explains insights and suggests next steps",
      "Privacy-first: consent flags, anonymization, and deletion flows",
    ],
    problem: [
      "LMS platforms surface raw scores but provide no trend analysis, weak-area diagnosis, or proactive guidance.",
      "Students lack a centralized view across courses and the actionable context to respond to their academic data.",
    ],
    howItWorks: [
      {
        title: "Data Integration",
        detail:
          "OAuth-based LMS connection, scheduled sync, and normalization of course structures and grading weights across institutions.",
      },
      {
        title: "Deterministic Analytics",
        detail:
          "Feature-based scoring, weighted grade projections, Holt's double exponential smoothing for forecasting, and threshold logic for identifying at-risk areas.",
      },
      {
        title: "AI Copilot Layer",
        detail:
          "Uses deterministic outputs as grounding constraints — generates structured explanations and actionable recommendations without fabricating data.",
      },
      {
        title: "Privacy & Safety",
        detail:
          "Anonymization controls, consent flags per data type, export and deletion flows, and strict schema validation on every inbound sync.",
      },
    ],
    metrics: [
      {
        title: "300+ Beta Users",
        description:
          "Early adopters actively testing automated LMS sync and performance insights.",
      },
      {
        title: "Live LMS Integration",
        description:
          "Canvas and D2L OAuth integration deployed with real-time grade normalization.",
      },
      {
        title: "Deterministic Analytics Engine",
        description:
          "Feature-based scoring, trend forecasting, and weakness detection running on live user data.",
      },
      {
        title: "Privacy-First Architecture",
        description:
          "User-controlled anonymization, export, and deletion workflows fully implemented.",
      },
    ],
  },

  pakuni: {
    slug: "pakuni",
    name: "PakUni",
    tagline:
      "A centralized admissions portal for Pakistani universities — an OUAC-style workflow where applicants create one reusable profile and submit to multiple programs through a single guided flow.",
    year: "2026",
    tags: [
      "Python",
      "JavaScript",
      "FastAPI",
      "MongoDB",
      "Multi-step Workflow",
      "Full-stack MVP",
    ],
    accentColor: "#1a6b3c",
    overview: [
      "One reusable applicant profile with Pakistan-specific fields (CNIC, domicile, Matric/Inter)",
      "Document locker to upload and reuse transcripts across applications",
      "Program discovery and selection with a structured review-and-submit flow",
      "Server-side validation for required fields and document formats",
      "Full-stack MVP with an admissions-style multi-step workflow engine",
    ],
    problem: [
      "Students applying to multiple Pakistani universities repeatedly re-enter the same information across different portals and forms.",
      "Requirements vary by program, and missing documents or fields cause delays and confusion with no unified way to manage it.",
    ],
    howItWorks: [
      {
        title: "Guided Workflow Engine",
        detail:
          "Step-by-step onboarding — profile → academics → documents → program selection → review — enforcing completion before progression.",
      },
      {
        title: "Pakistan-Specific Validation",
        detail:
          "Enforces formats for CNIC and passport numbers, domicile fields, grade-level structures (Matric/Inter), and required document checks.",
      },
      {
        title: "Reusable Data Model",
        detail:
          "Stores one canonical applicant profile attached to multiple program submissions, eliminating repeated data entry.",
      },
      {
        title: "Submission Readiness",
        detail:
          "Completeness checks and clear missing-items indicators surface exactly what's needed before a submission can proceed.",
      },
    ],
    metrics: [
      {
        title: "Reusable Applicant Profile",
        description:
          "One canonical profile attached to multiple program submissions, eliminating repeated data entry.",
      },
      {
        title: "Pakistan-Specific Validation",
        description:
          "CNIC, domicile, and Matric/Inter grade-level formats enforced server-side across all submissions.",
      },
      {
        title: "5-Step Guided Workflow",
        description:
          "Complete onboarding flow from profile creation through document upload to final submission review.",
      },
      {
        title: "Full-Stack MVP Shipped",
        description:
          "End-to-end admissions portal built with a real multi-step workflow and server-side validation engine.",
      },
    ],
  },
};
