import styles from "./Akcije.module.css"
import ActionCard from "../../../../components/Card/ActionCard"
import ActionCardSkeleton from "../LoadingSkeleton/ActionCardSkeleton";
import { useState, useEffect } from "react";
import { isLastDayOfMonth } from "date-fns";

export default function Akcije({ userID, akcijeCount }) {
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
    const [skip, setSkip] = useState(0);
    const take = 3;

    const [backendMessage, setBackendMessage] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [actions, setActions] = useState([]);
    const [types, setTypes] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        async function fetchTypes() {
            try {
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
    }, [baseUrl]);

    async function handleGetAkcije(currentSkip, isLoadMore = false) {
        if (!userID) return;
        
        setIsLoading(true);
        try {
            const url = baseUrl + "/Action/FilterAkcija";
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Title: null,
                    Latitude: -1.0,
                    Longitude: -1.0,
                    Distance: -1,
                    Type: null,
                    OdKada: null,
                    DoKada: null,
                    Status: null,
                    CheapestFirst: null,
                    Skip: currentSkip,
                    Take: take,
                    ProducerID: userID
                }),
            });

            if (!response.ok)
                throw new Error(`Server odgovorio sa statusom: ${response.status}`);

            const data = await response.json();
            setBackendMessage(data.poruka);
            setHasMore(data.imaJos);

            if (isLoadMore) {
                setActions(prevActions => [...prevActions, ...data.akcije]);
            } else {
                setActions(data.akcije);
            }
        } catch (err) {
            console.error("KRAH:", err.message);
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!userID) return;
        setSkip(0); 
        setIsCollapsed(false); // Resetujemo skupljanje za novog korisnika
        handleGetAkcije(0, false);
    }, [userID]); 

    async function handleLoadMore() {
        // Ako je bilo skupljeno, a klikne se Load More, prvo rasiri prikaz
        if (isCollapsed) {
            setIsCollapsed(false);
            return;
        }
        const nextSkip = skip + take;
        setSkip(nextSkip);
        handleGetAkcije(nextSkip, true);
    }

    // Ako je isCollapsed true, metodom uzimamo samo prve 3 akcije - prvi red
    const displayedActions = isCollapsed ? actions.slice(0, 3) : actions;

    return (
        <div className={styles["akcije-main-div"]}>
            {!isLoading && <p className={styles["section-title"]}>Moje Akcije</p>}
            
            <main className={styles["cards-grid"]}>
                {displayedActions.length > 0 ? (
                    displayedActions.map((action) => (
                        <ActionCard key={action.id} action={action} types={types} />
                    ))
                ) : (
                    !isLoading && <p className={styles["no-results"]}>Korisnik nema Akcija</p>
                )} 
                {isLoading && (
                    <>
                        <ActionCardSkeleton />
                        <ActionCardSkeleton />
                        <ActionCardSkeleton />
                    </>
                )}                
            </main>    
            
            <div className={styles["footer-buttons-container"]}>
                {(hasMore || isCollapsed) && actions.length > 0 && (
                    <button className={styles["load-more-button"]} onClick={handleLoadMore}>
                        {isCollapsed ? "Prikaži sve učitane akcije" : "Učitaj još akcija"} 
                        <span className={styles["arrow-down"]}>{isCollapsed ? "▼" : "▼"}</span>
                    </button>
                )}

                {actions.length > 3 && !isCollapsed && (
                    <button className={styles["collapse-button"]} onClick={() => setIsCollapsed(true)}>
                        Sakriji akcije <span className={styles["arrow-up"]}>▲</span>
                    </button>
                )}
                
                {!hasMore && !isCollapsed && actions.length > 0 && (
                    <p className={styles["all-loaded-text"]}>Učitane su sve akcije ovog korisnika</p>
                )}                
            </div>
        </div>
    )
}