import { useState } from "react";

export default function MainPage({ onLogout, handleAddActionClick }) {
    // Čitamo username i profilnu sliku iz localStorage-a
    const username = localStorage.getItem("username") || "Guest";
    const profilePicture = localStorage.getItem("profilePicture");

    function handleLogoutClick() {
        localStorage.clear(); // Briše token, username i sliku iz memorije browsera
        onLogout(); // Javlja App.jsx-u da vrati login ekran
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            
            {/* OKVIR ZA PROFILNU SLIKU */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                {profilePicture ? (
                    <img 
                        src={profilePicture} 
                        alt="Profile" 
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%', // Pravi savršen krug
                            objectFit: 'cover',   // Sprečava razvlačenje slike
                            border: '3px solid #3B82F6', // Lep plavi okvir oko slike
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                ) : (
                    /* Ako slika iz nekog razloga ne postoji, prikazujemo sivi krug sa prvim slovom */
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#6B7280',
                        border: '3px solid #D1D5DB'
                    }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <h1>Welcome, {username}!</h1>
            <p style={{ color: '#4B5563' }}>Uspesno si na glavnoj stranici aplikacije Akcije.</p>
            <br />
            
            <button onClick={handleLogoutClick} style={{ maxWidth: '200px' }}>
                Log Out
            </button>

            <button onClick={handleAddActionClick}>AddAction</button>
        </div>
    );
}