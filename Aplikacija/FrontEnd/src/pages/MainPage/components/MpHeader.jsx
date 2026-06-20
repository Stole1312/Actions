import { useState, useEffect, useRef } from "react"
import styles from "./MpHeader.module.css"
import { 
    MagnifyingGlassIcon, 
    CalendarIcon, 
    MapPinIcon, 
    BellIcon 
} from "@heroicons/react/24/outline"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function MpHeader(props) {
    const profilePicture = localStorage.getItem("profilePicture");
    
    const [types, setTypes] = useState([]);
    const [activeType, setActiveType] = useState(null);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [cityInput, setCityInput] = useState(""); 
    const [suggestions, setSuggestions] = useState([]); 
    const [selectedCoordinates, setSelectedCoordinates] = useState(null); 
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const dropdownRef = useRef(null);

    useEffect(() => {
        async function fetchTypes() {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
                const response = await fetch(`${baseUrl}/Action/GetActionTypes`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                setTypes([{ id: null, name: "Sve" }, ...data]);
            } catch (error) {
                console.error("Greška pri povlačenju tipova:", error);
            }
        }

        fetchTypes();
    }, []);

    //za uzimanje lokacije korisnika
    useEffect(() => {
        async function detectLocationByIP() {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
                const response = await fetch(`${baseUrl}/Action/GetClientLocation`);
                
                if (!response.ok) throw new Error("Greška na našem serveru");

                const data = await response.json();
                
                if (data && data.cityName) {
                    setCityInput(`${data.cityName}, ${data.countryName}`);
                    setSelectedCoordinates({
                        lat: data.latitude,
                        lng: data.longitude
                    });
                }
            } catch (error) {
                console.error("API nije odgovorio salje se na Bg", error);
                setCityInput("Beograd, Srbija");
                setSelectedCoordinates({ lat: 44.7871, lng: 20.4489 });
            }
        }
        
        detectLocationByIP();
    }, []);

    useEffect(() => {
        if (cityInput.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://photon.komoot.io/api/?q=${encodeURIComponent(cityInput)}&limit=15`
                );
                
                if (!response.ok) throw new Error("Mrežna greška");
                const data = await response.json();
                
                if (data && data.features) {
                    const filteredFeatures = data.features.filter(f => {
                        const osmValue = f.properties.osm_value;
                        return osmValue === "city" || osmValue === "town" || osmValue === "village";
                    });

                    const places = filteredFeatures.slice(0, 5).map(f => ({
                        name: f.properties.name,
                        country: f.properties.country || "",
                        state: f.properties.state || "",
                        coordinates: {
                            lat: f.geometry.coordinates[1],
                            lng: f.geometry.coordinates[0]
                        }
                    }));
                    
                    setSuggestions(places);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Greška sa Geocoding API-jem:", error);
                setSuggestions([]);
            }
        }, 400); // Debounce pauza od 400ms

        return () => clearTimeout(delayDebounceFn);
    }, [cityInput]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const handleSelectSuggestion = (place) => {
        const displayName = place.state ? `${place.name}, ${place.state}, ${place.country}` : `${place.name}, ${place.country}`;
        setCityInput(displayName);
        setSelectedCoordinates(place.coordinates);
        setSuggestions([]);
        setShowSuggestions(false);
        
    };

    return (
        <header className={styles["header-main-page"]}>
            
            <div className={styles["upper-header"]}>
                {/* Search */}
                <div className={styles["search-container"]}>
                    <MagnifyingGlassIcon className={styles["input-icon"]} />
                    <input
                        type="text"
                        placeholder="Search akcije..."
                        className={styles["custom-input"]}
                    />
                </div>

                {/* kalendar */}
                <div className={styles["datepicker-container"]}>
                    <CalendarIcon className={styles["input-icon"]} />
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateChange}
                        isClearable={true}
                        placeholderText="Select date range"
                        className={styles["custom-datepicker"]}
                        selected={startDate} 
                    />
                </div>

                {/* input sa lokacijom */}
                <div className={styles["dropdown-container"]} ref={dropdownRef}>
                    <MapPinIcon className={styles["input-icon-dropdown"]} />
                    <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => {
                            setCityInput(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Unesite grad..."
                        className={styles["custom-input-location"]}
                    />
                    
                    {/* lista predloga */}
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className={styles["autocomplete-dropdown"]}>
                            {suggestions.map((place, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => handleSelectSuggestion(place)}
                                    className={styles["autocomplete-item"]}
                                >
                                    <strong>{place.name}</strong> 
                                    <span className={styles["country-span"]}>
                                        {place.state ? `, ${place.state}` : ""}, {place.country}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* notifikacije i profil slika */}
                <div className={styles["right-side-container"]}>
                    <div className={styles["notification-bell"]}>
                        <BellIcon className={styles["bell-icon"]} />
                        <span className={styles["bell-badge"]}></span>
                    </div>

                    <div className={styles["profile-picture-container"]}>
                        <img 
                            src={profilePicture} 
                            alt="Profile Picture" 
                            className={styles["profile-picture-img"]} 
                            onClick={() => props.onImageClick()}
                        />
                    </div>
                </div>
            </div>

            {/* donji deo headera */}
            <div className={styles["lower-header"]}>
                <div className={styles["dropdown-menu-container"]}>
                    <label htmlFor="type-filter" className={styles["tip-label"]}>Tip:</label>
                    <select
                        id="type-filter"
                        value={activeType ?? ""} // Ako je activeType null (opcija "Sve"), vrednost je prazan string
                        onChange={(e) => {
                            const value = e.target.value;
                            // Ako je korisnik izabrao "Sve" (prazan string), postavljamo null, inače kastujemo u broj
                            setActiveType(value === "" ? null : Number(value));
                        }}
                        className={styles["custom-select"]}
                    >
                        {types.map((type) => (
                            <option 
                                key={type.id ?? "all"} 
                                value={type.id ?? ""}
                            >
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

        </header>
    )
}