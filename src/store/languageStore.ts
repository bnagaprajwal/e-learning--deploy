import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

export interface Translations {
  // Navigation
  courses: string;
  mockInterview: string;
  softSkills: string;
  searchPlaceholder: string;
  
  // Home Page
  learn: string;
  grow: string;
  succeed: string;
  heroDescription: string;
  startLearning: string;
  tryMockInterview: string;
  featuredCourses: string;
  featuredCoursesDescription: string;
  viewCourse: string;
  
  // Stats
  coursesCount: string;
  studentsCount: string;
  certificatesCount: string;
  successRate: string;
  
  // Courses Page
  allCourses: string;
  coursesDescription: string;
  viewDetails: string;
  enroll: string;
  sortBy: string;
  filters: string;
  clearAll: string;
  noCoursesFound: string;
  tryAdjustingSearch: string;
  
  // Course Detail
  backToCourses: string;
  courseContent: string;
  continueLearning: string;
  whatsIncluded: string;
  videoLessons: string;
  lifetimeAccess: string;
  certificateOfCompletion: string;
  mobileAndDesktopAccess: string;
  downloadResources: string;
  
  // Mock Interview
  mockInterviewPractice: string;
  mockInterviewDescription: string;
  technicalInterview: string;
  behavioralInterview: string;
  leadershipInterview: string;
  startInterview: string;
  question: string;
  of: string;
  complete: string;
  previous: string;
  next: string;
  finish: string;
  
  // Soft Skills
  softSkillsDevelopment: string;
  softSkillsDescription: string;
  communication: string;
  leadership: string;
  timeManagement: string;
  problemSolving: string;
  emotionalIntelligence: string;
  adaptability: string;
  backToSkills: string;
  progress: string;
  modulesCompleted: string;
  continueLearning: string;
  
  // Dashboard
  welcomeBack: string;
  continueYourJourney: string;
  enrolledCourses: string;
  overallProgress: string;
  studyTime: string;
  achievements: string;
  continueLearning: string;
  recentActivity: string;
  learningGoals: string;
  
  // Common
  level: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  duration: string;
  students: string;
  lessons: string;
  rating: string;
  price: string;
  instructor: string;
  category: string;
  completed: string;
  start: string;
  
  // Filter and Sort Options
  all: string;
  webDevelopment: string;
  dataScience: string;
  mobileDevelopment: string;
  design: string;
  business: string;
  marketing: string;
  finance: string;
  mostPopular: string;
  highestRated: string;
  priceLowToHigh: string;
  priceHighToLow: string;
  newestFirst: string;
  minimumRating: string;
  any: string;
  gridView: string;
  listView: string;
  showFilters: string;
  hideFilters: string;
  quickFilters: string;
  advancedFilters: string;
  priceRange: string;
  free: string;
  paid: string;
  under25: string;
  under50: string;
  under100: string;
  over100: string;
  
  // Interview Questions and Descriptions
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
  question6: string;
  question7: string;
  question8: string;
  question9: string;
  question10: string;
  technicalDescription: string;
  behavioralDescription: string;
  leadershipDescription: string;
  
  // Soft Skills Descriptions and Modules
  communicationDescription: string;
  leadershipSkillsDescription: string;
  timeManagementDescription: string;
  problemSolvingDescription: string;
  emotionalIntelligenceDescription: string;
  adaptabilityDescription: string;
  activeListening: string;
  publicSpeaking: string;
  writtenCommunication: string;
  nonVerbalCommunication: string;
  teamBuilding: string;
  decisionMaking: string;
  conflictResolution: string;
  motivatingOthers: string;
  prioritizationTechniques: string;
  goalSetting: string;
  delegationSkills: string;
  workLifeBalance: string;
  criticalThinking: string;
  creativeSolutions: string;
  riskAssessment: string;
  selfAwareness: string;
  selfRegulation: string;
  empathy: string;
  socialSkills: string;
  changeManagement: string;
  learningAgility: string;
  resilience: string;
  innovationMindset: string;
  
  // Dashboard Activity and Achievements
  completeWebDevBootcamp: string;
  completedLesson3: string;
  mockInterviewPracticeActivity: string;
  completedTechnicalInterview: string;
  communicationSkills: string;
  completedActiveListening: string;
  dataScienceWithPython: string;
  startedLesson5: string;
  hoursAgo: string;
  dayAgo: string;
  daysAgo: string;
  firstCourse: string;
  completedFirstCourse: string;
  interviewReady: string;
  completed5MockInterviews: string;
  skillMaster: string;
  completed3SoftSkillModules: string;
  learningStreak: string;
  daysConsecutiveLearning: string;
}

