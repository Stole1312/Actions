import { useState, useEffect } from "react"
import MpHeader from "./components/Header/MpHeader"
import ActionCard from "./components/Card/ActionCard" // Uvezi novu komponentu za karticu
import styles from "./MainPage.module.css"

export default function MainPage(props) {
    const [actionType, setActionType] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [cityInput, setCityInput] = useState(""); 
    const [selectedCoordinates, setSelectedCoordinates] = useState(null); 
    const [distance, setDistance] = useState(10);
    const [cheapestFirst, setCheapestFirst] = useState(false);
    const [title, setTitle] = useState("");

    const [types, setTypes] = useState([]);
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

    // STATE ZA AKCIJE KOJE SE PRIKAZUJU
    const [actions, setActions] = useState([]);

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

    async function handleApplyFilters() {
        const latitude = selectedCoordinates ? selectedCoordinates.lat : null;
        const longitude = selectedCoordinates ? selectedCoordinates.lng : null;
        
        try {
            const url = baseUrl + "/Action/FilterAkcija";
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Title: title,
                    Latitude: latitude,
                    Longitude: longitude,
                    Distance: distance,
                    Type:actionType,
                    OdKada: startDate,
                    DoKada: endDate,
                    Status: null,
                    CheapestFirst: cheapestFirst,
                }),
            });

            if (!response.ok)
                throw new Error(`Server odgovorio sa statusom: ${response.status}`);

            const data = await response.json();
            
            // Smeštamo dobijeni niz u state
            setActions(data); 
        }
        catch(err) {
            console.error("KRAH:", err.message);
        }
    }

    useEffect(() => {
        // Ako su koordinate null (tek se učitava stranica), ne šalji ništa na backend
        if (!selectedCoordinates) return; 

        handleApplyFilters();
    }, [selectedCoordinates]); // useEffect prati promenu koordinata

    return (
        <div className={styles["page-wrapper"]}>
            <MpHeader 
                actionType={actionType} setActionType={setActionType}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                cityInput={cityInput} setCityInput={setCityInput}
                selectedCoordinates={selectedCoordinates} setSelectedCoordinates={setSelectedCoordinates}
                distance={distance} setDistance={setDistance}
                cheapestFirst={cheapestFirst} setCheapestFirst={setCheapestFirst}
                title={title} setTitle={setTitle}
                onApplyFilters={handleApplyFilters}
                types={types} setTypes={setTypes}
                onImageClick={props.onMyProfileClick}
            />
            
            {/* MREŽA KARTICA UNUTAR MAIN TAGA */}
            <main className={styles["cards-grid"]}>
                {actions.length > 0 ? (
                    actions.map((action) => (
                        <ActionCard key={action.id} action={action} types={types}/>
                    ))
                ) : (
                    <p className={styles["no-results"]}>Nema pronađenih akcija za zadate filtere.</p>
                )}
            </main>
        </div>
    )
}