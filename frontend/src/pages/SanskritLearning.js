import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, Award, Clock, Users, Star, Filter } from 'lucide-react';
import { courseAPI } from '../services/api';

const SanskritLearning = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [selectedLevel, selectedCategory, courses]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      const coursesData = response.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    if (!Array.isArray(courses) || courses.length === 0) {
      setFilteredCourses([]);
      return;
    }

    let filtered = [...courses];

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setFilteredCourses(filtered);
  };

  // Extract unique levels and categories
  const levels = ['all', ...new Set(courses.map(c => c.level).filter(Boolean))];
  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Learn Sanskrit
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Master the ancient language of the Vedas with expert instructors
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        {courses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredCourses.length}</span> courses
              </p>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {courses.length === 0 ? 'Building Course Library' : 'No courses found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {courses.length === 0 
                ? "We're developing comprehensive Sanskrit learning programs"
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {filteredCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <div className="relative h-48">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400'}
                    alt={course.title?.english || 'Course'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {course.level || 'All Levels'}
                    </span>
                  </div>
                  {course.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs text-indigo-600 font-semibold uppercase">
                    {course.category || 'Sanskrit'}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 mt-1">
                    {course.title?.english || 'Course Title'}
                  </h3>
                  
                  {course.instructor && (
                    <div className="flex items-center mb-3 text-sm text-gray-600">
                      <img
                        src={course.instructor.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'}
                        alt={course.instructor.name}
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                      />
                      <span>{course.instructor.name}</span>
                    </div>
                  )}

                  <div className="flex items-center mb-3">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="ml-1 text-sm text-gray-600">
                      {course.ratings?.average?.toFixed(1) || '4.5'}
                      {course.ratings?.count ? ` (${course.ratings.count})` : ''}
                    </span>
                    {course.enrolledStudents > 0 && (
                      <>
                        <span className="mx-2 text-gray-300">•</span>
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {course.enrolledStudents.toLocaleString()} students
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {course.duration?.weeks} weeks • {course.duration?.hoursPerWeek} hrs/week
                    </div>
                    {course.modules && course.modules.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {course.modules.length} modules • {course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lessons
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{(course.discountPrice || course.price || 0).toLocaleString()}
                      </span>
                      {course.discountPrice && course.price && course.discountPrice < course.price && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₹{course.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Banner - Only show if there are courses */}
        {courses.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              More Courses Coming Soon!
            </h2>
            <p className="text-lg text-indigo-100 mb-6">
              We're developing comprehensive Sanskrit learning programs with live classes
            </p>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Get Notified
            </button>
          </div>
        )}

        {/* Why Learn Sanskrit Section */}
        {courses.length > 0 && (
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Ancient Wisdom</h3>
              <p className="text-gray-600 text-sm">
                Access timeless knowledge from Vedas, Upanishads, and classical texts
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Expert Teachers</h3>
              <p className="text-gray-600 text-sm">
                Learn from traditional scholars and modern Sanskrit experts
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Certification</h3>
              <p className="text-gray-600 text-sm">
                Earn recognized certificates upon course completion
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SanskritLearning;
