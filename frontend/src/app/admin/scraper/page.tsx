"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedApiClient } from '@/lib/api-client';

interface ScrapedProduct {
    name: string;
    price: number;
    discountedPrice: number | null;
    imageURL: string;
    color: string | null;
    size: string | null;
    material: string | null;
    productURL: string;
    description: string;
    isEditorsPick: boolean;
    categoryId: number | null;
    subCategoryId: number | null;
    brandId: number | null;
}

export default function ShopifyScraper() {
    const router = useRouter();
    const [directStoreUrl, setDirectStoreUrl] = useState('');
    const [shopifyStoreUrl, setShopifyStoreUrl] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<ScrapedProduct[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleDirectScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authenticatedApiClient.post('/api/scraper/shopify/direct', {
                storeName: directStoreUrl
            });

            setProducts(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to scrape products');
            console.error('Scraping error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApiScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Extract store name from URL (e.g., https://egodials.com -> egodials)
            const storeName = shopifyStoreUrl
                .replace(/https?:\/\//, '') // Remove http:// or https://
                .replace(/\.myshopify\.com$/, '') // Remove .myshopify.com if present
                .replace(/\.com$/, '') // Remove .com
                .split('/')[0]; // Get the first part before any path
            
            const response = await authenticatedApiClient.post('/api/scraper/shopify/api', {
                storeName,
                storefrontAccessToken: apiToken
            });

            setProducts(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to scrape products');
            console.error('Scraping error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (index: number, field: keyof ScrapedProduct, value: string | number | boolean | null) => {
        const updatedProducts = [...products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value
        };
        setProducts(updatedProducts);
    };

    const handleSave = async () => {
        try {
            await authenticatedApiClient.post('/api/scraper/save', {
                products
            });
            alert('Products saved successfully!');
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to save products');
            console.error('Save error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Product Scraper</h1>
                
                {/* Scraping Methods Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Direct Access Method */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Method 1: Direct Access</h2>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Any Website</span>
                        </div>
                        <p className="text-gray-600 mb-4">Use this method for any public website.</p>
                        <form onSubmit={handleDirectScrape} className="space-y-4">
                            <div>
                                <label htmlFor="directStoreUrl" className="block text-sm font-medium text-gray-700">
                                    Website URL
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="directStoreUrl"
                                        id="directStoreUrl"
                                        value={directStoreUrl}
                                        onChange={(e) => setDirectStoreUrl(e.target.value)}
                                        className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="e.g., https://example.com"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !directStoreUrl}
                                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Scraping...' : 'Scrape Products'}
                            </button>
                        </form>
                    </div>

                    {/* Storefront API Method */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Method 2: Shopify Admin API</h2>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Shopify Only</span>
                        </div>
                        <p className="text-gray-600 mb-4">Use this method for Shopify stores with Admin API access.</p>
                        <form onSubmit={handleApiScrape} className="space-y-4">
                            <div>
                                <label htmlFor="shopifyStoreUrl" className="block text-sm font-medium text-gray-700">
                                    Shopify Store URL
                                </label>
                                <input
                                    type="text"
                                    name="shopifyStoreUrl"
                                    id="shopifyStoreUrl"
                                    value={shopifyStoreUrl}
                                    onChange={(e) => setShopifyStoreUrl(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="e.g., mystore.myshopify.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700">
                                    Admin API Token
                                </label>
                                <input
                                    type="password"
                                    name="apiToken"
                                    id="apiToken"
                                    value={apiToken}
                                    onChange={(e) => setApiToken(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter your Admin API token"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !shopifyStoreUrl || !apiToken}
                                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Scraping...' : 'Scrape Using API'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6">
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                            {error}
                        </div>
                    </div>
                )}

                {/* Products Table */}
                {products.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-medium">Scraped Products</h2>
                                <p className="mt-1 text-sm text-gray-500">{products.length} products found</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Save Products
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image URL</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product URL</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Editor's Pick</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={product.name}
                                                    onChange={(e) => handleEdit(index, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <textarea
                                                    value={product.description}
                                                    onChange={(e) => handleEdit(index, 'description', e.target.value)}
                                                    className="w-full px-2 py-1 border rounded"
                                                    rows={3}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    value={product.price}
                                                    onChange={(e) => handleEdit(index, 'price', parseFloat(e.target.value))}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    value={product.discountedPrice || ''}
                                                    onChange={(e) => handleEdit(index, 'discountedPrice', e.target.value ? parseFloat(e.target.value) : null)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={product.imageURL}
                                                    onChange={(e) => handleEdit(index, 'imageURL', e.target.value)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={product.color || ''}
                                                    onChange={(e) => handleEdit(index, 'color', e.target.value || null)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={product.size || ''}
                                                    onChange={(e) => handleEdit(index, 'size', e.target.value || null)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={product.material || ''}
                                                    onChange={(e) => handleEdit(index, 'material', e.target.value || null)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={product.productURL}
                                                    onChange={(e) => handleEdit(index, 'productURL', e.target.value)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={product.isEditorsPick}
                                                    onChange={(e) => handleEdit(index, 'isEditorsPick', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 