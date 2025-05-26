'use client';

import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
