import { useState, useEffect } from 'react';
import './SubnettingGame.css';
import {
    generateRandomIPAddress,
    generateRandomSubnetMask,
    calculateNetworkAddress,
    calculateBroadcastAddress,
    calculateUsableHosts,
    isValidIPAddress
} from '../utils/ipUtils';

interface Exercise {
    ipAddress: string;
    subnetMask: number;
    networkAddress: string;
    broadcastAddress: string;
    usableHosts: number;
}

const SubnettingGame = () => {
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [score, setScore] = useState<number>(0);
    const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [userAnswers, setUserAnswers] = useState({
        networkAddress: '',
        broadcastAddress: '',
        usableHosts: ''
    });
    const [showResults, setShowResults] = useState<boolean>(false);
    const [gameComplete, setGameComplete] = useState<boolean>(false);

    const generateNewExercise = () => {
        const ipAddress = generateRandomIPAddress();
        const subnetMask = generateRandomSubnetMask();
        const networkAddress = calculateNetworkAddress(ipAddress, subnetMask);
        const broadcastAddress = calculateBroadcastAddress(ipAddress, subnetMask);
        const usableHosts = calculateUsableHosts(subnetMask);

        setCurrentExercise({
            ipAddress,
            subnetMask,
            networkAddress,
            broadcastAddress,
            usableHosts
        });
        setUserAnswers({
            networkAddress: '',
            broadcastAddress: '',
            usableHosts: ''
        });
        setShowResults(false);
    };

    useEffect(() => {
        generateNewExercise();
    }, []);

    const handleSubmit = () => {
        if (!currentExercise) return;

        let exerciseScore = 0;
        if (userAnswers.networkAddress === currentExercise.networkAddress) exerciseScore++;
        if (userAnswers.broadcastAddress === currentExercise.broadcastAddress) exerciseScore++;
        if (Number(userAnswers.usableHosts) === currentExercise.usableHosts) exerciseScore++;

        setScore(prevScore => prevScore + exerciseScore);
        setShowResults(true);

        if (currentRound === 10) {
            setGameComplete(true);
        }
    };

    const handleNextExercise = () => {
        if (currentRound < 10) {
            setCurrentRound(prev => prev + 1);
            generateNewExercise();
        }
    };

    const handleRestart = () => {
        setCurrentRound(1);
        setScore(0);
        setGameComplete(false);
        generateNewExercise();
    };

    return (
        <div className="subnetting-game">
            <div className="game-header">
                <h2>Procvičování subnetů</h2>
                <div className="game-info">
                    <span>Kolo: {currentRound}/10</span>
                    <span>Skore: {score}/30</span>
                    <button className="help-button" onClick={() => setShowHelp(!showHelp)}>❓</button>
                </div>
            </div>

            <div className={`help-panel ${showHelp ? 'show' : ''}`}>
                <h3>Jak počítat subnety - Jednoduchý průvodce</h3>
                <div className="help-content">
                    <section>
                        <h4>1. Síťová adresa (Network Address)</h4>
                        <p>Síťová adresa je první použitelná adresa v síti.</p>
                        <p><strong>Jak ji spočítat:</strong></p>
                        <ul>
                            <li>Všechny čísla za maskou změňte na 0</li>
                        </ul>
                        <p><strong>Příklad:</strong></p>
                        <p>IP adresa: 192.168.1.100 s maskou /24</p>
                        <p>Síťová adresa bude: 192.168.1.0</p>
                    </section>
                    
                    <section>
                        <h4>2. Broadcast adresa</h4>
                        <p>Broadcast adresa je poslední adresa v síti.</p>
                        <p><strong>Jak ji spočítat:</strong></p>
                        <ul>
                            <li>Všechny čísla za maskou změňte na 255</li>
                        </ul>
                        <p><strong>Příklad:</strong></p>
                        <p>IP adresa: 192.168.1.100 s maskou /24</p>
                        <p>Broadcast adresa bude: 192.168.1.255</p>
                    </section>

                    <section>
                        <h4>3. Počet použitelných hostů</h4>
                        <p>Jednoduchá tabulka pro rychlý výpočet:</p>
                        <div className="host-table">
                            <p>/24 → 254 hostů</p>
                            <p>/25 → 126 hostů</p>
                            <p>/26 → 62 hostů</p>
                            <p>/27 → 30 hostů</p>
                            <p>/28 → 14 hostů</p>
                            <p>/29 → 6 hostů</p>
                            <p>/30 → 2 hosty</p>
                        </div>
                    </section>

                    <section>
                        <h4>Užitečné tipy</h4>
                        <ul>
                            <li>Síťová adresa končí vždy 0</li>
                            <li>Broadcast adresa končí vždy 255</li>
                            <li>Použitelné adresy jsou všechny mezi síťovou a broadcast adresou</li>
                        </ul>
                    </section>
                </div>
            </div>

            {currentExercise && !gameComplete && (
                <div className="exercise-container">
                    <div className="exercise-info">
                        <h3>Kolo {currentRound}</h3>
                        <p>IP Addresa: {currentExercise.ipAddress}</p>
                        <p>Maska sítě: /{currentExercise.subnetMask}</p>
                    </div>

                    <div className="answer-form">
                        <div className="form-group">
                            <label>Network Address:</label>
                            <input
                                type="text"
                                value={userAnswers.networkAddress}
                                onChange={(e) => setUserAnswers(prev => ({ ...prev, networkAddress: e.target.value }))}
                                disabled={showResults}
                            />
                        </div>
                        <div className="form-group">
                            <label>Broadcast Address:</label>
                            <input
                                type="text"
                                value={userAnswers.broadcastAddress}
                                onChange={(e) => setUserAnswers(prev => ({ ...prev, broadcastAddress: e.target.value }))}
                                disabled={showResults}
                            />
                        </div>
                        <div className="form-group">
                            <label>Čislo hostů v síti:</label>
                            <input
                                type="number"
                                value={userAnswers.usableHosts}
                                onChange={(e) => setUserAnswers(prev => ({ ...prev, usableHosts: e.target.value }))}
                                disabled={showResults}
                            />
                        </div>

                        {!showResults ? (
                            <button onClick={handleSubmit}>Potvrdit</button>
                        ) : (
                            <div className="results">
                                <h4>Výsledek:</h4>
                                <p className={userAnswers.networkAddress === currentExercise.networkAddress ? 'correct' : 'incorrect'}>
                                    Network Address: {currentExercise.networkAddress}
                                </p>
                                <p className={userAnswers.broadcastAddress === currentExercise.broadcastAddress ? 'correct' : 'incorrect'}>
                                    Broadcast Address: {currentExercise.broadcastAddress}
                                </p>
                                <p className={Number(userAnswers.usableHosts) === currentExercise.usableHosts ? 'correct' : 'incorrect'}>
                                    Počet hostů: {currentExercise.usableHosts}
                                </p>
                                <button onClick={handleNextExercise}>Další</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {gameComplete && (
                <div className="game-complete">
                    <h3>Hra je u konce!</h3>
                    <p>Finální skore: {score}/30</p>
                    <button onClick={handleRestart}>Další hra</button>
                </div>
            )}
        </div>
    );
};

export default SubnettingGame;