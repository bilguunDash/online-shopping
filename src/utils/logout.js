import { useRouter } from 'next/router';

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('role');
    
    // Force rerender of components that check auth
    localStorage.setItem('lastAuthUpdate', Date.now().toString());
    
    router.push('/login');
  };

  return handleLogout;
};