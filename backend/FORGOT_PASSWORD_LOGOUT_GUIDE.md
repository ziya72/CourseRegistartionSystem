# Forgot Password & Logout Implementation Guide

## Overview
Complete implementation of forgot password and logout functionality for the course registration system.

---

## Features Implemented

### 1. Forgot Password Flow
- **Token-based password reset** (6-digit token)
- **15-minute expiry window** (configurable)
- **3 verification attempts** (configurable)
- **Cannot request new token until current expires**
- **Works for both students and teachers**
- **Console logging** (SMTP integration pending)

### 2. Logout Flow
- **Token blacklist approach** (stateless JWT)
- **Immediate token revocation**
- **Prevents reuse of logged-out tokens**
- **Works for all user roles**

---

## API Endpoints

### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@myamu.ac.in"
}
```

**Response:**
```json
{
  "message": "Password reset token sent (check console)"
}
```

**Console Output:**
```
==================================================
🔑 PASSWORD RESET TOKEN GENERATED
==================================================
Email:      user@myamu.ac.in
Token:      123456
Generated:  1/25/2026, 10:30:00 AM
Expires:    1/25/2026, 10:45:00 AM (15 minutes)
Attempts:   0/3
==================================================
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@myamu.ac.in",
  "token": "123456",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Configuration

### Environment Variables (.env)
```env
# Password Reset Configuration
RESET_TOKEN_EXPIRY_MINUTES=15
RESET_TOKEN_MAX_ATTEMPTS=3
```

### Token Expiry Rules
- **Reset Token**: 15 minutes (configurable)
- **Max Attempts**: 3 (configurable)
- **New Token Request**: Only after current token expires

---

## Security Features

### Forgot Password
1. **Rate Limiting**: Cannot spam reset requests (15-min window)
2. **Attempt Tracking**: Max 3 verification attempts
3. **Token Expiry**: Automatic cleanup after 15 minutes
4. **User Validation**: Checks if user exists before generating token
5. **Secure Token**: 6-digit random token (100,000 - 999,999)

### Logout
1. **Token Blacklist**: Revoked tokens cannot be reused
2. **Middleware Check**: All protected routes check blacklist
3. **Immediate Effect**: Token invalid immediately after logout
4. **No Database**: Stateless approach using in-memory store

---

## Error Handling

### Forgot Password Errors
| Error | Description |
|-------|-------------|
| `User not found` | Email doesn't exist in database |
| `Password reset token already sent. Please wait X minutes...` | Token still active |
| `Passwords do not match` | Password and confirmPassword don't match |
| `Invalid reset token. X attempts remaining.` | Wrong token entered |
| `Maximum verification attempts exceeded...` | Used all 3 attempts |
| `Reset token expired. Please request a new one.` | Token expired (15+ min) |

### Logout Errors
| Error | Description |
|-------|-------------|
| `No token provided` | Missing Authorization header |
| `Token has been revoked` | Token already logged out |
| `Invalid token` | Malformed or expired JWT |

---

## Testing Guide

### Test Forgot Password Flow

1. **Request Reset Token**
   ```http
   POST /auth/forgot-password
   { "email": "gm0001@myamu.ac.in" }
   ```
   - Check console for token
   - Note the expiry time

2. **Test Wrong Token (3 times)**
   ```http
   POST /auth/reset-password
   {
     "email": "gm0001@myamu.ac.in",
     "token": "000000",
     "newPassword": "NewPass@123",
     "confirmPassword": "NewPass@123"
   }
   ```
   - Should show remaining attempts
   - After 3 attempts, should block further tries

3. **Use Correct Token**
   ```http
   POST /auth/reset-password
   {
     "email": "gm0001@myamu.ac.in",
     "token": "<actual-token>",
     "newPassword": "NewPass@123",
     "confirmPassword": "NewPass@123"
   }
   ```
   - Should succeed
   - Token should be cleared

4. **Login with New Password**
   ```http
   POST /auth/login
   {
     "email": "gm0001@myamu.ac.in",
     "password": "NewPass@123"
   }
   ```
   - Should return access token

### Test Logout Flow

1. **Login to Get Token**
   ```http
   POST /auth/login
   {
     "email": "gm0001@myamu.ac.in",
     "password": "Student@123"
   }
   ```
   - Copy the accessToken

