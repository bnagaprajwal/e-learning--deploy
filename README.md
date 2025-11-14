# VP E-Learning Platform

A comprehensive e-learning platform built with React, TypeScript, and modern web technologies. This platform provides interactive courses, mock interviews, soft skills training, and a complete learning management system.

## 🚀 Features

### 📚 Course Management
- **Course Catalog**: Browse and search through a comprehensive library of courses
- **Course Details**: Detailed course information with lessons, duration, and instructor details
- **Progress Tracking**: Real-time progress tracking for enrolled courses
- **Categories & Filtering**: Filter courses by category, level, and other criteria

### 🎯 Mock Interview System
- **AI-Powered Practice**: Practice interviews with different types (Technical, Behavioral, Leadership)
- **Recording & Playback**: Record your answers and review them later
- **Progress Tracking**: Track your interview practice sessions
- **Instant Feedback**: Get AI-powered feedback on your performance

### 🧠 Soft Skills Development
- **Comprehensive Modules**: Communication, Leadership, Time Management, Problem Solving, Emotional Intelligence, and Adaptability
- **Interactive Learning**: Step-by-step modules with progress tracking
- **Skill Assessment**: Track your development across different soft skills
- **Achievement System**: Earn badges and certificates for completed modules

### 📊 Dashboard & Analytics
- **Personal Dashboard**: Overview of your learning progress and achievements
- **Learning Goals**: Set and track personal learning objectives
- **Activity History**: View your recent learning activities
- **Achievement System**: Earn badges for milestones and accomplishments

### 🎨 Modern UI/UX
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion animations for enhanced user experience
- **Modern Design**: Clean, professional interface with Tailwind CSS

### 🤖 AI Chatbot & Text Analyzer
- **Chatbot**: Floating VP AI Assistant powered by Gemini 2.5 Pro
- **Text Analyzer**: Select any text to open a mini analyzer with Simplify, Summarize, Analyze actions

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Build Tool**: Vite
- **Linting**: ESLint

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vp-elearning-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Environment

Create `.env` in the `VP` folder (copy from `env.example`) and set:

```
VITE_GOOGLE_CLOUD_API_KEY=YOUR_GOOGLE_API_KEY
```

The chatbot and analyzer require this key for Gemini 2.5 Pro.

## 🏗️ Project Structure

```
src/
├── components/
│   └── Layout/
│       └── Header.tsx          # Main navigation header
├── pages/
│   ├── Home.tsx               # Landing page with featured courses
│   ├── Courses.tsx            # Course catalog with filtering
│   ├── CourseDetail.tsx       # Individual course details and lessons
│   ├── MockInterview.tsx      # Mock interview practice system
│   ├── SoftSkills.tsx         # Soft skills training modules
│   └── Dashboard.tsx          # User dashboard and progress tracking
├── store/
│   ├── themeStore.ts          # Theme management (dark/light mode)
│   └── courseStore.ts         # Course data and user progress
├── App.tsx                    # Main application component with routing
├── main.tsx                   # Application entry point
└── index.css                  # Global styles and Tailwind imports
```

## 🎯 Key Features Implementation

### State Management
- **Zustand**: Lightweight state management with persistence
- **Theme Store**: Global theme management with localStorage persistence
- **Course Store**: Course data, user progress, and enrollment management

### Routing
- **React Router**: Client-side routing with nested routes
- **Protected Routes**: Route protection for authenticated users
- **Dynamic Routes**: Dynamic course detail pages

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for page transitions and micro-interactions
- **Toast Notifications**: User feedback with React Hot Toast
- **Loading States**: Skeleton loaders and loading indicators

## 🚀 Getting Started

1. **Browse Courses**: Start by exploring the course catalog
2. **Enroll in Courses**: Click on any course to view details and enroll
3. **Track Progress**: Monitor your learning progress in the dashboard
4. **Practice Interviews**: Use the mock interview system to prepare for real interviews
5. **Develop Soft Skills**: Work through the soft skills modules to enhance your professional skills

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Code formatting (recommended)

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop**: Full-featured experience with all functionality
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with mobile navigation

## 🎨 Theming

- **Light Mode**: Clean, professional light theme
- **Dark Mode**: Easy-on-the-eyes dark theme
- **Persistent**: Theme preference saved in localStorage
- **Smooth Transitions**: Animated theme switching

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Video lesson player with progress tracking
- [ ] Real-time chat and discussion forums
- [ ] Certificate generation and sharing
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Integration with external learning management systems

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@vplearning.com or create an issue in the repository.