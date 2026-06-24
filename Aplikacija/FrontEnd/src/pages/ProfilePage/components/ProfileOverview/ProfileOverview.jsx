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
    UserMinusIcon,
    FaceSmileIcon
} from "@heroicons/react/24/outline"
import { HeartIcon as SolidHeartIcon} from "@heroicons/react/24/solid" 
import styles from "./ProfileOverview.module.css"
import { useState, useEffect } from "react"
import { authFetch } from "../../../../api"
/* ========================================== */
/* NOVE PROMENE: Importovanje Cropper komponente */
/* ========================================== */
import Cropper from "react-easy-crop"
import { GrFormDown } from "react-icons/gr"

export default function ProfileOverview({ userToShow, yourProfile, onLogout, reportTypes,setZelimRefresh }){  

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
    const [showVerifyModal, setShowVerifyModal]=useState(false);
    const [showEditModal, setShowEditModal]=useState(false);
    const [showChangePicture, setShowChangePicture]=useState(false);


    //STATEOVI ZA REPORT
    const [selectedReportType, setSelectedReportType] = useState("");
    const [reportDescription, setReportDescription] = useState("");

    //STATE ZA VERIFIKACIJU
    const [selectedFile,setSelectedFile] = useState(null);

    //STATE ZA EDIT
    const [editUsername, setEditUsername] = useState(userToShow?.username || "");
    const [editEmail, setEditEmail] = useState(userToShow?.email || "");
    const [editBio, setEditBio] = useState(userToShow?.bio || "");

    useEffect(() => {
        if (userToShow) {
            setEditUsername(userToShow.username || "");
            setEditEmail(userToShow.email || "");
            setEditBio(userToShow.bio || "");
        }
    }, [userToShow]);

    const isFormChanged = 
        editUsername !== (userToShow?.username || "") || 
        editEmail !== (userToShow?.email || "") || 
        editBio !== (userToShow?.bio || "");

    /* ========================================================================= */
    /* NOVE PROMENE: State-ovi za potrebe kropovanja slike (pozicija, zum, pikseli) */
    /* ========================================================================= */
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
            const errorText = await response.text();
            console.error("Server je odbio zahtev:", errorText);
        } else {
            console.log("Korisnik uspešno prijavljen!");
        }
    }

    async function handleVerification(document) {
        console.log(`dokument:${document}`);
        const formData = new FormData();
        formData.append("Document",document);
        const response = await authFetch(`/User/SubmitVerificationRequest/${userToShow.id}`,{
            method:"POST",
            body: formData      
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server je odbio zahtev:", errorText);
        } else {
            console.log("Korisnik uspešno prijavljen!");
        }
    }

    /* ========================================================================= */
    /* NOVE PROMENE: Funkcija koja se poziva kada korisnik završi pozicioniranje slike */
    /* ========================================================================= */
    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    /* ========================================================================= */
    /* NOVE PROMENE: Pomoćna funkcija koja preko Canvas-a seče sliku i pravi Blob */
    /* ========================================================================= */
    const getCroppedImg = (imageSrc, pixelCrop) => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;

                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    pixelCrop.width,
                    pixelCrop.height
                );

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Canvas je prazan"));
                        return;
                    }
                    blob.name = "cropped-avatar.jpg";
                    resolve(blob);
                }, "image/jpeg");
            };
            image.onerror = (htmlError) => reject(htmlError);
        });
    };

    /* ========================================================================= */
    /* NOVE PROMENE: Handler koji pre samog slanja iseče sliku i šalje je dalje   */
    /* ========================================================================= */
    async function handlePictureChange() {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            
            // PRAVI SUBMIT NA BACKEND (Ovde pozivaš tvoj endpoint/funkciju)
            console.log("Spreman isečen fajl za slanje:", croppedBlob);
            
            // Gasimo sve i zatvaramo modal uspešno
            setShowChangePicture(false);
            setImageSrc(null);
            setCroppedAreaPixels(null);
        } catch (e) {
            console.error("Greška prilikom kropovanja slike:", e);
        }
    }

    /* ========================================================================= */
    /* NOVE PROMENE: Čišćenje svih stanja kada korisnik odustane ili zatvori modal */
    /* ========================================================================= */
    const handleCloseChangePictureModal = () => {
        setShowChangePicture(false);
        setImageSrc(null);
        setCroppedAreaPixels(null);
    };

    async function handleEdit(userName, userBio, email){
        const formData = new FormData();
        console.log("username:",userName);
        if(imageSrc!=null && croppedAreaPixels!=null)
        {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            formData.append("ProfilePictureFile", croppedBlob, "avatar.jpg");
        }

        if(userName)
            formData.append("Username", userName);
        if(userBio)
            formData.append("Bio",userBio);
        if(email)
            formData.append("Email",email);

        try {
            const response = await authFetch(`/User/EditUser`, {
                method: "PUT",
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server je odbio izmenu (400/500):", errorText);
            } else {
                console.log("Profil uspešno ažuriran!");
                handleCloseChangePictureModal(); // Zatvori modal nakon uspešnog slanja
                const data = await response.json();
                console.log(data);
                localStorage.setItem("user",JSON.stringify(data.userViewModel));//ovo ce da uradi da se u localStorage promeni slika da ne bi covek morao
                //da se izloguje da vidi promenu
                setZelimRefresh(prethodno => !prethodno);
                // Opciono: Ako imaš funkciju za osvežavanje podataka o korisniku na stranici, pozovi je ovde
            }
        } catch (error) {
            console.error("Mrežna greška pri slanju podataka:", error);
        }
    }

    return(
        <div className={styles["profile-card"]}>
            <div className={styles["top-section"]}>
                <div className={styles["left-meta"]}>
                    <div className={styles["avatar-container"]}>
                        <img src={userToShow?.profilePicture || "https://via.placeholder.com/150"} alt={userToShow?.username} className={styles["profile-avatar"]} />
                        {yourProfile && (
                            <button className={styles["change-pic-btn"]} title="Promeni sliku" onClick={()=>setShowChangePicture(true)}>
                                <CameraIcon className={styles["icon-camera"]} />
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles["right-section"]}>

                    {yourProfile ? 
                        userToShow.verificationStatus !=2 && <button className={styles["share-btn"]} onClick={()=>setShowVerifyModal(true)}>
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
                        <button className={styles["edit-btn"]} onClick={()=>setShowEditModal(true)}>
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

            {/* MODALI */}
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

            {showVerifyModal && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-container"]}>
                        <div className={styles["modal-header"]}>
                            <CheckCircleIcon className={styles["modal-icon"]} />
                            <h3>Verify</h3>
                        </div>
                        <div className={styles["modal-body"]}>
                            <p className={styles["modal-instructions"]}>
                                Uploudujte dokument kako bi ste se verifikovali:
                            </p>
                            
                            {/* POLJE ZA UPLOAD SLIKE */}
                            <div className={styles["form-group"]}>
                                <label className={styles["image-upload-zone"]}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className={styles["image-upload-input"]}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setSelectedFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <div className={styles["image-upload-content"]}>
                                        <svg className={styles["image-upload-icon"]} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                        </svg>
                                        <span className={styles["image-upload-text"]}>
                                            {selectedFile ? selectedFile.name : "Kliknite ili prevucite sliku dokumenta ovde"}
                                        </span>
                                    </div>
                                </label>
                            </div>

                        </div>
                        <div className={styles["modal-actions"]}>
                            <button className={styles["modal-btn-reject"]} onClick={() => {
                                setShowVerifyModal(false);
                                setSelectedFile(null); 
                            }}>
                                Odustani
                            </button>
                            <button 
                                className={styles["modal-btn-accept"]} 
                                disabled={!selectedFile}
                                onClick={() => { 
                                    handleVerification(selectedFile); 
                                    setShowVerifyModal(false);
                                    setSelectedFile(null);
                                }}
                            >
                                Pošalji
                            </button>
                        </div>
                        <button className={styles["modal-close-x"]} onClick={() => {
                            setShowVerifyModal(false);
                            setSelectedFile(null);
                        }}>
                            <XMarkIcon />
                        </button>
                    </div>
                </div>
            )}

            {showChangePicture && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-container"]}>
                        <div className={styles["modal-header"]}>
                            <FaceSmileIcon className={styles["modal-icon"]} />
                            <h3>Smile</h3>
                        </div>
                        <div className={styles["modal-body"]}>
                            
                            {!imageSrc ? (
                                <>
                                    <p className={styles["modal-instructions"]}>
                                        Uploudujte novu profilnu sliku
                                    </p>
                                    
                                    <div className={styles["form-group-avatar"]}>
                                        <label className={styles["image-upload-zone"]}>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className={styles["image-upload-input"]}
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        
                                                        const reader = new FileReader();
                                                        reader.addEventListener("load", () => {
                                                            setImageSrc(reader.result);
                                                        });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <div className={styles["image-upload-content"]}>
                                                <svg className={styles["image-upload-icon"]} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                                </svg>
                                                <span className={styles["image-upload-text"]}>
                                                    Kliknite za novu profilnu sliku
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className={styles["modal-instructions"]}>
                                        Centrirajte i zumirajte svoju sliku unutar kruga:
                                    </p>
                                    <div style={{ position: "relative", width: "100%", height: "240px", background: "#15161e", borderRadius: "14px", marginTop: "14px", overflow: "hidden" }}>
                                        <Cropper
                                            image={imageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={1}
                                            cropShape="round"
                                            showGrid={false}
                                            onCropChange={setCrop}
                                            onZoomChange={setZoom}
                                            onCropComplete={onCropComplete}
                                            style={{
                                                containerStyle: { width: "100%", height: "100%", position: "relative" },
                                                cropAreaStyle: { border: "2px solid #f59e0b" }
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "14px" }}>
                                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Zumiraj:</span>
                                        <input
                                            type="range"
                                            value={zoom}
                                            min={1}
                                            max={3}
                                            step={0.1}
                                            aria-label="Zoom"
                                            onChange={(e) => setZoom(Number(e.target.value))}
                                            style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }}
                                        />
                                    </div>
                                </>
                            )}

                        </div>
                        <div className={styles["modal-actions"]}>
                            <button className={styles["modal-btn-reject"]} onClick={()=>handleCloseChangePictureModal()}>
                                Odustani
                            </button>
                            <button 
                                className={styles["modal-btn-accept"]} 
                                disabled={!imageSrc}
                                onClick={()=>{handlePictureChange(); handleEdit(userToShow.username,null,null)}}
                            >
                                Pošalji
                            </button>
                        </div>
                        <button className={styles["modal-close-x"]} onClick={()=>handleCloseChangePictureModal()}>
                            <XMarkIcon />
                        </button>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-container"]}>
                        <div className={styles["modal-header"]}>
                            {/* Možeš zameniti ikonicu sa npr. PencilIcon ako je imaš, ili zadrži istu */}
                            <FlagIcon className={styles["modal-icon"]} />
                            <h3>Izmena Profila</h3>
                        </div>
                        <div className={styles["modal-body"]}>
                            <p className={styles["modal-instructions"]}>
                                Unesite nove podatke za izmenu profila:
                            </p>
                            
                            {/* Polje za Username */}
                            <div className={styles["form-group"]}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Korisničko ime:</label>
                                <input 
                                    type="text"
                                    className={styles["modal-textarea"]} // koristi isti stil, samo rows smanji vizuelno ili je input bolji
                                    style={{ height: '40px', padding: '8px', resize: 'none' }}
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    placeholder="Novi username..."
                                />
                            </div>

                            {/* Polje za Email */}
                            <div className={styles["form-group"]}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email adresa:</label>
                                <input 
                                    type="email"
                                    className={styles["modal-textarea"]}
                                    style={{ height: '40px', padding: '8px', resize: 'none' }}
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder="Novi email..."
                                />
                            </div>

                            {/* Polje za Biografiju */}
                            <div className={styles["form-group"]}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Biografija:</label>
                                <textarea
                                    className={styles["modal-textarea"]}
                                    placeholder="Unesite novu biografiju..."
                                    maxLength={250}
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    rows={4}
                                />
                                <div className={styles["char-counter"]}>
                                    {editBio.length} / 250
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles["modal-actions"]}>
                            <button 
                                className={styles["modal-btn-reject"]} 
                                onClick={() => {
                                    setShowEditModal(false);
                                    // Resetujemo na stare vrednosti pri odustajanju
                                    setEditUsername(userToShow?.username || "");
                                    setEditEmail(userToShow?.email || "");
                                    setEditBio(userToShow?.bio || "");
                                }}
                            >
                                Odustani
                            </button>
                            <button 
                                className={styles["modal-btn-accept"]} 
                                /* Dugme radi samo ako je nešto stvarno promenjeno */
                                disabled={!isFormChanged || !editUsername.trim() || !editEmail.trim()}
                                onClick={() => { 
                                    handleEdit(editUsername, editBio, editEmail);
                                    setShowEditModal(false)
                                }}
                            >
                                Potvrdi
                            </button>
                        </div>
                        
                        <button 
                            className={styles["modal-close-x"]} 
                            onClick={() => {
                                setShowEditModal(false);
                                setEditUsername(userToShow?.username || "");
                                setEditEmail(userToShow?.email || "");
                                setEditBio(userToShow?.bio || "");
                            }}
                        >
                            <XMarkIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}