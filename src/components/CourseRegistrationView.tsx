import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Search, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  BookOpen,
  Info
} from 'lucide-react';

// Extended course data matching Figma
const availableCourses = [
  { id: 'CS301', name: 'Data Structures & Algorithms', credits: 4, instructor: 'Dr. Sharma', status: 'eligible', statusText: 'Eligible', department: 'CS' },
  { id: 'CS302', name: 'Database Management Systems', credits: 4, instructor: 'Dr. Patel', status: 'eligible', statusText: 'Eligible', department: 'CS' },
  { id: 'CS401', name: 'Machine Learning', credits: 4, instructor: 'Dr. Kumar', status: 'blocked', statusText: 'Prerequisite: CS301', department: 'CS' },
  { id: 'MA201', name: 'Linear Algebra', credits: 4, instructor: 'Dr. Reddy', status: 'eligible', statusText: 'Eligible', department: 'MA' },
  { id: 'CS501', name: 'Advanced Artificial Intelligence', credits: 4, instructor: 'Dr. Singh', status: 'blocked', statusText: 'CPI < 8.5 required', department: 'CS' },
  { id: 'HS201', name: 'Technical Communication', credits: 4, instructor: 'Prof. Singh', status: 'eligible', statusText: 'Eligible', department: 'HS' },
  { id: 'CS303', name: 'Operating Systems', credits: 4, instructor: 'Dr. Kumar', status: 'eligible', statusText: 'Eligible', department: 'CS' },
  { id: 'CS201', name: 'Computer Networks', credits: 4, instructor: 'Dr. Verma', status: 'passed', statusText: 'Already Passed', department: 'CS' },
];

interface CourseRegistrationViewProps {
  onBack: () => void;
}

