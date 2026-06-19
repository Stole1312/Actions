import { useEffect, useState } from "react"
import styles from "./ChatPage.module.css"
import { authFetch } from "../../api"

export default function ChatPage() {
    //STATES
    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)
    const [messages, setMessages] = useState([])

    //SIDE EFFECTS
    useEffect(() => {
        fetchMyChats()
    }, [])

    //FUNCTIONS
    async function fetchMyChats() {
        const response = await authFetch("/Communication/GetMyChats")
        if (!response.ok) {
            console.log("Greška pri učitavanju chatova")
            return
        }

        const data = await response.json()
        setChats(data)
    }

    //VARIABLES
    const chatSideBarElements = chats.map((chat) => (
        <button key={chat.id} className={styles["chat-card"]}>
            <img
                src={chat.otherUser.profilePicture}
                alt=""
                className={styles["chat-card-icon"]}
            />
            <div className={styles["chat-card-icon-text"]}>
                <p>{chat.otherUser.username}</p>
                <span
                    style={chat.unreadCount !== 0 ? { color: "#111110" } : {}}
                >
                    {chat.lastMessage?.content ?? "Pritisni da otvoriš chat"}
                </span>
            </div>
            <div className={styles["chat-card-time-unread"]}>
                {chat.lastMessage?.content && (
                    <p>
                        {new Date(chat.lastMessage?.sent).toLocaleTimeString(
                            "sr-RS",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        )}
                    </p>
                )}
                {chat.unreadCount !== 0 && (
                    <div>
                        <span>{chat.unreadCount}</span>
                    </div>
                )}
            </div>
        </button>
    ))

    return (
        <main className={styles["chat-page-container"]}>
            <section className={styles["chat-sidebar-container"]}>
                <div className={styles["chats-sidebar"]}>
                    {chatSideBarElements}
                </div>
            </section>

            <section className={styles["chat-window"]}>Window</section>
        </main>
    )
}
