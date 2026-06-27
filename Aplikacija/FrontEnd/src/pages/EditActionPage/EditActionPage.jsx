import { useState } from "react";
import styles from "./EditActionPage.module.css"; 

export default function EditActionPage({ actionData, onSave, onCancel }) {
    // Inicijalizujemo state sa svim podacima iz actionData
    const [formData, setFormData] = useState({
        ...actionData,
        // Ako neka polja nisu u actionData, ovde ih definiši kao prazna/0
    });
    
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

    
    const handleSave = async () => {
    try {
        const response = await fetch(`${baseUrl}/Action/EditAkcija/${formData.id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                latitude: formData.latitude || 0,
                longitude: formData.longitude || 0,
                actionPicture: formData.actionPicture || "",
                type: formData.type || 0,
                dtStart: formData.dtStart,
                dtEnd: formData.dtEnd || formData.dtStart,
                maxParticipants: formData.maxParticipants,
                price: formData.price
            })
        })

        if (response.ok) {
            alert("Akcija uspešno ažurirana!")
            onSave(formData)
        } else {
            const errorData = await response.text()
            alert("Greška: " + errorData)
        }
    } catch (err) {
        console.error("Greška pri čuvanju:", err)
    }
}

    return (
        <div className={styles["edit-container"]}>
            <h2>Uredi akciju</h2>
            
            <label>Naslov:</label>
            <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />

            <label>Opis:</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

            <label>Lokacija:</label>
            <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />

            <label>Max učesnika:</label>
            <input type="number" value={formData.maxParticipants} onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})} />

            <label>Cena:</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} />

            {/* Možeš dodati još inputa ako želiš da menjaš i tip, datume ili koordinate */}

            <div className={styles["btn-group"]}>
                <button className={styles["save-btn"]} onClick={handleSave}>Sačuvaj</button>
                <button className={styles["cancel-btn"]} onClick={onCancel}>Odustani</button>
            </div>
        </div>
    );
}