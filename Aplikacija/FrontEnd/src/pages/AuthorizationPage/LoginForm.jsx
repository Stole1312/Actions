import { useState } from "react"
import styles from "./Auth.module.css"
import { Cog6ToothIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function LoginForm({ onSwitchToSignUp, onLoginSuccess }) {
    const [error, setError] = useState({ field: "", message: "" })
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [verificationCode, setVerificationCode]=useState("");
    const [showChangePassword,setShowChangePassword]=useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.target)
        const url = baseUrl + "/User/Login"
        setError({ field: "", message: "" })

        try {
            const response = await fetch(`${url}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Username: formData.get("username"),
                    Password: formData.get("password"),
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()

                if (errorText.toLowerCase().includes("username")) {
                    setError({ field: "username", message: errorText })
                } else if (errorText.toLowerCase().includes("password")) {
                    setError({ field: "password", message: errorText })
                    setPassword("")
                } else {
                    setError({ field: "general", message: errorText })
                }
                return
            }

            const data = await response.json()
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.userViewModel))

            alert("Uspešno ste se ulogovali!")
            onLoginSuccess(data.userViewModel)
        } catch (err) {
            console.error("KRAH:", err.message)
            setError({
                field: "general",
                message: "Upps, nešto je puklo. Pokušajte ponovo.",
            })
        }
    }

    async function handlePasswordChange() {
        if(newPassword!==confirmPassword)
        {
            setPasswordError(true);
            return;
        }

        const response = await fetch(`${baseUrl}/User/ChangePassword/${username}`,{
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                VerificationCode: verificationCode.trim(), // State za polje verifikacionog koda
                NewPassword: newPassword                   // State za novu šifru
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            setError({ field: "username", message: errorText });
            return;
        }
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError(false);
        setShowChangePassword(false);
    }

    async function handleGetMail() {
        const response = await fetch(`${baseUrl}/User/SendChangePasswordMail/${username}`,{
            method:"GET"
        })
        if (!response.ok) {
            const errorText = await response.text();
            setError({ field: "username", message: errorText });
            return;
        }
    }

    return (
        <div
            className={`${styles["auth-slider-wrapper"]} ${styles["login-container"]}`}
        >
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <div className={styles["form-top-group"]}>
                    <div className={styles.loginHeader}>
                        <h1>Login</h1>
                        <p>Welcome to Akcije</p>
                    </div>

                    {error.field === "general" && (
                        <p
                            style={{
                                color: "#DC2626",
                                fontSize: "14px",
                                fontWeight: "bold",
                                marginBottom: "15px",
                            }}
                        >
                            {error.message}
                        </p>
                    )}

                    <label
                        style={{
                            color:
                                error.field === "username"
                                    ? "#DC2626"
                                    : "inherit",
                        }}
                    >
                        Username
                    </label>
                    <input
                        name="username"
                        type="text"
                        placeholder="Enter your username here"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            border:
                                error.field === "username"
                                    ? "2px solid #DC2626"
                                    : "1px solid #ccc",
                            marginBottom:
                                error.field === "username" ? "5px" : "10px",
                        }}
                    />
                    {error.field === "username" && (
                        <span
                            style={{
                                color: "#DC2626",
                                fontSize: "14px",
                                fontWeight: "bold",
                                marginBottom: "15px",
                                display: "block",
                            }}
                        >
                            {error.message}
                        </span>
                    )}

                    <label
                        style={{
                            color:
                                error.field === "password"
                                    ? "#DC2626"
                                    : "inherit",
                        }}
                    >
                        Password
                    </label>
                    <input
                        name="password"
                        type="password"
                        placeholder="Enter your password here"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            border:
                                error.field === "password"
                                    ? "2px solid #DC2626"
                                    : "1px solid #ccc",
                            marginBottom:
                                error.field === "password" ? "5px" : "10px",
                        }}
                    />
                    {error.field === "password" && (
                        <span
                            style={{
                                color: "#DC2626",
                                fontSize: "14px",
                                fontWeight: "bold",
                                marginBottom: "15px",
                                display: "block",
                            }}
                        >
                            Forgot your password?  
                            <a
                                href="#"
                                onClick={()=> {handleGetMail(); setShowChangePassword(true)}}
                            >
                                👉 👈 🥺
                            </a>
                        </span>
                    )}
                </div>

                <button type="submit">Log in!</button>
                <p>
                    Don't have account yet?{" "}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            onSwitchToSignUp()
                        }}
                    >
                        Click Here!
                    </a>
                </p>
            </form>
            
            {showChangePassword && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-container"]}>
                        <div className={styles["modal-header"]}>
                            <Cog6ToothIcon className={styles["modal-icon"]} />
                            <h3>Change password</h3>
                        </div>
                                                <div className={styles["modal-body"]}>
                            <p className={styles["modal-instructions"]}>
                                <strong>Verification code has been sent to your email</strong>
                            </p>


                            <div className={styles["form-group"]}>
                                <label>Verification Code</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter 6-digit code" 
                                    required 
                                    value={verificationCode}
                                    onChange={(e) =>{
                                        setVerificationCode(e.target.value)
                                    }}
                                />
                            </div>


                            <div className={styles["form-group"]}>
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter new password" 
                                    required 
                                    value={newPassword}
                                    onChange={(e) =>{
                                        setNewPassword(e.target.value)
                                        setPasswordError(false);
                                    }}
                                />
                            </div>


                            <div className={styles["form-group"]}>
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Repeat new password" 
                                    required 
                                    value={confirmPassword}
                                    onChange={(e) =>{
                                        setConfirmPassword(e.target.value)
                                        setPasswordError(false);
                                    }}
                                />
                                {passwordError && (
                                    <span style={{ color: "#DC2626", fontSize: "12px", marginTop: "4px", textAlign: "left", fontWeight: "bold" }}>
                                        Passwords do not match!
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles["modal-actions"]}>
                            <button className={styles["modal-btn-reject"]} onClick={() => setShowChangePassword(false)}>
                                Cancel
                            </button>
                            <button className={styles["modal-btn-accept"]} onClick={() => { handlePasswordChange();}}>
                                Confirm
                            </button>
                        </div>
                        
                        <button className={styles["modal-close-x"]} onClick={() => {setPasswordError(false); setShowChangePassword(false);}}>
                            <XMarkIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