const translations: Record<string, Translations> = {
  en: {
    // Navigation
    courses: 'Courses',
    mockInterview: 'Mock Interview',
    softSkills: 'Soft Skills',
    searchPlaceholder: 'Search courses...',
    
    // Home Page
    learn: 'LEARN',
    grow: 'GROW',
    succeed: 'SUCCEED',
    heroDescription: 'Master new skills with our comprehensive e-learning platform. From coding to soft skills, we\'ve got you covered.',
    startLearning: 'Start Learning',
    tryMockInterview: 'Try Mock Interview',
    featuredCourses: 'Featured Courses',
    featuredCoursesDescription: 'Start your learning journey with our top-rated courses',
    viewCourse: 'View Course',
    
    // Stats
    coursesCount: 'Courses',
    studentsCount: 'Students',
    certificatesCount: 'Certificates',
    successRate: 'Success Rate',
    
    // Courses Page
    allCourses: 'All Courses',
    coursesDescription: 'Discover and enroll in courses that match your learning goals',
    viewDetails: 'View Details',
    enroll: 'Enroll',
    sortBy: 'Sort by:',
    filters: 'Filters',
    clearAll: 'Clear All',
    noCoursesFound: 'No courses found',
    tryAdjustingSearch: 'Try adjusting your search criteria',
    
    // Course Detail
    backToCourses: 'Back to Courses',
    courseContent: 'Course Content',
    continueLearning: 'Continue Learning',
    whatsIncluded: 'What\'s included:',
    videoLessons: 'video lessons',
    lifetimeAccess: 'Lifetime access',
    certificateOfCompletion: 'Certificate of completion',
    mobileAndDesktopAccess: 'Mobile and desktop access',
    downloadResources: 'Download Resources',
    
    // Mock Interview
    mockInterviewPractice: 'Mock Interview Practice',
    mockInterviewDescription: 'Practice with AI-powered mock interviews and get instant feedback',
    technicalInterview: 'Technical Interview',
    behavioralInterview: 'Behavioral Interview',
    leadershipInterview: 'Leadership Interview',
    startInterview: 'Start Interview',
    question: 'Question',
    of: 'of',
    complete: 'Complete',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    
    // Soft Skills
    softSkillsDevelopment: 'Soft Skills Development',
    softSkillsDescription: 'Enhance your interpersonal skills and professional development',
    communication: 'Communication',
    leadership: 'Leadership',
    timeManagement: 'Time Management',
    problemSolving: 'Problem Solving',
    emotionalIntelligence: 'Emotional Intelligence',
    adaptability: 'Adaptability',
    backToSkills: 'Back to Skills',
    progress: 'Progress',
    modulesCompleted: 'modules completed',
    
    // Dashboard
    welcomeBack: 'Welcome back!',
    continueYourJourney: 'Continue your learning journey',
    enrolledCourses: 'Enrolled Courses',
    overallProgress: 'Overall Progress',
    studyTime: 'Study Time',
    achievements: 'Achievements',
    recentActivity: 'Recent Activity',
    learningGoals: 'Learning Goals',
    
    // Common
    level: 'Level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    duration: 'Duration',
    students: 'Students',
    lessons: 'Lessons',
    rating: 'Rating',
    price: 'Price',
    instructor: 'Instructor',
    category: 'Category',
    completed: 'Completed',
    start: 'Start',
    
    // Filter and Sort Options
    all: 'All',
    webDevelopment: 'Web Development',
    dataScience: 'Data Science',
    mobileDevelopment: 'Mobile Development',
    design: 'Design',
    business: 'Business',
    marketing: 'Marketing',
    finance: 'Finance',
    mostPopular: 'Most Popular',
    highestRated: 'Highest Rated',
    priceLowToHigh: 'Price: Low to High',
    priceHighToLow: 'Price: High to Low',
    newestFirst: 'Newest First',
    minimumRating: 'Minimum Rating',
    any: 'Any',
    gridView: 'Grid View',
    listView: 'List View',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    quickFilters: 'Quick Filters',
    advancedFilters: 'Advanced Filters',
    priceRange: 'Price Range',
    free: 'Free',
    paid: 'Paid',
    under25: 'Under $25',
    under50: 'Under $50',
    under100: 'Under $100',
    over100: 'Over $100',
    
    // Interview Questions and Descriptions
    question1: 'Tell me about yourself and your background.',
    question2: 'What are your greatest strengths?',
    question3: 'Describe a challenging project you worked on and how you overcame it.',
    question4: 'Where do you see yourself in 5 years?',
    question5: 'Why do you want to work for our company?',
    question6: 'How do you handle stress and pressure?',
    question7: 'Describe a time when you had to work with a difficult team member.',
    question8: 'What is your greatest weakness and how do you work on it?',
    question9: 'How do you stay updated with industry trends?',
    question10: 'Do you have any questions for us?',
    technicalDescription: 'Focus on technical skills and problem-solving',
    behavioralDescription: 'Assess soft skills and cultural fit',
    leadershipDescription: 'Evaluate leadership and management skills',
    
    // Soft Skills Descriptions and Modules
    communicationDescription: 'Master verbal and written communication skills',
    leadershipSkillsDescription: 'Develop leadership and team management skills',
    timeManagementDescription: 'Learn to prioritize and manage your time effectively',
    problemSolvingDescription: 'Enhance critical thinking and problem-solving abilities',
    emotionalIntelligenceDescription: 'Develop self-awareness and emotional management',
    adaptabilityDescription: 'Learn to thrive in changing environments',
    activeListening: 'Active Listening',
    publicSpeaking: 'Public Speaking',
    writtenCommunication: 'Written Communication',
    nonVerbalCommunication: 'Non-verbal Communication',
    teamBuilding: 'Team Building',
    decisionMaking: 'Decision Making',
    conflictResolution: 'Conflict Resolution',
    motivatingOthers: 'Motivating Others',
    prioritizationTechniques: 'Prioritization Techniques',
    goalSetting: 'Goal Setting',
    delegationSkills: 'Delegation Skills',
    workLifeBalance: 'Work-Life Balance',
    criticalThinking: 'Critical Thinking',
    creativeSolutions: 'Creative Solutions',
    riskAssessment: 'Risk Assessment',
    selfAwareness: 'Self-Awareness',
    selfRegulation: 'Self-Regulation',
    empathy: 'Empathy',
    socialSkills: 'Social Skills',
    changeManagement: 'Change Management',
    learningAgility: 'Learning Agility',
    resilience: 'Resilience',
    innovationMindset: 'Innovation Mindset',
    
    // Dashboard Activity and Achievements
    completeWebDevBootcamp: 'Complete Web Development Bootcamp',
    completedLesson3: 'Completed lesson 3',
    mockInterviewPracticeActivity: 'Mock Interview Practice',
    completedTechnicalInterview: 'Completed technical interview',
    communicationSkills: 'Communication Skills',
    completedActiveListening: 'Completed Active Listening module',
    dataScienceWithPython: 'Data Science with Python',
    startedLesson5: 'Started lesson 5',
    hoursAgo: 'hours ago',
    dayAgo: 'day ago',
    daysAgo: 'days ago',
    firstCourse: 'First Course',
    completedFirstCourse: 'Completed your first course',
    interviewReady: 'Interview Ready',
    completed5MockInterviews: 'Completed 5 mock interviews',
    skillMaster: 'Skill Master',
    completed3SoftSkillModules: 'Completed 3 soft skill modules',
    learningStreak: 'Learning Streak',
    daysConsecutiveLearning: 'days of consecutive learning',
  },
  
  es: {
    // Navigation
    courses: 'Cursos',
    mockInterview: 'Entrevista de Práctica',
    softSkills: 'Habilidades Blandas',
    searchPlaceholder: 'Buscar cursos...',
    
    // Home Page
    learn: 'APRENDE',
    grow: 'CRECE',
    succeed: 'TRIUNFA',
    heroDescription: 'Domina nuevas habilidades con nuestra plataforma integral de e-learning. Desde programación hasta habilidades blandas, te tenemos cubierto.',
    startLearning: 'Comenzar a Aprender',
    tryMockInterview: 'Probar Entrevista',
    featuredCourses: 'Cursos Destacados',
    featuredCoursesDescription: 'Comienza tu viaje de aprendizaje con nuestros cursos mejor calificados',
    viewCourse: 'Ver Curso',
    
    // Stats
    coursesCount: 'Cursos',
    studentsCount: 'Estudiantes',
    certificatesCount: 'Certificados',
    successRate: 'Tasa de Éxito',
    
    // Courses Page
    allCourses: 'Todos los Cursos',
    coursesDescription: 'Descubre e inscríbete en cursos que coincidan con tus objetivos de aprendizaje',
    viewDetails: 'Ver Detalles',
    enroll: 'Inscribirse',
    sortBy: 'Ordenar por:',
    filters: 'Filtros',
    clearAll: 'Limpiar Todo',
    noCoursesFound: 'No se encontraron cursos',
    tryAdjustingSearch: 'Intenta ajustar tus criterios de búsqueda',
    
    // Course Detail
    backToCourses: 'Volver a Cursos',
    courseContent: 'Contenido del Curso',
    continueLearning: 'Continuar Aprendiendo',
    whatsIncluded: 'Qué está incluido:',
    videoLessons: 'lecciones de video',
    lifetimeAccess: 'Acceso de por vida',
    certificateOfCompletion: 'Certificado de finalización',
    mobileAndDesktopAccess: 'Acceso móvil y de escritorio',
    downloadResources: 'Descargar Recursos',
    
    // Mock Interview
    mockInterviewPractice: 'Práctica de Entrevista',
    mockInterviewDescription: 'Practica con entrevistas simuladas impulsadas por IA y obtén retroalimentación instantánea',
    technicalInterview: 'Entrevista Técnica',
    behavioralInterview: 'Entrevista Conductual',
    leadershipInterview: 'Entrevista de Liderazgo',
    startInterview: 'Comenzar Entrevista',
    question: 'Pregunta',
    of: 'de',
    complete: 'Completo',
    previous: 'Anterior',
    next: 'Siguiente',
    finish: 'Finalizar',
    
    // Soft Skills
    softSkillsDevelopment: 'Desarrollo de Habilidades Blandas',
    softSkillsDescription: 'Mejora tus habilidades interpersonales y desarrollo profesional',
    communication: 'Comunicación',
    leadership: 'Liderazgo',
    timeManagement: 'Gestión del Tiempo',
    problemSolving: 'Resolución de Problemas',
    emotionalIntelligence: 'Inteligencia Emocional',
    adaptability: 'Adaptabilidad',
    backToSkills: 'Volver a Habilidades',
    progress: 'Progreso',
    modulesCompleted: 'módulos completados',
    
    // Dashboard
    welcomeBack: '¡Bienvenido de vuelta!',
    continueYourJourney: 'Continúa tu viaje de aprendizaje',
    enrolledCourses: 'Cursos Inscritos',
    overallProgress: 'Progreso General',
    studyTime: 'Tiempo de Estudio',
    achievements: 'Logros',
    recentActivity: 'Actividad Reciente',
    learningGoals: 'Objetivos de Aprendizaje',
    
    // Common
    level: 'Nivel',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    duration: 'Duración',
    students: 'Estudiantes',
    lessons: 'Lecciones',
    rating: 'Calificación',
    price: 'Precio',
    instructor: 'Instructor',
    category: 'Categoría',
    completed: 'Completado',
    start: 'Comenzar',
    
    // Filter and Sort Options
    all: 'Todos',
    webDevelopment: 'Desarrollo Web',
    dataScience: 'Ciencia de Datos',
    mobileDevelopment: 'Desarrollo Móvil',
    design: 'Diseño',
    business: 'Negocios',
    marketing: 'Marketing',
    finance: 'Finanzas',
    mostPopular: 'Más Popular',
    highestRated: 'Mejor Calificado',
    priceLowToHigh: 'Precio: Bajo a Alto',
    priceHighToLow: 'Precio: Alto a Bajo',
    newestFirst: 'Más Recientes',
    minimumRating: 'Calificación Mínima',
    any: 'Cualquiera',
    gridView: 'Vista de Cuadrícula',
    listView: 'Vista de Lista',
    showFilters: 'Mostrar Filtros',
    hideFilters: 'Ocultar Filtros',
    quickFilters: 'Filtros Rápidos',
    advancedFilters: 'Filtros Avanzados',
    priceRange: 'Rango de Precio',
    free: 'Gratis',
    paid: 'De Pago',
    under25: 'Menos de $25',
    under50: 'Menos de $50',
    under100: 'Menos de $100',
    over100: 'Más de $100',
    
    // Interview Questions and Descriptions
    question1: 'Cuéntame sobre ti y tu experiencia.',
    question2: '¿Cuáles son tus mayores fortalezas?',
    question3: 'Describe un proyecto desafiante en el que trabajaste y cómo lo superaste.',
    question4: '¿Dónde te ves en 5 años?',
    question5: '¿Por qué quieres trabajar para nuestra empresa?',
    question6: '¿Cómo manejas el estrés y la presión?',
    question7: 'Describe una vez que tuviste que trabajar con un miembro difícil del equipo.',
    question8: '¿Cuál es tu mayor debilidad y cómo trabajas en ella?',
    question9: '¿Cómo te mantienes actualizado con las tendencias de la industria?',
    question10: '¿Tienes alguna pregunta para nosotros?',
    technicalDescription: 'Enfócate en habilidades técnicas y resolución de problemas',
    behavioralDescription: 'Evalúa habilidades blandas y ajuste cultural',
    leadershipDescription: 'Evalúa habilidades de liderazgo y gestión',
    
    // Soft Skills Descriptions and Modules
    communicationDescription: 'Domina las habilidades de comunicación verbal y escrita',
    leadershipSkillsDescription: 'Desarrolla habilidades de liderazgo y gestión de equipos',
    timeManagementDescription: 'Aprende a priorizar y gestionar tu tiempo efectivamente',
    problemSolvingDescription: 'Mejora el pensamiento crítico y las habilidades de resolución de problemas',
    emotionalIntelligenceDescription: 'Desarrolla autoconciencia y gestión emocional',
    adaptabilityDescription: 'Aprende a prosperar en entornos cambiantes',
    activeListening: 'Escucha Activa',
    publicSpeaking: 'Oratoria',
    writtenCommunication: 'Comunicación Escrita',
    nonVerbalCommunication: 'Comunicación No Verbal',
    teamBuilding: 'Construcción de Equipos',
    decisionMaking: 'Toma de Decisiones',
    conflictResolution: 'Resolución de Conflictos',
    motivatingOthers: 'Motivar a Otros',
    prioritizationTechniques: 'Técnicas de Priorización',
    goalSetting: 'Establecimiento de Objetivos',
    delegationSkills: 'Habilidades de Delegación',
    workLifeBalance: 'Equilibrio Trabajo-Vida',
    criticalThinking: 'Pensamiento Crítico',
    creativeSolutions: 'Soluciones Creativas',
    riskAssessment: 'Evaluación de Riesgos',
    selfAwareness: 'Autoconciencia',
    selfRegulation: 'Autorregulación',
    empathy: 'Empatía',
    socialSkills: 'Habilidades Sociales',
    changeManagement: 'Gestión del Cambio',
    learningAgility: 'Agilidad de Aprendizaje',
    resilience: 'Resiliencia',
    innovationMindset: 'Mentalidad de Innovación',
  },
  
  fr: {
    // Navigation
    courses: 'Cours',
    mockInterview: 'Entretien d\'Entraînement',
    softSkills: 'Compétences Douces',
    searchPlaceholder: 'Rechercher des cours...',
    
    // Home Page
    learn: 'APPRENDS',
    grow: 'GRANDIS',
    succeed: 'RÉUSSIS',
    heroDescription: 'Maîtrisez de nouvelles compétences avec notre plateforme d\'apprentissage en ligne complète. Du codage aux compétences douces, nous vous avons couvert.',
    startLearning: 'Commencer à Apprendre',
    tryMockInterview: 'Essayer l\'Entretien',
    featuredCourses: 'Cours en Vedette',
    featuredCoursesDescription: 'Commencez votre parcours d\'apprentissage avec nos cours les mieux notés',
    viewCourse: 'Voir le Cours',
    
    // Stats
    coursesCount: 'Cours',
    studentsCount: 'Étudiants',
    certificatesCount: 'Certificats',
    successRate: 'Taux de Réussite',
    
    // Courses Page
    allCourses: 'Tous les Cours',
    coursesDescription: 'Découvrez et inscrivez-vous à des cours qui correspondent à vos objectifs d\'apprentissage',
    viewDetails: 'Voir les Détails',
    enroll: 'S\'inscrire',
    sortBy: 'Trier par:',
    filters: 'Filtres',
    clearAll: 'Tout Effacer',
    noCoursesFound: 'Aucun cours trouvé',
    tryAdjustingSearch: 'Essayez d\'ajuster vos critères de recherche',
    
    // Course Detail
    backToCourses: 'Retour aux Cours',
    courseContent: 'Contenu du Cours',
    continueLearning: 'Continuer l\'Apprentissage',
    whatsIncluded: 'Ce qui est inclus:',
    videoLessons: 'leçons vidéo',
    lifetimeAccess: 'Accès à vie',
    certificateOfCompletion: 'Certificat de réussite',
    mobileAndDesktopAccess: 'Accès mobile et bureau',
    downloadResources: 'Télécharger les Ressources',
    
    // Mock Interview
    mockInterviewPractice: 'Pratique d\'Entretien',
    mockInterviewDescription: 'Pratiquez avec des entretiens simulés alimentés par l\'IA et obtenez des commentaires instantanés',
    technicalInterview: 'Entretien Technique',
    behavioralInterview: 'Entretien Comportemental',
    leadershipInterview: 'Entretien de Leadership',
    startInterview: 'Commencer l\'Entretien',
    question: 'Question',
    of: 'de',
    complete: 'Complet',
    previous: 'Précédent',
    next: 'Suivant',
    finish: 'Terminer',
    
    // Soft Skills
    softSkillsDevelopment: 'Développement des Compétences Douces',
    softSkillsDescription: 'Améliorez vos compétences interpersonnelles et votre développement professionnel',
    communication: 'Communication',
    leadership: 'Leadership',
    timeManagement: 'Gestion du Temps',
    problemSolving: 'Résolution de Problèmes',
    emotionalIntelligence: 'Intelligence Émotionnelle',
    adaptability: 'Adaptabilité',
    backToSkills: 'Retour aux Compétences',
    progress: 'Progrès',
    modulesCompleted: 'modules terminés',
    
    // Dashboard
    welcomeBack: 'Bon retour!',
    continueYourJourney: 'Continuez votre parcours d\'apprentissage',
    enrolledCourses: 'Cours Inscrits',
    overallProgress: 'Progrès Global',
    studyTime: 'Temps d\'Étude',
    achievements: 'Réalisations',
    recentActivity: 'Activité Récente',
    learningGoals: 'Objectifs d\'Apprentissage',
    
    // Common
    level: 'Niveau',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    duration: 'Durée',
    students: 'Étudiants',
    lessons: 'Leçons',
    rating: 'Note',
    price: 'Prix',
    instructor: 'Instructeur',
    category: 'Catégorie',
    completed: 'Terminé',
    start: 'Commencer',
    
    // Filter and Sort Options
    all: 'Tous',
    webDevelopment: 'Développement Web',
    dataScience: 'Science des Données',
    mobileDevelopment: 'Développement Mobile',
    design: 'Design',
    business: 'Business',
    marketing: 'Marketing',
    finance: 'Finance',
    mostPopular: 'Plus Populaire',
    highestRated: 'Mieux Noté',
    priceLowToHigh: 'Prix: Bas à Élevé',
    priceHighToLow: 'Prix: Élevé à Bas',
    newestFirst: 'Plus Récent',
    minimumRating: 'Note Minimale',
    any: 'N\'importe',
    gridView: 'Vue Grille',
    listView: 'Vue Liste',
    showFilters: 'Afficher Filtres',
    hideFilters: 'Masquer Filtres',
    quickFilters: 'Filtres Rapides',
    advancedFilters: 'Filtres Avancés',
    priceRange: 'Gamme de Prix',
    free: 'Gratuit',
    paid: 'Payant',
    under25: 'Moins de 25$',
    under50: 'Moins de 50$',
    under100: 'Moins de 100$',
    over100: 'Plus de 100$',
    
    // Interview Questions and Descriptions
    question1: 'Parlez-moi de vous et de votre parcours.',
    question2: 'Quelles sont vos plus grandes forces?',
    question3: 'Décrivez un projet difficile sur lequel vous avez travaillé et comment vous l\'avez surmonté.',
    question4: 'Où vous voyez-vous dans 5 ans?',
    question5: 'Pourquoi voulez-vous travailler pour notre entreprise?',
    question6: 'Comment gérez-vous le stress et la pression?',
    question7: 'Décrivez un moment où vous avez dû travailler avec un membre d\'équipe difficile.',
    question8: 'Quelle est votre plus grande faiblesse et comment y travaillez-vous?',
    question9: 'Comment restez-vous à jour avec les tendances de l\'industrie?',
    question10: 'Avez-vous des questions pour nous?',
    technicalDescription: 'Concentrez-vous sur les compétences techniques et la résolution de problèmes',
    behavioralDescription: 'Évaluez les compétences douces et l\'ajustement culturel',
    leadershipDescription: 'Évaluez les compétences de leadership et de gestion',
    
    // Soft Skills Descriptions and Modules
    communicationDescription: 'Maîtrisez les compétences de communication verbale et écrite',
    leadershipSkillsDescription: 'Développez les compétences de leadership et de gestion d\'équipe',
    timeManagementDescription: 'Apprenez à prioriser et gérer votre temps efficacement',
    problemSolvingDescription: 'Améliorez la pensée critique et les capacités de résolution de problèmes',
    emotionalIntelligenceDescription: 'Développez la conscience de soi et la gestion émotionnelle',
    adaptabilityDescription: 'Apprenez à prospérer dans des environnements changeants',
    activeListening: 'Écoute Active',
    publicSpeaking: 'Prise de Parole en Public',
    writtenCommunication: 'Communication Écrite',
    nonVerbalCommunication: 'Communication Non Verbale',
    teamBuilding: 'Construction d\'Équipe',
    decisionMaking: 'Prise de Décision',
    conflictResolution: 'Résolution de Conflits',
    motivatingOthers: 'Motiver les Autres',
    prioritizationTechniques: 'Techniques de Priorisation',
    goalSetting: 'Fixation d\'Objectifs',
    delegationSkills: 'Compétences de Délégation',
    workLifeBalance: 'Équilibre Travail-Vie',
    criticalThinking: 'Pensée Critique',
    creativeSolutions: 'Solutions Créatives',
    riskAssessment: 'Évaluation des Risques',
    selfAwareness: 'Conscience de Soi',
    selfRegulation: 'Autorégulation',
    empathy: 'Empathie',
    socialSkills: 'Compétences Sociales',
    changeManagement: 'Gestion du Changement',
    learningAgility: 'Agilité d\'Apprentissage',
    resilience: 'Résilience',
    innovationMindset: 'Mentalité d\'Innovation',
  },
  
  hi: {
    // Navigation
    courses: 'कोर्स',
    mockInterview: 'मॉक इंटरव्यू',
    softSkills: 'सॉफ्ट स्किल्स',
    searchPlaceholder: 'कोर्स खोजें...',
    
    // Home Page
    learn: 'सीखें',
    grow: 'बढ़ें',
    succeed: 'सफल हों',
    heroDescription: 'हमारे व्यापक ई-लर्निंग प्लेटफॉर्म के साथ नए कौशल में महारत हासिल करें। कोडिंग से लेकर सॉफ्ट स्किल्स तक, हमारे पास सब कुछ है।',
    startLearning: 'सीखना शुरू करें',
    tryMockInterview: 'मॉक इंटरव्यू आजमाएं',
    featuredCourses: 'विशेष कोर्स',
    featuredCoursesDescription: 'हमारे सर्वोच्च रेटेड कोर्स के साथ अपनी सीखने की यात्रा शुरू करें',
    viewCourse: 'कोर्स देखें',
    
    // Stats
    coursesCount: 'कोर्स',
    studentsCount: 'छात्र',
    certificatesCount: 'प्रमाणपत्र',
    successRate: 'सफलता दर',
    
    // Courses Page
    allCourses: 'सभी कोर्स',
    coursesDescription: 'अपने सीखने के लक्ष्यों से मेल खाने वाले कोर्स खोजें और उनमें नामांकन करें',
    viewDetails: 'विवरण देखें',
    enroll: 'नामांकन करें',
    sortBy: 'क्रमबद्ध करें:',
    filters: 'फिल्टर',
    clearAll: 'सभी साफ करें',
    noCoursesFound: 'कोई कोर्स नहीं मिला',
    tryAdjustingSearch: 'अपने खोज मानदंड को समायोजित करने का प्रयास करें',
    
    // Course Detail
    backToCourses: 'कोर्स पर वापस जाएं',
    courseContent: 'कोर्स सामग्री',
    continueLearning: 'सीखना जारी रखें',
    whatsIncluded: 'क्या शामिल है:',
    videoLessons: 'वीडियो पाठ',
    lifetimeAccess: 'जीवनकाल पहुंच',
    certificateOfCompletion: 'पूर्णता प्रमाणपत्र',
    mobileAndDesktopAccess: 'मोबाइल और डेस्कटॉप पहुंच',
    downloadResources: 'संसाधन डाउनलोड करें',
    
    // Mock Interview
    mockInterviewPractice: 'मॉक इंटरव्यू अभ्यास',
    mockInterviewDescription: 'AI-संचालित मॉक इंटरव्यू के साथ अभ्यास करें और तत्काल फीडबैक प्राप्त करें',
    technicalInterview: 'तकनीकी इंटरव्यू',
    behavioralInterview: 'व्यवहारिक इंटरव्यू',
    leadershipInterview: 'नेतृत्व इंटरव्यू',
    startInterview: 'इंटरव्यू शुरू करें',
    question: 'प्रश्न',
    of: 'का',
    complete: 'पूर्ण',
    previous: 'पिछला',
    next: 'अगला',
    finish: 'समाप्त करें',
    
    // Soft Skills
    softSkillsDevelopment: 'सॉफ्ट स्किल्स विकास',
    softSkillsDescription: 'अपने पारस्परिक कौशल और व्यावसायिक विकास को बढ़ाएं',
    communication: 'संचार',
    leadership: 'नेतृत्व',
    timeManagement: 'समय प्रबंधन',
    problemSolving: 'समस्या समाधान',
    emotionalIntelligence: 'भावनात्मक बुद्धिमत्ता',
    adaptability: 'अनुकूलनशीलता',
    backToSkills: 'कौशल पर वापस जाएं',
    progress: 'प्रगति',
    modulesCompleted: 'मॉड्यूल पूर्ण',
    
    // Dashboard
    welcomeBack: 'वापस स्वागत है!',
    continueYourJourney: 'अपनी सीखने की यात्रा जारी रखें',
    enrolledCourses: 'नामांकित कोर्स',
    overallProgress: 'समग्र प्रगति',
    studyTime: 'अध्ययन समय',
    achievements: 'उपलब्धियां',
    recentActivity: 'हाल की गतिविधि',
    learningGoals: 'सीखने के लक्ष्य',
    
    // Common
    level: 'स्तर',
    beginner: 'शुरुआती',
    intermediate: 'मध्यम',
    advanced: 'उन्नत',
    duration: 'अवधि',
    students: 'छात्र',
    lessons: 'पाठ',
    rating: 'रेटिंग',
    price: 'मूल्य',
    instructor: 'प्रशिक्षक',
    category: 'श्रेणी',
    completed: 'पूर्ण',
    start: 'शुरू करें',
    
    // Filter and Sort Options
    all: 'सभी',
    webDevelopment: 'वेब डेवलपमेंट',
    dataScience: 'डेटा साइंस',
    mobileDevelopment: 'मोबाइल डेवलपमेंट',
    design: 'डिज़ाइन',
    business: 'व्यवसाय',
    marketing: 'मार्केटिंग',
    finance: 'वित्त',
    mostPopular: 'सबसे लोकप्रिय',
    highestRated: 'सबसे अधिक रेटेड',
    priceLowToHigh: 'मूल्य: कम से अधिक',
    priceHighToLow: 'मूल्य: अधिक से कम',
    newestFirst: 'नवीनतम पहले',
    minimumRating: 'न्यूनतम रेटिंग',
    any: 'कोई भी',
    gridView: 'ग्रिड व्यू',
    listView: 'लिस्ट व्यू',
    showFilters: 'फिल्टर दिखाएं',
    hideFilters: 'फिल्टर छुपाएं',
    quickFilters: 'त्वरित फिल्टर',
    advancedFilters: 'उन्नत फिल्टर',
    priceRange: 'मूल्य सीमा',
    free: 'मुफ्त',
    paid: 'भुगतान',
    under25: '$25 से कम',
    under50: '$50 से कम',
    under100: '$100 से कम',
    over100: '$100 से अधिक',
    
    // Interview Questions and Descriptions
    question1: 'अपने बारे में और अपनी पृष्ठभूमि के बारे में बताएं।',
    question2: 'आपकी सबसे बड़ी ताकत क्या हैं?',
    question3: 'एक चुनौतीपूर्ण परियोजना का वर्णन करें जिस पर आपने काम किया और आपने इसे कैसे पार किया।',
    question4: 'आप खुद को 5 साल में कहां देखते हैं?',
    question5: 'आप हमारी कंपनी के लिए क्यों काम करना चाहते हैं?',
    question6: 'आप तनाव और दबाव को कैसे संभालते हैं?',
    question7: 'एक समय का वर्णन करें जब आपको एक कठिन टीम सदस्य के साथ काम करना पड़ा।',
    question8: 'आपकी सबसे बड़ी कमजोरी क्या है और आप इस पर कैसे काम करते हैं?',
    question9: 'आप उद्योग के रुझानों के साथ कैसे अपडेट रहते हैं?',
    question10: 'क्या आपके पास हमारे लिए कोई प्रश्न हैं?',
    technicalDescription: 'तकनीकी कौशल और समस्या समाधान पर ध्यान दें',
    behavioralDescription: 'सॉफ्ट स्किल्स और सांस्कृतिक फिट का मूल्यांकन करें',
    leadershipDescription: 'नेतृत्व और प्रबंधन कौशल का मूल्यांकन करें',
    
    // Soft Skills Descriptions and Modules
    communicationDescription: 'मौखिक और लिखित संचार कौशल में महारत हासिल करें',
    leadershipSkillsDescription: 'नेतृत्व और टीम प्रबंधन कौशल विकसित करें',
    timeManagementDescription: 'अपने समय को प्रभावी ढंग से प्राथमिकता देने और प्रबंधित करना सीखें',
    problemSolvingDescription: 'आलोचनात्मक सोच और समस्या समाधान क्षमताओं को बढ़ाएं',
    emotionalIntelligenceDescription: 'आत्म-जागरूकता और भावनात्मक प्रबंधन विकसित करें',
    adaptabilityDescription: 'बदलते वातावरण में पनपना सीखें',
    activeListening: 'सक्रिय सुनना',
    publicSpeaking: 'सार्वजनिक बोलना',
    writtenCommunication: 'लिखित संचार',
    nonVerbalCommunication: 'गैर-मौखिक संचार',
    teamBuilding: 'टीम निर्माण',
    decisionMaking: 'निर्णय लेना',
    conflictResolution: 'संघर्ष समाधान',
    motivatingOthers: 'दूसरों को प्रेरित करना',
    prioritizationTechniques: 'प्राथमिकता तकनीक',
    goalSetting: 'लक्ष्य निर्धारण',
    delegationSkills: 'प्रतिनिधिमंडल कौशल',
    workLifeBalance: 'कार्य-जीवन संतुलन',
    criticalThinking: 'आलोचनात्मक सोच',
    creativeSolutions: 'रचनात्मक समाधान',
    riskAssessment: 'जोखिम मूल्यांकन',
    selfAwareness: 'आत्म-जागरूकता',
    selfRegulation: 'आत्म-नियमन',
    empathy: 'सहानुभूति',
    socialSkills: 'सामाजिक कौशल',
    changeManagement: 'परिवर्तन प्रबंधन',
    learningAgility: 'सीखने की चपलता',
    resilience: 'लचीलापन',
    innovationMindset: 'नवाचार मानसिकता',
  },
  
  zh: {
    // Navigation
    courses: '课程',
    mockInterview: '模拟面试',
    softSkills: '软技能',
    searchPlaceholder: '搜索课程...',
    
    // Home Page
    learn: '学习',
    grow: '成长',
    succeed: '成功',
    heroDescription: '通过我们全面的电子学习平台掌握新技能。从编程到软技能，我们为您提供全方位支持。',
    startLearning: '开始学习',
    tryMockInterview: '尝试模拟面试',
    featuredCourses: '精选课程',
    featuredCoursesDescription: '从我们评分最高的课程开始您的学习之旅',
    viewCourse: '查看课程',
    
    // Stats
    coursesCount: '课程',
    studentsCount: '学生',
    certificatesCount: '证书',
    successRate: '成功率',
    
    // Courses Page
    allCourses: '所有课程',
    coursesDescription: '发现并注册符合您学习目标的课程',
    viewDetails: '查看详情',
    enroll: '注册',
    sortBy: '排序方式:',
    filters: '筛选',
    clearAll: '清除全部',
    noCoursesFound: '未找到课程',
    tryAdjustingSearch: '尝试调整您的搜索条件',
    
    // Course Detail
    backToCourses: '返回课程',
    courseContent: '课程内容',
    continueLearning: '继续学习',
    whatsIncluded: '包含内容:',
    videoLessons: '视频课程',
    lifetimeAccess: '终身访问',
    certificateOfCompletion: '完成证书',
    mobileAndDesktopAccess: '移动和桌面访问',
    downloadResources: '下载资源',
    
    // Mock Interview
    mockInterviewPractice: '模拟面试练习',
    mockInterviewDescription: '通过AI驱动的模拟面试进行练习并获得即时反馈',
    technicalInterview: '技术面试',
    behavioralInterview: '行为面试',
    leadershipInterview: '领导力面试',
    startInterview: '开始面试',
    question: '问题',
    of: '的',
    complete: '完成',
    previous: '上一个',
    next: '下一个',
    finish: '完成',
    
    // Soft Skills
    softSkillsDevelopment: '软技能发展',
    softSkillsDescription: '提升您的人际交往技能和职业发展',
    communication: '沟通',
    leadership: '领导力',
    timeManagement: '时间管理',
    problemSolving: '问题解决',
    emotionalIntelligence: '情商',
    adaptability: '适应性',
    backToSkills: '返回技能',
    progress: '进度',
    modulesCompleted: '模块已完成',
    
    // Dashboard
    welcomeBack: '欢迎回来！',
    continueYourJourney: '继续您的学习之旅',
    enrolledCourses: '已注册课程',
    overallProgress: '总体进度',
    studyTime: '学习时间',
    achievements: '成就',
    recentActivity: '最近活动',
    learningGoals: '学习目标',
    
    // Common
    level: '级别',
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    duration: '时长',
    students: '学生',
    lessons: '课程',
    rating: '评分',
    price: '价格',
    instructor: '讲师',
    category: '类别',
    completed: '已完成',
    start: '开始',
    
    // Filter and Sort Options
    all: '全部',
    webDevelopment: '网页开发',
    dataScience: '数据科学',
    mobileDevelopment: '移动开发',
    design: '设计',
    business: '商业',
    marketing: '营销',
    finance: '金融',
    mostPopular: '最受欢迎',
    highestRated: '评分最高',
    priceLowToHigh: '价格：低到高',
    priceHighToLow: '价格：高到低',
    newestFirst: '最新优先',
    minimumRating: '最低评分',
    any: '任意',
    gridView: '网格视图',
    listView: '列表视图',
    showFilters: '显示筛选',
    hideFilters: '隐藏筛选',
    quickFilters: '快速筛选',
    advancedFilters: '高级筛选',
    priceRange: '价格范围',
    free: '免费',
    paid: '付费',
    under25: '25美元以下',
    under50: '50美元以下',
    under100: '100美元以下',
    over100: '100美元以上',
    
    // Interview Questions and Descriptions
    question1: '请介绍一下你自己和你的背景。',
    question2: '你最大的优势是什么？',
    question3: '描述一个你参与过的具有挑战性的项目以及你是如何克服困难的。',
    question4: '你如何看待自己5年后的发展？',
    question5: '你为什么想为我们公司工作？',
    question6: '你如何处理压力和紧张？',
    question7: '描述一次你不得不与难相处的团队成员合作的经历。',
    question8: '你最大的弱点是什么，你如何改进？',
    question9: '你如何跟上行业趋势？',
    question10: '你对我们有什么问题吗？',
    technicalDescription: '专注于技术技能和问题解决',
    behavioralDescription: '评估软技能和文化适应性',
    leadershipDescription: '评估领导力和管理技能',
    
    // Soft Skills Descriptions and Modules
    communicationDescription: '掌握口头和书面沟通技能',
    leadershipSkillsDescription: '发展领导力和团队管理技能',
    timeManagementDescription: '学习有效优先排序和时间管理',
    problemSolvingDescription: '增强批判性思维和问题解决能力',
    emotionalIntelligenceDescription: '发展自我意识和情绪管理',
    adaptabilityDescription: '学习在变化环境中茁壮成长',
    activeListening: '积极倾听',
    publicSpeaking: '公开演讲',
    writtenCommunication: '书面沟通',
    nonVerbalCommunication: '非语言沟通',
    teamBuilding: '团队建设',
    decisionMaking: '决策制定',
    conflictResolution: '冲突解决',
    motivatingOthers: '激励他人',
    prioritizationTechniques: '优先级技术',
    goalSetting: '目标设定',
    delegationSkills: '授权技能',
    workLifeBalance: '工作生活平衡',
    criticalThinking: '批判性思维',
    creativeSolutions: '创意解决方案',
    riskAssessment: '风险评估',
    selfAwareness: '自我意识',
    selfRegulation: '自我调节',
    empathy: '同理心',
    socialSkills: '社交技能',
    changeManagement: '变革管理',
    learningAgility: '学习敏捷性',
    resilience: '韧性',
    innovationMindset: '创新思维',
  }
};

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
];

interface LanguageState {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  getTranslation: (key: keyof Translations) => string;
  getCurrentLanguage: () => Language;
  getAvailableLanguages: () => Language[];
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      
      setLanguage: (language: string) => {
        set({ currentLanguage: language });
      },
      
      getTranslation: (key: keyof Translations) => {
        const currentLang = get().currentLanguage;
        return translations[currentLang]?.[key] || translations.en[key] || key;
      },
      
      getCurrentLanguage: () => {
        const currentLang = get().currentLanguage;
        return languages.find(lang => lang.code === currentLang) || languages[0];
      },
      
      getAvailableLanguages: () => languages,
    }),
    {
      name: 'language-storage',
    }
  )
);
