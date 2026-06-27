import styles from "./ActionCard.module.css"
// Ako imaš Heroicons instaliran, iskoristi ih za datum i lokaciju kao u headeru:
import { CalendarIcon, MapPinIcon, UserGroupIcon, StarIcon, CheckBadgeIcon } from "@heroicons/react/24/outline"
import {StarIcon as FilledStarIcon} from "@heroicons/react/24/solid"
import { act, useEffect, useState } from "react";
import { authFetch } from "../../api";

export default function ActionCard({ action, types, mojeAkcije, onCardClick, onEdit}) {

    const foundType = types.find(t => t.id === action.type);
    const typeName = foundType ? foundType.name : "Ostalo";

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

    const currentUser = JSON.parse(localStorage.getItem("user"));

    //Provera dal je korisnik vec prijavljen na akciju
    const [prijavljen, setPrijavljen]=useState(false);
    useEffect(()=>{
        async function getPrijavljen() {
            try{
                const response = await authFetch(`/Action/HaveIApplied/${action.id}`,{
                    method:"GET"
                });
                if(response.ok){
                    const data=await response.json();
                    setPrijavljen(data);
                }
            }catch(err){
                console.error("Greska pri proveri prijave", err.message);
            }
        }
        if(action.id)
            getPrijavljen();
    },[action.id]);

    // Formatiranje datuma u čitljiv oblik (npr: "Čet, 30. apr · 09:44")
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const time = date.toLocaleTimeString('sr-Latn-RS', { hour: '2-digit', minute: '2-digit' });
        
        let formattedDate = date.toLocaleDateString('sr-Latn-RS', options);
        // Prvo slovo veliko za dan u nedelji
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        
        return `${formattedDate} · ${time}`;
    };

    const [producer,setProducer]=useState(null);
    useEffect(()=>{
        async function fetchProducer() {
            try{
                if (!action?.producerID) return;

                const response = await fetch(`${baseUrl}/User/GetUserByID`, { 
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify(action.producerID) 
                });

                if (!response.ok) {
                    const tekstGreske = await response.text(); 
                    throw new Error(`Status: ${response.status} - ${tekstGreske}`);
                    return;
                }

                const data = await response.json();
                setProducer(data);
            }catch(err){
                throw new Error("Greska pri povlacenju producenta")
            }
        } 
        if(action.producerID)
            fetchProducer();
    },[action.producerID])

    // Funkcija za odlazak na detalje akcije
    const handleCardClick = () => {
        console.log(action);
        console.log(`Otvaram detalje za akciju sa ID-jem: ${action.id}`);
        // Ovde će ići ruter: navigate(`/akcija/${action.id}`)
        if (onCardClick) onCardClick(action)
    };

    // Funkcija za prijavu (samo dugme)
    const handleJoinClick = async (e) => {
        try{
            const response = await authFetch(`/Action/ApplyAkcija/${action.id}`,{
                method:"POST"
            });
            if(response.ok){
                setPrijavljen(true);
                action.currentNumParticipants+=1;
            }else {
                const greskaSaServera = await response.text();
                alert(`Greška pri prijavi: ${greskaSaServera}`);
            }
        } catch (error) {
            console.error("Mrežna greška pri prijavi:", error.message);
            alert("Došlo je do greške na serveru.");
        }

    };

    const handleUnapplyClick = async (e) => {
        try{
            const response = await authFetch(`/Action/UnapplyAkcija/${action.id}`,{
                method:"DELETE"
            });
            if(response.ok){
                setPrijavljen(false);
                action.currentNumParticipants-=1;
            }else {
                const greskaSaServera = await response.text();
                alert(`Greška pri odjavi: ${greskaSaServera}`);
            }
        } catch (error) {
            console.error("Mrežna greška pri prijavi:", error.message);
            alert("Došlo je do greške na serveru.");
        }
    };

    // Podrazumevana slika ako je actionPicture null
    const fallbackImage = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop";

    function showStars() {
        const stars = [];

        for (let i = 0; i < 5; i++) {
            const fillValue = Math.max(0, Math.min(1, action.averageRating - i));
            const fillPercentage = fillValue * 100;

            stars.push(
                <div key={i} className={styles["star-container"]}>
                    <StarIcon className={styles["empty-star"]} />
                    
                    {fillPercentage > 0 && (
                        <FilledStarIcon 
                            className={styles["filled-star"]} 
                            style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }} 
                        />
                    )}
                </div>
            );
        }
        return <div className={styles["zvezdice-wrapper"]}>{stars}</div>;
    }

    return (
        <div className={styles["card-container"]} 
            onClick={handleCardClick}
            style={{
                opacity: action.status === 2 ? 0.5 : 1
            }}
        >
            <div className={styles["image-container"]}>
                <img 
                    src={action.actionPicture || fallbackImage} 
                    alt={action.title} 
                    className={styles["card-img"]}
                />
                
                {/* Značke preko slike */}
                <span className={styles["badge-type"]}>{typeName}</span>

                {
                    producer && producer.verificationStatus===2 &&(
                    <span className={styles["badge-verified"]}>
                        <CheckBadgeIcon className={styles["verified-icon"]}/>
                    </span>)
                }
                
                <span className={`${styles["badge-price"]} ${action.price === 0 ? styles["free"] : ""}`}>
                    {action.price > 0 ? `${action.price} RSD` : "Besplatno"}
                </span>
            </div>

            <div className={styles["card-content"]}>
                <h3 className={styles["card-title"]}>{action.title}</h3>
                
                <div className={styles["info-row"]}>
                    <CalendarIcon className={styles["card-icon"]} />
                    <span>{formatDate(action.dtStart)}</span>
                </div>

                <div className={styles["info-row"]}>
                    <MapPinIcon className={styles["card-icon"]} />
                    <span className={styles["location-text"]}>{action.location}</span>
                </div>

                {action.status === 2 ?

                    showStars() : 
                    <div className={styles["info-row"]}>
                        <StarIcon className={styles["card-icon"]}/>
                        <span>Akcija jos uvek nije gotova</span>
                    </div>
                }

                <div className={styles["card-footer"]}>
                    <div className={styles["participants-info"]}>
                        <UserGroupIcon className={styles["card-icon-group"]} />
                        <span>
                            {action.currentNumParticipants || 0}/{action.maxParticipants}
                        </span>
                    </div>

                    {action.status !== 2 ? (
                        (!mojeAkcije && producer?.id !== currentUser.id) ? (
                            (prijavljen ? (
                                <button className={styles["join-button"]} onClick={handleUnapplyClick}>
                                    Odjavi se 
                                </button>)
                                : 
                                (<button className={styles["join-button"]} onClick={handleJoinClick}>
                                    Prijavi se
                                </button>)
                            )
                        ) : (
                            <button className={styles["join-button"]} onClick={(e) => { e.stopPropagation(); onEdit(action); }}>
                                Uredi
                            </button>
                        )
                    ) : (
                        <button className={styles["join-button"]} onClick={(e) => { e.stopPropagation(); console.log("onEdit:", onEdit, "action:", action); onEdit(action); }}>
                            Uredi
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}