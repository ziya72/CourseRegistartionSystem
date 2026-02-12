import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  ArrowRight,
  Plus,
  Clock,
  Lock
} from 'lucide-react';
import type { StudentDashboardData, Course } from '@/services/api';

interface DashboardOverviewProps {
  onNavigateToRegistration: () => void;
  dashboardData: StudentDashboardData | null;
  courses: Course[];
}

const DashboardOverview = ({ onNavigateToRegistration, dashboardData, courses }: DashboardOverviewProps) => {
  const { user, studentData, isRegistrationEnabled } = useAuth();
  
  // Use dashboardData from API if available, fallback to context
  const displayData = dashboardData || studentData;
  const displayName = dashboardData?.name || user?.name || 'Student';
  const creditProgress = displayData ? (displayData.totalCredits / 160) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 sm:gap-2 glass-card px-2.5 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium mb-2 sm:mb-4">
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
          <span className="text-foreground">Student Dashboard</span>
        </div>
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-2">
          Welcome, <span className="serif-highlight text-primary">{displayName}</span>
        </h1>
        <p className="text-xs sm:text-base text-muted-foreground">
          Enrollment Number: <span className="font-mono font-medium text-foreground">{displayData?.enrollmentNo || 'N/A'}</span>
        </p>
      </div>

      {/* Academic Overview Stats */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Current CPI</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{displayData?.cpi?.toFixed(2) || '0.00'}</div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-primary mt-1 sm:mt-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Academic Performance</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Credits</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{displayData?.totalCredits || 0}</div>
          <Progress value={creditProgress} className="h-1.5 sm:h-2 mt-2 sm:mt-3" />
          <div className="text-xs text-muted-foreground mt-1">{160 - (displayData?.totalCredits || 0)} remaining</div>
        </div>

        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Current Semester</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{displayData?.currentSemester || 1}</div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">of 8 semesters</div>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground">My Courses</h3>
              <p className="text-xs text-muted-foreground">Semester {displayData?.currentSemester || 1} - Currently Enrolled</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {courses.reduce((acc, c) => acc + (c.credits || 0), 0)} Credits
          </Badge>
        </div>
        
        {courses.length === 0 ? (
          <EmptyState 
            title="No courses found"
            message="You haven't enrolled in any courses yet for this semester."
          />
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {courses.map((course) => (
              <div key={course.id || course.courseCode} className="flex flex-col gap-2 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-primary">{course.courseCode}</span>
                      {course.grade && (
                        <Badge variant="secondary" className="text-[10px]">{course.grade}</Badge>
                      )}
                      {course.status && (
                        <Badge variant="outline" className="text-[10px]">{course.status}</Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-foreground leading-tight line-clamp-2">{course.courseName}</h4>
                    {course.instructor && (
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {course.credits} cr
                  </Badge>
                </div>
                {course.schedule && (
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg w-fit">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="truncate">{course.schedule}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Eligibility / Registration Rules */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-foreground">Registration Eligibility</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
          {[
            { rule: 'Maximum 40 credits per semester', status: true },
            { rule: 'CPI ≥ 8.5 for advanced courses', status: (displayData?.cpi || 0) >= 8.5 },
            { rule: 'All prerequisites completed', status: true },
            { rule: 'No academic probation', status: true },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/30">
              {item.status ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0" />
              )}
              <span className="text-xs sm:text-sm text-foreground">{item.rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions - Registration */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 glow-primary">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
              <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground">Ready to Register?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isRegistrationEnabled 
                  ? `Registration window is open for Semester ${(displayData?.currentSemester || 0) + 1}`
                  : 'Registration not opened by faculty yet.'
                }
              </p>
            </div>
          </div>
          <Button 
            size="lg" 
            className="rounded-full px-6 sm:px-8 group w-full sm:w-auto" 
            onClick={onNavigateToRegistration}
            disabled={!isRegistrationEnabled}
          >
            {isRegistrationEnabled ? (
              <>
                Register
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Register
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
