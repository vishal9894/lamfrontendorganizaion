# Multi-Tenant System Testing Guide

## Step-by-Step Testing Instructions

### Step 1: Set Up Local Development Environment

#### 1.1 Configure Local Hosts File
**Windows:**
```bash
# Open Notepad as Administrator
# File -> Open: C:\Windows\System32\drivers\etc\hosts
# Add these lines:
127.0.0.1 localhost
127.0.0.1 test-org.localhost
127.0.0.1 vishal-classes.localhost
127.0.0.1 demo-institute.localhost
```

**Mac/Linux:**
```bash
# Edit hosts file
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 localhost
127.0.0.1 test-org.localhost
127.0.0.1 vishal-classes.localhost
127.0.0.1 demo-institute.localhost

# Save and exit
```

#### 1.2 Update Vite Configuration
Create or update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Allow subdomain access
    allowedHosts: [
      'localhost',
      'test-org.localhost',
      'vishal-classes.localhost',
      'demo-institute.localhost'
    ]
  }
})
```

#### 1.3 Start Development Server
```bash
npm run dev
```

### Step 2: Test Basic Application Functionality

#### 2.1 Test Main Domain Access
1. Open browser and go to: `http://localhost:3000`
2. Verify the application loads
3. Check for any console errors
4. Test basic navigation

#### 2.2 Test Login/Signup
1. Navigate to `http://localhost:3000/login`
2. Try to create a new account
3. Verify login functionality works
4. Check dashboard access after login

### Step 3: Test Multi-Tenant Routing

#### 3.1 Test Subdomain Detection
1. Open browser and go to: `http://test-org.localhost:3000`
2. Check browser console for organization detection logs
3. Verify the URL shows organization-specific behavior
4. Test with different subdomains:
   - `http://vishal-classes.localhost:3000`
   - `http://demo-institute.localhost:3000`

#### 3.2 Test Organization Context
1. Open browser developer tools
2. Go to Console tab
3. Type: `localStorage.getItem('organizationId')`
4. Verify organization context is properly set

### Step 4: Test Organization Creation (Mock Backend)

#### 4.1 Create Mock Organization Data
Since backend isn't ready yet, let's create mock data for testing:

Create `src/mockData.js`:
```javascript
export const mockOrganizations = [
  {
    id: 'org-1',
    name: 'Vishal Classes',
    subdomain: 'vishal-classes',
    primaryColor: '#3498db',
    secondaryColor: '#2ecc71',
    accentColor: '#e74c3c',
    logo: null,
    description: 'Educational institution for competitive exams',
    status: true,
    theme: 'light',
    createdAt: new Date().toISOString()
  },
  {
    id: 'org-2',
    name: 'Demo Institute',
    subdomain: 'demo-institute',
    primaryColor: '#9b59b6',
    secondaryColor: '#3498db',
    accentColor: '#e67e22',
    logo: null,
    description: 'Demo educational organization',
    status: true,
    theme: 'light',
    createdAt: new Date().toISOString()
  }
];
```

#### 4.2 Update API Functions for Mock Testing
Temporarily update `src/api/allApi.js` to use mock data:

```javascript
// Add at the top of the file
import { mockOrganizations } from '../mockData';

// Temporarily replace these functions for testing:
export const handleGetOrganizationBySubdomain = async (subdomain) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const org = mockOrganizations.find(o => o.subdomain === subdomain);
  if (!org) {
    throw new Error('Organization not found');
  }
  return org;
};

export const handleGetCurrentOrganization = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  
  if (subdomain === 'localhost') {
    throw new Error('Not a subdomain');
  }
  
  const org = mockOrganizations.find(o => o.subdomain === subdomain);
  if (!org) {
    throw new Error('Organization not found');
  }
  
  return org;
};
```

### Step 5: Test Organization Branding

