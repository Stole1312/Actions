import { useEffect, useState } from "react"
import styles from "./FriendsPage.module.css"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import NavButton from "./components/NavButton"
import FriendsSection from "./components/FriendsSection/FriendsSection"
import { authFetch } from "../../api"
import RequestSection from "./components/RequestSection/RequestSection"
import SendedSection from "./components/SendedSection/SendedSection"
import SearchSection from "./components/SearchSection/SearchSection"
import FollowingPage from "./components/FollowingPage/FollowingPage"

export default function FriendsPage(props) {
    //STATES
    const [currentView, setCurrentView] = useState("friendsPage")
    const [friends, setFriends] = useState(null)
    const [pendingRequests, setPendingRequests] = useState(null)
    const [sentRequests, setSentRequests] = useState(null)
    const [followingUsers, setFollowingUsers] = useState(null)

    //SIDE EFFECTS
    useEffect(() => {
        loadFriends()
        loadPendingRequests()
        loadSentRequests()
        loadFollowingUsers()
    }, [])

    //FUNCTIONS
    async function loadFriends() {
        const response = await authFetch("/Social/GetFriends")
        if (!response.ok) {
            console.log("Greška pri učitavanju prijatelja")
            return
        }

        const data = await response.json()
        setFriends(data)
    }

    async function loadPendingRequests() {
        const response = await authFetch("/Social/GetPendingFriendRequests")
        if (!response.ok) {
            console.log("Greška pri učitavanju primljenih zahteva")
            return
        }

        const data = await response.json()
        setPendingRequests(data)
    }

    async function loadSentRequests() {
        const response = await authFetch("/Social/GetSentFriendRequests")
        if (!response.ok) {
            console.log("Greška pri učitavanju poslatih zahteva")
            return
        }

        const data = await response.json()
        setSentRequests(data)
    }

    async function loadFollowingUsers() {
        const response = await authFetch("/Social/GetFollowing")
        if (!response.ok) {
            console.log("Greška pri učitavanju poslatih zahteva")
            return
        }

        const data = await response.json()
        setFollowingUsers(data)
    }

    async function removeFriend(friendId) {
        const response = await authFetch(`/Social/RemoveFriend/${friendId}`, {
            method: "DELETE",
        })
        if (!response.ok) {
            console.log("Greška pri uklanjanju prijatelja:")
            return false
        }

        setFriends((currentFriends) =>
            currentFriends.filter((friend) => friend.friendID !== friendId),
        )
    }

    async function respondFriendRequest(requestId, status) {
        const response = await authFetch(
            `/Social/RespondFriendRequest/${requestId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: status,
                }),
            },
        )
        if (!response.ok) {
            console.log("Greška pri promeni statusa pristiglog zahteva")
            return false
        }

        setPendingRequests((currentPendingRequests) =>
            currentPendingRequests.filter((pr) => pr.id !== requestId),
        )

        await loadFriends()
    }

    async function cancelFriendRequest(requestId) {
        const response = await authFetch(
            `/Social/CancelFriendRequest/${requestId}`,
            {
                method: "DELETE",
            },
        )
        if (!response.ok) {
            console.log("Greška pri otkazivanju poslatog zahteva")
            return false
        }

        setSentRequests((currentSentRequests) =>
            currentSentRequests.filter((sr) => sr.id !== requestId),
        )
    }

    return (
        <div className={styles["friends-page-container"]}>
            <nav className={styles["main-nav-page-container"]}>
                <div className={styles["nav-header"]}>
                    <div className={styles["nav-title-container"]}>
                        <h1>Prijatelji</h1>
                        <p>Upravljaj prijateljima i pratiocima</p>
                    </div>
                </div>
                <div className={styles["main-nav-page"]}>
                    <NavButton
                        currentView={currentView}
                        isCurrentView="friendsPage"
                        text="Prijatelji"
                        number={friends?.length}
                        onClick={() => setCurrentView("friendsPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="requestsPage"
                        text="Zahtevi"
                        number={pendingRequests?.length}
                        onClick={() => setCurrentView("requestsPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="sendedPage"
                        text="Poslato"
                        number={sentRequests?.length}
                        onClick={() => setCurrentView("sendedPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="followingPage"
                        text="Pratim"
                        number={followingUsers?.length}
                        onClick={() => setCurrentView("followingPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="searchPage"
                        text="Pronadji"
                        number={0}
                        onClick={() => setCurrentView("searchPage")}
                        isSearchButton={true}
                    />
                </div>
            </nav>
            {currentView === "friendsPage" && (
                <FriendsSection
                    number={friends?.length}
                    friends={friends}
                    openChatWithFriend={props.openChatWithFriend}
                    removeFriend={removeFriend}
                    onUserClick={props.onUserClick}
                />
            )}

            {currentView === "requestsPage" && (
                <RequestSection
                    number={pendingRequests?.length}
                    pendingRequests={pendingRequests}
                    respondFriendRequest={respondFriendRequest}
                    onUserClick={props.onUserClick}
                />
            )}

            {currentView === "sendedPage" && (
                <SendedSection
                    number={sentRequests?.length}
                    sentRequests={sentRequests}
                    cancelFriendRequest={cancelFriendRequest}
                    onUserClick={props.onUserClick}
                />
            )}

            {currentView === "followingPage" && (
                <FollowingPage
                    number={followingUsers?.length}
                    followingUsers={followingUsers}
                    onUserClick={props.onUserClick}
                    loadFollowingUsers={loadFollowingUsers}
                />
            )}

            {currentView === "searchPage" && (
                <SearchSection
                    loadSentRequests={loadSentRequests}
                    onUserClick={props.onUserClick}
                    loadFollowingUsers={loadFollowingUsers}
                />
            )}
        </div>
    )
}
