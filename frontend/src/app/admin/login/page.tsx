"use client"

import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();

    const handleEnterDashboard = () => {
        localStorage.setItem('adminLoggedIn', 'true');
        router.push('/admin/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Admin Dashboard
                    </h2>
                </div>
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleEnterDashboard}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Enter Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
} 