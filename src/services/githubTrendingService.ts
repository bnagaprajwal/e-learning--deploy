import { ProjectIdea } from './projectSuggestionService';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  topics?: string[];
  created_at: string;
}

interface GitHubSearchResponse {
  items: GitHubRepo[];
}

/**
 * Service to fetch trending projects from GitHub
 */
class GitHubTrendingService {
  /**
   * Check if text is primarily English
   */
  private isEnglish(text: string): boolean {
    if (!text) return false;
    // Detect common CJK characters to filter out non-English repos
    const nonEnglishRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
    return !nonEnglishRegex.test(text);
  }

  /**
   * Validate project data
   */
  private validateProject(project: ProjectIdea): boolean {
    return !!(
      project.title &&
      project.title.trim().length > 0 &&
      project.description &&
      project.description.trim().length > 0 &&
      project.problem &&
      project.problem.trim().length > 0 &&
      project.solution &&
      project.solution.trim().length > 0 &&
      project.technologies &&
      project.technologies.length > 0 &&
      project.difficulty &&
      ['Beginner', 'Intermediate', 'Advanced'].includes(project.difficulty) &&
      project.estimatedTime &&
      project.estimatedTime.trim().length > 0 &&
      project.realWorldImpact &&
      project.realWorldImpact.trim().length > 0 &&
      this.isEnglish(project.title) &&
      this.isEnglish(project.description)
    );
  }

  /**
   * Fetch trending repositories from GitHub
   */
  async fetchTrendingRepos(): Promise<ProjectIdea[]> {
    try {
      // Fetch top-starred repositories created in the last 21 days
      const date = new Date();
      date.setDate(date.getDate() - 21);
      const dateStr = date.toISOString().split('T')[0];

      // Search for the most-starred English-friendly repositories created recently
      const url = `https://api.github.com/search/repositories?q=created:>${dateStr}+stars:>25&sort=stars&order=desc&per_page=50`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: GitHubSearchResponse = await response.json();
      
      // Convert GitHub repos to ProjectIdea format and filter
      const projects: ProjectIdea[] = data.items
        .map((repo) => {
        // Determine difficulty based on stars and language
        let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
        if (repo.stargazers_count > 1000) {
          difficulty = 'Advanced';
        } else if (repo.stargazers_count < 100) {
          difficulty = 'Beginner';
        }

        // Extract technologies from language and topics
        const technologies: string[] = [];
        if (repo.language) {
          technologies.push(repo.language);
        }
        // Add top 2 topics as technologies
        const repoTopics = Array.isArray(repo.topics) ? repo.topics : [];
        repoTopics.slice(0, 2).forEach(topic => {
          if (!technologies.includes(topic)) {
            technologies.push(topic);
          }
        });
        // Default technologies if none found
        if (technologies.length === 0) {
          technologies.push('JavaScript', 'TypeScript');
        }

        // Estimate time based on stars (more stars = more complex)
        let estimatedTime = '1-2 weeks';
        if (repo.stargazers_count > 500) {
          estimatedTime = '2-4 weeks';
        } else if (repo.stargazers_count < 50) {
          estimatedTime = '3-5 days';
        }

        return {
          title: this.formatProjectTitle(repo.name),
          description: repo.description || `A ${repo.language || 'web'} project: ${repo.name}`,
          problem: `Building a ${repo.name} project that solves real-world problems using modern technologies and best practices.`,
          solution: `Implement ${repo.name} using ${technologies.join(', ')} with proper architecture, testing, and documentation.`,
          technologies: technologies.slice(0, 4), // Limit to 4 technologies
          difficulty,
          estimatedTime,
          realWorldImpact: `This project demonstrates ${repo.language || 'modern'} development practices and can serve as a portfolio piece or learning resource.`,
          repositoryUrl: repo.html_url // Include GitHub repository URL
        };
        })
        .filter((project) => this.validateProject(project))
        .slice(0, 9);

      // If not enough English projects, perform fallback search on broader trending repos
      if (projects.length < 9) {
        const fallbackUrl = `https://api.github.com/search/repositories?q=stars:>200&sort=stars&order=desc&per_page=50`;
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        });

        if (fallbackResponse.ok) {
          const fallbackData: GitHubSearchResponse = await fallbackResponse.json();
          const additionalProjects: ProjectIdea[] = fallbackData.items
            .map((repo) => {
              let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
              if (repo.stargazers_count > 1000) {
                difficulty = 'Advanced';
              } else if (repo.stargazers_count < 100) {
                difficulty = 'Beginner';
              }

              const technologies: string[] = [];
              if (repo.language) {
                technologies.push(repo.language);
              }
              const repoTopics = Array.isArray(repo.topics) ? repo.topics : [];
              repoTopics.slice(0, 2).forEach(topic => {
                if (!technologies.includes(topic)) {
                  technologies.push(topic);
                }
              });
              if (technologies.length === 0) {
                technologies.push('JavaScript', 'TypeScript');
              }

              let estimatedTime = '1-2 weeks';
              if (repo.stargazers_count > 500) {
                estimatedTime = '2-4 weeks';
              } else if (repo.stargazers_count < 50) {
                estimatedTime = '3-5 days';
              }

              return {
                title: this.formatProjectTitle(repo.name),
                description: repo.description || `A ${repo.language || 'web'} project: ${repo.name}`,
                problem: `Building a ${repo.name} project that solves real-world problems using modern technologies and best practices.`,
                solution: `Implement ${repo.name} using ${technologies.join(', ')} with proper architecture, testing, and documentation.`,
                technologies: technologies.slice(0, 4),
                difficulty,
                estimatedTime,
                realWorldImpact: `This project demonstrates ${repo.language || 'modern'} development practices and can serve as a portfolio piece or learning resource.`,
                repositoryUrl: repo.html_url
              };
            })
            .filter((project) => this.validateProject(project));

          const existingUrls = new Set(projects.map(p => p.repositoryUrl));
          const newProjects = additionalProjects.filter(p => !existingUrls.has(p.repositoryUrl)).slice(0, 9 - projects.length);
          projects.push(...newProjects);
        }
      }

