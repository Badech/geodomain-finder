'use client';

import { useRouter as useNextRouter, useParams as useNextParams, useSearchParams as useNextSearchParams, usePathname } from 'next/navigation';

// Navigation wrapper to replace react-router-dom
export function useNavigate() {
  const router = useNextRouter();
  return (path: string | number) => {
    if (typeof path === 'number') {
      if (path === -1) {
        router.back();
      } else {
        router.forward();
      }
    } else {
      router.push(path);
    }
  };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return useNextParams() as T;
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  return [searchParams] as const;
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname };
}
