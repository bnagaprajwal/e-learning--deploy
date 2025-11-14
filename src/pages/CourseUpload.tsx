import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Plus, Trash2, Save, ArrowLeft, Clock, BookOpen, Video, FileText, Link as LinkIcon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { courseService, Course, Lesson, Resource } from '../services/courseService';
import { storageService } from '../services/storageService';
import toast from 'react-hot-toast';

const CourseUpload: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const isEditMode = !!courseId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState<{ [key: number]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficultyLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    durationHours: 0,
    price: 0,
    isPublished: false,
    thumbnailUrl: '',
    videoUrl: '',
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (user.userType !== 'instructor') {
      navigate('/dashboard');
      return;
    }

    if (isEditMode && courseId) {
      loadCourse();
    }
  }, [user, isAuthenticated, navigate, isEditMode, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const course = await courseService.getCourseById(courseId);
      if (course) {
        setFormData({
          title: course.title,
          description: course.description,
          category: course.category,
          difficultyLevel: course.difficultyLevel,
          durationHours: course.durationHours,
          price: course.price,
          isPublished: course.isPublished,
          thumbnailUrl: course.thumbnailUrl || '',
          videoUrl: course.videoUrl || '',
        });
        setLessons(course.lessons || []);
        if (course.thumbnailUrl) {
          setThumbnailPreview(course.thumbnailUrl);
        }
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingThumbnail(true);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      // Get Firebase Auth user ID (not the numeric ID from our user object)
      const { auth } = await import('../config/firebase');
      const firebaseUser = auth?.currentUser;
      
      if (!firebaseUser) {
        throw new Error('You must be logged in to upload files. Please log in and try again.');
      }
      
      const userId = firebaseUser.uid;
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const storagePath = `courses/thumbnails/${userId}/${timestamp}.${fileExtension}`;
      
      const downloadURL = await storageService.uploadImage(file, storagePath, (progress) => {
        // Progress tracking for thumbnail
        console.log(`Thumbnail upload: ${progress}%`);
      });

      setFormData(prev => ({ ...prev, thumbnailUrl: downloadURL }));
      toast.success('Thumbnail uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      toast.error(`Failed to upload thumbnail: ${error.message}`);
      setThumbnailPreview(null);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleVideoUpload = async (lessonIndex: number, file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video size should be less than 500MB');
      return;
    }

    try {
      setUploadingVideos(prev => ({ ...prev, [lessonIndex]: true }));
      
      // Get Firebase Auth user ID (not the numeric ID from our user object)
      const { auth } = await import('../config/firebase');
      const firebaseUser = auth?.currentUser;
      
      if (!firebaseUser) {
        throw new Error('You must be logged in to upload files. Please log in and try again.');
      }
      
      const userId = firebaseUser.uid;
      const currentCourseId = courseId || 'new';
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const storagePath = `courses/${currentCourseId}/videos/lesson${lessonIndex + 1}_${timestamp}.${fileExtension}`;
      
      const downloadURL = await storageService.uploadVideo(file, storagePath, (progress) => {
        setUploadProgress(prev => ({ ...prev, [lessonIndex]: progress }));
      });

      updateLesson(lessonIndex, 'videoUrl', downloadURL);
      toast.success(`Video uploaded successfully for lesson ${lessonIndex + 1}`);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(`Failed to upload video: ${error.message}`);
    } finally {
      setUploadingVideos(prev => ({ ...prev, [lessonIndex]: false }));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[lessonIndex];
        return newProgress;
      });
    }
  };

  const addLesson = () => {
    setLessons([...lessons, {
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: lessons.length + 1,
      resources: [],
    }]);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index).map((lesson, i) => ({
      ...lesson,
      order: i + 1
    })));
  };

  const addResource = (lessonIndex: number) => {
    const updated = [...lessons];
    if (!updated[lessonIndex].resources) {
      updated[lessonIndex].resources = [];
    }
    updated[lessonIndex].resources!.push({
      title: '',
      type: 'link',
      url: '',
    });
    setLessons(updated);
  };

  const updateResource = (lessonIndex: number, resourceIndex: number, field: keyof Resource, value: any) => {
    const updated = [...lessons];
    if (updated[lessonIndex].resources) {
      updated[lessonIndex].resources![resourceIndex] = {
        ...updated[lessonIndex].resources![resourceIndex],
        [field]: value
      };
      setLessons(updated);
    }
  };

  const removeResource = (lessonIndex: number, resourceIndex: number) => {
    const updated = [...lessons];
    if (updated[lessonIndex].resources) {
      updated[lessonIndex].resources = updated[lessonIndex].resources!.filter((_, i) => i !== resourceIndex);
      setLessons(updated);
    }
  };

  const calculateTotalDuration = () => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a course description');
      return;
    }

    if (!formData.category.trim()) {
      toast.error('Please select a category');
      return;
    }

    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    if (lessons.length === 0) {
      toast.error('Please add at least one lesson');
      return;
    }

    try {
      setSaving(true);

      // Get Firebase Auth UID (required for Firestore security rules)
      const { auth } = await import('../config/firebase');
      const firebaseUser = auth?.currentUser;
      
      if (!firebaseUser) {
        throw new Error('You must be logged in to create courses. Please log in and try again.');
      }

      const courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        instructorId: firebaseUser.uid, // Use Firebase Auth UID, not numeric ID
        instructorName: `${user.firstName} ${user.lastName}`,
        category: formData.category,
        difficultyLevel: formData.difficultyLevel,
        durationHours: formData.durationHours || Math.ceil(calculateTotalDuration() / 60),
        price: formData.price,
        isPublished: formData.isPublished,
        thumbnailUrl: formData.thumbnailUrl,
        videoUrl: formData.videoUrl,
        lessons: lessons,
      };

      if (isEditMode && courseId) {
        await courseService.updateCourse(courseId, courseData);
        toast.success('Course updated successfully!');
      } else {
        const newCourseId = await courseService.createCourse(courseData);
        toast.success('Course created successfully!');
        navigate(`/instructor/course-upload/${newCourseId}`);
      }

      navigate('/instructor/dashboard');
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} course: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    'Web Development',
    'Data Science',
    'Mobile Development',
    'Design',
    'Business',
    'Marketing',
    'Finance',
    'Programming',
    'Cloud Computing',
    'Cybersecurity',
    'AI & Machine Learning',
    'Other',
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-[#F5F1EB]'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className={`flex items-center gap-2 mb-4 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold">
              {isEditMode ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isEditMode ? 'Update your course details' : 'Fill in the details to create your course'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className={`rounded-xl shadow-lg p-6 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Basic Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      }`}
                      placeholder="e.g., Complete Web Development Bootcamp"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      }`}
                      placeholder="Describe what students will learn in this course..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Difficulty Level *
                      </label>
                      <select
                        name="difficultyLevel"
                        value={formData.difficultyLevel}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                        }`}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className={`rounded-xl shadow-lg p-6 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Course Lessons *
                  </h2>
                  <button
                    type="button"
                    onClick={addLesson}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <Plus size={18} />
                    Add Lesson
                  </button>
                </div>

                {lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      No lessons added yet. Click "Add Lesson" to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Lesson {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeLesson(index)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-red-400 hover:bg-red-900/20'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, 'title', e.target.value)}
                            placeholder="Lesson Title"
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                          <textarea
                            value={lesson.description}
                            onChange={(e) => updateLesson(index, 'description', e.target.value)}
                            placeholder="Lesson Description"
                            rows={2}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <label className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="block text-sm font-medium mb-2">Video</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleVideoUpload(index, file);
                                      }
                                    }}
                                    className="hidden"
                                    id={`video-upload-${index}`}
                                    disabled={uploadingVideos[index]}
                                  />
                                  <label
                                    htmlFor={`video-upload-${index}`}
                                    className={`flex-1 px-4 py-2 rounded-lg border cursor-pointer text-center transition-colors ${
                                      uploadingVideos[index]
                                        ? isDarkMode
                                          ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                        : isDarkMode
                                          ? 'bg-gray-600 border-gray-500 text-white hover:bg-gray-500'
                                          : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                    }`}
                                  >
                                    {uploadingVideos[index] ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Uploading... {uploadProgress[index]?.toFixed(0)}%
                                      </span>
                                    ) : lesson.videoUrl ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <Video size={16} />
                                        Change Video
                                      </span>
                                    ) : (
                                      <span className="flex items-center justify-center gap-2">
                                        <Upload size={16} />
                                        Upload Video
                                      </span>
                                    )}
                                  </label>
                                </div>
                                {lesson.videoUrl && (
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Video uploaded ✓
                                  </p>
                                )}
                              </label>
                              <input
                                type="number"
                                value={lesson.duration}
                                onChange={(e) => updateLesson(index, 'duration', parseFloat(e.target.value) || 0)}
                                placeholder="Duration (min)"
                                className={`w-24 px-3 py-2 rounded-lg border ${
                                  isDarkMode
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Resources */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Resources
                              </span>
                              <button
                                type="button"
                                onClick={() => addResource(index)}
                                className={`text-xs px-2 py-1 rounded transition-colors ${
                                  isDarkMode
                                    ? 'text-blue-400 hover:bg-blue-900/20'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                + Add Resource
                              </button>
                            </div>
                            {lesson.resources && lesson.resources.map((resource, resIndex) => (
                              <div key={resIndex} className="flex gap-2 mb-2">
                                <select
                                  value={resource.type}
                                  onChange={(e) => updateResource(index, resIndex, 'type', e.target.value)}
                                  className={`flex-1 px-2 py-1 rounded border text-sm ${
                                    isDarkMode
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                >
                                  <option value="link">Link</option>
                                  <option value="pdf">PDF</option>
                                  <option value="file">File</option>
                                </select>
                                <input
                                  type="text"
                                  value={resource.title}
                                  onChange={(e) => updateResource(index, resIndex, 'title', e.target.value)}
                                  placeholder="Resource Title"
                                  className={`flex-2 px-2 py-1 rounded border text-sm ${
                                    isDarkMode
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                                <input
                                  type="url"
                                  value={resource.url}
                                  onChange={(e) => updateResource(index, resIndex, 'url', e.target.value)}
                                  placeholder="URL"
                                  className={`flex-3 px-2 py-1 rounded border text-sm ${
                                    isDarkMode
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeResource(index, resIndex)}
                                  className={`p-1 rounded ${
                                    isDarkMode
                                      ? 'text-red-400 hover:bg-red-900/20'
                                      : 'text-red-600 hover:bg-red-50'
                                  }`}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thumbnail Upload */}
              <div className={`rounded-xl shadow-lg p-6 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Course Thumbnail
                </h2>
                <div className="space-y-4">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview(null);
                          setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDarkMode
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={32} />
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Click to upload thumbnail
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Pricing & Settings */}
              <div className={`rounded-xl shadow-lg p-6 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pricing & Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Price (INR) *
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ₹
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        required
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Set 0 for free courses
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Duration (Hours)
                    </label>
                    <div className="relative">
                      <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} size={20} />
                      <input
                        type="number"
                        name="durationHours"
                        value={formData.durationHours}
                        onChange={handleInputChange}
                        min="0"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                        }`}
                        placeholder="Auto-calculated from lessons"
                      />
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {calculateTotalDuration() > 0 && `Total: ${Math.ceil(calculateTotalDuration() / 60)} hours`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <label className={`block text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Publish Course
                      </label>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Make it visible to students
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer ${
                        isDarkMode
                          ? 'bg-gray-600 peer-checked:bg-blue-600'
                          : 'bg-gray-300 peer-checked:bg-blue-600'
                      } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 transition-colors`}>
                        <div className={`absolute top-0.5 left-[2px] w-5 h-5 rounded-full transition-transform ${
                          formData.isPublished ? 'translate-x-5' : 'translate-x-0'
                        } ${isDarkMode ? 'bg-white' : 'bg-white'}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <motion.button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                  } shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isEditMode ? 'Update Course' : 'Create Course'}
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => navigate('/instructor/dashboard')}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                      : 'bg-white text-[#2D3748] hover:bg-gray-50 border border-[#E2E8F0]'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseUpload;

