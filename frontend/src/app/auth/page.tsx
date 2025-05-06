'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SignUpForm } from '@/components/auth/signup-form';
import { PathosTextLogo } from '@/components/icons/pathos-text-logo';

export default function AuthPage() {
  // TODO: 이미지 스플래쉬 구현

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="bg-primary min-h-svh grid lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/images/login-splash.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute left-10 top-10 z-10">
          <PathosTextLogo className="h-auto w-36 text-white" />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {mode === 'login' ? (
              <LoginForm onSwitch={() => setMode('signup')} />
            ) : (
              <SignUpForm onSwitch={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
