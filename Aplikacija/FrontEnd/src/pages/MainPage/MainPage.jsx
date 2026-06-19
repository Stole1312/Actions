import { useState } from "react"
import MpHeader from "./components/MpHeader"

export default function MainPage({ onMyProfileClick, handleAddActionClick }) {
    // Čitamo username i profilnu sliku iz localStorage-a
    const username = localStorage.getItem("username") || "Guest"
    const profilePicture = localStorage.getItem("profilePicture")

    function handleBack() {
        navigate(-1); // Vraća korisnika na prethodnu stranicu
    }

    // 3. Definišeš funkciju za slanje podataka / objavljivanje
    async function handlePublish() {
        console.log("Slanje podataka na backend...");
        // Tvoja fetch logika za kreiranje akcije ide ovde
        alert("Akcija uspešno objavljena!");
    }

    console.log(profilePicture);

    return (
        <div >
            <MpHeader onImageClick = {()=>{onMyProfileClick()}}/>
        </div>
    )
}
