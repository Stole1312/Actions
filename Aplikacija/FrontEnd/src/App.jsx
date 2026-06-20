import { useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import { authFetch } from "./api"
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
        return localStorage.getItem("previousView")
    })

    //Ovaj state je za unreadMessages za NavBar i za chat
    const [totalUnread, setTotalUnread] = useState(0)
    const [connection, setConnection] = useState(null)

    //SIDE EFFECTS
    //Ubacio sam ovo da kad uradish refresh da te ne vrati na login vec da ostanes na trenutnu stranicu
    useEffect(() => {
        if (currentView === "login" || currentView === "signup") return
        if (connection) return

        fetchUnreadCount()

        const token = localStorage.getItem("token")

        const conn = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_BACKEND_API_URL}/chatHub`, {
                accessTokenFactory: () => token,
            })
            .configureLogging(signalR.LogLevel.None)
            .withAutomaticReconnect()
            .build()

        conn.on("UnreadMessagesChanged", () => {
            fetchUnreadCount()
        })

        conn.start()
            .then(() => {
                setConnection(conn)
            })
            .catch((error) => {
                console.log("SignalR greška:", error)
            })
    }, [currentView])

    //FUNCTIONS
    async function fetchUnreadCount() {
        const response = await authFetch("/Communication/GetMyChats")
        if (!response.ok) return

        const chats = await response.json()

        const unread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0)
        setTotalUnread(unread)
    }

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
                        totalUnread={totalUnread}
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
                        totalUnread={totalUnread}
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
                        totalUnread={totalUnread}
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
                        totalUnread={totalUnread}
                    />
                    <ChatPage
                        connection={connection}
                        refreshUnreadCount={fetchUnreadCount}
                    />
                </div>
            )}
        </div>
    )
}
