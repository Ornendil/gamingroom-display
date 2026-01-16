import React, { useEffect, useState } from 'react';
import WindowsIcon from './assets/icons/windows.svg';
import XboxIcon from './assets/icons/xbox.svg';
import PlayStationIcon from './assets/icons/playstation.svg';
import SwitchIcon from './assets/icons/switch.svg';
import UserIcon from './assets/icons/user.svg';
import './App.css';

const API_ENDPOINT = '/api/sessions/';
const TENANT_ENDPOINT = `/api/tenant/`;

const normalizeId = (id) => String(id).toLowerCase();

const App = () => {

    // State to hold the list of gaming sessions fetched from the API
    const [sessions, setSessions] = useState([]);

    // Tenant and devices state
    const [tenant, setTenant] = useState(null);
    const [devices, setDevices] = useState([]);

    // State to keep track of the current time, used for live updates
    // const timeOffset = - 5 * 60 * 1000;
    const timeOffset = 0;
    const [currentTime, setCurrentTime] = useState(new Date(Date.now() + timeOffset));


    const logoBase = process.env.PUBLIC_URL || "";
    const tenantSlug = tenant?.slug;

    const logoSrc = tenantSlug
        ? `${logoBase}/tenant-logos/${tenantSlug}.svg`
        : `${logoBase}/tenant-logos/logo.svg`; // fallback

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const res = await fetch(TENANT_ENDPOINT);
                if (!res.ok) throw new Error("Tenant fetch failed");
                const json = await res.json();
                if (json.status === "success" && json.tenant) {
                    setTenant(json.tenant);
                    setDevices(Array.isArray(json.tenant.devices) ? json.tenant.devices : []);
                }
            } catch (e) {
                console.error("Error fetching tenant:", e);
            }
        };

        fetchTenant();
    }, []);

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
    const iconForType = (type) => {
        if (type === "playstation") return PlayStationIcon;
        if (type === "xbox") return XboxIcon;
        if (type === "switch") return SwitchIcon;
        return WindowsIcon; // default: pc
    };

    const renderStations = () => {
        if (!devices.length) {
            return <div style={{ padding: 20 }}>Laster stasjoner…</div>;
        }

        const sortedDevices = [...devices].sort((a, b) => {
        // PCs first
        if (a.type === "pc" && b.type !== "pc") return -1;
        if (a.type !== "pc" && b.type === "pc") return 1;

        // Same type → stable order by id
        return a.id.localeCompare(b.id, undefined, { numeric: true });
        });


        return sortedDevices.map((device) => {
            const deviceId = normalizeId(device.id);

            // Filter sessions for this device
            const stationSessions = sessions.filter(
                (session) => normalizeId(session.computer) === deviceId
            );

            let currentSession = null;
            let overdueSession = null;
            let comingSession = null;
            const upcomingSessions = [];

            stationSessions.forEach((session) => {
                const startTime = new Date(currentTime.getTime());
                const [startHour, startMinute] = session.fra.split(":");
                startTime.setHours(startHour, startMinute, 0, 0);

                const endTime = new Date(currentTime.getTime());
                const [endHour, endMinute] = session.til.split(":");
                endTime.setHours(endHour, endMinute, 0, 0);

                const inFive = new Date(currentTime.getTime() + 5 * 60 * 1000);

                if (currentTime >= startTime && currentTime <= endTime) {
                    currentSession = session;
                } else if (inFive >= startTime && currentTime < startTime) {
                    comingSession = session;
                    upcomingSessions.push(session);
                } else if (currentTime < startTime) {
                    upcomingSessions.push(session);
                }
            });

            return (
                <div key={device.id} className={`station-card ${device.type === "pc" ? "col-pc" : "col-console"} ${deviceId}`}>
                    <div className="station-name">
                        <img alt="" src={iconForType(device.type)} />
                        <h2>{device.label}</h2>
                    </div>

                    {currentSession ? (
                        <div className="current-session active">
                            <p className="playerName">{currentSession.navn}</p>
                            <div className="playerTime">
                                <p>
                                    {currentSession.fra} - {currentSession.til}
                                </p>
                                {(() => {
                                    const [endHour, endMinute] = currentSession.til.split(":");
                                    const endTime = new Date(currentTime.getTime());
                                    endTime.setHours(endHour, endMinute, 0, 0);

                                    const timeLeftMs = endTime - currentTime;
                                    if (timeLeftMs > 0) {
                                        const timeLeftMinutes = Math.floor(timeLeftMs / (1000 * 60)) + 1;
                                        const unit = timeLeftMinutes === 1 ? "minutt" : "minutter";
                                        return (
                                            <p className="playerTimeRemaining">
                                                {timeLeftMinutes <= 30 ? `${timeLeftMinutes} ${unit} igjen` : ""}
                                            </p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    ) : overdueSession ? (
                        <div className="current-session overdue">
                            <p className="player">
                                <img alt="" className="playerIcon" src={UserIcon} /> {overdueSession.navn}
                            </p>
                            <p className="overdueSpan">(på overtid)</p>
                            <p>
                                {overdueSession.fra} - {overdueSession.til}
                            </p>
                        </div>
                    ) : comingSession ? (
                        <div className="current-session pending">
                            <p>Skal snart spille:</p>
                            <p className="playerName">{comingSession.navn}</p>
                            <div className="playerTime">
                                <p>
                                    {comingSession.fra} - {comingSession.til}
                                </p>
                                {(() => {
                                    const [startHour, startMinute] = comingSession.fra.split(":");
                                    const startTime = new Date(currentTime.getTime());
                                    startTime.setHours(startHour, startMinute, 0, 0);

                                    const timeLeftMs = startTime - currentTime;
                                    if (timeLeftMs > 0) {
                                        const timeLeftMinutes = Math.floor(timeLeftMs / (1000 * 60)) + 1;
                                        const unit = timeLeftMinutes === 1 ? "minutt" : "minutter";
                                        return (
                                            <p className="playerTimeRemaining">
                                                {timeLeftMinutes <= 30 ? `Om ${timeLeftMinutes} ${unit}` : ""}
                                            </p>
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

                    <div className="upcoming-sessions">
                        {upcomingSessions.length === 1 ? <h3>Neste spiller:</h3> : <h3>Neste spillere:</h3>}
                        <div className="upcoming-sessions-list">
                            {upcomingSessions.length > 0 ? (
                                upcomingSessions.slice(0, 6).map((session) => (
                                    <div className="upcoming-session" key={session.id}>
                                        <div className="upcomingTime">
                                            {session.fra} - {session.til}
                                        </div>
                                        <div>{session.navn}</div>
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
                    <img
                        className="App-logo"
                        src={logoSrc}
                        alt=""
                        onError={(e) => {
                            e.currentTarget.src = `${logoBase}/tenant-logos/logo.svg`;
                        }}
                     />
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
