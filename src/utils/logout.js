import { useRouter } from 'next/router';

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    router.push('/login');
  };

  return handleLogout;
};