import { useState } from "react";
import LoginForm from "./pages/AuthorizationPage/LoginForm";
import SignUpForm from "./pages/AuthorizationPage/SignUpForm";
import MainPage from "./pages/MainPage/MainPage";

export default function App() {

    const [currentView, setCurrentView] = useState('login'); 

    return (
        <div className="auth-wrapper">

            {currentView === 'login' && (
                <LoginForm 
                    onSwitchToSignUp={() => setCurrentView('signup')} 
                    onLoginSuccess={() => setCurrentView('main')}
                />
            )}

            {currentView === 'signup' && (
                <SignUpForm 
                    onSwitchToLogin={() => setCurrentView('login')} 
                />
            )}

            {currentView === 'main' && (
                <MainPage 
                    onLogout={() => setCurrentView('login')}
                />
            )}
        </div>
    );
}