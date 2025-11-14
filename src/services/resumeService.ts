import { GoogleGenerativeAI } from '@google/generative-ai';

export type ResumeInput = {
  fullName: string;
  title: string;
  summary?: string;
  yearsExperience?: number;
  skills: string[];
  experiences: Array<{ company: string; role: string; start: string; end: string; details?: string }>;
  education?: Array<{ school: string; degree: string; year: string }>;
  email?: string;
  phone?: string;
  location?: string;
  links?: { github?: string; linkedin?: string; website?: string };
  projects?: Array<{ name: string; description?: string; link?: string; tech?: string[] }>;
  certifications?: Array<{ name: string; issuer?: string; year?: string }>;
  bulletsPerExperience?: number;
};

export type ResumeSection = {
  summary: string;
  skills: string[];
  experiences: Array<{
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }>;
  projects?: Array<{ name: string; bullets: string[]; link?: string }>;
  certifications?: Array<{ name: string; issuer?: string; year?: string }>;
};

export type ATSScore = {
  overallScore: number;
  breakdown: {
    contactInfo: number;
    structure: number;
    keywords: number;
    formatting: number;
    achievements: number;
    skills: number;
  };
  recommendations: string[];
  strengths: string[];
};

class ResumeService {
  private gem?: GoogleGenerativeAI;
  private enabled: boolean;

  constructor() {
    this.enabled = false;
    this.gem = undefined;
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY as string | undefined;
      if (!apiKey || apiKey.trim() === '') {
        this.enabled = false;
        return;
      }
      
      // Try to initialize - if it fails, we'll catch it
      try {
        this.gem = new GoogleGenerativeAI(apiKey);
        this.enabled = true;
      } catch (initError) {
        console.warn('Failed to initialize Google Generative AI:', initError);
        this.enabled = false;
        this.gem = undefined;
      }
    } catch (error) {
      console.warn('Failed to initialize ResumeService:', error);
      this.enabled = false;
      this.gem = undefined;
    }
  }

  async generate(input: ResumeInput): Promise<ResumeSection> {
    if (!this.enabled || !this.gem) {
      // Fallback: basic structure without AI
      return {
        summary: input.summary || `${input.title} with ${input.yearsExperience || 0}+ years of experience.`,
        skills: input.skills,
        experiences: input.experiences.map(e => ({ ...e, bullets: [e.details || 'Contributed to key initiatives and collaborated across teams.'] })),
      };
    }

    const model = this.gem.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `You are an expert resume writer. Create professional resume content in JSON for the following candidate.

Return ONLY valid JSON matching this schema:
{
  "summary": string,
  "skills": string[],
  "experiences": [
    { "company": string, "role": string, "start": string, "end": string, "bullets": string[] }
  ],
  "projects": [ { "name": string, "bullets": string[], "link": string | null } ],
  "certifications": [ { "name": string, "issuer": string | null, "year": string | null } ]
}

Guidelines:
- Use strong, outcome-focused bullet points with metrics when possible.
- Tailor to the title: ${input.title}.
- Keep bullets concise (max 20 words each). Generate up to ${input.bulletsPerExperience || 5} bullets per experience.

Candidate data:
name: ${input.fullName}
title: ${input.title}
yearsExperience: ${input.yearsExperience ?? ''}
skills: ${input.skills.join(', ')}
experiences: ${input.experiences.map(e => `${e.role} at ${e.company} (${e.start} - ${e.end}) ${e.details || ''}`).join(' | ')}
summaryProvided: ${input.summary || 'none'}
contacts: email=${input.email || ''}, phone=${input.phone || ''}, location=${input.location || ''}
links: github=${input.links?.github || ''}, linkedin=${input.links?.linkedin || ''}, website=${input.links?.website || ''}
projectsProvided: ${input.projects?.map(p => `${p.name} ${p.description || ''}`).join(' | ') || 'none'}
certificationsProvided: ${input.certifications?.map(c => `${c.name} ${c.issuer || ''} ${c.year || ''}`).join(' | ') || 'none'}`;

    const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    let text = res.response.text().trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return parsed as ResumeSection;
  }

  async checkATSFromPDF(file: File, jobDescription: string): Promise<ATSScore> {
    if (!this.enabled || !this.gem) {
      // Return a basic score structure with helpful message
      return {
        overallScore: 0,
        breakdown: {
          contactInfo: 0,
          structure: 0,
          keywords: 0,
          formatting: 0,
          achievements: 0,
          skills: 0,
        },
        recommendations: ['AI service not available. Please configure your Google Cloud API key in the .env file to enable ATS analysis.'],
        strengths: [],
      };
    }

    // Use lower temperature for more consistent results
    const model = this.gem.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.1, // Lower temperature for more deterministic results
        topP: 0.8,
      }
    });

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume PDF and compare it against the provided job description to provide a CONSISTENT ATS compatibility score.

