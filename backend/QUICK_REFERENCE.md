# Quick Reference - Forgot Password & Logout

## 🚀 Quick Start

### 1. Start Server
```bash
npm run dev
```

### 2. Test Forgot Password
```http
# Request reset token
POST http://localhost:8000/auth/forgot-password
Content-Type: application/json

{
  "email": "gm0001@myamu.ac.in"
}

# Check console for token, then reset password
POST http://localhost:8000/auth/reset-password
Content-Type: application/json

{
  "email": "gm0001@myamu.ac.in",
  "token": "123456",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

### 3. Test Logout
```http
# Login first
POST http://localhost:8000/auth/login
Content-Type: application/json

{
  "email": "gm0001@myamu.ac.in",
  "password": "Student@123"
}

# Copy token, then logout
POST http://localhost:8000/auth/logout
Authorization: Bearer <your-token>
```

## 📋 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/forgot-password` | No | Request password reset token |
| POST | `/auth/reset-password` | No | Reset password with token |
| POST | `/auth/logout` | Yes | Logout and revoke token |

## ⚙️ Configuration (.env)

```env
RESET_TOKEN_EXPIRY_MINUTES=15
RESET_TOKEN_MAX_ATTEMPTS=3
```

## 🔑 Key Rules

### Forgot Password
- ✅ 15-minute expiry
- ✅ 3 verification attempts
- ✅ Cannot request new token until current expires
- ✅ Works for students and teachers
- ✅ Token logged to console

### Logout
- ✅ Immediate token revocation
- ✅ Token added to blacklist
- ✅ Cannot reuse logged-out token
- ✅ Works for all roles

## 🧪 Test Files

- `api-tests.rest` - Complete test suite
- `FORGOT_PASSWORD_LOGOUT_GUIDE.md` - Detailed documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

## 🐛 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `User not found` | Email doesn't exist | Check email spelling |
| `Password reset token already sent` | Token still active | Wait for expiry (15 min) |
| `Passwords do not match` | Password confirmation mismatch | Ensure both passwords match |
| `Invalid reset token` | Wrong token | Check console for correct token |
| `Maximum verification attempts exceeded` | Used all 3 attempts | Wait for token to expire |
| `Token has been revoked` | Token logged out | Login again to get new token |

## 📞 Quick Help

1. **Reset token not working?** Check console for the actual token
2. **Can't request new token?** Wait 15 minutes for current to expire
3. **Logout not working?** Ensure Authorization header is correct
4. **Token still works after logout?** Check middleware is checking blacklist

---

**Ready to test!** Open `api-tests.rest` and start testing.
