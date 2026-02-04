import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  BookOpen, 
  ClipboardList,
  ArrowRight,
  Settings,
  BarChart3,
  Shield,
  Sparkles,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Bell,
  FileText,
  AlertTriangle,
  TrendingUp,
  Unlock,
  Lock
} from 'lucide-react';

// Sample data
const students = [
  { id: 'GP1234', name: 'Rahul Sharma', branch: 'Computer Engineering', cpi: 8.7, semester: 5, status: 'active' },
  { id: 'GP5678', name: 'Priya Singh', branch: 'Computer Engineering', cpi: 9.2, semester: 5, status: 'active' },
  { id: 'GE1122', name: 'Amit Kumar', branch: 'Electrical Engineering', cpi: 7.8, semester: 3, status: 'active' },
  { id: 'GM3344', name: 'Sneha Patel', branch: 'Mechanical Engineering', cpi: 8.1, semester: 7, status: 'active' },
  { id: 'GP9012', name: 'Vikram Rao', branch: 'Computer Engineering', cpi: 6.5, semester: 5, status: 'probation' },
];

const courses = [
  { id: 'CS301', name: 'Data Structures', credits: 4, prereq: 'CS101', minCPI: 0, status: true },
  { id: 'CS302', name: 'Database Systems', credits: 4, prereq: 'CS201', minCPI: 0, status: true },
  { id: 'CS401', name: 'Machine Learning', credits: 4, prereq: 'MA201', minCPI: 7.5, status: true },
  { id: 'CS501', name: 'Advanced AI', credits: 4, prereq: 'CS401', minCPI: 8.5, status: false },
];

const pendingApprovals = [
  { id: 1, student: 'GP1234', course: 'CS501', reason: 'Prerequisite waiver', date: '2024-01-10' },
  { id: 2, student: 'GE1122', course: 'CS401', reason: 'Branch change', date: '2024-01-09' },
  { id: 3, student: 'GP9012', course: 'CS302', reason: 'Credit overload', date: '2024-01-08' },
];

const auditLogs = [
  { id: 1, action: 'Course rule updated', user: 'Admin', target: 'CS401', time: '2 hours ago' },
  { id: 2, action: 'Student status changed', user: 'Faculty', target: 'GP9012', time: '5 hours ago' },
  { id: 3, action: 'New course added', user: 'Admin', target: 'CS601', time: '1 day ago' },
  { id: 4, action: 'Registration approved', user: 'Faculty', target: 'GP1234', time: '2 days ago' },
];

