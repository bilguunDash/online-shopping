import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { decodeToken } from './axios';

/**
 * Higher-order component for role-based route protection
 * @param {React.Component} WrappedComponent - The component to wrap with role protection
 * @param {string} allowedRole - The role allowed to access this route ("ADMIN" or "USER")
 * @returns {React.Component} - Protected component
 */
const roleBasedRoute = (WrappedComponent, allowedRole = "USER") => {
  const Component = (props) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('jwt');
      
      // If no token, redirect to login
      if (!token) {
        console.log("No authentication token found, redirecting to login");
        router.push('/login');
        return;
      }
      
      // Decode token to get user info
      const userInfo = decodeToken(token);
      
      // If token is invalid, redirect to login
      if (!userInfo) {
        console.log("Invalid token, redirecting to login");
        router.push('/login');
        return;
      }
      
      const userRole = userInfo.role;
      console.log(`User role: ${userRole}, Required role: ${allowedRole}`);
      
      // For ADMIN routes, only allow ADMIN users
      if (allowedRole === "ADMIN" && userRole !== "ADMIN") {
        console.log("Access denied: Only admins can access this page");
        router.push('/home');
        return;
      }
      
      // For USER routes, deny access to ADMIN users (they should use admin routes)
      if (allowedRole === "USER" && userRole === "ADMIN") {
        console.log("Access denied: Admins should use admin pages");
        router.push('/admin/AdminHome');
        return;
      }
      
      // User is authorized
      console.log("User authorized to access this route");
      setIsAuthorized(true);
      setLoading(false);
    }, [router, allowedRole]);
    
    // Show nothing while checking authorization or redirecting
    if (loading && !isAuthorized) {
      return null;
    }
    
    // Render the wrapped component if authorized
    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };

  Component.displayName = `RoleBasedRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return Component;
};

export default roleBasedRoute; 