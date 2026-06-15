import { useState } from "react";
import "./Auth.css" ;

export default function LoginForm({ onSwitchToSignUp, onLoginSuccess }){
    const [error, setError] = useState({ field: '', message: '' }); 
    
    // Uvodimo stanja samo za čuvanje teksta u poljima nakon greške
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;

    async function handleSubmit(e) {
        e.preventDefault(); // Sprečavamo podrazumevani submit da nam browser ne obriše polja
        
        const formData = new FormData(e.target);
        const url = baseUrl + "/User/Login";
        setError({ field: '', message: '' });

        try {
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Username: formData.get("username"),
                    Password: formData.get("password")
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                
                if (errorText.toLowerCase().includes("username")) {
                    setError({ field: 'username', message: errorText });
                } else if (errorText.toLowerCase().includes("password")) {
                    setError({ field: 'password', message: errorText });
                    // Ako je pogrešna šifra, brišemo samo šifru da može odmah da kuca ponovo
                    setPassword(''); 
                } else {
                    setError({ field: 'general', message: errorText });
                }
                return;
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.userViewModel.username);
            localStorage.setItem("profilePicture",data.profilePicture);

            alert('Uspešno ste se ulogovali!');
            onLoginSuccess();

        } catch (err) {
            console.error("KRAH:", err.message);
            setError({ field: 'general', message: 'Upps, nešto je puklo. Pokušajte ponovo.' });
        }
    }

    return (
        <div className="login-container auth-slider-wrapper">
            {/* Vratili smo onSubmit={handleSubmit} umesto action-a radi bolje kontrole brisanja */}
            <form className="loginForm" onSubmit={handleSubmit}>   
                <div className="form-top-group">
                    <div className="loginHeader">
                        <h1>Login</h1>
                        <p>Welcome to Akcije</p>
                    </div> 

                    {error.field === 'general' && (
                        <p style={{ color: '#DC2626', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>
                            {error.message}
                        </p>
                    )}
                    
                    {/* === USERNAME INPUT === */}
                    <label style={{ color: error.field === 'username' ? '#DC2626' : 'inherit' }}>
                        Username
                    </label>
                    <input 
                        name="username" 
                        type="text" 
                        placeholder="Enter your username here" 
                        required 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Pamti šta je korisnik ukucao
                        style={{ 
                            border: error.field === 'username' ? '2px solid #DC2626' : '1px solid #ccc',
                            marginBottom: error.field === 'username' ? '5px' : '15px'
                        }}
                    />
                    {error.field === 'username' && (
                        <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', display: 'block' }}>
                            {error.message}
                        </span>
                    )}
                    
                    {/* === PASSWORD INPUT === */}
                    <label style={{ color: error.field === 'password' ? '#DC2626' : 'inherit' }}>
                        Password
                    </label>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Enter your password here" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Pamti šifru, ali je mi praznimo ako pukne login
                        style={{ 
                            border: error.field === 'password' ? '2px solid #DC2626' : '1px solid #ccc',
                            marginBottom: error.field === 'password' ? '5px' : '15px'
                        }}
                    />
                    {error.field === 'password' && (
                        <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', display: 'block' }}>
                            {error.message}
                        </span>
                    )}
                </div>
                
                <button type="submit">Log in!</button>
                <p style={{ marginTop: '15px', width: '100%', textAlign: 'left' }}>
                    Don't have account yet?{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }}>
                        Click Here!
                    </a>
                </p>
            </form>
        </div>
    );
}