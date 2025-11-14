import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Search } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { learnerFaqs, instructorFaqs } from './supportData';

const audienceTabs = ['Learner', 'Instructor'] as const;

const learnerResources = [
  { title: 'Getting Started Guide', href: '/courses' },
  { title: 'Progress Tracking Help', href: '/dashboard' },
  { title: 'Certificate Information', href: '/dashboard' },
  { title: 'Account Settings', href: '/dashboard' },
];

const instructorResources = [
  { title: 'Instructor Code of Conduct', href: '/instructor/dashboard' },
  { title: 'Content Guidelines', href: '/instructor/course-upload' },
  { title: 'Pricing Best Practices', href: '/instructor/course-upload' },
  { title: 'Student Engagement Tips', href: '/instructor/dashboard' },
];

const SupportCenter: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const [activeAudience, setActiveAudience] = useState<typeof audienceTabs[number]>('Learner');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get('support-search') as string)?.trim();

    if (query) {
      // Navigate to Ask Anything page with search query
      navigate(`/ask-anything?q=${encodeURIComponent(query)}`);
    }
  };

  const getArticleSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };

  const currentFaqs = activeAudience === 'Learner' ? learnerFaqs : instructorFaqs;
  const currentResources = activeAudience === 'Learner' ? learnerResources : instructorResources;
  const audienceSlug = activeAudience.toLowerCase();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-b from-[#faf6ef] via-white to-white text-gray-900'
      }`}
    >
      <div className="px-6 md:px-12 lg:px-24 xl:px-32 py-6">
        {/* Top utility bar */}
        <div className="flex items-center justify-between text-sm font-medium">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Back To VP Learning
          </button>
          <span className={`text-xl font-black tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            VP Learning
          </span>
          <div className="flex items-center gap-4">
            <button className={`inline-flex items-center gap-1 transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}>
              <Globe size={16} />
              English (US)
            </button>
            <Link
              to="/login"
              className={`border rounded-lg px-3 py-1.5 transition-colors ${
                isDarkMode
                  ? 'border-gray-700 hover:bg-gray-800 text-white'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="mt-8">
          <div className="relative overflow-hidden rounded-[40px] shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#f6c042,_#f4921f,_#ea6f1b)]" />
            <div className="relative px-8 md:px-12 py-8 md:py-12">
              <div className="max-w-xl">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-gray-900">
                  How May We Help You?
                </h1>
                <form
                  onSubmit={handleSearch}
                  className="mt-6 flex items-center gap-4 bg-white/95 rounded-2xl border border-white/40 shadow-lg px-6 py-4"
                >
                  <Search className="text-gray-500" size={22} />
                  <input
                    type="search"
                    name="support-search"
                    placeholder="Search for solutions"
                    className="flex-1 bg-transparent outline-none text-base text-gray-800 placeholder:text-gray-500"
                  />
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Audience toggle */}
        <section className="mt-10">
          <div className={`inline-flex rounded-full border overflow-hidden text-sm font-semibold ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {audienceTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveAudience(tab)}
                className={`px-6 py-2 transition-colors ${
                  activeAudience === tab
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-white'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <p className={`mt-4 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {activeAudience === 'Instructor'
              ? 'Resources, policies, and inspiration tailored for VP Learning instructors.'
              : 'Guidance for students looking to get the most out of VP Learning.'}
          </p>
        </section>

        {/* Frequently asked questions */}
        <section className="mt-12">
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h2>
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            {currentFaqs.map((card) => {
              const articleSlug = getArticleSlug(card.title);
              return (
                <Link
                  key={card.title}
                  to={`/support/${audienceSlug}/${articleSlug}`}
                  className={`border rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600' 
                      : 'border-gray-200 hover:border-gray-900 bg-white'
                  }`}
                >
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {card.title}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {card.description}
                  </p>
                  <span className={`mt-4 inline-flex text-sm font-semibold ${
                    isDarkMode ? 'text-blue-400' : 'text-gray-900'
                  }`}>
                    Learn more →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Resources */}
        <section className="mt-16">
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {activeAudience === 'Learner' ? 'Learning Resources' : 'Instructor Resources'}
          </h2>
          <div className="mt-5 grid md:grid-cols-2 gap-4">
            {currentResources.map((resource) => (
              <Link
                key={resource.title}
                to={resource.href}
                className={`border rounded-lg px-5 py-3 text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600 text-white'
                    : 'border-gray-200 hover:border-gray-900 text-gray-900'
                }`}
              >
                {resource.title}
              </Link>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className={`mt-16 border-t pt-10 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Still need help?
          </h2>
          <p className={`mt-2 text-sm max-w-2xl ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Get instant help from our AI assistant, explore the community forum, or contact our support team for personalized assistance.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to="/ask-anything"
              className={`px-5 py-3 rounded-lg text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              Ask the AI Assistant
            </Link>
            <Link
              to="/community"
              className={`border px-5 py-3 rounded-lg text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'border-gray-600 text-white hover:border-gray-500 hover:bg-gray-800'
                  : 'border-gray-300 hover:border-gray-900'
              }`}
            >
              Visit Community
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-semibold underline underline-offset-4 hover:no-underline ${
                isDarkMode ? 'text-blue-400' : 'text-gray-900'
              }`}
            >
              View Dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportCenter;

