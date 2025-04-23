import { useRouter } from 'next/router';
import { useEffect } from 'react';

const protectRoute = (WrappedComponent) => {
  const Component = (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        router.push('/login');
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  Component.displayName = `ProtectRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return Component;
};

export default protectRoute;