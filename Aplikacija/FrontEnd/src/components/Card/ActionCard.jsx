import styles from "./ActionCard.module.css"
// Ako imaš Heroicons instaliran, iskoristi ih za datum i lokaciju kao u headeru:
import { CalendarIcon, MapPinIcon, UserGroupIcon, StarIcon } from "@heroicons/react/24/outline"
import {StarIcon as FilledStarIcon} from "@heroicons/react/24/solid"

export default function ActionCard({ action, types, mojeAkcije}) {

    const foundType = types.find(t => t.id === action.type);
    const typeName = foundType ? foundType.name : "Ostalo";

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

    // Funkcija za odlazak na detalje akcije
    const handleCardClick = () => {
        console.log(`Otvaram detalje za akciju sa ID-jem: ${action.id}`);
        // Ovde će ići ruter: navigate(`/akcija/${action.id}`)
    };

    // Funkcija za prijavu (samo dugme)
    const handleJoinClick = (e) => {
        e.stopPropagation(); // <-- OVO SPREČAVA KLIK NA CELU KARTICU
        console.log(`Prijavljujem se na akciju: ${action.title}`);
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
        <div className={styles["card-container"]} onClick={handleCardClick}>
            <div className={styles["image-container"]}>
                <img 
                    src={action.actionPicture || fallbackImage} 
                    alt={action.title} 
                    className={styles["card-img"]}
                />
                
                {/* Značke preko slike */}
                <span className={styles["badge-type"]}>{typeName}</span>
                
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

                    {!mojeAkcije ?
                        <button className={styles["join-button"]} onClick={handleJoinClick}>Prijavi se</button>
                        :
                        <button className={styles["join-button"]} onClick={console.log("ce ode na detalji akcije")}>Uredi</button>
                    }
                </div>
            </div>
        </div>
    )
}