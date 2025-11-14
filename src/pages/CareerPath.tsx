import React from 'react';
import { Compass, Target, Lightbulb, GraduationCap, Briefcase, Users, Rocket, RefreshCcw } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const steps = [
  {
    id: 1,
    icon: Compass,
    label: 'Step 1',
    title: 'Self-Discovery',
    subtitle: 'Know Yourself',
    description: 'Gain clarity on what energises you before selecting a career path.',
    focus: [
      'Identify interests: subjects, activities or industries that excite you',
      'List strengths: natural abilities, skills and personality traits',
      'Clarify personal values: money, purpose, freedom, stability, creativity',
      'Explore personality frameworks such as MBTI, Holland Code (RIASEC) or CliftonStrengths',
    ],
    goal: 'Understand the kind of work that aligns with your strengths, passions and life goals.',
  },
  {
    id: 2,
    icon: Lightbulb,
    label: 'Step 2',
    title: 'Career Exploration',
    subtitle: 'Know What’s Out There',
    description: 'Investigate real-world career options that match your self-discovery insights.',
    focus: [
      'Research industries and roles using LinkedIn, Indeed or O*NET',
      'Schedule informational interviews or job shadowing sessions',
      'Evaluate market demand, salary ranges and required skills',
    ],
    goal: 'Narrow your options to 1–3 potential career directions.',
  },
  {
    id: 3,
    icon: Target,
    label: 'Step 3',
    title: 'Goal Setting',
    subtitle: 'Define Your Path',
    description: 'Translate your preferred careers into a roadmap with concrete milestones.',
    focus: [
      'Set short-term goals (1–2 years): learn skills, complete courses, gain experience',
      'Plan mid-term goals (3–5 years): secure a full-time role or first promotion',
      'Visualise long-term goals (5–10+ years): leadership positions, entrepreneurship or pivots',
    ],
    goal: 'Capture your career roadmap in writing.',
  },
  {
    id: 4,
    icon: GraduationCap,
    label: 'Step 4',
    title: 'Skill Building',
    subtitle: 'Prepare for the Role',
    description: 'Bridge the gap between where you are and the skills your target roles need.',
    focus: [
      'Acquire technical skills specific to your target jobs (coding, finance, design, marketing)',
      'Polish core soft skills: communication, collaboration, problem-solving and leadership',
      'Leverage online courses, certifications, bootcamps and workshops',
    ],
    goal: 'Become qualified and competitive for your chosen roles.',
  },
  {
    id: 5,
    icon: Briefcase,
    label: 'Step 5',
    title: 'Practical Experience',
    subtitle: 'Start Small, Build Up',
    description: 'Apply your skills in real situations to accelerate learning and credibility.',
    focus: [
      'Pursue internships, apprenticeships or volunteer initiatives',
      'Take on freelance or passion projects to demonstrate value',
      'Target entry-level roles that help you accumulate results and stories',
    ],
    goal: 'Build a portfolio, resume and network that open doors.',
  },
  {
    id: 6,
    icon: Users,
    label: 'Step 6',
    title: 'Networking',
    subtitle: 'Build Relationships',
    description: 'Create meaningful connections who can mentor, refer or collaborate with you.',
    focus: [
      'Attend industry meetups, webinars and conferences',
      'Join professional associations or online communities',
      'Maintain authentic relationships with peers and mentors',
    ],
    goal: 'Open doors to opportunities and guidance through your relationships.',
  },
  {
    id: 7,
    icon: Rocket,
    label: 'Step 7',
    title: 'Job Search & Growth',
    subtitle: 'Launch & Advance',
    description: 'Enter the market with intention and continue levelling up once inside.',
    focus: [
      'Craft a strong resume, cover letter and LinkedIn presence',
      'Apply strategically — prioritise quality over quantity',
      'When employed, seek feedback, learn continuously and take initiative',
    ],
    goal: 'Secure roles that move you toward your long-term vision.',
  },
  {
    id: 8,
    icon: RefreshCcw,
    label: 'Step 8',
    title: 'Review & Adapt',
    subtitle: 'Stay Future-Ready',
    description: 'Regularly reassess to ensure your career still aligns with your evolving self.',
    focus: [
      'Reflect on progress every 6–12 months',
      'Adjust goals as interests or market dynamics change',
      'Add new skills or pivot paths when needed',
    ],
    goal: 'Maintain flexibility and resilience throughout your career journey.',
  },
];

const CareerPath: React.FC = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="px-6 lg:px-8 py-10">
      <section className={`${isDarkMode ? 'bg-gray-900/80' : 'bg-white'} rounded-3xl shadow-xl border ${isDarkMode ? 'border-gray-800/80' : 'border-gray-200'} p-8`}> 
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
            Career Navigation Framework
          </span>
          <h1 className="mt-4 text-3xl font-bold">Design Your Personal Career Path</h1>
          <p className="mt-3 text-base opacity-80">
            Follow this eight-step loop to align who you are with the opportunities around you. Each stage builds on the previous one and ends with a clear goal before you move forward.
          </p>
        </header>

        <div className="mt-10 grid gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.id}
                className={`rounded-2xl border ${
                  isDarkMode ? 'border-gray-800 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
                } p-6 lg:p-7 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white w-14 h-14 shadow-lg">
                      <Icon size={26} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">{step.label}</span>
                      <h2 className="text-xl font-semibold">{step.title}</h2>
                      <span className="text-sm opacity-70">{step.subtitle}</span>
                    </div>
                    <p className="text-sm leading-relaxed opacity-80">{step.description}</p>
                    <div className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-70">Focus on</span>
                      <ul className="grid gap-2 text-sm list-disc pl-6">
                        {step.focus.map((item, idx) => (
                          <li key={idx} className="leading-relaxed opacity-80">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={`rounded-xl px-4 py-3 border ${isDarkMode ? 'border-purple-700/50 bg-purple-900/20 text-purple-100' : 'border-purple-200 bg-purple-50 text-purple-900'}`}>
                      <span className="text-xs font-semibold uppercase tracking-wide">Goal</span>
                      <p className="mt-1 text-sm leading-relaxed">{step.goal}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className={`${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 mt-10`}> 
          <h3 className="text-lg font-semibold">How to Use This Roadmap</h3>
          <ol className="mt-3 space-y-2 text-sm opacity-80 list-decimal pl-6">
            <li>Work through each step in order and document your insights.</li>
            <li>Set reminders to revisit Step 8 every 6–12 months.</li>
            <li>Repeat the loop whenever you feel misaligned or ready for the next challenge.</li>
          </ol>
        </footer>
      </section>
    </div>
  );
};

export default CareerPath;



