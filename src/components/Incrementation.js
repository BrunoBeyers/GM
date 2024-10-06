import React from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';

function Incrementation({player, date, db}) {
    const handleIncrement = async (stat) => {
        const docRef = doc(db, 'date', date);
        try {
            await updateDoc(docRef, {
                [`${player}.${stat}`]: increment(1)
            });
            console.log(`Incremented ${stat} for ${player}`);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const stats = [
        'nbAlimentation', 'nbDoucheFroide', 'nbLangue', 'nbLecture',
        'nbMeditation', 'nbPas', 'nbPomodoro', 'nbSport',
        'nbToDolist', 'nbReseaux', 'nbBoulotAvantPlaisir'
    ];

    return (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">Incrémentation pour {player}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <button
                        key={stat}
                        onClick={() => handleIncrement(stat)}
                        className="flex items-center justify-between p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <span>{stat.replace('nb', '')}</span>
                        <span className="text-xl font-bold">+</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Incrementation;