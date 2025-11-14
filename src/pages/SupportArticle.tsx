import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Globe, Search, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { learnerFaqs, instructorFaqs } from './supportData';

const SupportArticle: React.FC = () => {
  const navigate = useNavigate();
  const { articleId, audience } = useParams<{ articleId: string; audience: string }>();
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  // Get the article data
  const faqs = audience === 'instructor' ? instructorFaqs : learnerFaqs;
  const article = faqs.find((faq) => 
    faq.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === articleId
  );

  // Get related articles (other FAQs from the same audience)
  const relatedArticles = faqs
    .filter((faq) => faq.title !== article?.title)
    .slice(0, 5);

  // Get topics based on audience
  const topics = audience === 'instructor' 
    ? ['Getting Started', 'Course Creation', 'Content Management', 'Pricing & Publishing', 'Analytics']
    : ['Getting Started', 'Account/Profile', 'Courses', 'Learning Tools', 'Certificates'];

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link to="/support" className="text-blue-600 hover:underline">
            Back to Support Center
          </Link>
        </div>
      </div>
    );
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get('search') as string)?.trim();
    if (query) {
      navigate(`/ask-anything?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back To VP Learning
            </button>
            <Link to="/" className="text-2xl font-black tracking-tight text-gray-900">
              VP Learning
            </Link>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative flex items-center bg-gray-100 rounded-lg px-3 py-2">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="search"
                    name="search"
                    placeholder="Search"
                    className="ml-2 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>
              </form>
              <button className="inline-flex items-center gap-1 text-sm text-gray-600">
                <Globe size={16} />
                English (US)
              </button>
              <Link
                to="/login"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/support"
              className="hover:underline text-purple-600"
            >
              VP Learning
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-600">
              {audience === 'instructor' ? 'Instructor' : 'Learner'}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-600">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Main Article Content */}
          <article>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              {article.title}
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-base leading-relaxed mb-6 text-gray-700">
                {article.description}
              </p>

              {article.intro && (
                <p className="text-base leading-relaxed mb-6 text-gray-700">
                  {article.intro}
                </p>
              )}

              {article.resourceTypes && article.resourceTypes.length > 0 && (
                <div className="mb-8">
                  <p className="text-base mb-3 text-gray-700">
                    {article.resourceTypes.intro}
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    {article.resourceTypes.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {article.relatedLinks && article.relatedLinks.length > 0 && (
                <div className="mb-8">
                  <p className="text-base mb-3 text-gray-700">
                    For more information, review:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    {article.relatedLinks.map((link, index) => (
                      <li key={index}>
                        <Link
                          to={link.href}
                          className="hover:underline text-purple-600"
                        >
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h2 className="text-2xl font-bold mt-8 mb-4 underline text-gray-900">
                {article.title}
              </h2>

              {article.steps && article.steps.length > 0 && (
                <ol className="space-y-4 mb-8">
                  {article.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-purple-100 text-purple-700">
                        {index + 1}
                      </span>
                      <p className="text-base leading-relaxed flex-1 pt-1 text-gray-700">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              )}

              {article.additionalInfo && (
                <div className="mt-8 p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-700">
                    {article.additionalInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Feedback Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Was this article helpful?
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFeedback('helpful')}
                  className={`p-3 rounded-lg transition-colors ${
                    feedback === 'helpful'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp size={20} />
                </button>
                <button
                  onClick={() => setFeedback('not-helpful')}
                  className={`p-3 rounded-lg transition-colors ${
                    feedback === 'not-helpful'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsDown size={20} />
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-8 space-y-8">
              {/* Related Articles */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  Related articles
                </h3>
                <ul className="space-y-2">
                  {relatedArticles.map((related) => {
                    const slug = related.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <li key={related.title}>
                        <Link
                          to={`/support/${audience}/${slug}`}
                          className="text-sm hover:underline text-purple-600"
                        >
                          {related.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Topics */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  {audience === 'instructor' ? 'Instructor Topics' : 'Student Topics'}
                </h3>
                <ul className="space-y-2">
                  {topics.map((topic) => (
                    <li key={topic}>
                      <Link
                        to={`/support?topic=${topic.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm hover:underline text-purple-600"
                      >
                        {topic}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/courses"
                className="hover:underline text-gray-600"
              >
                Courses
              </Link>
              <Link
                to="/instructor/dashboard"
                className="hover:underline text-gray-600"
              >
                Teach on VP Learning
              </Link>
              <Link
                to="/support"
                className="hover:underline text-gray-600"
              >
                Help
              </Link>
              <span className="text-gray-400">
                Terms
              </span>
              <span className="text-gray-400">
                Privacy policy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gray-500" />
              <select
                className="bg-transparent border-none outline-none text-sm text-gray-600"
              >
                <option>English (US)</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SupportArticle;

