"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedApiClient } from '@/lib/api-client';

interface Brand {
    id: number;
    name: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState('');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (!isLoggedIn) {
            router.push('/admin/login');
        } else {
            fetchBrands();
        }
    }, [router]);

    const fetchBrands = async () => {
        try {
            console.log('Fetching brands...');
            const response = await authenticatedApiClient.get('/brands');
            console.log('Brands response:', response.data);
            
            if (!response.data || !Array.isArray(response.data)) {
                console.error('Invalid brands data format:', response.data);
                return;
            }

            const formattedBrands = response.data.map((brand: any) => ({
                id: brand.ID || brand.id,
                name: brand.Name || brand.name
            }));
            
            console.log('Formatted brands:', formattedBrands);
            setBrands(formattedBrands);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching brands:', error);
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        router.push('/admin/login');
    };

    const handleDownload = async () => {
        if (!selectedOption) return;

        setIsDownloading(true);
        try {
            let endpoint = '';
            if (selectedOption === 'all') {
                endpoint = '/export/admin/brands';
            } else {
                endpoint = `/export/brands/${selectedOption}`;
            }

            console.log('Downloading from endpoint:', endpoint);
            const response = await authenticatedApiClient.get(endpoint, {
                responseType: 'blob'
            });

            if (!response.data) {
                console.error('No data received from download endpoint');
                return;
            }

            console.log('Download response received, creating download link...');
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `${selectedOption === 'all' ? 'all_brands' : `brand_${selectedOption}`}.csv`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            console.log('Download completed for file:', filename);
        } catch (error: any) {
            console.error('Error downloading CSV:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="/admin/scraper"
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Product Scraper
                            </a>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Download Reports</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
                                    Select Report Type
                                </label>
                                <select
                                    id="reportType"
                                    value={selectedOption}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    disabled={isDownloading}
                                >
                                    <option value="">Select a report</option>
                                    <option value="all">Summary of all brands</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <button
                                    onClick={handleDownload}
                                    disabled={!selectedOption || isDownloading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloading ? 'Downloading...' : 'Download CSV'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 