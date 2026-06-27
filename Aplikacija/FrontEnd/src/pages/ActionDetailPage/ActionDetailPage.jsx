import { useState, useEffect } from "react"
import { CalendarIcon, MapPinIcon, ClockIcon, UserGroupIcon, ShareIcon, FlagIcon, HeartIcon, ChevronLeftIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid, CheckCircleIcon } from "@heroicons/react/24/solid"
import { StarIcon } from "@heroicons/react/24/solid"
import styles from "./ActionDetailPage.module.css"

export default function ActionDetailPage({ actionData, onBack, onOrganizerClick, loggedUser, onParticipantClick }) {
    
    const [action, setAction] = useState(actionData)
    const [producer, setProducer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [liked, setLiked] = useState(false)
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [joined, setJoined] = useState(false)
    const [isReporting, setIsReporting] = useState(false); // Za prikazivanje inputa
    const [reportReason, setReportReason] = useState("");   // Za čuvanje teksta prijave
    const [hasRated, setHasRated] = useState(false);
    const [participants, setParticipants] = useState([])

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL

    const fetchComments = async (actionId) => {
    if (!actionId) return;
    try {
        const response = await fetch(`${baseUrl}/Feedback/GetCommentsForAction/${actionId}`);
        if (response.ok) {
            const data = await response.json();
            setComments(data); 
        }
    } catch (err) {
        console.error("Greška pri učitavanju komentara:", err);
    }
};
    const fetchParticipants = async (actionId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseUrl}/Action/AllApplicants/${actionId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: "true" 
        });

        if (response.ok) {
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                setParticipants(data);
                setJoined(data.some(p => p.username === loggedUser?.username));
            } catch (e) {
                setParticipants([]);
                setJoined(false);
            }
        } else {
            setParticipants([]);
            setJoined(false);
        }
    } catch (error) {
        console.error("Greška:", error);
        setParticipants([]);
    }
}

