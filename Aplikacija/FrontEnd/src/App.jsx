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
import ActionDetailPage from "./pages/ActionDetailPage/ActionDetailPage"

export default function App() {
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem("currentView") || "login"
    })
    //Ubacio sam da bi back dugme znalo na koju stranicu da se vrati (sig bolje da se napravi stack ali i ovo radi poso)
    const [previousView, setPreviousView] = useState(() => {
        return localStorage.getItem("previousView")
    })
    const [selectedAction, setSelectedAction] = useState(null)

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

    //Upozorenje kada korisnik zeli da napusti sajt zato sto je sajt SPA
    useEffect(() => {
        const guardKey = "__exitGuard"

        // Ne dodajemo novi guard svaki put kada se uradi reload
        if (!window.history.state?.[guardKey]) {
            window.history.replaceState(
                {
                    ...window.history.state,
                    [guardKey]: "base",
                },
                "",
                window.location.href,
            )

            window.history.pushState(
                {
                    [guardKey]: "guard",
                },
                "",
                window.location.href,
            )
        }

        function handleBack(event) {
            if (event.state?.[guardKey] !== "base") return

            const shouldLeave = window.confirm(
                "Da li sigurno želite da napustite sajt?",
            )

            if (shouldLeave) {
                window.removeEventListener("popstate", handleBack)
                window.history.back()
            } else {
                window.history.pushState(
                    {
                        [guardKey]: "guard",
                    },
                    "",
                    window.location.href,
                )
            }
        }

        window.addEventListener("popstate", handleBack)

        return () => {
            window.removeEventListener("popstate", handleBack)
        }
    }, [])

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

    function setUserAsProducer() {
        setLoggedUser((previousUser) => {
            if (!previousUser || previousUser.role !== 0) {
                return previousUser
            }

            const updatedUser = {
                ...previousUser,
                role: 1,
            }

            localStorage.setItem("user", JSON.stringify(updatedUser))

            return updatedUser
        })
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
                        onActionClick={(actionObj) => {
                            setSelectedAction(actionObj)
                            setPreviousView("main")
                            setCurrentView("actionDetail")
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
                        setUserAsProducer={setUserAsProducer}
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
                        onUserClick={(friendID) => {
                            setUserID(friendID)
                            sessionStorage.setItem(
                                "viewingUserID",
                                JSON.stringify(friendID),
                            )
                            setCurrentView("profilePage")
                        }}
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
                            setUserID(friendID)
                            sessionStorage.setItem(
                                "viewingUserID",
                                JSON.stringify(friendID),
                            )
                            setCurrentView("profilePage")
                        }}
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
                        openUserProfile={(reportedUserId) => {
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
            
           {currentView === "actionDetail" && (
                <div className="app-layout">
                    <NavBar currentView={currentView} setCurrentView={setCurrentView} totalUnread={totalUnread} role={loggedUser?.role} />
                    <ActionDetailPage
                        actionData={selectedAction}
                        loggedUser={loggedUser}
                        onBack={() => setCurrentView(previousView || "main")}
                        onOrganizerClick={(userId) => {
                            setUserID(userId)
                            setPreviousView("actionDetail")
                            setCurrentView("profilePage")
                        }}
                    />
                </div>
            )}

            {notification && (
                <NotificationPopup
                    notification={notification}
                    closeNotification={closeNotification}
                    setCurrentView={setCurrentView}
                />
            )}

            {currentView === "mojeAkcijePage" && (
                <div className="app-layout">
                    <NavBar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        handleAddActionClick={() => {
                            setCurrentView("addAction")
                            setPreviousView("mojeAkcijePage")
                        }}
                        selected={"mojeAkcijePage"}
                        totalUnread={totalUnread}
                        role={loggedUser?.role}
                    />
                    <MainPage
                        onMyProfileClick={() => {
                            setCurrentView("myProfilePage")
                        }}
                        mojeAkcije={true}
                    />
                </div>
            )}

            {notification && (
                <NotificationPopup
                    notification={notification}
                    closeNotification={closeNotification}
                    setCurrentView={setCurrentView}
                />
            )}
        </div>
    )
}
