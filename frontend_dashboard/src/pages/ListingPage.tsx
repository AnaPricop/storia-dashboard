import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Filters from '../components/Filters';
import { useFilters } from '../contexts/FiltersContext';
import qs from 'qs';
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = 'http://localhost:3001';
import ClipLoader from "react-spinners/ClipLoader";
interface Listing {
    TITLU: string;
    LOCATIE: string;
    PRET: number;
    NUMAR_CAMERE: string;
    SUPRAFATA_MP: number;
    PRET_PE_MP: number;
    LINK: string;
    DATA_POSTARE: string;
}

const ListingsPage: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { filters } = useFilters();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/listings`, {
                    params: {
                        ...filters,
                        page: currentPage,
                        pageSize: 15
                    },
                    paramsSerializer: params => {
                        return qs.stringify(params, { arrayFormat: 'brackets' })
                    }
                });
                setListings(response.data.listings); 
                setTotalPages(response.data.totalPages);
                setError(null);
            } catch (err) {
                setError('Failed to fetch listings.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const handler = setTimeout(() => {
            fetchData();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [filters, currentPage]);

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-brown mb-8">Listă Detaliată Anunțuri</h1>


            <Filters />

            <section className="bg-white rounded-lg shadow-md overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-700 p-6 md:p-6">Rezultate Căutare</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-gray-600">Data Postării</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Titlu</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Locație</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Preț (€)</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Suprafață (m²)</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Camere</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">€/m²</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Link</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center p-8">
                                    <div className="flex justify-center items-center">
                                        <ClipLoader
                                            color={"#A98467"}
                                            loading={loading}
                                            size={50}
                                            aria-label="Loading Spinner"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr><td colSpan={7} className="text-center p-8 text-red-500">{error}</td></tr>
                        )  : listings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center p-8">
                                    <p className="text-gray-500">Nu au fost gasite anunturi care sa corespunda filtrelor selectate.</p>
                                </td>
                            </tr>
                        ) : listings.map((listing, index) => (
                            <tr key={index} className="border-t border-gray-200 hover:bg-beige/30">
                                <td className="p-4 text-sm text-gray-600">{new Date(listing.DATA_POSTARE).toLocaleDateString('ro-RO')}</td>
                                <td className="p-4 text-sm text-gray-800">{listing.TITLU}</td>
                                <td className="p-4 text-sm text-gray-700">{listing.LOCATIE}</td>
                                <td className="p-4 text-sm text-gray-800">{listing.PRET.toLocaleString()}</td>
                                <td className="p-4 text-sm text-gray-700">{listing.SUPRAFATA_MP}</td>
                                <td className="p-4 text-sm text-gray-700">{listing.NUMAR_CAMERE}</td>
                                <td className="p-4 text-sm text-gray-800">{Math.round(listing.PRET_PE_MP).toLocaleString()}</td>
                                <td className="p-4 text-sm">
                                    <a href={listing.LINK} target="_blank" rel="noopener noreferrer" className="text-olive hover:underline">
                                        Vezi Anunț
                                    </a>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-tan text-white rounded-md disabled:bg-gray-300"
                >
                    Anterior
                </button>
                <span className="text-dark-brown">
                Pagina {currentPage} din {totalPages}
            </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 bg-tan text-white rounded-md disabled:bg-gray-300"
                >
                    Următor
                </button>
            </div>
        </div>
    );
}

export default ListingsPage;