const CourseRegistrationView = ({ onBack }: CourseRegistrationViewProps) => {
  const { user, studentData } = useAuth();
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['CS301', 'CS302', 'CS303']);
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('all');
  const [filter, setFilter] = useState('all');

  const maxCredits = 40;
  const selectedCredits = availableCourses
    .filter(c => selectedCourses.includes(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  const creditProgress = (selectedCredits / maxCredits) * 100;

  const toggleCourse = (courseId: string, status: string) => {
    if (status === 'blocked' || status === 'passed') return;
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = department === 'all' || course.department === department;
    const matchesFilter = filter === 'all' || 
      (filter === 'eligible' && course.status === 'eligible') ||
      (filter === 'blocked' && course.status === 'blocked');
    return matchesSearch && matchesDepartment && matchesFilter;
  });

  const eligibleCount = availableCourses.filter(c => c.status === 'eligible').length;
  const blockedCount = availableCourses.filter(c => c.status === 'blocked').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'eligible':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'passed':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'text-primary';
      case 'blocked':
        return 'text-destructive';
      case 'passed':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 animate-fade-in">
      {/* Header with Back Button */}
      <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border-l-4 border-primary">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="rounded-lg h-8 px-2 sm:px-3 text-xs shrink-0"
            >
              <ArrowLeft className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Course Registration</p>
              <h2 className="font-bold text-sm sm:text-base text-foreground truncate">
                Semester {studentData?.currentSemester || 5} - Fall 2024
              </h2>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] sm:text-xs self-start sm:self-auto max-w-full truncate">
            <span className="font-mono truncate">{user?.name || 'Rahul Kumar'}</span>
            <span className="text-muted-foreground ml-1 hidden sm:inline">({studentData?.enrollmentNo || '2021CS001'})</span>
          </Badge>
        </div>
      </div>

      {/* Credit Selection Progress */}
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border-l-4 border-secondary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm sm:text-base text-foreground">Credit Selection Progress</h3>
          <span className="font-bold text-lg sm:text-xl text-secondary">
            {selectedCredits} / {maxCredits} credits
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={creditProgress} 
            className="h-3 sm:h-4 rounded-full"
          />
          <div 
            className="absolute top-0 h-3 sm:h-4 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.min(creditProgress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-primary" />
            Within limit
          </span>
          <span>{maxCredits - selectedCredits} credits remaining</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="relative col-span-2 sm:col-span-1">
          <label className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 rounded-lg h-9 sm:h-10 text-xs sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 block">Department</label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="rounded-lg h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="CS">CS</SelectItem>
              <SelectItem value="MA">Math</SelectItem>
              <SelectItem value="HS">Humanities</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 block">Filter</label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="rounded-lg h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="eligible">Eligible</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available Courses Table */}
      <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-border flex items-center gap-2">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
          <h3 className="font-bold text-sm sm:text-base text-foreground">Available Courses for Registration</h3>
        </div>

        {/* Table Header - Desktop */}
        <div className="hidden sm:grid grid-cols-12 gap-3 p-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <div className="col-span-1">Select</div>
          <div className="col-span-2">Course Code</div>
          <div className="col-span-4">Course Name</div>
          <div className="col-span-1">Credits</div>
          <div className="col-span-2">Instructor</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Course Rows */}
        <div className="divide-y divide-border">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              onClick={() => toggleCourse(course.id, course.status)}
              className={`p-3 sm:p-4 transition-colors cursor-pointer ${
                course.status === 'blocked' || course.status === 'passed'
                  ? 'opacity-60 cursor-not-allowed bg-muted/10' 
                  : selectedCourses.includes(course.id)
                    ? 'bg-primary/5 hover:bg-primary/10'
                    : 'hover:bg-muted/30'
              }`}
            >
              {/* Mobile Layout */}
              <div className="sm:hidden">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    disabled={course.status === 'blocked' || course.status === 'passed'}
                    className="h-4 w-4 mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-foreground">{course.id}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{course.credits}Cr</Badge>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] shrink-0 ${getStatusColor(course.status)}`}>
                        {getStatusIcon(course.status)}
                        <span className="hidden xs:inline">{course.status === 'eligible' ? '✓' : ''}</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-tight line-clamp-2">{course.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-muted-foreground">{course.instructor}</p>
                      <span className={`text-[10px] ${getStatusColor(course.status)}`}>
                        {course.statusText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    disabled={course.status === 'blocked' || course.status === 'passed'}
                    className="h-5 w-5"
                  />
                </div>
                <div className="col-span-2">
                  <span className="font-mono text-sm font-bold text-foreground">{course.id}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-foreground">{course.name}</span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm text-muted-foreground">{course.credits}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">{course.instructor}</span>
                </div>
                <div className="col-span-2">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${getStatusColor(course.status)}`}>
                    {getStatusIcon(course.status)}
                    <span>{course.statusText}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="p-3 sm:p-4 bg-muted/20 border-t border-border">
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <span className="text-primary font-medium">{eligibleCount} eligible courses</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-destructive font-medium">{blockedCount} blocked</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-secondary font-medium">{selectedCourses.length} selected</span>
          </div>
        </div>
      </div>

      {/* Eligibility Checks & Warnings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Eligibility Checks */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">Eligibility Checks Passed</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 text-primary shrink-0" />
              <span>Credit limit: Within {maxCredits} credits</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 text-primary shrink-0" />
              <span>All prerequisites satisfied</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 text-primary shrink-0" />
              <span>CPI requirement met for advanced courses</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 border-l-4 border-destructive/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h4 className="font-semibold text-sm text-foreground">Warnings</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 text-xs sm:text-sm text-destructive">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{blockedCount} courses blocked due to prerequisites</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10 text-xs sm:text-sm text-secondary-foreground">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{maxCredits - selectedCredits} credits remaining before limit</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs sm:text-sm text-muted-foreground">
              <Info className="h-3 w-3 shrink-0" />
              <span>Registration deadline: 20th Jan 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 sticky bottom-2 sm:bottom-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-xs sm:text-base text-foreground">
              {selectedCourses.length} courses • {selectedCredits} credits
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Last saved: 2 min ago</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedCourses([])}
              className="rounded-lg text-[10px] sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              Clear
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg text-[10px] sm:text-sm h-8 sm:h-9 px-2 sm:px-3 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              Draft
            </Button>
            <Button 
              size="sm" 
              className="rounded-lg text-[10px] sm:text-sm h-8 sm:h-9 px-2 sm:px-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              disabled={selectedCourses.length === 0}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistrationView;
