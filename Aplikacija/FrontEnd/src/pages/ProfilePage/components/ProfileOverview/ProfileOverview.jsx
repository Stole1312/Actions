import React from "react"
import { 
    LinkIcon, 
    PencilIcon, 
    UserPlusIcon, 
    CalendarIcon, 
    CameraIcon, 
    CheckCircleIcon ,
    ArrowLeftStartOnRectangleIcon,
    HeartIcon,
    FlagIcon,
    ClockIcon,
    XMarkIcon,
    UserMinusIcon
} from "@heroicons/react/24/outline"
import { HeartIcon as SolidHeartIcon} from "@heroicons/react/24/solid" 
import styles from "./ProfileOverview.module.css"
import { useState, useEffect } from "react"
import { authFetch } from "../../../../api"

export default function ProfileOverview({ userToShow, yourProfile, onLogout, reportTypes }){  

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
    const tokenUsera = localStorage.getItem("token");

    const [roles, setRoles] = useState([]);
    useEffect(() => {
        fetch(`${baseUrl}/User/GetUserRoles`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Greška pri učitavanju uloga");
            })
            .then(data => setRoles(data))
            .catch(err => console.error(err));
    }, []);
    const currentRoleObj = roles.find(r => r.id === userToShow?.role);
    const roleName = currentRoleObj ? currentRoleObj.name : "Učitavanje...";

    const [follows,setFollows]=useState(false);
    useEffect(() => {
        async function checkFollowStatus() {
            if (!userToShow?.id || yourProfile) return;

            try {                
                const response = await fetch(`${baseUrl}/Social/IsFollowing/${userToShow.id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${tokenUsera}`
                    }
                });

                if (response.ok) {
                    const status = await response.json();
                    setFollows(status);
                }
            } catch (error) {
                console.error("Greška pri proveri zapraćivanja:", error);
            }
        }

        checkFollowStatus();
    }, []);  

    async function handleFollow(producerID){
        if (!producerID) return;

        try {
            if(follows){
                const response = await fetch(`${baseUrl}/Social/UnfollowProducer/${producerID}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenUsera}`
                    },
                    body: JSON.stringify({ producerId: producerID })
                });

                if (!response.ok) {
                    throw new Error(`Greška pri zapraćivanju: ${response.status}`);
                }
                setFollows(false);
            }
            else{
                const response = await fetch(`${baseUrl}/Social/FollowProducer/${producerID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenUsera}`
                    },
                    body: JSON.stringify({ producerId: producerID })
                });

                if (!response.ok) {
                    throw new Error(`Greška pri zapraćivanju: ${response.status}`);
                }

                setFollows(true);
            }
        } catch (error) {
            console.error("Krah pri follow zahtevu:", error);
        }
    }

    const [areFriends, setAreFriends]=useState("None");
    const [requestID, setRequestID] =useState(-1);

    //STATEOVI ZA PROZORE
    const [showFriendModal, setShowFriendModal] = useState(false);
    const [showUnfollowModal, setShowUnfollowModal]=useState(false);
    const [showReportModal, setShowReportModal]=useState(false);
    const [showVerifyModal,setShowVerifyModal]=useState(false);

    //STATEOVI ZA REPORT
    const [selectedReportType, setSelectedReportType] = useState("");
    const [reportDescription, setReportDescription] = useState("");

    useEffect(() => {
        async function checkFriendStatus() {
            if (!userToShow?.id || yourProfile) return;

            try {                
                const response = await authFetch(`/Social/GetFriendshipStatus/${userToShow.id}`, {
                    method: "GET"
                });

                if (response.ok) {
                    const status = await response.json(); 
                    setRequestID(status.requestID)
                    setAreFriends(status.status);
                }
            } catch (error) {
                console.error("Greška pri proveri prijateljstva:", error);
            }
        }

        checkFriendStatus();
    }, [userToShow?.id, yourProfile]);
    
    async function respondFriendRequest(requestId, status) {
        const response = await authFetch(
            `/Social/RespondFriendRequest/${requestId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: status,
                }),
            },
        )
        if (!response.ok) {
            console.log("Greška pri promeni statusa pristiglog zahteva")
            return false
        }
    }  

    async function handleAcceptRequest() {
        await respondFriendRequest(requestID, 2);
        setAreFriends("Friends");
        setShowFriendModal(false);
    }

    async function handleRejectRequest() {
        await respondFriendRequest(requestID, 1);
        setAreFriends("None");
        setShowFriendModal(false);
    }

    async function handleAddFriend(friendID){
        if(yourProfile || !areFriends) return;

        if(areFriends==="None"){
            const response = await authFetch(`/Social/SendFriendRequest/${friendID}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error(`Greška pri slanju zahteva za prijateljstvo: ${response.status}`);
            }
            setAreFriends("Outgoing");         
        }
        else if(areFriends==="Incoming"){
            setShowFriendModal(true);
        }
        else if(areFriends==="Outgoing"){
            const response = await authFetch(`/Social/CancelFriendRequest/${requestID}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Greška pri slanju prekidanju prijateljstva: ${response.status}`);
            }
            setAreFriends("None");  
        }
        else if(areFriends==="Friends"){
            const response = await authFetch(`/Social/RemoveFriend/${friendID}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Greška pri slanju prekidanju prijateljstva: ${response.status}`);
            }
            setAreFriends("None");  
        }
    }
    const renderFriendButton = () => {
        switch (areFriends) {
            case "Incoming":
                return (
                    <button className={styles["add-friend-btn"]} onClick={() => handleAddFriend(userToShow.id)}>
                        <ClockIcon className={styles["btn-icon"]} /> Wants to be your friend
                    </button>
                );
            case "Outgoing":
                return (
                    <button className={styles["add-friend-btn"]} onClick={() => handleAddFriend(userToShow.id)}>
                        <XMarkIcon className={styles["btn-icon"]} /> Cancel Request?
                    </button>
                );
            case "None":
                return (
                    <button className={styles["add-friend-btn"]} onClick={() => handleAddFriend(userToShow.id)}>
                        <UserPlusIcon className={styles["btn-icon"]} /> Add Friend
                    </button>
                );
            default: 
                return (
                    <button className={styles["add-friend-btn"]} onClick={() => handleAddFriend(userToShow.id)}>
                        <UserMinusIcon className={styles["btn-icon"]} /> Remove Friend
                    </button>
                );
        }
    };

    const formatMemberSince = (isoString) => {
        if (!isoString) return "nedavno";
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString("sr-Latn-RS", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        } catch {
            return "nedavno";
        }
    };

    async function handleReport(reason, description) {
        const response = await authFetch(`/Feedback/ReportUser/${userToShow.id}`,{
            method:"POST",
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                Reason: reason,
                Description: description
            })
        });
        if (!response.ok) {
            // Ako bekhend vrati BadRequest(e.Message), ovde ces videti sta je tacno puklo
            const errorText = await response.text();
            console.error("Server je odbio zahtev:", errorText);
        } else {
            console.log("Korisnik uspešno prijavljen!");
        }
    }

    return(
        <div className={styles["profile-card"]}>
            <div className={styles["top-section"]}>
                <div className={styles["left-meta"]}>
                    <div className={styles["avatar-container"]}>
                        <img src={userToShow?.profilePicture || "https://via.placeholder.com/150"} alt={userToShow?.username} className={styles["profile-avatar"]} />
                        {yourProfile && (
                            <button className={styles["change-pic-btn"]} title="Promeni sliku">
                                <CameraIcon className={styles["icon-camera"]} />
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles["right-section"]}>

                    {yourProfile ? 
                        userToShow.verificationStatus !=2 && <button className={styles["share-btn"]} onClick={console.log("TO DO")}>
                            <CheckCircleIcon className={styles["btn-icon"]} /> Verify
                        </button> :
                        <button className={styles["share-btn"]} onClick={()=>setShowReportModal(true)}>
                            <FlagIcon className={styles["btn-icon"]} /> Report
                        </button>
                    }

                    {!yourProfile && userToShow.role == 1 &&
                        (
                            follows ? 
                                <button className={styles["edit-btn"]} onClick={()=>setShowUnfollowModal(true)}>
                                        <SolidHeartIcon className={styles["btn-icon"]} /> Following                       
                                </button> :
                                <button className={styles["edit-btn"]} onClick={()=>handleFollow(userToShow.id)}>
                                        <HeartIcon className={styles["btn-icon"]} /> Follow                       
                                </button>
                        )
                    }

                    
                    {yourProfile ? (
                        <button className={styles["edit-btn"]} onClick={console.log("TO DO")}>
                            <PencilIcon className={styles["btn-icon"]} /> Edit 
                        </button>
                    ) : (
                        renderFriendButton()
                    )}

                    { yourProfile &&
                        <button className={styles["logout-btn"]}>
                            <ArrowLeftStartOnRectangleIcon className={styles["btn-icon"]} onClick={onLogout}/>
                        </button>
                    }
                </div>
            </div>

            <div className={styles["bottom-section"]}>
                <div className={styles["name-container"]}>
                        <h2 className={styles["profile-name"]}>
                            {userToShow?.username} 
                            {userToShow?.verificationStatus === 2 && <CheckCircleIcon className={styles["icon-verified"]} />}
                        </h2>
                        <p className={styles["profile-role"]}>{roleName}</p>
                        <p className={styles["profile-bio"]}>{userToShow?.bio || "I <3 Actions"}</p>
                        <div className={styles["meta-info"]}>
                            <span className={styles["meta-item"]}>
                                <CalendarIcon className={styles["meta-icon"]} /> Član od {formatMemberSince(userToShow.created)}
                            </span>
                        </div>
                </div>
            </div>

            {showFriendModal && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-container"]}>
                        <div className={styles["modal-header"]}>
                            <ClockIcon className={styles["modal-icon"]} />
                            <h3>Zahtev za prijateljstvo</h3>
                        </div>
                        <p className={styles["modal-body"]}>
                            Korisnik <strong>{userToShow?.username}</strong> vam je poslao zahtev. Da li želite da prihvatite?
                        </p>
                        <div className={styles["modal-actions"]}>
                            <button className={styles["modal-btn-reject"]} onClick={()=>{handleRejectRequest(); setShowFriendModal(false);}}>
                                Odbij
                            </button>
                            <button className={styles["modal-btn-accept"]} onClick={()=> {handleAcceptRequest(); setShowFriendModal(false);}}>
                                Prihvati
                            </button>
                        </div>
                        <button className={styles["modal-close-x"]} onClick={() => setShowFriendModal(false)}>
                            <XMarkIcon />
                        </button>
                    </div>
                </div>
            )}

            {showUnfollowModal && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-container"]}>
                        <div className={styles["modal-header"]}>
                            <ClockIcon className={styles["modal-icon"]} />
                            <h3>Unfollow?</h3>
                        </div>
                        <p className={styles["modal-body"]}>
                            Da li želite da <strong>unfollowujete</strong> korisnika <strong>{userToShow?.username}</strong> ?
                        </p>
                        <div className={styles["modal-actions"]}>
                            <button className={styles["modal-btn-reject"]} onClick={() =>setShowUnfollowModal(false)}>
                                Odustani
                            </button>
                            <button className={styles["modal-btn-accept"]} onClick={() => {handleFollow(userToShow.id); setShowUnfollowModal(false);}}>
                                Unfollow
                            </button>
                        </div>
                        <button className={styles["modal-close-x"]} onClick={() => setShowUnfollowModal(false)}>
                            <XMarkIcon />
                        </button>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-container"]}>
                        <div className={styles["modal-header"]}>
                            <FlagIcon className={styles["modal-icon"]} />
                            <h3>Report</h3>
                        </div>
                        <div className={styles["modal-body"]}>
                            <p className={styles["modal-instructions"]}>
                                Odaberite razlog reporta i kratko ga opišite:
                            </p>
                            
                            <div className={styles["form-group"]}>
                                <select 
                                    className={styles["modal-select"]}
                                    value={selectedReportType}
                                    onChange={(e) => setSelectedReportType(e.target.value)}
                                >
                                    <option value="" disabled>Izaberite razlog...</option>
                                    {reportTypes?.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles["form-group"]}>
                                <textarea
                                    className={styles["modal-textarea"]}
                                    placeholder="Unesite opis (obavezno)..."
                                    maxLength={250}
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    rows={4}
                                />
                                <div className={styles["char-counter"]}>
                                    {reportDescription.length} / 250
                                </div>
                            </div>
                        </div>
                        <div className={styles["modal-actions"]}>
                            <button className={styles["modal-btn-reject"]} onClick={() => {
                                setShowReportModal(false);
                                setSelectedReportType("");
                                setReportDescription("");
                            }}>
                                Odustani
                            </button>
                            <button 
                                className={styles["modal-btn-accept"]} 
                                disabled={!selectedReportType || !reportDescription.trim()}
                                onClick={() => { 
                                    handleReport(Number(selectedReportType), reportDescription);
                                    setShowReportModal(false);
                                    setSelectedReportType("");
                                    setReportDescription("");
                                }}
                            >
                                Report
                            </button>
                        </div>
                        <button className={styles["modal-close-x"]} onClick={() => {
                            setShowReportModal(false);
                            setSelectedReportType("");
                            setReportDescription("");
                        }}>
                            <XMarkIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}