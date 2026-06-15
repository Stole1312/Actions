import { useState, useRef } from "react";
import "./Auth.css" ;

export default function SignUpForm({ onSwitchToLogin }) {
    const [error, setError] = useState('');
    // Pratimo korak registracije: 1 je prva forma, 2 je personalizacija (slika i bio)
    const [step, setStep] = useState(1); 

    // Stanja za drugi korak (Personalizacija)
    const [bio, setBio] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    
    // 1. NOVO STANJE: Ovde čuvamo stvarni fajl za slanje na backend
    const [imageFile, setImageFile] = useState(null);
    
    const fileInputRef = useRef(null);

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
    
    // Privremeno čuvamo podatke iz prvog koraka dok korisnik ne završi drugi korak
    const [firstStepData, setFirstStepData] = useState(null);

    // --- KORAK 1: Provera inicijalnih podataka ---
    function handleFirstStepNext(formData) {
        setError('');
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password !== confirmPassword) {
            setError("Lozinke se ne poklapaju!");
            alert("Lozinke se ne poklapaju!");
            return;
        }

        // Čuvamo podatke iz prve forme u stanje
        setFirstStepData({
            email: formData.get("email"),
            username: formData.get("username"),
            password: password
        });

        // Prelazimo na korak 2 (personalizacija)
        setStep(2);
    }

    // --- KLIK NA KRUŽNO POLJE ZA SLIKU ---
    function handleImageClick() {
        fileInputRef.current.click();
    }

    // --- PRIKAZ I ČUVANJE SELEKTOVANE SLIKE ---
    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            // Čuvamo pravi fajl objekat koji ćemo spakovati u FormData
            setImageFile(file); 

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result); // Ovo ostaje SAMO za prikaz na ekranu
            };
            reader.readAsDataURL(file);
        }
    }

    // --- KORAK 2: Konačno slanje na Backend ---
    async function handleFinalSubmit() {
        const url = baseUrl + "/User/AddUser";
        setError('');

        // 2. KORISTIMO FormData UMESTO JSON-a
        const formData = new FormData();
        
        // Dodajemo tekstualne podatke iz prvog koraka (Ključevi moraju pratiti backend DTO!)
        formData.append("Email", firstStepData.email);
        formData.append("Username", firstStepData.username);
        formData.append("Password", firstStepData.password);
        
        // Dodajemo podatke iz drugog koraka
        formData.append("Bio", bio);
        
        // 3. Ako je slika izabrana, dodajemo sirovi fajl pod imenom koje backend očekuje
        if (imageFile) {
            formData.append("ProfileImageFile", imageFile); 
        }

        try {
            const response = await fetch(`${url}`, {
                method: 'POST',
                // VAŽNO: Ne stavljamo 'Content-Type' header! Browser će to uraditi sam.
                body: formData, 
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert('Uspešno ste se registrovali! Sada se možete ulogovati.');
            onSwitchToLogin();
            
        } catch (err) {
            console.error("KRAH REGISTRACIJE:", err.message);
            alert(err.message);
            setError(err.message);
        }
    }

    // Bezbedniji trim ako je bio slučajno null/undefined u nekom momentu
    const hasDataEntered = (bio && bio.trim().length > 0) || imagePreview !== null;

    return (
        /* Glavni kontejner koji glumi BELU KARTICU */
        <div className="login-container auth-slider-wrapper">
            
            {/* Unutrašnja traka koja se šeta levo-desno */}
            <div className={`slider-content ${step === 2 ? 'slide-active' : ''}`}>
                
                {/* PANEL 1: Prvi korak */}
                <div className="slide-pane">
                    <form className="loginForm" action={handleFirstStepNext}>   
                        <div className="loginHeader">
                            <h1>Sign Up</h1>
                            <p>Create your Akcije account</p>
                        </div> 
                        
                        <label>Email</label>
                        <input name="email" type="email" placeholder="Enter your email here" required />

                        <label>Username</label>
                        <input name="username" type="text" placeholder="Choose a username" required />
                        
                        <label>Password</label>
                        <input name="password" type="password" placeholder="Enter your password here" required />

                        <label>Confirm Password</label>
                        <input name="confirmPassword" type="password" placeholder="Repeat your password here" required />
                        
                        <button type="submit">Sign Up!</button>
                        <p>Already have an account?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
                                Click Here!
                            </a>
                        </p>
                    </form>
                </div>

                {/* PANEL 2: Personalizacija */}
                <div className="slide-pane">
                    <div className="loginForm">
                        <div className="loginHeader">
                            <h1>Personalize your page</h1>
                            <p>Share a bit about yourself</p>
                        </div>

                        <div className="image-upload-section">
                            <label>Profile Picture</label>
                            <div className="profile-circle" onClick={handleImageClick}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="profile-preview-img" />
                                ) : (
                                    <span className="plus-icon">+</span>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                                style={{ display: 'none' }} 
                                accept="image/*"
                            />
                        </div>

                        <div className="bio-section">
                            <label>Biography</label>
                            <textarea 
                                placeholder="Tell us something about yourself..."
                                maxLength={250}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="bio-textarea"
                            />
                            <div className="char-counter">
                                {(bio || '').length}/250
                            </div>
                        </div>

                        <div className="buttons-group">
                            <button type="button" onClick={() => setStep(1)} className="back-btn">
                                Back
                            </button>
                            <button type="button" onClick={handleFinalSubmit} className="final-submit-btn">
                                {hasDataEntered ? 'Confirm' : 'Skip'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}