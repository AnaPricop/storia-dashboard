import React, {useState, useEffect} from 'react';
import {Outlet, Link, useLocation} from 'react-router-dom';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useEffect(() => {

        const timer = setTimeout(() => {
            document.body.classList.add('layout-ready');
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    const navLinkClasses = (path: string) =>
        `block p-3 text-left rounded-lg transition-colors text-lg ${
            location.pathname === path
                ? 'bg-olive text-white'
                : 'text-dark-brown hover:bg-light-green'
        }`;

    const SidebarContent = () => (
        <>
            <h1 className="text-3xl font-bold text-dark-brown mb-10">Menu</h1>
            <nav className="space-y-4">
                <Link to="/" className={navLinkClasses('/')}>Dashboard</Link>
                <Link to="/listings" className={navLinkClasses('/listings')}>Listings</Link>
            </nav>
        </>
    );

    return (
        <div className="flex min-h-screen  w-screen bg-gray-100 font-sans">

            <aside className="hidden lg:block w-64 bg-beige p-6 shadow-lg">
                <SidebarContent/>
            </aside>

            <div className="flex-1 flex flex-col w-full">
                <header className="lg:hidden flex justify-between items-center bg-beige p-4 shadow-md">
                    <h1 className="text-xl font-bold text-dark-brown">Menu</h1>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-dark-brown p-2 rounded-md hover:bg-light-green"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet/>
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <aside className="fixed top-0 left-0 h-full w-64 bg-beige p-6 shadow-lg z-30">
                        <SidebarContent/>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default MainLayout;