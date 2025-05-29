'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Configuration, ProfileAPIApi } from '@/generated-api';
import { useUserStore } from '@/stores/use-user-store';
import { toast } from 'sonner';
import SplashScreen from '@/components/splash-screen';

export const dynamic = 'force-dynamic';

function OAuthCallbackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    localStorage.setItem('accessToken', token);

    const config = new Configuration({
      accessToken: () => token,
    });

    const api = new ProfileAPIApi(config);

    const startTime = Date.now();

    api
      .getUserSettings()
      .then((userSettings) => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(2500 - elapsed, 0);

        setTimeout(() => {
          setUser(userSettings);
          router.replace('/main');
        }, delay);
      })
      .catch(() => {
        toast.error('Authentication failed. Please try again.');
        router.replace('/');
      });
  }, [searchParams, setUser, router]);

  return (
    <SplashScreen useNavigate={false} text="Signing in to your account..." />
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<SplashScreen useNavigate={false} text="Loading..." />}>
      <OAuthCallbackPageInner />
    </Suspense>
  );
}
