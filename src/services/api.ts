import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// =============================================================================
// API CONFIGURATION
// =============================================================================
// Backend API base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// =============================================================================
// AXIOS INSTANCE
// =============================================================================
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================================
// REQUEST INTERCEPTOR - Automatically attach token
// =============================================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// =============================================================================
// RESPONSE INTERCEPTOR - Handle common errors
// =============================================================================
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// API TYPES
// =============================================================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  studentId: string;
  password: string;
  role?: 'student' | 'faculty';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'faculty';
  };
  message?: string;
}

export interface StudentDashboardData {
  name: string;
  email: string;
  enrollmentNo: string;
  branch: string;
  admissionYear: number;
  cpi: number;
  totalCredits: number;
  currentSemester: number;
  courses: Course[];
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade?: string;
  status?: string;
  instructor?: string;
  schedule?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// =============================================================================
// AUTH API FUNCTIONS
// =============================================================================

/**
 * Login user with email and password
 * @endpoint POST /auth/login
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * Register a new user
 * @endpoint POST /auth/register
 */
export const registerUser = async (data: RegisterData): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/register', data);
  return response.data;
};

/**
 * Logout user (optional server-side logout)
 * @endpoint POST /auth/logout
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Logout should succeed even if server call fails
    console.warn('Server logout failed, proceeding with local logout');
  }
};

/**
 * Verify token validity
 * @endpoint GET /auth/verify
 */
export const verifyToken = async (): Promise<{ valid: boolean; user?: AuthResponse['user'] }> => {
  const response = await api.get<{ valid: boolean; user?: AuthResponse['user'] }>('/auth/verify');
  return response.data;
};

// =============================================================================
// STUDENT API FUNCTIONS
// =============================================================================

/**
 * Get student dashboard data (profile + courses)
 * @endpoint GET /api/student/dashboard
 */
export const getStudentDashboardData = async (): Promise<StudentDashboardData> => {
  const response = await api.get<StudentDashboardData>('/api/student/dashboard');
  return response.data;
};

/**
 * Get student's enrolled courses
 * @endpoint GET /api/student/courses
 */
export const getStudentCourses = async (): Promise<Course[]> => {
  const response = await api.get<Course[]>('/api/student/courses');
  return response.data;
};

/**
 * Get available courses for registration
 * @endpoint GET /api/courses/available
 */
export const getAvailableCourses = async (): Promise<Course[]> => {
  const response = await api.get<Course[]>('/api/courses/available');
  return response.data;
};

/**
 * Register for a course
 * @endpoint POST /api/courses/register
 */
export const registerForCourse = async (courseId: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/api/courses/register', { courseId });
  return response.data;
};

/**
 * Drop a registered course
 * @endpoint DELETE /api/courses/drop/:courseId
 */
export const dropCourse = async (courseId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/api/courses/drop/${courseId}`);
  return response.data;
};

// =============================================================================
// FACULTY API FUNCTIONS
// =============================================================================

/**
 * Get faculty dashboard data
 * @endpoint GET /api/teacher/dashboard
 */
export const getFacultyDashboardData = async (): Promise<any> => {
  const response = await api.get('/api/teacher/dashboard');
  return response.data;
};

/**
 * Toggle registration window
 * @endpoint POST /api/faculty/registration/toggle
 */
export const toggleRegistration = async (enabled: boolean): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/api/faculty/registration/toggle', { enabled });
  return response.data;
};

// =============================================================================
// ERROR HELPER
// =============================================================================

/**
 * Extract error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message || error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