      return projects;
    } catch (error) {
      console.error('Error fetching trending projects from GitHub:', error);
      // Return fallback projects if GitHub API fails
      return this.getFallbackProjects();
    }
  }

  /**
   * Format repository name to project title
   */
  private formatProjectTitle(name: string): string {
    // Convert kebab-case, snake_case, or camelCase to Title Case
    return name
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Fallback projects if GitHub API fails
   */
  private getFallbackProjects(): ProjectIdea[] {
    return [
      {
        title: 'Responsive Product Card Grid',
        description: 'Design and implement a responsive grid of product cards, each featuring an image, title, price, and a "Add to Cart" button.',
        problem: 'Applying Tailwind\'s flexbox/grid utilities and responsive design principles to create structured and adaptable layouts for multiple items.',
        solution: 'Utilize Tailwind\'s grid and flex utilities for layout, responsive prefixes (sm:, md:, lg:) for adapting the grid columns and card stacking.',
        technologies: ['HTML', 'Tailwind CSS'],
        difficulty: 'Beginner',
        estimatedTime: '1-2 days',
        realWorldImpact: 'Helps in building e-commerce product displays, portfolio sections, or any content gallery that needs to look good on all devices.'
      },
      {
        title: 'Todo List with Local Storage',
        description: 'Create a functional todo list application that persists data in the browser\'s local storage, with add, edit, delete, and mark complete features.',
        problem: 'Managing state persistence across browser sessions and implementing CRUD operations with proper data validation.',
        solution: 'Use JavaScript to handle DOM manipulation, localStorage API for persistence, and implement proper event handling for user interactions.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        difficulty: 'Beginner',
        estimatedTime: '2-3 days',
        realWorldImpact: 'Fundamental project for understanding state management, data persistence, and building interactive web applications.'
      },
      {
        title: 'Weather Dashboard',
        description: 'Build a weather dashboard that fetches and displays current weather data and forecasts using a weather API.',
        problem: 'Integrating external APIs, handling asynchronous data fetching, and displaying dynamic content based on API responses.',
        solution: 'Use fetch API or axios to make HTTP requests, handle promises/async-await, parse JSON responses, and update UI dynamically.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'API'],
        difficulty: 'Intermediate',
        estimatedTime: '3-5 days',
        realWorldImpact: 'Teaches API integration, error handling, and building real-world applications that consume external data services.'
      },
      {
        title: 'E-commerce Shopping Cart',
        description: 'Implement a shopping cart system with add to cart, remove items, update quantities, and calculate totals functionality.',
        problem: 'Managing complex state for multiple items, calculating dynamic totals, and maintaining cart state across page interactions.',
        solution: 'Use JavaScript objects/arrays to manage cart items, implement quantity updates, calculate totals dynamically, and handle edge cases.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        difficulty: 'Intermediate',
        estimatedTime: '1 week',
        realWorldImpact: 'Core functionality for any e-commerce website, teaching state management and complex user interactions.'
      },
      {
        title: 'Blog Post with Comments',
        description: 'Create a blog post page with a comment section that allows users to add, edit, and delete comments with timestamps.',
        problem: 'Building a dynamic comment system with real-time updates, form validation, and maintaining comment hierarchy.',
        solution: 'Implement comment data structure, create form handlers for adding/editing, use timestamps for sorting, and manage comment state.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        difficulty: 'Beginner',
        estimatedTime: '2-3 days',
        realWorldImpact: 'Common feature in content websites, teaching form handling, data manipulation, and user-generated content management.'
      },
      {
        title: 'Password Generator',
        description: 'Build a secure password generator with customizable length, character types (uppercase, lowercase, numbers, symbols), and copy functionality.',
        problem: 'Generating cryptographically secure random passwords with user-defined constraints and implementing secure copy-to-clipboard functionality.',
        solution: 'Use Math.random() or crypto API for randomness, implement character set filtering, generate passwords based on user preferences, and use Clipboard API.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        difficulty: 'Beginner',
        estimatedTime: '1-2 days',
        realWorldImpact: 'Practical utility tool that teaches random generation, user preferences handling, and browser APIs.'
      },
      {
        title: 'Expense Tracker',
        description: 'Develop an expense tracking application that allows users to add, categorize, and visualize their expenses with charts.',
        problem: 'Managing financial data, categorizing expenses, calculating totals by category, and visualizing data with charts or graphs.',
        solution: 'Create data models for expenses, implement categorization logic, calculate statistics, and use chart libraries like Chart.js for visualization.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
        difficulty: 'Intermediate',
        estimatedTime: '1 week',
        realWorldImpact: 'Personal finance management tool that teaches data visualization, categorization, and building practical applications.'
      },
      {
        title: 'Recipe Finder App',
        description: 'Create an application that searches for recipes based on ingredients, displays recipe details, and allows saving favorites.',
        problem: 'Searching and filtering data based on multiple criteria, displaying detailed information, and implementing favorites/bookmarking functionality.',
        solution: 'Integrate recipe API, implement search/filter logic, create detail views, and use localStorage for saving favorite recipes.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'API'],
        difficulty: 'Intermediate',
        estimatedTime: '1 week',
        realWorldImpact: 'Practical application for finding recipes, teaching API integration, search functionality, and data management.'
      },
      {
        title: 'Interactive Quiz App',
        description: 'Build an interactive quiz application with multiple choice questions, score tracking, timer, and results summary.',
        problem: 'Managing quiz state, tracking user answers, calculating scores, implementing timers, and displaying results dynamically.',
        solution: 'Create question data structure, implement answer selection, track progress, calculate scores, use setInterval for timers, and show results.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        difficulty: 'Intermediate',
        estimatedTime: '3-5 days',
        realWorldImpact: 'Educational tool that teaches state management, user interaction tracking, and building engaging interactive applications.'
      }
    ];
  }
}

export default GitHubTrendingService;

