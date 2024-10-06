import React, { useState } from 'react';

function Calendrier({ player, data }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStats, setSelectedDateStats] = useState(null); // État pour les stats du jour sélectionné
    const [formattedDate, setFormattedDate] = useState(''); // État pour la date formatée

    const handlePreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        if (newDate >= new Date(2024, 8, 1)) { // Limite à septembre 2024
            setCurrentDate(newDate);
        }
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        if (newDate <= new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), 1)) { // Limite à 2 ans dans le futur
            setCurrentDate(newDate);
        }
    };

    const month = currentDate.getMonth(); // Mois actuel (0-11)
    const year = currentDate.getFullYear(); // Année actuelle

    // Obtenir le premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0); // Dernier jour du mois

    // Obtenir le nombre de jours dans le mois
    const daysInMonth = lastDayOfMonth.getDate();

    // Obtenir le jour de la semaine du premier jour du mois
    const startDay = firstDayOfMonth.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

    // Créer un tableau pour les jours du calendrier
    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-16 h-16"></div>); // Cases vides pour les jours avant le premier jour du mois
    }
// ... existing code ...
for (let day = 1; day <= daysInMonth; day++) {
    const formattedDateString = `${String(day).padStart(2, '0')}${String(month + 1).padStart(2, '0')}${year}`; // Format DDMMYYYY
    const hasStats = data[formattedDateString] && data[formattedDateString][player]; // Vérifier si des stats existent pour le joueur
    const stats = hasStats ? data[formattedDateString][player] : null; // Récupérer les stats du joueur

    // Vérifier si au moins une statistique est positive
    const hasPositiveStats = stats && (stats.nbPomodoro > 0 || stats.nbSport > 0 || stats.nbPas > 0 || stats.nbAlimentation > 0 || stats.nbMeditation > 0 || stats.nbLecture > 0 || stats.nbDoucheFroide > 0 || stats.nbLangue > 0);

    days.push(
        <div 
            key={day} 
            className={`w-16 h-16 flex items-center justify-center border border-gray-300 cursor-pointer hover:bg-gray-200 ${hasPositiveStats ? 'bg-green-200' : ''}`} // Colorier si des stats positives existent
            onClick={() => handleDateClick(day)}
        >
            {day}
        </div>
    );
}

console.log("Données pour le joueur le 01/10/2024:", data[player]); // Ajoutez ceci pour voir les donnéess
// ... existing code ...

    const handleDateClick = (day) => {
        const selectedDate = new Date(year, month, day);
        const formattedDateString = `${String(day).padStart(2, '0')}${String(month + 1).padStart(2, '0')}${year}`; // Format DDMMYYYY
        setFormattedDate(selectedDate.toLocaleDateString('fr-FR')); // Mettre à jour l'état avec la date formatée
    
        // Vérifier si des données existent pour cette date
        console.log("Date formatée:", formattedDateString); // Log de la date formatée
        console.log("Clés de data:", Object.keys(data)); // Log des clés de l'objet data
    
        const statsForDate = data[formattedDateString]; // Utiliser le format DDMMYYYY pour accéder aux données
        if (statsForDate && statsForDate[player]) { // Vérifier si les stats du joueur existent
            setSelectedDateStats(statsForDate[player]); // Accéder aux stats du joueur
        } else {
            setSelectedDateStats(null); // Pas de données pour ce jour
        }
    };

    return (
        <>
        <div className="flex flex-row items-center justify-center">
            <div>
            
            <div className="flex justify-between mb-4">
                <button onClick={handlePreviousMonth} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Mois Précédent
                </button>
                <h1 className="text-2xl font-bold mb-4">{currentDate.toLocaleString('default', { month: 'long' })} {year}</h1>
                <button onClick={handleNextMonth} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Mois Suivant
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
            </div>

            <div className="mt-4">
                <h2 className="text-xl font-semibold">Stats du {formattedDate}</h2>
                {selectedDateStats ? (
                    <ul>
                        <li>Pomodoros: {selectedDateStats.nbPomodoro}</li>
                        <li>Sports: {selectedDateStats.nbSport}</li>
                        <li>Pas: {selectedDateStats.nbPas}</li>
                        <li>Alimentation: {selectedDateStats.nbAlimentation}</li>
                        <li>Meditation: {selectedDateStats.nbMeditation}</li>
                        <li>Lecture: {selectedDateStats.nbLecture}</li>
                        <li>Douche froide: {selectedDateStats.nbDoucheFroide}</li>
                        <li>Langue: {selectedDateStats.nbLangue}</li>
                        <li>Reseaux: {selectedDateStats.nbReseaux}</li>
                        <li>Boulot avant Plaisir: {selectedDateStats.nbBoulotAvantPlaisir}</li>
                        <li>ToDoList Fait: {selectedDateStats.nbToDolist}</li>

                    </ul>
                ) : (
                    <p>Pas de données pour ce jour. </p> // Message si aucune donnée n'est disponible
                )}
            </div>
        </div>
        </>
    );
}

export default Calendrier;