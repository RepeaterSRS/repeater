'use client';

import { useState } from 'react';

import GoogleLogin from '@/components/GoogleLogin';
import { Button } from '@/components/ui/button';
import { loginAuthLoginPost } from '@/gen';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const apiURL = process.env.NEXT_PUBLIC_API_URL ?? '';
    const googleOAuthURI = '/oauth/login';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginAuthLoginPost({
                body: {
                    email: email,
                    password: password,
                },
            });
        } catch (err: any) {
            setError(err.detail ?? 'Failed to log in');
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 flex max-w-sm flex-col gap-2"
            >
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="border p-2"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="border p-2"
                />
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit">Login</Button>
            </form>
            <div className="mt-4 flex items-center justify-center gap-4">
                <a
                    href="/register"
                    className="whitespace-nowrap text-blue-600 hover:underline"
                >
                    Register
                </a>
                <div className="h-5 w-px bg-gray-300" />
                <GoogleLogin href={apiURL.concat(googleOAuthURI)} />
            </div>
        </div>
    );
}
