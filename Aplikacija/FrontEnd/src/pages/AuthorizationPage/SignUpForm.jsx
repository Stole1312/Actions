import { useState, useRef } from "react";
import styles from "./Auth.module.css";

export default function SignUpForm({ onSwitchToLogin }) {
    const [globalError, setGlobalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [step, setStep] = useState(1); 

    // DODATO: Stanja za prvu formu kako bi "Back" dugme radilo bez gubljenja podataka
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [bio, setBio] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    const fileInputRef = useRef(null);
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
    const [firstStepData, setFirstStepData] = useState(null);

    const [kod, setKod] = useState("");

    const clearFieldError = (fieldName) => {
        if (fieldErrors[fieldName]) {
            setFieldErrors(prev => {
                const copy = { ...prev };
                delete copy[fieldName];
                return copy;
            });
        }
    };

    async function handleFirstStepNext(e) {
        e.preventDefault(); 
        setGlobalError('');
        setFieldErrors({});

        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: "Lozinke se ne poklapaju!" });
            return;
        }

        setFirstStepData({ email, username, password });

        const formData = new FormData();
        formData.append("email", email);
        formData.append("username", username);
        formData.append("password", password);

        try {
            const response = await fetch(`${baseUrl}/User/StepOneCheck`, {
                method: "POST",
                body: formData 
            });

            if (!response.ok) {
                const errorText = await response.text();
                const lowerError = errorText.toLowerCase();
                if (lowerError.includes("email")) {
                    setFieldErrors({ email: errorText });
                } else if (lowerError.includes("username")) {
                    setFieldErrors({ username: errorText });
                } else if (lowerError.includes("password")) {
                    setFieldErrors({ password: errorText });
                } else {
                    setGlobalError(errorText);
                }
                return;
            }

            setStep(2);

        } catch (err) {
            console.error("Greška na koraku 1:", err.message);
            setGlobalError("Došlo je do greške na serveru.");
        }
    }

    async function handleVerifyClick() {
        setGlobalError('');
        setFieldErrors({});
        
        if (!kod || kod.trim().length !== 6) {
            setFieldErrors({ kod: "Kod mora imati tačno 6 cifara." });
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/User/StepTwoCheck`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(kod.trim()) 
            });

            if (!response.ok) {
                const errorText = await response.text();
                setFieldErrors({ kod: errorText });
                return;
            }

            setStep(3);

        } catch (err) {
            console.error("Greška na koraku 2:", err.message);
            setGlobalError("Greška pri verifikaciji koda.");
        }
    }

    function handleImageClick() {
        fileInputRef.current.click();
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); 

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result); 
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleFinalSubmit() {
        const url = baseUrl + "/User/AddUser";
        setGlobalError('');

        const formData = new FormData();
        formData.append("Email", firstStepData.email);
        formData.append("Username", firstStepData.username);
        formData.append("Password", firstStepData.password);
        formData.append("Bio", bio);
        
        if (imageFile) {
            formData.append("ProfilePictureFile", imageFile); 
        }

        try {
            const response = await fetch(`${url}`, {
                method: 'POST',
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
            setGlobalError(err.message);
        }
    }

    const hasDataEntered = (bio && bio.trim().length > 0) || imagePreview !== null;
    
    const getTranslateX = () => {
        if (step === 1) return "0%";
        if (step === 2) return "-33.333%";
        return "-66.666%";
    };

    return (
        <div className={`${styles['auth-slider-wrapper']} ${styles['login-container']}`}>
            {globalError && (
                <div className={styles['global-error-message']} style={{color: 'red', textAlign: 'center', marginBottom: '10px', fontWeight: 'bold'}}>
                    {globalError}
                </div>
            )}
            
            <div 
                className={styles['slider-content']} 
                style={{ 
                    transform: `translateX(${getTranslateX()})`, 
                    display: 'flex', 
                    transition: 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)',
                    width: '1260px' 
                }}
            >
                
                {/* PANE 1: OSNOVNI PODACI */}
                <div className={styles['slide-pane']}>
                    <form className={styles.loginForm} onSubmit={handleFirstStepNext}>   
                        <div className={styles.loginHeader}>
                            <h1>Sign Up</h1>
                            <p>Create your Akcije account</p>
                        </div> 
                        
                        <div className={styles['form-top-group']}>
                            <label>Email</label>
                            <input 
                                name="email" 
                                type="email" 
                                placeholder="Enter your email here" 
                                required 
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    clearFieldError("email");
                                }}
                                style={{ borderColor: fieldErrors.email ? 'red' : '' }}
                            />
                            {fieldErrors.email && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '10px' }}>{fieldErrors.email}</span>}

                            <label>Username</label>
                            <input 
                                name="username" 
                                type="text" 
                                placeholder="Choose a username" 
                                required 
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    clearFieldError("username");
                                }}
                                style={{ borderColor: fieldErrors.username ? 'red' : '' }}
                            />
                            {fieldErrors.username && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '10px' }}>{fieldErrors.username}</span>}
                            
                            <label>Password</label>
                            <input 
                                name="password" 
                                type="password" 
                                placeholder="Enter your password here" 
                                required 
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    clearFieldError("password");
                                }}
                                style={{ borderColor: fieldErrors.password ? 'red' : '' }}
                            />
                            {fieldErrors.password && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '10px' }}>{fieldErrors.password}</span>}

                            <label>Confirm Password</label>
                            <input 
                                name="confirmPassword" 
                                type="password" 
                                placeholder="Repeat your password here" 
                                required 
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    clearFieldError("confirmPassword");
                                }}
                                style={{ borderColor: fieldErrors.confirmPassword ? 'red' : '' }}
                            />
                            {fieldErrors.confirmPassword && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '10px' }}>{fieldErrors.confirmPassword}</span>}
                        </div>
                        
                        <button type="submit">Next</button>
                        <p>Already have an account?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
                                Click Here!
                            </a>
                        </p>
                    </form>
                </div>

                {/* PANE 2: VERIFIKACIONI KOD */}
                <div className={styles['slide-pane']}>
                    <div className={styles.loginForm}>
                        <div className={styles['form-top-group']}>
                            <div className={styles.loginHeader}>
                                <h1>Verify your email</h1>
                                <p>We sent a 6-digit verification code to your email address.</p>
                            </div>

                            <label>Verification Code</label>
                            <input 
                                type="text" 
                                maxLength={6}
                                placeholder="Enter 6-digit code" 
                                value={kod}
                                onChange={(e) => {
                                    setKod(e.target.value.replace(/\D/g, ''));
                                    clearFieldError("kod");
                                }}
                                required 
                                style={{ 
                                    textAlign: 'center', 
                                    fontSize: '20px', 
                                    letterSpacing: '4px',
                                    borderColor: fieldErrors.kod ? 'red' : ''
                                }}
                            />
                            {fieldErrors.kod && <span style={{ color: 'red', fontSize: '12px', marginTop: '5px', textAlign: 'center', display: 'block' }}>{fieldErrors.kod}</span>}
                        </div>

                        <div className={styles['buttons-group']}>
                            <button type="button" onClick={() => setStep(1)} className={styles['back-btn']}>
                                Back
                            </button>
                            <button type="button" onClick={handleVerifyClick} className={styles['final-submit-btn']}>
                                Verify
                            </button>
                        </div>
                    </div>
                </div>

                {/* PANE 3: PERSONALIZACIJA */}
                <div className={styles['slide-pane']}>
                    <div className={styles.loginForm}>
                        <div className={styles['form-top-group']}>
                            <div className={styles.loginHeader}>
                                <h1>Personalize your page</h1>
                                <p>Share a bit about yourself</p>
                            </div>

                            <div className={styles['image-upload-section']}>
                                <label>Profile Picture</label>
                                <div className={styles['profile-circle']} onClick={handleImageClick}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className={styles['profile-preview-img']} />
                                    ) : (
                                        <span className={styles['plus-icon']}>+</span>
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

                            <div className={styles['bio-section']}>
                                <label>Biography</label>
                                <textarea 
                                    placeholder="Tell us something about yourself..."
                                    maxLength={250}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className={styles['bio-textarea']}
                                />
                                <div className={styles['char-counter']}>
                                    {(bio || '').length}/250
                                </div>
                            </div>
                        </div>

                        <div className={styles['buttons-group']}>
                            <button type="button" onClick={() => setStep(2)} className={styles['back-btn']}>
                                Back
                            </button>
                            <button type="button" onClick={handleFinalSubmit} className={styles['final-submit-btn']}>
                                {hasDataEntered ? 'Confirm' : 'Skip'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}