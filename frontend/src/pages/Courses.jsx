import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Leaf,
  Clock,
  Users,
  Play,
  Star,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Sample courses
const sampleCourses = [
  {
    id: '1',
    title: 'Plant Care Fundamentals',
    description: 'Learn the essential skills for keeping your plants healthy and thriving. From watering techniques to light requirements.',
    instructor: 'Dr. Sarah Green',
    duration: '4 hours',
    level: 'beginner',
    price: 0,
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    enrolled_count: 1250,
    modules: [
      { title: 'Understanding Plant Basics', duration: '45 min' },
      { title: 'Watering Techniques', duration: '60 min' },
      { title: 'Light & Temperature', duration: '50 min' },
      { title: 'Soil & Fertilization', duration: '65 min' }
    ]
  },
  {
    id: '2',
    title: 'Landscape Design Masterclass',
    description: 'Transform outdoor spaces with professional landscape design principles. Perfect for aspiring landscapers.',
    instructor: 'James Mitchell',
    duration: '8 hours',
    level: 'intermediate',
    price: 99,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    enrolled_count: 856,
    modules: [
      { title: 'Design Principles', duration: '90 min' },
      { title: 'Plant Selection', duration: '75 min' },
      { title: 'Hardscape Elements', duration: '80 min' },
      { title: 'Client Presentations', duration: '60 min' }
    ]
  },
  {
    id: '3',
    title: 'Running a Nursery Business',
    description: 'Complete guide to starting and scaling a plant nursery business. From operations to marketing.',
    instructor: 'Maria Santos',
    duration: '12 hours',
    level: 'advanced',
    price: 199,
    image_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=400&fit=crop',
    enrolled_count: 423,
    modules: [
      { title: 'Business Planning', duration: '120 min' },
      { title: 'Inventory Management', duration: '90 min' },
      { title: 'Sales & Marketing', duration: '100 min' },
      { title: 'Scaling Operations', duration: '110 min' }
    ]
  },
  {
    id: '4',
    title: 'Terrarium Building Workshop',
    description: 'Create beautiful self-sustaining terrariums. Learn the art and science of miniature ecosystems.',
    instructor: 'Alex Chen',
    duration: '3 hours',
    level: 'beginner',
    price: 49,
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop',
    enrolled_count: 2100,
    modules: [
      { title: 'Terrarium Basics', duration: '45 min' },
      { title: 'Plant Selection', duration: '40 min' },
      { title: 'Building Process', duration: '60 min' },
      { title: 'Maintenance Tips', duration: '35 min' }
    ]
  }
];

const levelColors = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400'
};

const Courses = () => {
  const [courses, setCourses] = useState(sampleCourses);
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses`);
        if (response.data.length > 0) {
          setCourses(response.data);
        }
      } catch (error) {
        // Use sample courses
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = selectedLevel === 'all' 
    ? courses 
    : courses.filter(c => c.level === selectedLevel);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="font-heading font-bold text-xl text-white">GreenForge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-white transition-colors">Home</Link>
            <Link to="/store" className="text-muted-foreground hover:text-white transition-colors">Store</Link>
          </div>

          <Link to="/login">
            <Button variant="ghost" className="text-white">Sign In</Button>
          </Link>
        </div>
      </nav>

      <main className="pt-24 px-6 pb-16" data-testid="courses-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Expert-Led Training</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Learn & Grow
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Master plant care, landscape design, and business management with our comprehensive courses.
            </p>
          </div>

          {/* Level Filters */}
          <div className="flex justify-center gap-3 mb-12">
            {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                className={selectedLevel === level ? "bg-primary" : "border-white/20 text-white hover:bg-white/5"}
                onClick={() => setSelectedLevel(level)}
              >
                {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300"
                data-testid={`course-card-${course.id}`}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </button>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={levelColors[course.level]}>
                        {course.level}
                      </Badge>
                      {course.price === 0 ? (
                        <Badge className="bg-green-500/20 text-green-400">Free</Badge>
                      ) : (
                        <span className="font-heading text-xl font-bold text-primary">${course.price}</span>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrolled_count?.toLocaleString()} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.modules?.length} modules
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs text-primary font-bold">
                            {course.instructor?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-white">{course.instructor}</span>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses found for this level.</p>
            </div>
          )}

          {/* CTA Section */}
          <div className="glass-card p-12 mt-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
            <div className="relative">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-white mb-3">
                Become a Certified Green Professional
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Complete our course tracks and earn industry-recognized certifications.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Learning Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 GreenForge OS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Courses;