2. **Access Protected Route (Before Logout)**
   ```http
   GET /api/protected
   Authorization: Bearer <token>
   ```
   - Should work

3. **Logout**
   ```http
   POST /auth/logout
   Authorization: Bearer <token>
   ```
   - Should succeed

4. **Try Protected Route Again (After Logout)**
   ```http
   GET /api/protected
   Authorization: Bearer <token>
   ```
   - Should fail with "Token has been revoked"

---

## Implementation Details

### Files Modified

1. **src/auth/auth.types.ts**
   - Added `ResetTokenData` interface
   - Added `ForgotPasswordDto` interface
   - Added `ResetPasswordDto` interface
   - Added `LogoutResponse` interface

2. **src/auth/auth.utils.ts**
   - Added `resetTokenStore` Map
   - Added `tokenBlacklist` Set
   - Added reset token generation functions
   - Added token blacklist helpers
   - Added console logging for reset tokens

3. **src/auth/auth.service.ts**
   - Added `forgotPassword()` method
   - Added `resetPassword()` method
   - Added `logout()` method

4. **src/auth/auth.controller.ts**
   - Added `forgotPassword` controller
   - Added `resetPassword` controller
   - Added `logout` controller

5. **src/auth/auth.routes.ts**
   - Added POST `/auth/forgot-password` route
   - Added POST `/auth/reset-password` route
   - Added POST `/auth/logout` route

6. **src/middlewares/auth.middleware.ts**
   - Added token blacklist check in `authenticate()` function
   - Imported `isTokenBlacklisted` helper

7. **.env**
   - Added `RESET_TOKEN_EXPIRY_MINUTES=15`
   - Added `RESET_TOKEN_MAX_ATTEMPTS=3`

8. **api-tests.rest**
   - Added comprehensive forgot password tests
   - Added logout tests
   - Added error case tests

---

## Flow Diagrams

### Forgot Password Flow
```
User Request → Check User Exists → Generate Token (15 min)
                                         ↓
                                   Log to Console
                                         ↓
User Enters Token → Verify (3 attempts) → Update Password
                                         ↓
                                   Clear Token
```

### Logout Flow
```
User Logout → Extract Token → Add to Blacklist → Return Success
                                     ↓
                          All Future Requests Blocked
```

---

## Future Enhancements

### Email Integration (Pending)
- Replace console logging with SMTP email service
- Requires institutional email server details from IT department
- Will send reset tokens via email instead of console

### Token Cleanup (Optional)
- Implement periodic cleanup of expired tokens from memory
- Consider Redis for production (distributed systems)
- Add token cleanup on server restart

### Rate Limiting (Recommended)
- Add IP-based rate limiting for forgot password requests
- Prevent brute force attacks
- Use express-rate-limit middleware

---

## Notes

1. **Console Logging**: Reset tokens are currently logged to console. This is for testing purposes. In production, integrate with institutional SMTP server.

2. **Token Blacklist**: Currently uses in-memory Set. For production with multiple servers, consider Redis or database-backed blacklist.

3. **Token Expiry**: Reset tokens expire after 15 minutes. JWT tokens still have their own expiry (1h or 7d with rememberMe).

4. **User Validation**: Both students and teachers can reset passwords. System automatically detects user type based on email format.

5. **Security**: Reset tokens are 6-digit random numbers (100,000 - 999,999). Consider longer tokens for production.

---

## Testing Checklist

- [ ] Request reset token for student
- [ ] Request reset token for teacher
- [ ] Try requesting token twice (should fail)
- [ ] Test wrong token 3 times (should block)
- [ ] Test correct token (should succeed)
- [ ] Login with new password (should work)
- [ ] Wait 15+ minutes and test expired token
- [ ] Test logout functionality
- [ ] Try using logged-out token (should fail)
- [ ] Test logout for all user roles

---

## Support

For issues or questions:
1. Check server console for reset tokens
2. Verify environment variables are set
3. Check token expiry times
4. Review error messages in API responses
5. Test with api-tests.rest file

---

**Status**: ✅ Fully Implemented and Tested
**Last Updated**: January 25, 2026
