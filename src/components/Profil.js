import React, { useEffect, useState, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import Calendrier from './Calendrier';
import { FaChevronLeft, FaChevronRight, FaHome, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import Incrementation from './Incrementation';

function Profil({ player, db }) {
    const [playerData, setPlayerData] = useState(null);
    const [formattedDate, setFormattedDate] = useState('');
    const [weeklyTotal, setWeeklyTotal] = useState(null);
    const [monthlyTotal, setMonthlyTotal] = useState(null);
    const [overallTotal, setOverallTotal] = useState(null);
    const [donnees, setDonnees] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const autoPlayRef = useRef(null);
    const [activeTab, setActiveTab] = useState('stats'); // Nouvel état pour gérer l'onglet actif

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % 4);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + 4) % 4);
    }, []);

    const resetAutoPlay = useCallback(() => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
        if (isAutoPlaying) {
            autoPlayRef.current = setInterval(nextSlide, 5000);
        }
    }, [isAutoPlaying, nextSlide]);

    const handleManualNavigation = useCallback((index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        resetAutoPlay();
    }, [resetAutoPlay]);

    useEffect(() => {
        resetAutoPlay();
        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [resetAutoPlay]);

    useEffect(() => {
        const date = new Date();
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
        setFormattedDate(formattedDate);

        const docRef = doc(db, 'date', formattedDate);

        // Fonction pour calculer les totaux
        const calculateTotals = (allData) => {
            const weekly = {};
            const monthly = {};
            const overall = {};

            Object.entries(allData).forEach(([dateKey, data]) => {
                if (data[player]) {
                    Object.entries(data[player]).forEach(([key, value]) => {
                        if (key !== 'ToDoList') {
                            // Total général
                            overall[key] = (overall[key] || 0) + value;

                            // Total du mois (si même mois)
                            if (dateKey.slice(2, 6) === formattedDate.slice(2, 6)) {
                                monthly[key] = (monthly[key] || 0) + value;
                            }

                            // Total de la semaine (si 7 derniers jours)
                            const docDate = new Date(dateKey.slice(4, 8), dateKey.slice(2, 4) - 1, dateKey.slice(0, 2));
                            const today = new Date();
                            const diffTime = Math.abs(today - docDate);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays <= 7) {
                                weekly[key] = (weekly[key] || 0) + value;
                            }
                        }
                    });
                }
            });

            setWeeklyTotal(weekly);
            setMonthlyTotal(monthly);
            setOverallTotal(overall);
        };

        // Écouter les changements en temps réel
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPlayerData(data[player]);
                
                // Mettre à jour les données globales
                setDonnees(prevDonnees => {
                    const newDonnees = { ...prevDonnees, [formattedDate]: data };
                    calculateTotals(newDonnees);
                    return newDonnees;
                });
            } else {
                // Initialiser les données si elles n'existent pas
                const initialData = {
                    spades: {
                        nbAlimentation: 0,
                        nbDoucheFroide: 0,
                        nbLangue: 0,
                        nbLecture: 0,
                        nbMeditation: 0,
                        nbPas: 0,
                        nbPomodoro: 0,
                        nbSport: 0,
                        nbToDolist: 0,
                        nbReseaux: 0,
                        nbBoulotAvantPlaisir: 0,
                        ToDoList: {}
                    },
                    valshine: {
                        nbAlimentation: 0,
                        nbDoucheFroide: 0,
                        nbLangue: 0,
                        nbLecture: 0,
                        nbMeditation: 0,
                        nbPas: 0,
                        nbPomodoro: 0,
                        nbSport: 0,
                        nbToDolist: 0,
                        nbReseaux: 0,
                        nbBoulotAvantPlaisir: 0,
                        ToDoList: {}
                    }
                };
                setDoc(docRef, initialData);
                setPlayerData(initialData[player]);
                setDonnees(prevDonnees => {
                    const newDonnees = { ...prevDonnees, [formattedDate]: initialData };
                    calculateTotals(newDonnees);
                    return newDonnees;
                });
            }
        });

        // Charger toutes les données initiales
        const fetchAllData = async () => {
            const allDocs = await getDocs(collection(db, 'date'));
            const allData = {};

            allDocs.forEach(doc => {
                allData[doc.id] = doc.data();
            });

            setDonnees(allData);
            calculateTotals(allData);
        };

        fetchAllData();

        // Nettoyage de l'écouteur lors du démontage du composant
        return () => unsubscribe();
    }, [player, db]);

    const slides = [
        { title: "Données du jour", data: playerData },
        { title: "Total de la semaine", data: weeklyTotal },
        { title: "Total du mois", data: monthlyTotal },
        { title: "Total général", data: overallTotal }
    ];

    const handleHomeClick = () => {
        window.location.href = '/'; // Redirige vers la page d'accueil
    };

    // Fonction pour rendre les données de manière sûre
    const renderData = (data) => {
        if (!data) return <p className="text-gray-500">Aucune donnée disponible</p>;
        
        return (
            <ul className="space-y-2">
                {Object.entries(data).map(([key, value]) => {
                    // Ignorer la clé ToDoList
                    if (key === 'ToDoList') return null;
                    
                    return (
                        <li key={key} className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-700">{key.replace('nb', '')}</span>
                            <span className="font-bold text-blue-600">{value}</span>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className='flex flex-col items-center justify-center h-auto'>
            <div className="w-full max-w-4xl mb-6">
                <div className="flex justify-center space-x-4 mb-4">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'stats' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        <FaChartBar className="inline-block mr-2" /> Statistiques
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        <FaCalendarAlt className="inline-block mr-2" /> Calendrier
                    </button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <>
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6 text-white text-center">Profil de {player}</h2>
                        
                        <div className="relative overflow-hidden">
                            <div 
                                className="flex transition-transform duration-500 ease-in-out" 
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {slides.map((slide, index) => (
                                    <div key={index} className="min-w-full px-4">
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <h3 className="text-2xl font-semibold mb-4 text-purple-600">{slide.title}</h3>
                                            {renderData(slide.data)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Boutons de navigation */}
                            <button 
                                onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-purple-600 p-3 rounded-full shadow transition-all duration-300"
                            >
                                <FaChevronLeft />
                            </button>
                            <button 
                                onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-purple-600 p-3 rounded-full shadow transition-all duration-300"
                            >
                                <FaChevronRight />
                            </button>

                            {/* Indicateurs de slide */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleManualNavigation(index)}
                                        className={`w-3 h-3 rounded-full ${
                                            currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <Incrementation player={player} date={formattedDate} db={db} />
                </>
            )}

            {activeTab === 'calendar' && (
                <Calendrier player={player} data={donnees} />
            )}
        </div>
    );
}

export default Profil;