import { useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import { authFetch } from "./api"
import LoginForm from "./pages/AuthorizationPage/LoginForm"
import SignUpForm from "./pages/AuthorizationPage/SignUpForm"
import MainPage from "./pages/MainPage/MainPage"
import AddActionPage from "./pages/AddActionPage/AddActionPage.jsx"
import NavBar from "./components/NavBar.jsx"
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx"
import ChatPage from "./pages/ChatPage/ChatPage.jsx"
import FriendsPage from "./pages/FriendsPage/FriendsPage.jsx"
import ModeratorPanelPage from "./pages/ModeratorPanelPage/ModeratorPanelPage.jsx"
import NotificationPopup from "./components/NotificationPopup/NotificationPopup.jsx"

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
    //Ovaj state pamti koj chat treba da se otvori u chatPage
    const [friendForChat, setFriendForChat] = useState(null)

    //Pamti ID korisnika koji treba da se prikaze
    const [userID, setUserID] = useState(null)

    const [loggedUser, setLoggedUser] = useState(() => {
        const savedUser = localStorage.getItem("user")

        try {
            return savedUser ? JSON.parse(savedUser) : null
        } catch {
            return null
        }
    })

    const [notification, setNotification] = useState(null)

    //SIDE EFFECTS
    useEffect(() => {
        localStorage.setItem("currentView", currentView)
    }, [currentView])

    useEffect(() => {
        if (previousView) {
            localStorage.setItem("previousView", previousView)
        } else {
            localStorage.removeItem("previousView")
        }
    }, [previousView])

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

    useEffect(() => {
        if (currentView === "login" || currentView === "signup") {
            setNotification(null)
            return
        }

        fetchUnreadNotification()
    }, [currentView])

    //FUNCTIONS
    async function fetchUnreadCount() {
        const response = await authFetch("/Communication/GetMyChats")
        if (!response.ok) return

        const chats = await response.json()

        const unread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0)
        setTotalUnread(unread)
    }

    async function fetchUnreadNotification() {
        const response = await authFetch("/Feedback/GetUnreadNotification")

        if (response.status === 204) {
            setNotification(null)
            return
        }

        if (!response.ok) {
            console.log("Greška pri učitavanju obaveštenja")
            return
        }

        const data = await response.json()

        setNotification(data)
    }

    async function closeNotification() {
        if (!notification) {
            return
        }

        const response = await authFetch(
            `/Feedback/MarkNotificationAsRead/${notification.id}`,
            {
                method: "PUT",
            },
        )

        if (!response.ok) {
            console.log("Greška pri zatvaranju obaveštenja")
            return
        }

        setNotification(null)

        await fetchUnreadNotification()
    }

    //VARIABLES
    const isProducer = loggedUser?.role === 1
    const isModerator = loggedUser?.role === 2

    return (
        <div className="auth-wrapper">
            {currentView === "login" && (
                <div className="auth_page">
                    <LoginForm
                        onSwitchToSignUp={() => setCurrentView("signup")}
                        onLoginSuccess={(user) => {
                            setLoggedUser(user)
                            setCurrentView("main")
                        }}
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
                        role={loggedUser?.role}
                    />
                    <MainPage
                        onMyProfileClick={() => {
                            setCurrentView("myProfilePage")
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
                        role={loggedUser?.role}
                    />
                    <AddActionPage
                        handleGoBackClick={() => {
                            setCurrentView(previousView)
                            setPreviousView("addAction")
                        }}
                        setCurrentView={setCurrentView}
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
                        role={loggedUser?.role}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("myProfilePage")
                        }}
                        selected={"myProfilePage"}
                    />
                    <ProfilePage
                        onLogout={() => {
                            localStorage.clear()
                            setPreviousView(null)
                            setLoggedUser(null)
                            setNotification(null)
                            setCurrentView("login")
                        }}
                        yourProfile={true}
                    />
                </div>
            )}

            {currentView === "profilePage" && (
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        totalUnread={totalUnread}
                        role={loggedUser?.role}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("profilePage")
                        }}
                        selected={"profilePage"}
                    />
                    <ProfilePage yourProfile={false} userID={userID} />
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
                        role={loggedUser?.role}
                    />
                    <ChatPage
                        connection={connection}
                        refreshUnreadCount={fetchUnreadCount}
                        friendForChat={friendForChat}
                        clearFriendForChat={() => setFriendForChat(null)}
                    />
                </div>
            )}

            {currentView === "friendsPage" && (
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("friendsPage")
                        }}
                        selected={"friendsPage"}
                        totalUnread={totalUnread}
                        role={loggedUser?.role}
                    />
                    <FriendsPage
                        openChatWithFriend={(friend) => {
                            setFriendForChat(friend)
                            setCurrentView("chatPage")
                        }}
                        onUserClick={(friendID) => {
                            //Tamo gde ce ti treba da odes na page dodas ovo
                            setUserID(friendID) // Sledeci korak ti je u FriendsPage.jsx
                            sessionStorage.setItem(
                                "viewingUserID",
                                JSON.stringify(friendID),
                            ) //ovo se stavlja da ja kad refreshujem stranicu idalje
                            setCurrentView("profilePage") // mogu da nadjem kog treba da gledam
                        }} // ako imas pitanja za ovo mog ti pojasnim
                    />
                </div>
            )}

            {currentView === "moderatorPage" && (
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("moderatorPage")
                        }}
                        selected={"moderatorPage"}
                        totalUnread={totalUnread}
                        role={loggedUser?.role}
                    />
                    <ModeratorPanelPage
                        openReportedUserProfile={(reportedUserId) => {
                            setUserID(reportedUserId)

                            sessionStorage.setItem(
                                "viewingUserID",
                                JSON.stringify(reportedUserId),
                            )

                            setPreviousView("moderatorPage")
                            setCurrentView("profilePage")
                        }}
                    />
                </div>
            )}

            {notification && (
                <NotificationPopup
                    notification={notification}
                    closeNotification={closeNotification}
                />
            )}
        </div>
    )
}
