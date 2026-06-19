import { useState, useEffect } from "react"
import styles from "./MpHeader.module.css"
import { 
    MagnifyingGlassIcon, 
    CalendarIcon, 
    MapPinIcon, 
    BellIcon 
} from "@heroicons/react/24/outline"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MpHeader(props) {
    const profilePicture = localStorage.getItem("profilePicture");
    
    const [types, setTypes] = useState([]);
    const [activeType, setActiveType] = useState(null);

    useEffect(() => {
        async function fetchTypes() {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
                const response = await fetch(`${baseUrl}/Action/GetActionTypes`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                
                // Spajamo opciju "Sve" i čiste nazive sa bekenda
                setTypes([{ id: null, name: "Sve" }, ...data]);
            } catch (error) {
                console.error("Greška pri povlačenju tipova:", error);
            }
        }

        fetchTypes();
    }, []);

    return (
        <header className={styles["header-main-page"]}>
            
            {/* GORNJI RED (Pretraga, Kalendar, Lokacija, Profil) */}
            <div className={styles["upper-header"]}>
                {/* Search */}
                <div className={styles["search-container"]}>
                    <MagnifyingGlassIcon className={styles["input-icon"]} />
                    <input
                        type="text"
                        placeholder="Search akcije..."
                        className={styles["custom-input"]}
                    />
                </div>

                {/* Kalendar */}
                <div className={styles["datepicker-container"]}>
                    <CalendarIcon className={styles["input-icon"]} />
                    <DatePicker
                        placeholderText="Select date"
                        className={styles["custom-datepicker"]}
                    />
                </div>

                {/* Dropdown za lokaciju */}
                <div className={styles["dropdown-container"]}>
                    <MapPinIcon className={styles["input-icon-dropdown"]} />
                    <DropdownButton 
                        id="dropdown-basic-button" 
                        title="Beograd"
                        className={styles["custom-dropdown"]}
                    >
                        <Dropdown.Item href="#/beograd">Beograd</Dropdown.Item>
                        <Dropdown.Item href="#/nis">Niš</Dropdown.Item>
                        <Dropdown.Item href="#/novisad">Novi Sad</Dropdown.Item>
                    </DropdownButton>
                </div>

                {/* Notifikacije i profil slika */}
                <div className={styles["right-side-container"]}>
                    <div className={styles["notification-bell"]}>
                        <BellIcon className={styles["bell-icon"]} />
                        <span className={styles["bell-badge"]}></span>
                    </div>

                    <div className={styles["profile-picture-container"]}>
                        <img 
                            src={profilePicture} 
                            alt="Profile Picture" 
                            className={styles["profile-picture-img"]} 
                            onClick={() => props.onImageClick()}
                        />
                    </div>
                </div>
            </div>

            {/* DONJI RED (Tipovi / Enum dugmići sa bekenda) */}
            <div className={styles["lower-header"]}>
                <span className={styles["tip-label"]}>Tip:</span>
                <div className={styles["buttons-list"]}>
                    {types.map((type) => (
                        <button
                            key={type.id ?? "all"}
                            onClick={() => setActiveType(type.id)}
                            className={`${styles["filter-button"]} ${
                                activeType === type.id ? styles["active"] : ""
                            }`}
                        >
                            {type.name}
                        </button>
                    ))}
                </div>
            </div>

        </header>
    )
}