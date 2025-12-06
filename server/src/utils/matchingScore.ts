export interface MatchingProfile {
  skills: string[];
  experience?: string;
}

export interface MatchingJob {
  requiredSkills: string[];
  experienceLevel?: string;
}

export function calculateMatchScore(profile: MatchingProfile, job: MatchingJob): number {
  if (!profile.skills || !job.requiredSkills) {
    return 0;
  }

  const profileSkills = profile.skills.map(s => s.toLowerCase().trim());
  const jobSkills = job.requiredSkills.map(s => s.toLowerCase().trim());

  if (jobSkills.length === 0) {
    return 50;
  }

  let matchedSkills = 0;
  let partialMatches = 0;

  for (const jobSkill of jobSkills) {
    const exactMatch = profileSkills.some(ps => ps === jobSkill);
    if (exactMatch) {
      matchedSkills++;
    } else {
      const partialMatch = profileSkills.some(ps => 
        ps.includes(jobSkill) || jobSkill.includes(ps)
      );
      if (partialMatch) {
        partialMatches += 0.5;
      }
    }
  }

  const skillScore = ((matchedSkills + partialMatches) / jobSkills.length) * 100;

  let experienceBonus = 0;
  if (profile.experience && job.experienceLevel) {
    const experienceKeywords: Record<string, string[]> = {
      entry: ["fresher", "junior", "entry", "graduate", "intern", "0-1", "1-2"],
      mid: ["mid", "2-4", "3-5", "4-6", "intermediate"],
      senior: ["senior", "5+", "6+", "7+", "experienced", "lead"],
      lead: ["lead", "principal", "architect", "manager", "director", "8+", "10+"],
    };

    const levelKeywords = experienceKeywords[job.experienceLevel] || [];
    const expLower = profile.experience.toLowerCase();
    
    if (levelKeywords.some(kw => expLower.includes(kw))) {
      experienceBonus = 10;
    }
  }

  const totalScore = Math.min(100, Math.round(skillScore + experienceBonus));
  
  return totalScore;
}

export function getMatchCategory(score: number): string {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Moderate Match";
  if (score >= 20) return "Low Match";
  return "Poor Match";
}

export function sortByMatchScore<T extends { matchScore?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