async function fetchProducer(producerId) {
    try {
        const [userResponse, statsResponse] = await Promise.all([
            fetch(`${baseUrl}/User/GetUserByID`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producerId)
            }),
            fetch(`${baseUrl}/User/GetUserStats/${producerId}`)
        ]);

        if (!userResponse.ok) throw new Error("Greška pri dohvatanju korisnika");

        const userData = await userResponse.json();
        let rating = 0;

        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            rating = stats.rating || 0;
        }

        setProducer({ ...userData, averageRating: rating });
        console.log("Uspelo! Podaci o producentu:", userData);

    } catch (err) {
        console.error("Greška u fetch-u producenta:", err);
    }
}

    useEffect(() => {
    const id = actionData?.id;
    if (!id) return;

    const loadData = async () => {
        setLoading(true);
        // Sve funkcije se izvršavaju istovremeno
        await Promise.all([
            fetchParticipants(id),
            fetchComments(id),
            actionData?.producerID ? fetchProducer(actionData.producerID) : Promise.resolve()
        ]);
        setLoading(false);
    };

    loadData();
}, [actionData, baseUrl, loggedUser]);

    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("sr-Latn-RS", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    }

    const formatTime = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" })
    }

    const fallbackImage = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop"

    const handleJoin = async () => {
    if (action.status == 2) {
        alert("Ova akcija je završena ili nije aktivna, ne možete se prijaviti.");
        return;
    }
    if (!loggedUser) {
        alert("Moraš biti ulogovan da bi se prijavio na akciju!");
        return;
    }

    const akcijaId = action?.id || actionData?.id;
    const endpoint = joined 
        ? `${baseUrl}/Action/UnapplyAkcija/${akcijaId}?akcijaID=${akcijaId}`
        : `${baseUrl}/Action/ApplyAkcija/${akcijaId}?akcijaID=${akcijaId}`;

    try {
        // OVO JE NAJBITNIJE: Proveri da li tvoj loggedUser ili localStorage ima token
        let token = localStorage.getItem("token") || loggedUser?.token;

        const response = await fetch(endpoint, { 
            method: joined ? "DELETE" : "POST", 
            headers: { 
                "Content-Type": "application/json",
                // DODAJ OVO, AKO NEMAŠ, BEZ OVOGA TE BACKEND NE PREPOZNAJE
                "Authorization": `Bearer ${token}` 
            }
        });

        if (response.ok) {
            if (joined) {
                setParticipants(prev => prev.filter(p => p.username !== loggedUser?.username))
                setJoined(false)
            } else {
                setParticipants(prev => [...prev, { username: loggedUser.username, profilePicture: loggedUser.profilePicture }])
                setJoined(true)
            }
        }
    } catch (error) {
        console.error("Greška:", error);
    }
};

   const handleSendComment = async () => {
    if (!comment.trim() || !action?.id) return;

    try {
        const response = await fetch(`${baseUrl}/Feedback/AddComment/${action.id}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}` 
            },
            body: JSON.stringify({ Content: comment }) 
        });

        if (response.ok) {
            setComment(""); 
            fetchComments(action.id); // Osveži listu sa pravim ID-jem
        }
    } catch (err) {
        console.error("Greška:", err);
    }
};

    const handleFollow = async () => {
    if (!loggedUser) {
        alert("Moraš biti ulogovan da bi pratio organizatora!");
        return;
    }

    try {
        // OVDE definišemo token i headers
        let token = localStorage.getItem("token") || loggedUser?.token;
        const headers = { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "" 
        };

        const response = await fetch(`${baseUrl}/Social/FollowProducer/${producer.id}`, {
            method: "POST",
            headers: headers // Sada ovde koristimo varijablu koju smo definisali iznad
        });

        if (response.ok) {
            alert("Uspešno si zapratio/la organizatora!");
        } else {
            const errorText = await response.text();
            console.error("Server kaže:", errorText);
            alert(`Greška: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error("Greška u handleFollow:", error);
        alert("Došlo je do greške pri povezivanju sa serverom.");
    }
};


   const rateAction = async (akcijaId, score) => {
    const requestBody = { rate: score };

    try {
        const response = await fetch(`${baseUrl}/Feedback/RateAction/${akcijaId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            setHasRated(true); // OVO BLOKIRA DALJE OCENJIVANJE
            alert("Hvala na oceni!");
        } else {
            const errorText = await response.text();
            alert("Greška: " + errorText);
        }
    } catch (err) {
        console.error("Greška:", err);
    }
};

    const handleReportUser = async () => {
    if (!reportReason.trim()) {
        alert("Molimo vas, unesite razlog prijave.");
        return;
    }

    try {
        let token = localStorage.getItem("token") || loggedUser?.token;
        
        // Na osnovu greške, spajamo sve što backend traži
        const reportData = {
            ruDTO: {
                // Prema grešci, možda ovde očekuje reason ili description
                reason: reportReason, 
                description: reportReason 
            },
            description: reportReason // Dodajemo i ovde jer greška kaže da fali 'description'
        };

        const response = await fetch(`${baseUrl}/Feedback/ReportUser/${producer.id}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            alert("Korisnik je uspešno prijavljen.");
            setIsReporting(false);
            setReportReason("");
        } else {
            const errorText = await response.text();
            console.error("Server greška:", errorText);
            alert(`Greška: ${errorText}`);
        }
    } catch (err) {
        console.error("Greška:", err);
    }
};
    if (!action) return <div className={styles["loading-wrapper"]}><div className={styles["spinner"]} /><p>Učitavanje akcije...</p></div>

    const a = action
    const maxParts = a.maxParticipants || 0
    const currParts = participants.length
    const spotsLeft = maxParts - currParts
    const isOrganizer = loggedUser?.id === action?.producerID
    console.log("loggedUser.id:", loggedUser?.id, "producerID:", a.producerID, "isOrganizer:", isOrganizer)

    return (
        <div className={styles["page"]}>
            <div className={styles["hero"]}>
                <img src={a.actionPicture || fallbackImage} alt={a.title} className={styles["hero-img"]} />
                <div className={styles["hero-overlay"]} />
                <button className={styles["back-btn"]} onClick={onBack}><ChevronLeftIcon className={styles["icon-sm"]} /></button>
                
                {/* Hero badges ostaju, srce i share su obrisani */}
                <div className={styles["hero-badges"]}>
                    {a.typeName && <span className={styles["badge-type"]}>{a.typeName}</span>}
                    <span className={`${styles["badge-price"]} ${!a.price || a.price === 0 ? styles["free"] : ""}`}>
                        {a.price > 0 ? `${a.price} RSD` : "Besplatno"}
                    </span>
                </div>
            </div>

            <div className={styles["title-section"]}>
                <div className={styles["title-main"]}>
                    <h1 className={styles["title"]}>{a.title}</h1>
                    <div className={styles["meta-row"]}>
                        <span className={styles["meta-item"]}><CalendarIcon className={styles["meta-icon"]} />{formatDate(a.dtStart)}</span>
                        <span className={styles["meta-item"]}><MapPinIcon className={styles["meta-icon"]} />{a.location}</span>
                    </div>
                </div>
                <div className={styles["action-btns"]}>
                    <button className={styles["icon-action-btn"]}><FlagIcon className={styles["icon-sm"]} /> Prijavi</button>
                </div>
            </div>

            <div className={styles["content-grid"]}>
                <div className={styles["left-col"]}>
                    <section className={styles["section"]}>
                        <h2 className={styles["section-title"]}>O akciji</h2>
                        <p className={styles["description"]}>{a.description}</p>
                        {a.tags && a.tags.length > 0 && (
                            <div className={styles["tags"]}>
                                {a.tags.map((tag, i) => <span key={i} className={styles["tag"]}>{tag}</span>)}
                            </div>
                        )}
                    </section>

                    <section className={styles["section"]}>
                        <div className={styles["participants-header"]}>
                            <h2 className={styles["section-title"]}>Učesnici</h2>
                            <span className={styles["participants-count"]}>{currParts} / {maxParts}</span>
                        </div>
                        <div className={styles["progress-bar"]}>
                            <div className={styles["progress-fill"]} style={{ width: `${maxParts > 0 ? (currParts / maxParts) * 100 : 0}%` }} />
                        </div>
                        <div className={styles["avatars-row"]}>
                            {(participants || []).slice(0, 8).map((p, i) => (
                                <div key={i} className={styles["avatar-circle"]}>
                                    {p?.profilePicture && p.profilePicture !== "string"
                                        ? <img src={p.profilePicture} alt="" className={styles["avatar-img"]} />
                                        : <span className={styles["avatar-placeholder"]}>{(p?.username || "U")[0]}</span>
                                    }
                                </div>
                            ))}
                            {currParts > 8 && <div className={styles["avatar-more"]}>+{currParts - 8}</div>}
                            {spotsLeft > 0 && <span className={styles["spots-left"]}>Još {spotsLeft} slobodnih mesta</span>}
                        </div>
                    </section>

                    <section className={styles["section"]}>
    <h2 className={styles["section-title"]}>
        Komentari <span className={styles["comment-count"]}>({(comments || []).length})</span>
    </h2>
    
    <div className={styles["comments-list"]}>
    {(comments || []).map((c) => (
        <div key={c.id} className={styles["comment-item"]}>
            <div className={styles["comment-avatar"]}>
                {/* Provera slike profilne */}
                {c.user?.profilePicture && c.user.profilePicture !== "string" ? 
                    <img src={c.user.profilePicture} alt="" className={styles["avatar-img"]} /> : 
                    <span className={styles["avatar-placeholder"]}>{(c.user?.username || "?")[0]}</span>
                }
            </div>
            <div className={styles["comment-body"]}>
                <div className={styles["comment-header"]}>
                    <strong>{c.user?.username}</strong>
                    <span className={styles["comment-time"]}>
                        {new Date(c.timePosted).toLocaleDateString()}
                    </span>
                </div>
                
                <p className={styles["comment-text"]}>{c.content}</p>
            </div>
        </div>
    ))}
</div>
    {/* Input sekcija - dostupna samo ako je status 2 */}
    {a.status === 2 ? (
        <div className={styles["comment-input-row"]}>
            <div className={styles["comment-avatar"]}>
                {loggedUser?.profilePicture && loggedUser.profilePicture !== "string" ? 
                    <img src={loggedUser.profilePicture} alt="" className={styles["avatar-img"]} /> : 
                    <span className={styles["avatar-placeholder"]}>{(loggedUser?.username || "?")[0]}</span>
                }
            </div>
            <input 
                className={styles["comment-input"]} 
                placeholder="Napiši komentar..." 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()} 
            />
            <button className={styles["send-btn"]} onClick={handleSendComment}>
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles["icon-sm"]}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
        </div>
    ) : (
        <p className={styles["info-text"]}>Komentarisanje je dostupno samo za završene akcije.</p>
    )}
</section>
                </div>

                <div className={styles["right-col"]}>
                    <div className={styles["ticket-card"]}>
                        <div className={styles["ticket-header"]}>
                            <span className={styles["ticket-price"]}>{a.price > 0 ? `${a.price} RSD` : "Besplatno"}</span>
                            <span className={styles["ticket-spots-badge"]}>{spotsLeft} slobodnih mesta</span>
                        </div>
                        <div className={styles["ticket-info"]}>
                            <div className={styles["ticket-row"]}><CalendarIcon className={styles["meta-icon"]} /><span>{formatDate(a.dtStart)}</span></div>
                            <div className={styles["ticket-row"]}><ClockIcon className={styles["meta-icon"]} /><span>{formatTime(a.dtStart)} – {formatTime(a.dtEnd)}</span></div>
                            <div className={styles["ticket-row"]}><MapPinIcon className={styles["meta-icon"]} /><span>{a.location}</span></div>
                            <div className={styles["ticket-row"]}><UserGroupIcon className={styles["meta-icon"]} /><span>{currParts} / {maxParts} učesnika</span></div>
                        </div>
                        <div className={styles["action-controls"]}>
                        {/* Prikazujemo ocenjivanje samo ako je status 2 */}
                        {action.status === 2 && (
                            <div className={`${styles["rating-stars"]} ${hasRated ? styles["disabled-rating"] : ""}`}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span 
                                        key={star} 
                                        onClick={() => !hasRated && rateAction(action.id, star)} // Blokira klik ako je već ocenjeno
                                        className={styles["star-icon"]}
                                    >
                                        ★
                                    </span>
                                ))}
                                {hasRated && <span className={styles["rating-msg"]}>Već si ocenio!</span>}
                            </div>
                        )}

                        {/* Tvoje postojeće dugme */}
                        <button 
                            className={`${styles["join-btn"]} ${action.status === 2 ? styles["disabled"] : ""} ${joined ? styles["leave-btn"] : ""}`}
                            onClick={handleJoin}
                            disabled={action.status === 2 || loggedUser?.id === a.producerID}
                        >
                            {action.status === 2 
                                ? "Akcija je završena"
                                : loggedUser?.id === a.producerID
                                    ? "Ti si organizator"
                                    : joined ? "Odjavi se sa akcije" : "Prijavi se na akciju"
                            }
                        </button>
                    </div>
                        <p className={styles["cancel-note"]}>Možeš otkazati u bilo kom trenutku</p>
                    </div>

                    {/* ORGANIZER CARD */}
                    {producer && (
    <div className={styles["organizer-card"]}>
        <h3 className={styles["organizer-title"]}>Organizator</h3>
        
        <div className={styles["organizer-info"]} onClick={() => onOrganizerClick?.(producer.id)}>
            <div className={styles["org-avatar"]}>
                {producer.profilePicture ? 
                    <img src={producer.profilePicture} alt="Avatar" className={styles["avatar-img"]} /> : 
                    <div className={styles["avatar-placeholder-lg"]}>{producer.username?.[0]}</div>
                }
            </div>
            
            <div>
                <strong className={styles["org-name"]}>{producer.username}</strong>
            </div>
        </div>

        {/* Glavna akcija */}
        <button className={styles["follow-btn"]} onClick={handleFollow}>
            Prati organizatora
        </button>

        {/* Sekundarna akcija (Report) */}
        {!isReporting ? (
            <button className={styles["report-btn"]} onClick={() => setIsReporting(true)}>
                Prijavi korisnika
            </button>
        ) : (
            <div className={styles["report-box"]}>
                <textarea 
                    className={styles["report-input"]}
                    placeholder="Razlog prijave..." 
                    value={reportReason} 
                    onChange={(e) => setReportReason(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles["follow-btn"]} style={{background: '#28a745'}} onClick={handleReportUser}>Pošalji</button>
                    <button className={styles["report-btn"]} onClick={() => setIsReporting(false)}>Odustani</button>
                </div>
            </div>
        )}
    </div>
)}
                </div>
            </div>
        </div>
    )
}