#### 5.1 Test Dynamic Branding Application
1. Go to: `http://vishal-classes.localhost:3000/login`
2. Check if the page shows blue theme (#3498db)
3. Go to: `http://demo-institute.localhost:3000/login`
4. Check if the page shows purple theme (#9b59b6)
5. Verify organization name appears correctly

#### 5.2 Test CSS Custom Properties
1. Open browser developer tools
2. Go to Elements tab
3. Check `<html>` element for CSS variables:
   - `--organization-primary`
   - `--organization-secondary`
   - `--organization-accent`

#### 5.3 Test Theme Switching
1. In browser console, run:
```javascript
// Test theme application
document.documentElement.style.setProperty('--organization-primary', '#ff6b6b');
```
2. Verify colors change immediately

### Step 6: Test Organization Login Flow

#### 6.1 Test Organization-Specific Login
1. Go to: `http://vishal-classes.localhost:3000/login`
2. Verify the login page shows "Vishal Classes" branding
3. Fill in login credentials
4. Check if organization context is preserved

#### 6.2 Test Login with Mock Authentication
Update the login function to work with mock data:

```javascript
// In OrganizationLogin.jsx, temporarily update handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.email || !formData.password) {
    toast.error('Please fill in all fields');
    return;
  }

  setLoading(true);
  try {
    // Mock authentication
    const mockUser = {
      id: 'user-1',
      email: formData.email,
      name: 'Test User',
      organizationId: 'org-1',
      role: 'user'
    };
    
    const mockToken = 'mock-jwt-token';
    
    // Store auth data
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userData', JSON.stringify(mockUser));
    localStorage.setItem('organizationId', organization?.id);
    localStorage.setItem('organizationName', organization?.name);
    
    toast.success('Login successful!');
    navigate('/dashboard');
  } catch (error) {
    toast.error(error.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

### Step 7: Test Data Isolation

#### 7.1 Test Organization Context in API Calls
1. Login to one organization
2. Create some test data (SuperStream, etc.)
3. Switch to different subdomain
4. Verify data is not accessible from other organization

#### 7.2 Test LocalStorage Isolation
1. Login to `vishal-classes.localhost:3000`
2. Check localStorage:
```javascript
console.log('Organization ID:', localStorage.getItem('organizationId'));
console.log('Organization Name:', localStorage.getItem('organizationName'));
```
3. Go to `demo-institute.localhost:3000`
4. Verify localStorage values are different

### Step 8: Test Super Admin Functionality

#### 8.1 Test Super Admin Routes
1. Go to: `http://localhost:3000/superadmin/organizations`
2. Verify Super Admin dashboard loads
3. Test organization creation form
4. Test organization editing

#### 8.2 Test Organization Management
1. Click "Add Organization" button
2. Fill in organization details:
   - Name: "Test Organization"
   - Subdomain: "test-org"
   - Colors: Choose custom colors
3. Submit form
4. Verify organization appears in list

### Step 9: Test Error Handling

#### 9.1 Test Invalid Subdomain
1. Go to: `http://invalid-subdomain.localhost:3000/login`
2. Verify error handling works
3. Check for appropriate error messages

#### 9.2 Test Missing Organization
1. Clear localStorage
2. Try to access dashboard
3. Verify redirect to login works

### Step 10: Performance Testing

#### 10.1 Test Loading States
1. Monitor network requests
2. Check loading indicators
3. Verify smooth transitions

#### 10.2 Test Branding Performance
1. Check CSS application speed
2. Verify no layout shifts
3. Test responsive design

## Debugging Tips

### Console Commands for Testing
```javascript
// Check current organization context
const context = getOrganizationContext();
console.log('Organization Context:', context);

// Check branding data
const branding = getCurrentBranding();
console.log('Branding:', branding);

// Test subdomain extraction
const subdomain = extractSubdomain();
console.log('Subdomain:', subdomain);

// Check localStorage
console.log('Organization ID:', localStorage.getItem('organizationId'));
console.log('Organization Name:', localStorage.getItem('organizationName'));
```

### Common Issues and Solutions

#### Issue 1: Subdomain not working
**Solution:** Check hosts file configuration and restart browser

#### Issue 2: Branding not applying
**Solution:** Check CSS custom properties in developer tools

#### Issue 3: Organization not detected
**Solution:** Check browser console for errors and verify subdomain format

#### Issue 4: CORS errors
**Solution:** Ensure Vite configuration allows subdomain hosts

## Next Steps After Testing

1. **Remove Mock Data** once backend is ready
2. **Test with Real Backend** endpoints
3. **Deploy to Staging** environment
4. **Configure Production DNS** and SSL
5. **Load Testing** with multiple organizations

## Testing Checklist

- [ ] Main domain loads correctly
- [ ] Subdomain routing works
- [ ] Organization branding applies
- [ ] Login flow works on subdomains
- [ ] Data isolation between organizations
- [ ] Super Admin dashboard functions
- [ ] Error handling works properly
- [ ] Performance is acceptable
- [ ] Responsive design works
- [ ] Console is clean (no errors)

Follow these steps systematically to ensure your multi-tenant system works correctly!
