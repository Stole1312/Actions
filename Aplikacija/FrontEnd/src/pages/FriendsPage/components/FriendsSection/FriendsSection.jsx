import styles from "./FriendsSection.module.css"
import {
    ChatBubbleOvalLeftIcon,
    UserMinusIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { BeatLoader } from "react-spinners"
import RemoveFriendPopUp from "../RemoveFriendPopUp/RemoveFriendPopUp"

export default function FriendsSection(props) {
    //STATES
    const [friendToRemove, setFriendToRemove] = useState(null)
    const [searchFriendText, setSearchFriendText] = useState("")

    //FUNCTIONS
    function confirmRemoveFriend() {
        props.removeFriend(friendToRemove.friendID)
        setFriendToRemove(null)
    }

    //VARIABLES
    const filteredFriends = props.friends?.filter((friend) =>
        friend.username?.toLowerCase().includes(searchFriendText.toLowerCase()),
    )

    const friendsElements = filteredFriends?.map((friend) => (
        <div className={styles["friend-card"]} key={friend.friendID}>
            <div
                className={styles["friend-info-container"]}
                onClick={() => props.onUserClick(friend.friendID)}
            >
                <img
                    src={friend.profilePicture}
                    alt=""
                    className={styles["friend-card-icon"]}
                />
                <p>{friend.username}</p>
            </div>
            <div className={styles["friend-card-buttons-container"]}>
                <button
                    className={styles["send-message-button"]}
                    onClick={() => props.openChatWithFriend(friend)}
                >
                    <ChatBubbleOvalLeftIcon
                        className={styles["send-message-button-icon"]}
                    />
                    Poruka
                </button>
                <button
                    className={styles["remove-friend-button"]}
                    onClick={() => setFriendToRemove(friend)}
                >
                    <UserMinusIcon
                        className={styles["remove-friend-button-icon"]}
                    />
                    Ukloni
                </button>
            </div>
        </div>
    ))

    return (
        <section className={styles["section-container"]}>
            <main className={styles["main-section"]}>
                <div className={styles["main-title"]}>
                    <h1>Svi prijatelji</h1>
                    <div className={styles["friends-number"]}>
                        {props.number}
                    </div>
                    <div className={styles["friends-search-container"]}>
                        <MagnifyingGlassIcon
                            className={styles["friends-search-icon"]}
                        />
                        <input
                            type="text"
                            placeholder="Pretraži..."
                            value={searchFriendText}
                            onChange={(event) =>
                                setSearchFriendText(event.target.value)
                            }
                            className={styles["friends-search-input"]}
                        />
                    </div>
                </div>
                {props.friends === null ? (
                    <div className={styles["friends-loading-container"]}>
                        <BeatLoader size={30} color="#F59E0B" />
                    </div>
                ) : filteredFriends.length === 0 ? (
                    <div className={styles["no-friends"]}>
                        <p>Nema prijatelja</p>
                    </div>
                ) : (
                    <div className={styles["friends-grid-container"]}>
                        {friendsElements}

                        {friendToRemove && (
                            <RemoveFriendPopUp
                                friendToRemove={friendToRemove}
                                setFriendToRemove={setFriendToRemove}
                                confirmRemoveFriend={confirmRemoveFriend}
                            />
                        )}
                    </div>
                )}
            </main>

            <section className={styles["following-section"]}></section>
        </section>
    )
}
