import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { decodeToken } from './axios';

const protectRoute = (WrappedComponent) => {
  const Component = (props) => {
    const router = useRouter();

    useEffect(() => {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('jwt');
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        router.push('/login');
        return;
      }
      
      // Decode and validate the token
      const userInfo = decodeToken(token);
      if (!userInfo) {
        console.log('Invalid token, redirecting to login');
        // Token is invalid, redirect to login
        router.push('/login');
        return;
      }
      
      console.log('Route protection: User authenticated as', userInfo.firstName, userInfo.lastName, `(${userInfo.role})`);
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  Component.displayName = `ProtectRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return Component;
};

export default protectRoute;