import { useEffect, useState } from "react";
import ProfileOverview from "./components/ProfileOverview/ProfileOverview"
import ProfileStats from "./components/ProfileStats/ProfileStats";
import Akcije from "./components/Akcije/Akcije.jsx"
import styles from "./ProfilePage.module.css"
import ProfileSkeleton from "./components/LoadingSkeleton/ProfileSkeleton.jsx";
import EditActionPage from "../EditActionPage/EditActionPage.jsx"
import ActionDetailPage from "../ActionDetailPage/ActionDetailPage.jsx"

export default function ProfilePage(props){
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
    
    const [viewMode, setViewMode] = useState("list");
    const [selectedAction, setSelectedAction] = useState(null);
    const [userToShow, setUserToShow] = useState(null)
    const [userStats, setUserStats] = useState(null); 
    const [userToShowID,setUserToShowID] =useState(() => {
        // Pri refreshu, proveri da li imamo zapamćen ID u memoriji
        const savedID = sessionStorage.getItem("viewingUserID");
        return savedID ? JSON.parse(savedID) : null;
    });

    const [reportTypes, setReportTypes] = useState([]);
    useEffect(() => {
        async function fetchTypes() {
            try {
                const response = await fetch(`${baseUrl}/User/GetReportTypes`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                setReportTypes(data);
            } catch (error) {
                console.error("Greška pri povlačenju tipova:", error);
            }
        }
        fetchTypes();
    }, []);
    
    //Kad ocu ja da izazovem refresh - kad prmeni profilnu npr
    const [zelimRefresh, setZelimRefresh]=useState(false);
    // ceka userID
    useEffect(() => {

        // tudji profil a nije ti stigo props za nemas ni sacuvan userToShowID
        if (!props.yourProfile && !props.userID && !userToShowID)
            return;

        if (props.yourProfile) {
            const localUser = localStorage.getItem("user");
            if (localUser)
                setUserToShow(JSON.parse(localUser));
        } else {
            const finalID = props.userID || userToShowID;// ako ga nema u props citaj iz userToShowID
            fetch(`${baseUrl}/User/GetUserByID`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(finalID)
                })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error("Greška pri učitavanju korisnika");
                })
                .then(data => {
                    setUserToShow(data);
                })
                .catch(err => console.error(err));  
        }
    }, [props.userID, props.yourProfile, zelimRefresh]);

    // ceka userToShow
    useEffect(() => {
        if (!userToShow) return;

        const currentId = userToShow.id;

        fetch(`${baseUrl}/User/GetUserStats`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentId)
            })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Greška pri učitavanju statistika");
            })
            .then(data => setUserStats(data))
            .catch(err => console.error(err));  
            
    }, [userToShow]);
    
    if (!userToShow || !userStats) {
        return (
            <div className={styles["page-container"]}>
                <ProfileSkeleton/>
            </div>    
        );
    }

    // Funkcija za prelazak u edit mod
    const handleEditAction = (action) => {
        setSelectedAction(action);
        setViewMode("edit");
    };

    // Funkcija za povratak na listu
    const handleBackToList = () => {
        setSelectedAction(null);
        setViewMode("list");
    };

    return (
        <div className={styles["page-container"]}>
            {viewMode === "edit" ? (
                // 1. EDIT MOD - formu za izmenu
                <EditActionPage 
                    actionData={selectedAction} 
                    onSave={() => {
                        // Ovde možeš dodati osvežavanje ako treba
                        setViewMode("list");
                    }} 
                    onCancel={() => setViewMode("list")} 
                />
            ) : viewMode === "detail" ? (
                // 2. DETALJNI PRIKAZ
                <ActionDetailPage 
                    actionData={selectedAction} 
                    onBack={() => setViewMode("list")} 
                    loggedUser={userToShow}
                />
            ) : (
                // 3. LISTA MOD - Tvoj originalni prikaz profila
                <>
                    <ProfileOverview 
                        userToShow={userToShow}
                        yourProfile={props.yourProfile}
                        onLogout={props.onLogout}
                        reportTypes={reportTypes}
                        setZelimRefresh={setZelimRefresh}
                    />
                    <ProfileStats stats={userStats}/>
                    
                    <Akcije 
                        userID={userToShow.id} 
                        akcijeCount={userStats.akcijeCout} 
                        mojeAkcije={props.yourProfile}
                        onEdit={handleEditAction}
                        onCardClick={(action) => {
                            setSelectedAction(action);
                            setViewMode("detail");
                        }}
                    />
                </>
            )}
        </div>
    );
}