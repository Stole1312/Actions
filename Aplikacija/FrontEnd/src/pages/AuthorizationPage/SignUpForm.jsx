import { useState, useRef } from "react";
import styles from "./Auth.module.css";

export default function SignUpForm({ onSwitchToLogin }) {
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); 

    const [bio, setBio] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    const fileInputRef = useRef(null);
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
    const [firstStepData, setFirstStepData] = useState(null);

    function handleFirstStepNext(formData) {
        setError('');
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password !== confirmPassword) {
            setError("Lozinke se ne poklapaju!");
            alert("Lozinke se ne poklapaju!");
            return;
        }

        setFirstStepData({
            email: formData.get("email"),
            username: formData.get("username"),
            password: password
        });

        setStep(2);
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
        setError('');

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
            alert(err.message);
            setError(err.message);
        }
    }

    const hasDataEntered = (bio && bio.trim().length > 0) || imagePreview !== null;

    return (
        <div className={`${styles['auth-slider-wrapper']} ${styles['login-container']}`}>
            <div className={`${styles['slider-content']} ${step === 2 ? styles['slide-active'] : ''}`}>
                
                <div className={styles['slide-pane']}>
                    <form className={styles.loginForm} action={handleFirstStepNext}>   
                        <div className={styles.loginHeader}>
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

                <div className={styles['slide-pane']}>
                    <div className={styles.loginForm}>
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

                        <div className={styles['buttons-group']}>
                            <button type="button" onClick={() => setStep(1)} className={styles['back-btn']}>
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