const FacultyDashboard = () => {
  const { isRegistrationEnabled, setIsRegistrationEnabled } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 glass-card px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-4">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
            <span className="text-foreground">Admin Dashboard</span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
            Welcome, <span className="serif-highlight gradient-text">Administrator</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage courses, rules, and monitor registrations
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="rounded-full text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Alerts</span>
            <Badge className="ml-1 sm:ml-2 bg-destructive text-destructive-foreground text-[10px] sm:text-xs">{pendingApprovals.length}</Badge>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card p-0.5 sm:p-1 rounded-xl sm:rounded-2xl w-full overflow-x-auto flex">
          <TabsTrigger value="overview" className="rounded-lg sm:rounded-xl px-2 sm:px-4 text-[10px] sm:text-sm flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg sm:rounded-xl px-2 sm:px-4 text-[10px] sm:text-sm flex-1 sm:flex-none">Students</TabsTrigger>
          <TabsTrigger value="courses" className="rounded-lg sm:rounded-xl px-2 sm:px-4 text-[10px] sm:text-sm flex-1 sm:flex-none">Courses</TabsTrigger>
          <TabsTrigger value="approvals" className="rounded-lg sm:rounded-xl px-2 sm:px-4 text-[10px] sm:text-sm flex-1 sm:flex-none">Approvals</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg sm:rounded-xl px-2 sm:px-4 text-[10px] sm:text-sm flex-1 sm:flex-none">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {[
              { label: 'Total Students', value: '1,234', icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />, change: '+12%' },
              { label: 'Active Courses', value: '42', icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />, change: '+3' },
              { label: 'Pending', value: String(pendingApprovals.length), icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5" />, change: 'Urgent' },
              { label: 'Semester', value: 'Fall 24', icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />, change: '' },
            ].map((stat, index) => (
              <div key={index} className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                    {stat.icon}
                  </div>
                  {stat.change && (
                    <Badge variant="outline" className="text-[9px] sm:text-xs text-primary px-1 sm:px-2">
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mt-0.5 sm:mt-1 truncate">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Registration Control & Quick Actions */}
          <div className="grid gap-3 sm:gap-6 lg:grid-cols-2">
            {/* Registration Control */}
            <div className={`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 ${isRegistrationEnabled ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  {isRegistrationEnabled ? (
                    <Unlock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  )}
                  <h3 className="font-bold text-sm sm:text-lg text-foreground">Registration</h3>
                </div>
                <Switch 
                  checked={isRegistrationEnabled} 
                  onCheckedChange={setIsRegistrationEnabled}
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {isRegistrationEnabled 
                  ? 'Students can register for courses.' 
                  : 'Registration closed for students.'
                }
              </p>
              <Badge className={`text-[10px] sm:text-xs ${isRegistrationEnabled ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-muted-foreground border-0'}`}>
                {isRegistrationEnabled ? 'Open' : 'Closed'}
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h3 className="font-bold text-sm sm:text-lg text-foreground mb-3 sm:mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {[
                  { label: 'Add Course', icon: <Plus className="h-4 w-4 sm:h-5 sm:w-5" />, color: 'primary' },
                  { label: 'Reports', icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />, color: 'secondary' },
                  { label: 'Rules', icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5" />, color: 'primary' },
                  { label: 'Export', icon: <Download className="h-4 w-4 sm:h-5 sm:w-5" />, color: 'secondary' },
                ].map((action, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="h-auto py-3 sm:py-4 flex-col gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl hover:bg-primary/5"
                    onClick={() => action.label === 'Reports' && setActiveTab('reports')}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {action.icon}
                    </div>
                    <span className="text-[10px] sm:text-sm font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-6">
              <h3 className="font-bold text-sm sm:text-lg text-foreground">Recent Activity</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('reports')} className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-1.5 sm:mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground truncate">{log.action}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {log.user} • {log.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals Alert */}
          {pendingApprovals.length > 0 && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 border-2 border-secondary/30 bg-secondary/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground">{pendingApprovals.length} Pending</h3>
                    <p className="text-[10px] sm:text-sm text-muted-foreground">Waiting for approval</p>
                  </div>
                </div>
                <Button className="rounded-full text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto" onClick={() => setActiveTab('approvals')}>
                  Review
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-foreground">Student Records</h2>
              <div className="flex gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-9 h-8 sm:h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <Button variant="outline" className="rounded-lg sm:rounded-xl h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-primary">{student.id}</span>
                    <Badge className={`text-[10px] ${student.status === 'active' 
                      ? 'bg-primary/10 text-primary border-0'
                      : 'bg-destructive/10 text-destructive border-0'
                    }`}>
                      {student.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{student.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{student.branch}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>CPI: <span className={student.cpi >= 8.0 ? 'text-primary font-medium' : ''}>{student.cpi}</span></span>
                      <span>Sem: {student.semester}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Roll No.</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Branch</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">CPI</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Sem</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm font-medium text-primary">{student.id}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{student.name}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{student.branch}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-sm ${student.cpi >= 8.0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {student.cpi}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">{student.semester}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`text-xs ${student.status === 'active' 
                          ? 'bg-primary/10 text-primary border-0'
                          : 'bg-destructive/10 text-destructive border-0'
                        }`}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Course Rules Tab */}
        <TabsContent value="courses" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-foreground">Course Rules</h2>
              <Button className="rounded-lg sm:rounded-xl text-xs sm:text-sm h-8 sm:h-10">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Add Course
              </Button>
            </div>
            
            <div className="space-y-2 sm:space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-primary">{course.id}</span>
                      <Badge variant="outline" className="text-[10px] sm:text-xs">{course.credits} Cr</Badge>
                    </div>
                    <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">{course.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-sm text-muted-foreground">
                      <span>Prereq: {course.prereq}</span>
                      {course.minCPI > 0 && <span>Min CPI: {course.minCPI}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-sm text-muted-foreground">Active</span>
                      <Switch checked={course.status} />
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6">
            <h2 className="text-base sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Pending Approvals</h2>
            
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex flex-col gap-3 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-primary">{approval.student}</span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="font-mono text-xs sm:text-sm text-secondary">{approval.course}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{approval.reason}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Submitted: {approval.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button className="rounded-lg sm:rounded-xl flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Approve
                      </Button>
                      <Button variant="outline" className="rounded-lg sm:rounded-xl flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-6 md:grid-cols-2">
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-lg text-foreground">Registration Stats</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { label: 'Total', value: 856, max: 1000 },
                  { label: 'Approved', value: 780, max: 856 },
                  { label: 'Pending', value: 58, max: 856 },
                  { label: 'Rejected', value: 18, max: 856 },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-medium text-foreground">{stat.value}</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(stat.value / stat.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-lg text-foreground">Audit Logs</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-1.5 sm:mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-foreground truncate">{log.action}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {log.user} • {log.target} • {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="font-bold text-sm sm:text-lg text-foreground">Export Reports</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: 'Student Report', desc: 'All student records' },
                { label: 'Registration', desc: 'Semester data' },
                { label: 'Audit Report', desc: 'Activity logs' },
              ].map((report, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="h-auto py-3 sm:py-4 flex-col items-start gap-0.5 sm:gap-1 rounded-xl sm:rounded-2xl"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium text-xs sm:text-sm">{report.label}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{report.desc}</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyDashboard;