IMPORTANT: Use objective, measurable criteria. The same resume and job description should always receive the same score.

Return ONLY valid JSON matching this schema:
{
  "overallScore": number (0-100),
  "breakdown": {
    "contactInfo": number (0-100),
    "structure": number (0-100),
    "keywords": number (0-100),
    "formatting": number (0-100),
    "achievements": number (0-100),
    "skills": number (0-100)
  },
  "recommendations": string[],
  "strengths": string[]
}

DETAILED SCORING CRITERIA (be consistent):
- contactInfo (0-100): 
  * Name present: +25 points
  * Email present: +25 points
  * Phone present: +25 points
  * Location present: +25 points

- structure (0-100):
  * Professional summary/objective: +25 points
  * Work experience section: +25 points
  * Skills section: +25 points
  * Education section: +25 points

- keywords (0-100): 
  * Extract ALL important keywords from job description (technologies, tools, frameworks, methodologies, job-specific terms)
  * Count how many of these keywords appear in the resume
  * Score = (matched keywords / total important keywords in job description) * 100
  * Be STRICT: Only count exact or very close matches (e.g., "React" matches "React.js" but "DevOps" does NOT match "Frontend")
  * If resume is for a completely different role (e.g., DevOps vs Frontend), score should be VERY LOW (0-20%)
  * Cap at 100

- formatting (0-100):
  * Clean, simple layout: +50 points
  * No complex graphics/tables: +30 points
  * Standard fonts: +20 points
  * Deduct points for: images, complex layouts, unusual fonts

- achievements (0-100):
  * Has quantifiable metrics (numbers, percentages): +50 points
  * Has action verbs and results: +30 points
  * Has multiple achievement bullets: +20 points

- skills (0-100):
  * Extract ALL required/desired skills from job description (programming languages, frameworks, tools, etc.)
  * Count how many of these skills appear in the resume skills section or experience
  * Score = (matching skills / total required skills in job description) * 100
  * Be STRICT: Only count skills that actually match (e.g., "Kubernetes" does NOT match "React")
  * If resume skills don't align with job requirements, score should be VERY LOW (0-20%)
  * Cap at 100

- overallScore: Use WEIGHTED average, NOT simple average. Keywords and Skills are CRITICAL for job matching:
  * Keywords: 30% weight (most important - directly affects ATS filtering)
  * Skills: 30% weight (critical - must match job requirements)
  * Contact Info: 10% weight (less important for job fit)
  * Structure: 10% weight (less important for job fit)
  * Formatting: 10% weight (less important for job fit)
  * Achievements: 10% weight (less important for job fit)
  * Formula: (keywords * 0.30) + (skills * 0.30) + (contactInfo * 0.10) + (structure * 0.10) + (formatting * 0.10) + (achievements * 0.10)
  * Round to nearest integer
  * IMPORTANT: If keywords < 30% OR skills < 30%, the overall score should be penalized by an additional 10-20 points to reflect poor job match

RECOMMENDATIONS GUIDELINES:
- Only include recommendations for issues ACTUALLY found in the resume
- Be specific and actionable (e.g., "Add React and TypeScript to skills section" not "Add more skills")
- Focus on ATS-specific issues (formatting, keywords, structure)
- Keep each recommendation under 100 characters
- Prioritize critical issues first
- If a skill/keyword is missing, name the specific skill/keyword from the job description
- For formatting issues, specify what to fix (e.g., "Remove photo" or "Convert education table to plain text")
- Don't make generic recommendations that don't apply to this resume

STRENGTHS GUIDELINES:
- List actual strengths found in the resume
- Be specific (e.g., "Strong keyword match in skills section" not "Good resume")
- Focus on ATS-relevant strengths

Job Description:
${jobDescription}

