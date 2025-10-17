
export interface SkillMatch {
  skill: string;
  level: string;
}

export interface UiHints {
  highlight_skills: string[];
  badge_colors: {
    Expert: string;
    Intermediate: string;
    Beginner: string;
  };
  match_score_chart: string;
}

export interface AnalysisResult {
  match_score: number;
  skills_matched: SkillMatch[];
  experience_matched: string[];
  missing_skills: string[];
  short_summary: string;
  ui_hints: UiHints;
}

export interface InterviewQuestionCategory {
  category: string;
  questions: string[];
}
