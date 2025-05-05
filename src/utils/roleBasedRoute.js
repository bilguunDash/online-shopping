import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
      const userRole = localStorage.getItem('role');
      
      // If no token, redirect to login
      if (!token) {
        router.push('/login');
        return;
      }
      
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
      setIsAuthorized(true);
      setLoading(false);
    }, [router]);
    
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