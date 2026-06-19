import { useEffect, useState } from "react"
import LoginForm from "./pages/AuthorizationPage/LoginForm"
import SignUpForm from "./pages/AuthorizationPage/SignUpForm"
import MainPage from "./pages/MainPage/MainPage"
import AddActionPage from "./pages/AddActionPage/AddActionPage.jsx"
import NavBar from "./components/NavBar.jsx"
import MyProfilePage from "./pages/MyProfilePage/MyProfilePage.jsx"
import ChatPage from "./pages/ChatPage/ChatPage.jsx"

export default function App() {
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem("currentView") || "login"
    })
    //Ubacio sam da bi back dugme znalo na koju stranicu da se vrati (sig bolje da se napravi stack ali i ovo radi poso)
    const [previousView, setPreviousView] = useState(() => {
        return localStorage.getItem("previousView" || null)
    })

    //Ubacio sam ovo da kad uradish refresh da te ne vrati na login vec da ostanes na trenutnu stranicu
    useEffect(() => {
        localStorage.setItem("currentView", currentView)
        localStorage.setItem("previousView", previousView)
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
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("main")
                        }}
                        selected={"main"}
                    />
                    <MainPage
                        onMyProfileClick={() => {
                            setCurrentView("myProfilePage")
                        }}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("main")
                        }}
                    />
                </div>
            )}

            {currentView === "addAction" && (
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        addActionButton={true}
                    />
                    <AddActionPage
                        handleGoBackClick={() => {
                            setCurrentView(previousView)
                            setPreviousView("addAction")
                        }}
                    />
                </div>
            )}

            {currentView === "myProfilePage" && (
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        selected={"myProfilePage"}
                    />
                    <MyProfilePage
                        onLogout={() => {
                            setCurrentView("login")
                            localStorage.clear()
                        }}
                    />
                </div>
            )}

            {currentView === "chatPage" && (
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("chatPage")
                        }}
                        selected={"chatPage"}
                    />
                    <ChatPage />
                </div>
            )}
        </div>
    )
}
