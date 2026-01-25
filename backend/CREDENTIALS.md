# System Credentials

## Test Accounts

### Students

| Email | Password | Enrollment No | Status |
|-------|----------|---------------|--------|
| gm0001@myamu.ac.in | Student@123 | gm0001 | Active |
| gm7605@myamu.ac.in | Student@123 | gm7605 | Active |
| gp1212@myamu.ac.in | Student@123 | gp1212 | Active |
| gq5012@myamu.ac.in | (Not set - for testing registration) | gq5012 | Inactive |

### Teachers

| Email | Password | Role | Department |
|-------|----------|------|------------|
| sadaf@amu.ac.in | Hello@123 | teacher | Computer Engineering |

### Administrators

| Email | Password | Role | Department |
|-------|----------|------|------------|
| admin@amu.ac.in | Admin@123 | admin | Administration |

---

## Role Hierarchy

```
admin (Level 3)
  ↓ Can access: admin, teacher, student routes
teacher (Level 2)
  ↓ Can access: teacher, student routes
student (Level 1)
  ↓ Can access: student routes only
```

---

## API Endpoints

### Authentication
- `POST /auth/request-otp` - Request OTP for student registration
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/register` - Complete student registration
- `POST /auth/login` - Login (students, teachers, admins)

### Protected Routes (Examples)
- `GET /api/public` - Public route (no auth)
- `GET /api/protected` - Any authenticated user
- `GET /api/student/dashboard` - Students only
- `GET /api/teacher/dashboard` - Teachers and admins
- `GET /api/admin/dashboard` - Admins only
- `GET /api/student/:enrollmentNo/grades` - Owner or admin

---

## Testing

Use `api-tests.rest` file with VS Code REST Client extension to test all endpoints.

1. Login with different roles
2. Copy the `accessToken` from response
3. Use token in `Authorization: Bearer <token>` header
4. Test different routes to verify access control

---

## Security Notes

- All passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 1 hour (or 7 days with rememberMe)
- OTP expires after 5 minutes
- Maximum 3 OTP verification attempts
- Cannot request new OTP until current one expires
- Role hierarchy is enforced server-side
- Students can only access their own resources
- Teachers and admins can access all student resources
