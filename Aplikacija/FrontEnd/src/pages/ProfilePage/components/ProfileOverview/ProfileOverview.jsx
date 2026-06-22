import React from "react"
import { 
    LinkIcon, 
    PencilIcon, 
    UserPlusIcon, 
    CalendarIcon, 
    CameraIcon, 
    CheckCircleIcon ,
    ArrowLeftStartOnRectangleIcon
} from "@heroicons/react/24/outline"
import styles from "./ProfileOverview.module.css"
import { useState, useEffect } from "react"

export default function ProfileOverview({ userToShow, yourProfile, onAddFriend, onEditProfile, onShareProfile, onLogout }){  
    const [roles, setRoles] = useState([]);
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

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

    return(
        <div className={styles["profile-card"]}>
            {/* GORNJI RED: Slika, Ime i Dugmići */}
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

                {/* DESNA STRANA: Akciona dugmad */}
                <div className={styles["right-section"]}>
                    <button className={styles["share-btn"]} onClick={onShareProfile}>
                        <LinkIcon className={styles["btn-icon"]} /> Podeli profil
                    </button>
                    
                    {yourProfile ? (
                        <button className={styles["edit-btn"]} onClick={onEditProfile}>
                            <PencilIcon className={styles["btn-icon"]} /> Uredi profil
                        </button>
                    ) : (
                        <button className={styles["add-friend-btn"]} onClick={onAddFriend}>
                            <UserPlusIcon className={styles["btn-icon"]} /> Dodaj u prijatelje
                        </button>
                    )}

                    <button className={styles["logout-btn"]}>
                        <ArrowLeftStartOnRectangleIcon className={styles["btn-icon"]} onClick={onLogout}/>
                    </button>
                </div>
            </div>

            {/* DONJI RED: Biografija i informacije koje idu ispod slike */}
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
                                <CalendarIcon className={styles["meta-icon"]} /> Član od {formatMemberSince(userToShow?.created)}
                            </span>
                        </div>

                </div>

            </div>
        </div>
    );
}