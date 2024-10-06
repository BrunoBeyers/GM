import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

function Connections({ handleConnection, player, db }) {
    const [code, setCode] = useState(['', '', '', '']);
    const [oldPassword, setOldPassword] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (!db) {
            console.error("La référence à la base de données n'est pas définie");
            return;
        }

        const initializePasswords = async () => {
            try {
                const docRef = doc(db, 'players', player);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    const initialPassword = player === 'spades' ? process.env.REACT_APP_SPADES_PASSWORD : process.env.REACT_APP_VALSHINE_PASSWORD;
                    const hashedPassword = await bcrypt.hash(initialPassword, 10);
                    await setDoc(docRef, { password: hashedPassword });
                    console.log(`Document créé pour ${player}`);
                }
            } catch (error) {
                console.error("Erreur lors de l'initialisation du mot de passe:", error);
            }
        };

        initializePasswords();
    }, [db, player]);

    const handleInputChange = (index, value, setter) => {
        if (value.length <= 1 && /^[0-9]*$/.test(value)) {
            setter(prev => {
                const newCode = [...prev];
                newCode[index] = value;
                return newCode;
            });

            if (value && index < 3) {
                const nextInput = document.getElementById(`input-${setter.name}-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleLogin = async () => {
        const password = code.join('');
        if (code.some(digit => digit === '')) {
            setError('Veuillez entrer tous les chiffres du code.');
            return;
        }

        try {
            const docRef = doc(db, 'players', player);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const hashedPassword = docSnap.data().password;
                const isCorrect = await bcrypt.compare(password, hashedPassword);
                if (isCorrect) {
                    console.log("Connexion réussie !");
                    setError('');
                    handleConnection(true);
                } else {
                    setError('Code incorrect.');
                }
            } else {
                setError('Erreur: Joueur non trouvé.');
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du mot de passe:", error);
            setError('Erreur lors de la connexion.');
        }
    };

    const handleChangePassword = async () => {
        const oldPass = oldPassword.join('');
        const newPass = newPassword.join('');

        if (oldPassword.some(digit => digit === '') || newPassword.some(digit => digit === '')) {
            setError('Veuillez entrer tous les chiffres des codes.');
            setSuccessMessage('');
            return;
        }

        try {
            const docRef = doc(db, 'players', player);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const hashedPassword = docSnap.data().password;
                const isCorrect = await bcrypt.compare(oldPass, hashedPassword);
                if (isCorrect) {
                    const hashedNewPassword = await bcrypt.hash(newPass, 10);
                    await setDoc(docRef, { password: hashedNewPassword }, { merge: true });
                    console.log('Mot de passe mis à jour avec succès');
                    setSuccessMessage('Mot de passe changé avec succès !');
                    setError('');
                    setIsChangingPassword(false);
                    setCode(['', '', '', '']);
                    setOldPassword(['', '', '', '']);
                    setNewPassword(['', '', '', '']);
                } else {
                    setError('Ancien mot de passe incorrect.');
                    setSuccessMessage('');
                }
            } else {
                setError('Erreur: Joueur non trouvé.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error("Erreur lors du changement de mot de passe:", error);
            setError('Erreur lors du changement de mot de passe.');
            setSuccessMessage('');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (isChangingPassword) {
                handleChangePassword();
            } else {
                handleLogin();
            }
        }
    };

    return (
        <div className='flex flex-col items-center justify-center w-screen h-screen'>
            <p className='font-bold'>
                {isChangingPassword ? 'Changer le mot de passe' : `CODE pour ${player}`}
            </p>
            {!isChangingPassword && (
                <div className="flex space-x-2 mb-4">
                    {code.map((digit, index) => (
                        <input 
                            key={index}
                            id={`input-setCode-${index}`}
                            type="password"
                            maxLength={1}
                            placeholder="_" 
                            value={digit} 
                            onChange={(e) => handleInputChange(index, e.target.value, setCode)}
                            onKeyDown={handleKeyDown}
                            required
                            className="w-12 h-12 text-center border border-gray-300 rounded"
                        />
                    ))}
                </div>
            )}
            {isChangingPassword && (
                <>
                    <p className="mt-4 mb-2">Ancien mot de passe:</p>
                    <div className="flex space-x-2 mb-4">
                        {oldPassword.map((digit, index) => (
                            <input 
                                key={index}
                                id={`input-setOldPassword-${index}`}
                                type="password"
                                maxLength={1}
                                placeholder="_" 
                                value={digit} 
                                onChange={(e) => handleInputChange(index, e.target.value, setOldPassword)}
                                onKeyDown={handleKeyDown}
                                required
                                className="w-12 h-12 text-center border border-gray-300 rounded"
                            />
                        ))}
                    </div>
                    <p className="mt-4 mb-2">Nouveau mot de passe:</p>
                    <div className="flex space-x-2 mb-4">
                        {newPassword.map((digit, index) => (
                            <input 
                                key={index}
                                id={`input-setNewPassword-${index}`}
                                type="password"
                                maxLength={1}
                                placeholder="_" 
                                value={digit} 
                                onChange={(e) => handleInputChange(index, e.target.value, setNewPassword)}
                                onKeyDown={handleKeyDown}
                                required
                                className="w-12 h-12 text-center border border-gray-300 rounded"
                            />
                        ))}
                    </div>
                </>
            )}
            <button 
                onClick={isChangingPassword ? handleChangePassword : handleLogin} 
                className="mt-4 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded"
            >
                {isChangingPassword ? 'Confirmer le changement' : 'Se connecter'}
            </button>
            <button 
                onClick={() => {
                    setIsChangingPassword(!isChangingPassword);
                    setCode(['', '', '', '']);
                    setOldPassword(['', '', '', '']);
                    setNewPassword(['', '', '', '']);
                    setError('');
                    setSuccessMessage('');
                }} 
                className="mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
                {isChangingPassword ? 'Annuler' : 'Changer le mot de passe'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </div>
    );
}

export default Connections;