import React, { useState } from 'react';
import Connections from './components/Connections'; // Assurez-vous d'importer votre composant Connections
import Stats from './components/Stats'; // Assurez-vous d'importer votre composant Stats
import Profil from './components/Profil';
import { db } from './components/Firebase'; // Changer l'importation pour utiliser l'exportation nommée

function App() {
  const [currentComponent, setCurrentComponent] = useState(null);
  const [showMain, setShowMain] = useState(true); 
  const [player, setPlayer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  function handleConnection(isConnected) {
    setIsConnected(isConnected);
  }

  const handleButtonClick = (component) => {
    if (component === 'spades' || component === 'valshine') {
      setPlayer(component); // Définir le joueur directement
      setCurrentComponent(<Connections handleConnection={handleConnection} player={component} db={db}/>); // Afficher le composant Connections
    } else {
      setCurrentComponent(<Stats />); // Afficher le composant Stats
    }
    setShowMain(false); // Masquer la page principale
  };

  const handleBack = () => {
    setCurrentComponent(null); // Réinitialiser le composant affiché
    setShowMain(true); // Afficher la page principale
    setIsConnected(false); // Déconnecter l'utilisateur
    setPlayer(null); // Réinitialiser le joueur
  };

  return (
    <div className="bg-slate-100 w-full h-auto flex flex-col items-center justify-center overflow-hidden p-4">
      <img src="/assets/img/fulll.png" alt="Logo" className="w-auto h-32 md:h-52 fixed bottom-0 left-0 z-10" />
      <img src="/assets/img/full.png" alt="Logo" className="w-auto h-32 md:h-52 fixed bottom-0 right-0 z-10" />

      {isConnected ? ( // Si l'utilisateur est connecté, afficher Profil
        <div className=''>
          <p className='text-2xl font-bold absolute top-0 right-0 w-auto h-auto flex items-center justify-center '>Player: {player}</p>
          <Profil player={player} db={db}/>
          <button onClick={handleBack} className="mt-4 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">
            Retour
          </button>
        </div>
      ) : (
        showMain ? ( // Afficher la page principale si showMain est true
          <>
            <h1 className='text-2xl font-bold'> Célestin toi Chad</h1>
            <div className='flex flex-col md:flex-row items-center justify-center w-full h-1/4'>
              <button 
                className='bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded w-full md:w-1/4 h-full m-2'
                onClick={() => handleButtonClick('spades')}
              >
                Spades
              </button>
              <button 
                className='bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded w-full md:w-1/4 h-full m-2'
                onClick={() => handleButtonClick('valshine')}
              >
                Valshine
              </button>
            </div>
            <div className='flex flex-row items-center justify-center w-full h-1/4 m-2'>
              <button 
                className='bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded w-full md:w-1/2 h-full'
                onClick={() => handleButtonClick('visitor')}
              >
                Visitor
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {currentComponent}
            <button onClick={handleBack} className="mt-4 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">
              Retour
            </button>
          </div>
        )
      )}
    </div>
  );
}

export default App;