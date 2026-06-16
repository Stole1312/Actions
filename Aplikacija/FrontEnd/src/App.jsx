import { useEffect, useState } from "react"
import LoginForm from "./pages/AuthorizationPage/LoginForm"
import SignUpForm from "./pages/AuthorizationPage/SignUpForm"
import MainPage from "./pages/MainPage/MainPage"
import AddActionPage from "./pages/AddActionPage/AddActionPage.jsx"

export default function App() {
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem("currentView") || "login"
    })

    //Ubacio sam oov da kad uradish refresh da te ne vrati na login vec da ostanes na trenutnu stranicu
    useEffect(() => {
        localStorage.setItem("currentView", currentView)
    }, [currentView])

    return (
        <div className="auth-wrapper">
            {currentView === "login" && (
                <div className="auth_page">
                    <LoginForm
                        onSwitchToSignUp={() => setCurrentView("signup")}
                        onLoginSuccess={() => setCurrentView("main")}
                    />
                </div>
            )}

            {currentView === "signup" && (
                <div className="auth_page">
                    <SignUpForm
                        onSwitchToLogin={() => setCurrentView("login")}
                    />
                </div>
            )}

            {currentView === "main" && (
                <MainPage
                    onLogout={() => {
                        setCurrentView("login")
                        localStorage.clear()
                    }}
                    handleAddActionClick={() => setCurrentView("addAction")}
                />
            )}

            {currentView === "addAction" && (
                <AddActionPage
                    handleGoBackClick={() => setCurrentView("main")}
                />
            )}
        </div>
    )
}
