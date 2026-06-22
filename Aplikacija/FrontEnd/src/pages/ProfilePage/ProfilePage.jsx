import { useEffect, useState } from "react";
import ProfileOverview from "./components/ProfileOverview/ProfileOverview"
import ProfileStats from "./components/ProfileStats/ProfileStats";
import Akcije from "./components/Akcije/Akcije.jsx"
import style from "./ProfilePage.module.css"

export default function ProfilePage(props){
    const userToShow = props.yourProfile? JSON.parse(localStorage.getItem("user")) : props.user; // ako gleda svoj page uzimaj iz localStorage
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

    const [userStats, setUserStats] = useState([]);
    useEffect(()=>{
        fetch(`${baseUrl}/User/GetUserStats`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userToShow.id)
            })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Greška pri učitavanju statistika");
            })
            .then(data => setUserStats(data))
            .catch(err => console.error(err));  
            
    },[])
    
    return(
        <div className={style["page-container"]}>
            <ProfileOverview 
                userToShow={userToShow}
                yourProfile={props.yourProfile}
                onAddFriend={props.onAddFriend}
                onEditProfile={props.onEditProfile}
                onLogout={props.onLogout}
                />
            <ProfileStats stats = {userStats}/>
            <Akcije userID = {userToShow.id} akcijeCount ={userStats.akcijeCout}/>
        </div>
    )
}