import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  History,
  GraduationCap,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Past semester history only (current semester courses are on dashboard)
const semesterHistory = [
  {
    semester: 4,
    year: '2024-25',
    session: 'Spring',
    sgpa: 8.7,
    totalCredits: 20,
    courses: [
      { id: 'CS251', name: 'Computer Organization', credits: 4, grade: 'A', gradePoints: 10 },
      { id: 'CS252', name: 'Operating Systems', credits: 4, grade: 'A-', gradePoints: 9 },
      { id: 'MA251', name: 'Linear Algebra', credits: 3, grade: 'B+', gradePoints: 8 },
      { id: 'CS253', name: 'Theory of Computation', credits: 3, grade: 'A', gradePoints: 10 },
      { id: 'HS251', name: 'Economics', credits: 3, grade: 'A-', gradePoints: 9 },
      { id: 'CS254', name: 'Software Engineering', credits: 3, grade: 'B', gradePoints: 7 },
    ]
  },
  {
    semester: 3,
    year: '2024-25',
    session: 'Fall',
    sgpa: 8.4,
    totalCredits: 21,
    courses: [
      { id: 'CS151', name: 'Discrete Mathematics', credits: 4, grade: 'A-', gradePoints: 9 },
      { id: 'CS152', name: 'Digital Logic Design', credits: 4, grade: 'B+', gradePoints: 8 },
      { id: 'MA151', name: 'Calculus II', credits: 3, grade: 'A', gradePoints: 10 },
      { id: 'PH151', name: 'Physics I', credits: 3, grade: 'B+', gradePoints: 8 },
      { id: 'EE151', name: 'Basic Electrical', credits: 3, grade: 'A-', gradePoints: 9 },
      { id: 'HS151', name: 'Communication Skills', credits: 4, grade: 'B', gradePoints: 7 },
    ]
  },
  {
    semester: 2,
    year: '2023-24',
    session: 'Spring',
    sgpa: 8.2,
    totalCredits: 22,
    courses: [
      { id: 'CS101', name: 'Introduction to Programming', credits: 4, grade: 'A', gradePoints: 10 },
      { id: 'CS102', name: 'Computer Fundamentals', credits: 3, grade: 'B+', gradePoints: 8 },
      { id: 'MA101', name: 'Calculus I', credits: 4, grade: 'B+', gradePoints: 8 },
      { id: 'PH101', name: 'Engineering Physics', credits: 4, grade: 'B', gradePoints: 7 },
      { id: 'CH101', name: 'Engineering Chemistry', credits: 3, grade: 'A-', gradePoints: 9 },
      { id: 'ME101', name: 'Engineering Graphics', credits: 4, grade: 'A', gradePoints: 10 },
    ]
  },
  {
    semester: 1,
    year: '2023-24',
    session: 'Fall',
    sgpa: 7.9,
    totalCredits: 20,
    courses: [
      { id: 'MA001', name: 'Basic Mathematics', credits: 4, grade: 'B+', gradePoints: 8 },
      { id: 'PH001', name: 'Physics Foundation', credits: 4, grade: 'B', gradePoints: 7 },
      { id: 'CH001', name: 'Chemistry Foundation', credits: 4, grade: 'B+', gradePoints: 8 },
      { id: 'EN001', name: 'English Communication', credits: 4, grade: 'A-', gradePoints: 9 },
      { id: 'WS001', name: 'Workshop Practice', credits: 4, grade: 'B', gradePoints: 7 },
    ]
  }
];

const CoursesView = () => {
  const { studentData } = useAuth();
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([4]); // Latest semester expanded by default

  const toggleSemester = (semester: number) => {
    setExpandedSemesters(prev => 
      prev.includes(semester)
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    );
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-primary/10 text-primary';
    if (grade.startsWith('B')) return 'bg-secondary/20 text-secondary-foreground';
    if (grade.startsWith('C')) return 'bg-muted text-muted-foreground';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Course History
        </h1>
        <p className="text-sm text-muted-foreground">
          View your past semester courses and grades
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
          <GraduationCap className="h-5 w-5 mx-auto text-primary mb-2" />
          <p className="text-lg sm:text-xl font-bold text-foreground">{studentData?.cpi?.toFixed(1) || '8.3'}</p>
          <p className="text-xs text-muted-foreground">Current CPI</p>
        </div>
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
          <Award className="h-5 w-5 mx-auto text-secondary mb-2" />
          <p className="text-lg sm:text-xl font-bold text-foreground">{studentData?.totalCredits || 83}</p>
          <p className="text-xs text-muted-foreground">Total Credits</p>
        </div>
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto text-accent-foreground mb-2" />
          <p className="text-lg sm:text-xl font-bold text-foreground">22</p>
          <p className="text-xs text-muted-foreground">Courses Done</p>
        </div>
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
          <History className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
          <p className="text-lg sm:text-xl font-bold text-foreground">4</p>
          <p className="text-xs text-muted-foreground">Semesters</p>
        </div>
      </div>

      {/* Semester-wise History */}
      <div className="space-y-3">
            {semesterHistory.map((sem) => (
              <div key={sem.semester} className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden">
                {/* Semester Header - Clickable */}
                <button
                  onClick={() => toggleSemester(sem.semester)}
                  className="w-full p-3 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base">
                      {sem.semester}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-sm sm:text-lg text-foreground">
                        Semester {sem.semester}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        {sem.session} {sem.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right">
                      <Badge className="bg-secondary/20 text-secondary-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                        SGPA: {sem.sgpa}
                      </Badge>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{sem.totalCredits} Cr</p>
                    </div>
                    {expandedSemesters.includes(sem.semester) ? (
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Course Details */}
                {expandedSemesters.includes(sem.semester) && (
                  <div className="px-3 sm:px-5 pb-3 sm:pb-5 border-t border-border">
                    <div className="pt-3 sm:pt-4 grid gap-2">
                      {sem.courses.map((course) => (
                        <div 
                          key={course.id}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="font-mono text-[9px] sm:text-xs font-bold text-primary">{course.id}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-xs sm:text-sm text-foreground truncate">{course.name}</h4>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">{course.credits} Credits</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <Badge className={`${getGradeColor(course.grade)} text-[10px] sm:text-xs font-bold px-1.5 sm:px-2`}>
                              {course.grade}
                            </Badge>
                            <span className="text-[10px] sm:text-xs text-muted-foreground font-mono hidden sm:inline">
                              GP: {course.gradePoints}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default CoursesView;