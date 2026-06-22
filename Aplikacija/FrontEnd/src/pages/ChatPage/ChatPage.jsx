import { useEffect, useState, useRef } from "react"
import styles from "./ChatPage.module.css"
import { authFetch } from "../../api"
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import { BeatLoader, ClipLoader } from "react-spinners"

export default function ChatPage(props) {
    //STATES
    const [chats, setChats] = useState(null)
    const [searchChatText, setSearchChatText] = useState("")
    const [selectedChat, setSelectedChat] = useState(null)
    const [messages, setMessages] = useState(null)
    const [messageText, setMessageText] = useState("")

    //SIDE EFFECTS
    useEffect(() => {
        fetchMyChats()
    }, [])

    useEffect(() => {
        if (!props.friendForChat) return

        async function openRequestedFriendChat() {
            try {
                const response = await authFetch(
                    "/Communication/OpenPrivateChat",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            otherUserId: props.friendForChat.friendID,
                        }),
                    },
                )

                if (!response.ok) {
                    console.log("Greška pri otvaranju privatnog chata")
                    return
                }

                const data = await response.json()

                const chat = {
                    id: data.chatId,
                    otherUser: {
                        id: props.friendForChat.friendID,
                        username: props.friendForChat.username,
                        profilePicture: props.friendForChat.profilePicture,
                    },
                    unreadCount: 0,
                    lastMessage: null,
                }

                await openChat(chat)
            } finally {
                props.clearFriendForChat()
            }
        }

        openRequestedFriendChat()
    }, [props.friendForChat])

    useEffect(() => {
        if (!props.connection) return

        const handler = () => {
            fetchMyChats()
        }

        props.connection.on("UnreadMessagesChanged", handler)

        return () => {
            props.connection.off("UnreadMessagesChanged", handler)
        }
    }, [props.connection])

    const messagesEndRef = useRef(null)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView()
    }, [messages])

    const inputRef = useRef(null)
    useEffect(() => {
        inputRef.current?.focus()
    }, [selectedChat])

    //SignalR listener
    useEffect(() => {
        if (!props.connection) return

        const handler = async (message) => {
            if (message.chatID !== selectedChat?.id) {
                fetchMyChats()
                props.refreshUnreadCount()
                return
            }

            setMessages((prevMessages) => [...prevMessages, message])

            await authFetch(
                `/Communication/MarkChatAsRead/${selectedChat.id}`,
                {
                    method: "PUT",
                },
            )

            fetchMyChats()
            props.refreshUnreadCount()
        }

        props.connection.on("ReceiveMessage", handler)

        return () => {
            props.connection.off("ReceiveMessage", handler)
        }
    }, [props.connection, selectedChat])

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

    async function openChat(chat) {
        //Prelaz iz jedne u drugu sobu kada dodje do promene
        if (selectedChat?.id && props.connection) {
            await props.connection.invoke("LeaveChat", selectedChat.id)
        }
        if (props.connection) {
            await props.connection.invoke("JoinChat", chat.id)
        }

        setSelectedChat(chat)

        const response = await authFetch(
            `/Communication/GetChatById/${chat.id}`,
        )
        if (!response.ok) {
            console.log("Greška pri učitavanju chata")
            return
        }

        const data = await response.json()
        setMessages(data.messages)

        await authFetch(`/Communication/MarkChatAsRead/${chat.id}`, {
            method: "PUT",
        })

        fetchMyChats()
        props.refreshUnreadCount()
    }

    function formatMessageDate(dateString) {
        const date = new Date(dateString)

        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return "Danas"

        if (date.toDateString() === yesterday.toDateString()) return "Juče"

        return date.toLocaleDateString("sr-Latn-RS", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    async function sendMessage(event) {
        event.preventDefault()

        if (!messageText.trim() || !selectedChat) return

        const response = await authFetch("/Communication/SendMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chatID: selectedChat.id,
                content: messageText.trim(),
            }),
        })

        if (!response.ok) {
            console.log("Greška pri slanju poruke")
            return
        }

        setMessageText("")
    }

    //VARIABLES
    const filteredChats = chats?.filter((chat) =>
        chat.otherUser?.username
            ?.toLowerCase()
            .includes(searchChatText.toLowerCase()),
    )

    const chatSideBarElements = filteredChats?.map((chat) => (
        <button
            key={chat.id}
            className={styles["chat-card"]}
            style={
                chat.id === selectedChat?.id
                    ? { backgroundColor: "#f5f4f0", pointerEvents: "none" }
                    : {}
            }
            onClick={() => openChat(chat)}
        >
            <img
                src={chat.otherUser.profilePicture}
                alt=""
                className={styles["chat-card-icon"]}
            />
            <div className={styles["chat-card-icon-text"]}>
                <p>{chat.otherUser.username}</p>
                <span
                    style={
                        chat.unreadCount !== 0
                            ? { color: "#111110", fontWeight: "700" }
                            : {}
                    }
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
                        <span>
                            {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                        </span>
                    </div>
                )}
            </div>
        </button>
    ))

    //Navodno vadi ID iz tokena
    const token = localStorage.getItem("token")
    const currentUserId = token
        ? Number(
              JSON.parse(atob(token.split(".")[1]))[
                  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ],
          )
        : null

    const messagesElements = messages?.map((message, index) => {
        const currentDate = formatMessageDate(message.sent)
        const previousDate =
            index > 0 ? formatMessageDate(messages[index - 1].sent) : null
        const showDateSeparator = currentDate !== previousDate

        return (
            <div key={message.id}>
                {showDateSeparator && (
                    <div className={styles["date-separator"]}>
                        {currentDate}
                    </div>
                )}
                <div
                    className={
                        message.senderID === currentUserId
                            ? styles["message-row-mine"]
                            : styles["message-row-other"]
                    }
                >
                    <div
                        className={
                            message.senderID === currentUserId
                                ? styles["message-bubble-mine"]
                                : styles["message-bubble-other"]
                        }
                    >
                        <p>{message.content}</p>
                    </div>
                    <span>
                        {new Date(message.sent).toLocaleTimeString("sr-RS", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        )
    })

    return (
        <main className={styles["chat-page-container"]}>
            <section className={styles["chat-sidebar-container"]}>
                <div className={styles["chat-sidebar-header"]}>
                    <h1>Poruke</h1>
                </div>
                <div className={styles["chat-search-border"]}>
                    <div className={styles["chat-search-container"]}>
                        <MagnifyingGlassIcon
                            className={styles["chat-search-icon"]}
                        />
                        <input
                            type="text"
                            placeholder="Pretraži..."
                            value={searchChatText}
                            onChange={(event) =>
                                setSearchChatText(event.target.value)
                            }
                            className={styles["chat-search-input"]}
                        />
                    </div>
                </div>
                <div className={styles["chats-sidebar"]}>
                    {chats === null ? (
                        <div
                            className={styles["chat-sidebar-loading-container"]}
                        >
                            <BeatLoader size={20} color="#F59E0B" />
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <p className={styles["no-chats-text"]}>
                            Još uvek nemaš započetih razgovora.
                        </p>
                    ) : (
                        chatSideBarElements
                    )}
                </div>
            </section>

            <section className={styles["chat-window"]}>
                {!selectedChat ? (
                    <div className={styles["default-chat-window"]}>
                        <div className={styles["default-chat-icon-container"]}>
                            <PaperAirplaneIcon
                                className={styles["default-chat-icon"]}
                            />
                        </div>
                        <h1>Vaše poruke</h1>
                        <p>Pošaljite poruku da bi ste započeli ćaskanje</p>
                    </div>
                ) : (
                    <>
                        <div className={styles["chat-window-header"]}>
                            <img
                                src={selectedChat.otherUser.profilePicture}
                                alt=""
                                className={styles["chat-window-user-img"]}
                            />
                            <p>{selectedChat.otherUser.username}</p>
                        </div>
                        <div className={styles["messages-container"]}>
                            {messages === null ? (
                                <div
                                    className={
                                        styles["chat-sidebar-loading-container"]
                                    }
                                >
                                    <ClipLoader size={50} color="#F59E0B" />
                                </div>
                            ) : messages.length === 0 ? (
                                <p className={styles["no-messages-text"]}>
                                    Nema postojećih razmenjenih poruka
                                </p>
                            ) : (
                                messagesElements
                            )}
                            <div ref={messagesEndRef}></div>
                        </div>
                        <form
                            className={styles["send-message-form"]}
                            onSubmit={sendMessage}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Napiši poruku..."
                                value={messageText}
                                onChange={(event) =>
                                    setMessageText(event.target.value)
                                }
                                className={styles["send-message-input"]}
                            />

                            <button
                                type="submit"
                                disabled={!messageText.trim()}
                                className={styles["send-message-button"]}
                            >
                                <PaperAirplaneIcon
                                    className={styles["send-message-icon"]}
                                />
                            </button>
                        </form>
                    </>
                )}
            </section>
        </main>
    )
}
