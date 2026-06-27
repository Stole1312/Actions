import { useState, useEffect } from "react"
import MpHeader from "./components/Header/MpHeader"
import ActionCard from "../../components/Card/ActionCard" 
import styles from "./MainPage.module.css"

export default function MainPage({ onMyProfileClick, onActionClick, mojeAkcije }) {
    const [actionType, setActionType] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [cityInput, setCityInput] = useState(""); 
    const [selectedCoordinates, setSelectedCoordinates] = useState(null); 
    const [distance, setDistance] = useState(10);
    const [cheapestFirst, setCheapestFirst] = useState(false);
    const [title, setTitle] = useState("");
    const [verifiedFirst, setVerifiedFirst]=useState(false);
    const [onlyFollowing, setOnlyFollowing]=useState(false);

    const [actions, setActions] = useState([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(null);
    const [backendMessage, setBackendMessage] = useState("");
    const take = 9;

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

    const [types, setTypes] = useState([]);
    useEffect(() => {
        async function fetchTypes() {
            try {
                const response = await fetch(`${baseUrl}/Action/GetActionTypes`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                setTypes([{ id: null, name: "Sve" }, ...data]);
                handleGetAkcije(0, false); 
            } catch (error) {
                console.error("Greška pri povlačenju tipova:", error);
            }
        }
        fetchTypes();
    }, [mojeAkcije]);

    async function handleGetAkcije(skipLocal,isLoadMore) {
        console.log("handleGetAkcije pozvan, ProducerID će biti:", mojeAkcije)
    
        const latitude = selectedCoordinates ? selectedCoordinates.lat : -1;
        const longitude = selectedCoordinates ? selectedCoordinates.lng : -1;
        console.log("latitude:", latitude, "longitude:", longitude)
        
        try {
            const url = baseUrl + "/Action/FilterAkcija";

            var ProducerID=null
            if(mojeAkcije){
                const user = JSON.parse(localStorage.getItem("user"));
                ProducerID = user.id;
            }

            console.log(onlyFollowing);
            console.log(verifiedFirst);
            const token = localStorage.getItem("token")
           const requestBody = {
                Title: title,
                Latitude: latitude,
                Longitude: longitude,
                Distance: distance,
                Type: actionType,
                OdKada: startDate,
                DoKada: endDate,
                Status: null,
                CheapestFirst: cheapestFirst,
                Skip: skipLocal,
                Take: take,
                ProducerID: ProducerID,
                OnlyFollowing: onlyFollowing,
                VerifiedFirst: verifiedFirst
            }
            console.log("Šaljem:", JSON.stringify(requestBody))

            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok)
                throw new Error(`Server odgovorio sa statusom: ${response.status}`);

            const data = await response.json();
            console.log("Data:", data)
            setBackendMessage(data.poruka);
            setHasMore(data.imaJos);

            if (isLoadMore) {
                //za ucitaj jos dodajes preko postojece akcije
                setActions(prevActions => [...prevActions, ...data.akcije]);
            } else {
                //za nov filter od pocetka
                setActions(data.akcije);
            }
        }
        catch(err) {
            console.error("KRAH:", err.message);
        }
    }

    async function handleApplyFilters(){
        setSkip(0);
        setBackendMessage("");
        handleGetAkcije(0,false);
    }

    async function handleLoadMore(){
        const nextSkip = skip+take;
        setSkip(nextSkip);
        handleGetAkcije(nextSkip,true);
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
                verifiedFirst={verifiedFirst} setVerifiedFirst={setVerifiedFirst}
                onlyFollowing={onlyFollowing} setOnlyFollowing={setOnlyFollowing}
                title={title} setTitle={setTitle}
                onApplyFilters={handleApplyFilters}
                types={types} setTypes={setTypes}
                onImageClick={onMyProfileClick}
            />
            
            {/* MREŽA KARTICA UNUTAR MAIN TAGA */}
            <main className={styles["cards-grid"]}>
                {actions.length > 0 ? (
                    actions.map((action) => (
                        <ActionCard action={action} key={action.id} types={types} mojeAkcije={false} onCardClick={onActionClick}/>
                    ))
                ) : (
                    <p className={styles["no-results"]}>Nema pronađenih akcija za zadate filtere.</p>
                )} 
            </main>
                { (hasMore!=null && hasMore)  ? (
                    <button className={styles["load-more-button"]} onClick={handleLoadMore}>
                        Učitaj još akcija <span className={styles["arrow-down"]}></span>
                    </button>
                ):(
                    ( actions.length>0 &&<p className={styles["no-results"]}>{backendMessage}</p>)
                )}
        </div>
    )
}