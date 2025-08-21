import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import 'rc-slider/assets/index.css';

import MainLayout from './MainLayout';
import DashboardPage from './pages/DashboardPage';
import ListingsPage from './pages/ListingPage';
import { FiltersProvider } from './contexts/FiltersContext';

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <DashboardPage />,
            },
            {
                path: "/listings",
                element: <ListingsPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <FiltersProvider>
            <RouterProvider router={router} />
        </FiltersProvider>
    </React.StrictMode>
);