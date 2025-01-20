import React, { useEffect, useState } from 'react';
import WindowsIcon from './assets/icons/windows.svg';
import XboxIcon from './assets/icons/xbox.svg';
import UserIcon from './assets/icons/user.svg';
import './App.css';

const API_ENDPOINT = '/gamingrom-admin/api/sessions/';
// const API_ENDPOINT = 'api/sessions/';

const App = () => {

    // State to hold the list of gaming sessions fetched from the API
    const [sessions, setSessions] = useState([]);

    // State to keep track of the current time, used for live updates
    // const timeOffset = - 5 * 60 * 1000;
    const timeOffset = 0;
    const [currentTime, setCurrentTime] = useState(new Date(Date.now() + timeOffset));

    useEffect(() => {
        let timeoutId;
    
        const fetchSessions = async () => {
            try {
                const response = await fetch(API_ENDPOINT);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSessions(data); // Set the fetched sessions into the state
            } catch (error) {
                console.error('Error fetching session data:', error);
            }
    
            // Recalculate the next interval dynamically
            const now = new Date(Date.now() + timeOffset);
            const hours = now.getHours();
            let nextInterval;
    
            if (hours >= 12 && hours < 16) {
                nextInterval = 5 * 1000; // Peak hours: every 5 seconds
            } else if (hours >= 0 && hours < 6) {
                nextInterval = 60 * 1000; // Night: every minute
            } else {
                nextInterval = 10 * 1000; // Off hours: every 10 seconds
            }
    
            // console.log(`Hours: ${hours}. Next interval: ${nextInterval / 1000} seconds`);
    
            // Schedule the next fetch dynamically
            timeoutId = setTimeout(fetchSessions, nextInterval);
        };
    
        fetchSessions(); // Initial fetch when the component mounts
    
        return () => {
            clearTimeout(timeoutId); // Cleanup on component unmount
        };
    }, []);

    // Effect to update the current time every second
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date(Date.now() + timeOffset)); // Update current time state
        }, 1000); // Update every second
        return () => clearInterval(clockInterval); // Clear interval on component unmount
    }, []);

    // Function to render all the gaming stations and their respective sessions
    const renderStations = () => {
        // Define the stations in the room, including PCs and Xboxes
        const stations = ['PC4', 'PC3', 'PC2', 'PC1', 'XBOX1', 'XBOX2'];

        return stations.map((station) => {
            // Filter sessions for the current station
            const stationSessions = sessions.filter(
                (session) => session.computer === station
            );

            let currentSession = null; // Holds the current session for this station
            let overdueSession = null; // Holds the overdue session if applicable
            let comingSession = null;
            const upcomingSessions = []; // Holds the upcoming sessions for this station

            // Loop through each session to categorize as current, overdue, or upcoming
            stationSessions.forEach((session) => {
                const startTime = new Date(currentTime.getTime());
                const [startHour, startMinute] = session.fra.split(':');
                startTime.setHours(startHour, startMinute, 0, 0);

                const endTime = new Date(currentTime.getTime());
                const [endHour, endMinute] = session.til.split(':');
                endTime.setHours(endHour, endMinute, 0, 0);
                
                const inFive = new Date(currentTime.getTime() + 5 * 60 * 1000);


                // Determine if the session is currently ongoing
                if (currentTime >= startTime && currentTime <= endTime) {
                    currentSession = session;
                // } else if (currentTime > endTime && !currentSession) {
                    // If the session has ended and there is no current session, mark it as overdue
                    // overdueSession = session;
                } else if (inFive >= startTime && currentTime < startTime) {
                    comingSession = session;
                    upcomingSessions.push(session);
                } else if (currentTime < startTime) {
                    // Otherwise, if the session is in the future, add it to upcoming sessions
                    upcomingSessions.push(session);
                }
            });

            // Render each station card with current and upcoming session information
            return (
                <div key={station} className={`station-card ${station.toLowerCase()}`}>
                    <div className='station-name'><img alt="" src={station.startsWith('X') ? XboxIcon : WindowsIcon}/> <h2>{station.replace(/(\d+)$/, ' $1')}</h2></div>
                    {/* Display the current session or overdue status */}
                    {currentSession ? (
                        <div className="current-session active">
                            <p className='playerName'>
                                {/* <img className='playerIcon' src={UserIcon}/> */}
                                {currentSession.navn}</p>
                            <div className='playerTime'>
                                <p>{currentSession.fra} - {currentSession.til}</p>
                                {/* Calculate and display the time left in the current session */}
                                {(() => {
                                    const [endHour, endMinute] = currentSession.til.split(':');
                                    const endTime = new Date(currentTime.getTime());
                                    endTime.setHours(endHour, endMinute, 0, 0);
                                    
                                    const timeLeftMs = endTime - currentTime;
                                    if (timeLeftMs > 0) {
                                        const timeLeftMinutes = Math.floor(timeLeftMs / (1000 * 60)) + 1;
                                        let PluralOrSingular = 'minutter';
                                        if (timeLeftMinutes === 1){
                                            PluralOrSingular = 'minutt';
                                        }
                                        return (
                                            <p className='playerTimeRemaining'> {timeLeftMinutes <= 30 ? `${timeLeftMinutes} ${PluralOrSingular} igjen` : ''}</p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    ) : overdueSession ? (
                        <div className="current-session overdue">
                            <p className='player'><img alt="" className='playerIcon' src={UserIcon}/> {overdueSession.navn}</p>
                            <p className='overdueSpan'>(på overtid)</p>
                            <p>{overdueSession.fra} - {overdueSession.til}</p>
                        </div>
                    ) : comingSession ? (
                        <div className="current-session pending">
                            <p>Skal snart spille:</p>
                            <p className='playerName'>
                                {comingSession.navn}</p>
                            <div className='playerTime'>
                                <p>{comingSession.fra} - {comingSession.til}</p>
                                {/* Calculate and display the time left in the current session */}
                                {(() => {
                                    const [startHour, startMinute] = comingSession.fra.split(':');
                                    const startTime = new Date(currentTime.getTime());
                                    startTime.setHours(startHour, startMinute, 0, 0);
                                    
                                    const timeLeftMs = startTime - currentTime;
                                    if (timeLeftMs > 0) {
                                        const timeLeftMinutes = Math.floor(timeLeftMs / (1000 * 60)) + 1;
                                        let PluralOrSingular = 'minutter';
                                        if (timeLeftMinutes === 1){
                                            PluralOrSingular = 'minutt';
                                        }
                                        return (
                                            <p className='playerTimeRemaining'> {timeLeftMinutes <= 30 ? `Om ${timeLeftMinutes} ${PluralOrSingular}` : ''}</p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="current-session">
                            <p>Ledig</p>
                        </div>
                    )}
                    {/* Display the upcoming sessions */}
                    <div className="upcoming-sessions">
                        {upcomingSessions.length === 1 ? <h3>Neste spiller:</h3> : <h3>Neste spillere:</h3>}
                        <div className="upcoming-sessions-list">
                            {upcomingSessions.length > 0 ? (
                                upcomingSessions.slice(0, 6).map((session) => (
                                    <div className='upcoming-session' key={session.id}>
                                        <div className='upcomingTime'>{session.fra} - {session.til} </div>
                                        <div>
                                            {/* <img className='playerIcon' src={UserIcon}/> */}
                                            {session.navn}</div>
                                    </div>
                                ))
                            ) : (
                            <div className="upcoming-session">
                                <p>Ingen i kø</p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            );
        });
    };

    // Render the main application
    return (
        <div className="App">
            <header className="App-header">
                <h1 className='title'>Hvem skal spille?</h1>
                {/* Display the current time */}
                <div className="clock">
                    {currentTime.toLocaleTimeString()}
                </div>
                <div>
                    <img className="App-logo" src={`${process.env.PUBLIC_URL}/images/logo.svg`} alt='' />
                </div>
            </header>
            {/* Render the gaming stations as a room map */}
            <div className="room-map">
                {renderStations()}
            </div>
            <div className='box'>
                <div className='wave -one'></div>
                <div className='wave -two'></div>
                <div className='wave -three'></div>
            </div>
        </div>
    );
};

export default App;
