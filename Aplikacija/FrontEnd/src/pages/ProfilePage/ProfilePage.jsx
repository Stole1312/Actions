import { useEffect, useState } from "react";
import ProfileOverview from "./components/ProfileOverview/ProfileOverview"
import ProfileStats from "./components/ProfileStats/ProfileStats";
import Akcije from "./components/Akcije/Akcije.jsx"
import style from "./ProfilePage.module.css"
import ProfileSkeleton from "./components/LoadingSkeleton/ProfileSkeleton.jsx";

export default function ProfilePage(props){
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

    const [userToShow, setUserToShow] = useState(null)
    const [userStats, setUserStats] = useState(null); 
    const [userToShowID,setUserToShowID] =useState(() => {
        // Pri refreshu, proveri da li imamo zapamćen ID u memoriji
        const savedID = sessionStorage.getItem("viewingUserID");
        return savedID ? JSON.parse(savedID) : null;
    });
    
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
                    console.log("Fetch uspeo, stigao user:", data);
                    setUserToShow(data);
                })
                .catch(err => console.error(err));  
        }
    }, [props.userID, props.yourProfile]);

    // ceka userToShow
    useEffect(() => {
        if (!userToShow) return;

        const currentId = userToShow.id;
        console.log(userToShow);

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
            <div className={style["page-container"]}>
                <ProfileSkeleton/>
            </div>    
        );
    }

    return(
        <div className={style["page-container"]}>
            <ProfileOverview 
                userToShow={userToShow}
                yourProfile={props.yourProfile}
                onAddFriend={props.onAddFriend}
                onEditProfile={props.onEditProfile}
                onLogout={props.onLogout}
            />
            <ProfileStats stats={userStats}/>
            <Akcije userID={userToShow.id} akcijeCount={userStats.akcijeCout}/>
        </div>
    )
}