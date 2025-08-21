import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
    const location = useLocation();

    const navLinkClasses = (path: string) =>
        `block p-4 text-left rounded-lg transition-colors ${
            location.pathname === path
                ? 'bg-olive text-white'
                : 'text-dark-brown hover:bg-light-green'
        }`;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-beige p-6 shadow-lg">
                <h1 className="text-2xl font-bold text-dark-brown mb-8">Menu</h1>
                <nav className="space-y-2">
                    <Link to="/" className={navLinkClasses('/')}>Dashboard</Link>
                    <Link to="/listings" className={navLinkClasses('/listings')}>Listings</Link>
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-auto">

                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;