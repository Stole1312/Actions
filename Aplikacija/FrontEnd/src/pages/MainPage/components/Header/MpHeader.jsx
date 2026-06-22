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
    const user = JSON.parse(localStorage.getItem("user"));
    const profilePicture = user.profilePicture;
    
    const [suggestions, setSuggestions] = useState([]); 
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Autodetekcija lokacije se okida samo ako roditelj već nema podešene koordinate/grad
        if (props.selectedCoordinates) return;

        async function detectLocationByIP() {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
                const response = await fetch(`${baseUrl}/Action/GetClientLocation`);
                if (!response.ok) throw new Error("Greška na našem serveru");

                const data = await response.json();
                if (data && data.cityName) {
                    props.setCityInput(`${data.cityName}, ${data.countryName}`);
                    props.setSelectedCoordinates({ lat: data.latitude, lng: data.longitude });
                }
            } catch (error) {
                console.error("API nije odgovorio, šalje se na Bg", error);
                props.setCityInput("Beograd, Srbija");
                props.setSelectedCoordinates({ lat: 44.7871, lng: 20.4489 });
            }
        }
        detectLocationByIP();
    }, []);

    useEffect(() => {
        if (props.cityInput.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://photon.komoot.io/api/?q=${encodeURIComponent(props.cityInput)}&limit=15`
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
                        coordinates: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }
                    }));
                    setSuggestions(places);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Greška sa Geocoding API-jem:", error);
                setSuggestions([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [props.cityInput]);

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
        props.setStartDate(start);
        props.setEndDate(end);
    };

    const handleSelectSuggestion = (place) => {
        const displayName = place.state ? `${place.name}, ${place.state}, ${place.country}` : `${place.name}, ${place.country}`;
        props.setCityInput(displayName);
        props.setSelectedCoordinates(place.coordinates);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <header className={styles["header-main-page"]}>
            
            <div className={styles["upper-header"]}>
                <div className={styles["search-container"]}>
                    <MagnifyingGlassIcon className={styles["input-icon"]} />
                    <input
                        type="text"
                        placeholder="Search akcije..."
                        className={styles["custom-input"]}
                        value={props.title}
                        onChange={(e) => props.setTitle(e.target.value)}
                    />
                </div>

                <div className={styles["datepicker-container"]}>
                    <CalendarIcon className={styles["input-icon"]} />
                    <DatePicker
                        selectsRange={true}
                        startDate={props.startDate}
                        endDate={props.endDate}
                        onChange={handleDateChange}
                        isClearable={true}
                        placeholderText="Select date range"
                        className={styles["custom-datepicker"]}
                        selected={props.startDate} 
                        dateFormat="dd.MM."
                    />
                </div>

                <div className={styles["dropdown-container"]} ref={dropdownRef}>
                    <MapPinIcon className={styles["input-icon-dropdown"]} />
                    <input
                        type="text"
                        value={props.cityInput}
                        onChange={(e) => {
                            props.setCityInput(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Unesite grad..."
                        className={styles["custom-input-location"]}
                    />
                    
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

                <div className={styles["right-side-container"]}>
                    <div className={styles["notification-bell"]}>
                        <BellIcon className={styles["bell-icon"]} />
                        <span className={styles["bell-badge"]}></span>
                    </div>

                    <div className={styles["profile-picture-container"]}>
                        <img 
                            src={profilePicture} 
                            alt="Profile" 
                            className={styles["profile-picture-img"]} 
                            onClick={() => props.onImageClick()}
                        />
                    </div>
                </div>
            </div>

            <div className={styles["lower-header"]}>
                <div className={styles["filters-left-group"]}>
                    <div className={styles["dropdown-menu-container"]}>
                        <label htmlFor="type-filter" className={styles["tip-label"]}>Tip:</label>
                        <select
                            id="type-filter"
                            value={props.actionType ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                props.setActionType(value === "" ? null : Number(value));
                            }}
                            className={styles["custom-select"]}
                        >
                            {props.types.map((type) => (
                                <option key={type.id ?? "all"} value={type.id ?? ""}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles["distance-container"]}>
                        <span className={styles["distance-label"]}>U krugu od:</span>
                        <div className={styles["distance-input-wrapper"]}>
                            <input
                                type="number"
                                value={props.distance}
                                min="1"
                                onChange={(e) => props.setDistance(e.target.value ? Number(e.target.value) : "")}
                                className={styles["custom-input-distance"]}
                            />
                            <span className={styles["distance-suffix"]}>km</span>
                        </div>
                    </div>
                </div>

                <div className={styles["filters-right-group"]}>
                    <button 
                        className={`${styles["sort-button"]} ${props.cheapestFirst ? styles["active"] : ""}`}
                        onClick={() => props.setCheapestFirst(!props.cheapestFirst)}
                    >
                        Najjeftinije prvo
                    </button>

                    <button 
                        className={styles["apply-button"]}
                        onClick={props.onApplyFilters}
                    >
                        Primeni
                    </button>
                </div>
            </div>

        </header>
    )
}