CRITICAL: Analyze the resume PDF against this job description. 
- If the resume is for a DIFFERENT role/field than the job description (e.g., DevOps resume for Frontend job, Backend resume for Design job), the keywords and skills scores MUST be very low (0-25%).
- The overall score should reflect how well the resume matches the SPECIFIC job requirements, not just resume quality.
- A well-formatted resume for the wrong job should still score LOW overall (30-50%).
- Be objective, consistent, and STRICT about keyword/skill matching. Count actual matches, don't estimate.
- Only recommend fixes for issues you actually see in the resume.`;

    try {
      const mimeType = file.type || 'application/pdf';
      const res = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        }],
      });

      let text = res.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      }
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return parsed as ATSScore;
    } catch (error) {
      console.error('PDF ATS check error:', error);
      throw new Error(`Failed to analyze PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkATS(input: ResumeInput, section?: ResumeSection): Promise<ATSScore> {
    const fullResume = {
      ...input,
      generated: section,
    };

    // Basic scoring without AI (fallback)
    if (!this.enabled || !this.gem) {
      return this.basicATSScore(fullResume);
    }

    const model = this.gem.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const resumeText = this.formatResumeForAnalysis(fullResume, section);

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume and provide an ATS compatibility score.

Return ONLY valid JSON matching this schema:
{
  "overallScore": number (0-100),
  "breakdown": {
    "contactInfo": number (0-100),
    "structure": number (0-100),
    "keywords": number (0-100),
    "formatting": number (0-100),
    "achievements": number (0-100),
    "skills": number (0-100)
  },
  "recommendations": string[],
  "strengths": string[]
}

Scoring criteria:
- contactInfo: Has name, email, phone, location (25% each)
- structure: Has summary, experience, skills, education sections
- keywords: Relevant industry keywords and job title alignment
- formatting: Clean, parseable format without complex layouts
- achievements: Quantifiable results and metrics in experience bullets
- skills: Skills section present and relevant to target role

Resume content:
${resumeText}`;

    try {
      const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      let text = res.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      }
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return parsed as ATSScore;
    } catch (error) {
      console.error('ATS check error:', error);
      return this.basicATSScore(fullResume);
    }
  }

  private formatResumeForAnalysis(input: ResumeInput, section?: ResumeSection): string {
    const parts: string[] = [];
    parts.push(`Name: ${input.fullName || 'Not provided'}`);
    parts.push(`Title: ${input.title || 'Not provided'}`);
    parts.push(`Email: ${input.email || 'Not provided'}`);
    parts.push(`Phone: ${input.phone || 'Not provided'}`);
    parts.push(`Location: ${input.location || 'Not provided'}`);
    parts.push(`\nSummary: ${section?.summary || input.summary || 'Not provided'}`);
    parts.push(`\nSkills: ${(section?.skills || input.skills || []).join(', ')}`);
    parts.push(`\nExperience:`);
    (section?.experiences || input.experiences || []).forEach(exp => {
      parts.push(`- ${exp.role} at ${exp.company} (${exp.start} - ${exp.end})`);
      (exp.bullets || []).forEach(b => parts.push(`  • ${b}`));
    });
    if (section?.projects || input.projects) {
      parts.push(`\nProjects:`);
      (section?.projects || input.projects || []).forEach(proj => {
        parts.push(`- ${proj.name}`);
        (proj.bullets || []).forEach(b => parts.push(`  • ${b}`));
      });
    }
    return parts.join('\n');
  }

  private basicATSScore(input: ResumeInput & { generated?: ResumeSection }): ATSScore {
    const contactScore = [
      input.fullName ? 25 : 0,
      input.email ? 25 : 0,
      input.phone ? 25 : 0,
      input.location ? 25 : 0,
    ].reduce((a, b) => a + b, 0);

    const structureScore = [
      (input.summary || input.generated?.summary) ? 25 : 0,
      (input.experiences?.length > 0) ? 25 : 0,
      (input.skills?.length > 0 || input.generated?.skills?.length > 0) ? 25 : 0,
      (input.education?.length > 0) ? 25 : 0,
    ].reduce((a, b) => a + b, 0);

    const skills = input.generated?.skills || input.skills || [];
    const skillsScore = skills.length >= 5 ? 100 : (skills.length * 20);

    const achievementsScore = (input.generated?.experiences || input.experiences || []).some(exp =>
      (exp.bullets || []).some(b => /\d+/.test(b))
    ) ? 80 : 40;

    const keywordsScore = input.title ? 70 : 50;
    const formattingScore = 85; // Assume clean format

    const overall = Math.round(
      (contactScore + structureScore + keywordsScore + formattingScore + achievementsScore + skillsScore) / 6
    );

    const recommendations: string[] = [];
    if (!input.email) recommendations.push('Add your email address');
    if (!input.phone) recommendations.push('Include your phone number');
    if (!input.location) recommendations.push('Add your location');
    if (!input.summary && !input.generated?.summary) recommendations.push('Add a professional summary');
    if (skills.length < 5) recommendations.push('Include at least 5-10 relevant skills');
    if ((input.generated?.experiences || input.experiences || []).length === 0) {
      recommendations.push('Add at least one work experience entry');
    }

    const strengths: string[] = [];
    if (input.fullName) strengths.push('Name is present');
    if (input.title) strengths.push('Job title is specified');
    if (skills.length > 0) strengths.push('Skills section included');
    if ((input.generated?.experiences || input.experiences || []).length > 0) {
      strengths.push('Work experience provided');
    }

    return {
      overallScore: overall,
      breakdown: {
        contactInfo: contactScore,
        structure: structureScore,
        keywords: keywordsScore,
        formatting: formattingScore,
        achievements: achievementsScore,
        skills: skillsScore,
      },
      recommendations,
      strengths,
    };
  }
}

export default ResumeService;


