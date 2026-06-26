import { useEffect, useState } from "react"
import styles from "./SearchSection.module.css"
import {
    MagnifyingGlassIcon,
    UsersIcon,
    UserPlusIcon,
    HeartIcon,
    MinusCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { BeatLoader } from "react-spinners"
import { authFetch } from "../../../../api"

export default function SearchSection(props) {
    //STATES
    const [searchUserText, setSearchUserText] = useState("")
    const [foundUsers, setFoundUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    //SIDE EFFECTS
    useEffect(() => {
        const search = searchUserText.trim()

        if (search.length < 2) {
            setFoundUsers([])
            setIsLoading(false)
            return
        }

        let ignoreResult = false

        const timeoutId = setTimeout(async () => {
            setIsLoading(true)

            try {
                const response = await authFetch(
                    `/Social/SearchUsers?search=${encodeURIComponent(search)}`,
                )
                if (!response.ok) {
                    console.log("Greška prilikom pretrage korisnika")
                    return
                }

                const data = await response.json()

                if (!ignoreResult) {
                    setFoundUsers(data)
                }
            } catch (error) {
                console.log(error)

                if (!ignoreResult) {
                    setFoundUsers([])
                }
            } finally {
                if (!ignoreResult) {
                    setIsLoading(false)
                }
            }
        }, 300)

        return () => {
            ignoreResult = true
            clearTimeout(timeoutId)
        }
    }, [searchUserText])

    //FUNCTIONS
    async function followUser(producerId) {
        const response = await authFetch(
            `/Social/FollowProducer/${producerId}`,
            {
                method: "POST",
            },
        )
        if (!response.ok) {
            console.log("Greška pri zapracivanju")
            return false
        }

        setFoundUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === producerId
                    ? {
                          ...user,
                          isFollowing: true,
                          followersCount: user.followersCount + 1,
                      }
                    : user,
            ),
        )

        props.loadFollowingUsers()
    }

    async function unfollowUser(producerId) {
        const response = await authFetch(
            `/Social/UnfollowProducer/${producerId}`,
            {
                method: "DELETE",
            },
        )
        if (!response.ok) {
            console.log("Greška pri odpracivanju")
            return false
        }

        setFoundUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === producerId
                    ? {
                          ...user,
                          isFollowing: false,
                          followersCount: user.followersCount - 1,
                      }
                    : user,
            ),
        )

        props.loadFollowingUsers()
    }

    async function sendFriendRequest(receiverId) {
        const response = await authFetch(
            `/Social/SendFriendRequest/${receiverId}`,
            {
                method: "POST",
            },
        )
        if (!response.ok) {
            console.log("Greška pri slanju zahteva")
            return false
        }

        setFoundUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === receiverId
                    ? {
                          ...user,
                          friendshipStatus: "Pending",
                      }
                    : user,
            ),
        )

        props.loadSentRequests()
    }

    // VARIABLES
    const usersElements = foundUsers.map((user) => (
        <div className={styles["user-card"]} key={user.id}>
            <img
                src={user.profilePicture}
                alt=""
                className={styles["user-profile-picture"]}
                onClick={() => props.onUserClick(user.id)}
            />
            <div className={styles["user-info-container"]}>
                <div className={styles["user-info"]}>
                    <p>{user.username}</p>
                    {user.verificationStatus === 2 && (
                        <CheckBadgeIcon
                            className={styles["user-info-verification-icon"]}
                        />
                    )}
                </div>
                <div className={styles["followers-count-container"]}>
                    <UsersIcon className={styles["user-info-icon"]} />
                    <p>Pratioci: {user.followersCount}</p>
                </div>
            </div>
            <div className={styles["user-buttons-container"]}>
                {user.isProducer && (
                    <button
                        className={styles["follow-button"]}
                        onClick={() =>
                            user.isFollowing
                                ? unfollowUser(user.id)
                                : followUser(user.id)
                        }
                        style={
                            user.isFollowing
                                ? {
                                      backgroundColor: "#ffffff",
                                      border: "1px solid #e7e5e0",
                                      fontWeight: 500,
                                      color: "#78716c",
                                  }
                                : {}
                        }
                    >
                        {user.isFollowing ? (
                            <MinusCircleIcon
                                className={styles["user-button-icon"]}
                                style={{ color: "#78716c" }}
                            />
                        ) : (
                            <HeartIcon className={styles["user-button-icon"]} />
                        )}
                        {user.isFollowing ? "Odprati" : "Zaprati"}
                    </button>
                )}
                <button
                    className={styles["send-friend-request-button"]}
                    onClick={() =>
                        user.friendshipStatus === "None"
                            ? sendFriendRequest(user.id)
                            : {}
                    }
                    style={
                        user.friendshipStatus === "Pending"
                            ? {
                                  backgroundColor: "#fffbeb",
                                  border: "1px solid #fcd34d",
                                  fontWeight: 500,
                                  color: "#b45309",
                                  pointerEvents: "none",
                              }
                            : user.friendshipStatus === "Friends"
                              ? {
                                    backgroundColor: "#F59E0B",
                                    border: "none",
                                    fontWeight: 600,
                                    color: "#FFFFFF",
                                    pointerEvents: "none",
                                }
                              : {}
                    }
                >
                    {user.friendshipStatus === "None" ? (
                        <UserPlusIcon className={styles["user-button-icon"]} />
                    ) : user.friendshipStatus === "Pending" ? (
                        <ClockIcon
                            className={styles["user-button-icon"]}
                            style={{ color: "#b45309" }}
                        />
                    ) : (
                        <UsersIcon
                            className={styles["user-button-icon"]}
                            style={{ color: "#FFFFFF" }}
                        />
                    )}
                    {user.friendshipStatus === "None"
                        ? "Dodaj prijatelja"
                        : user.friendshipStatus === "Pending"
                          ? "Na čekanju"
                          : "Prijatleji"}
                </button>
            </div>
        </div>
    ))

    return (
        <section className={styles["section-container"]}>
            <div className={styles["main-title"]}>
                <h1>Pretražite korisnike</h1>
                <div className={styles["user-search-container"]}>
                    <MagnifyingGlassIcon
                        className={styles["user-search-icon"]}
                    />
                    <input
                        type="text"
                        placeholder="Pretraži..."
                        value={searchUserText}
                        onChange={(event) =>
                            setSearchUserText(event.target.value)
                        }
                        className={styles["user-search-input"]}
                    />
                </div>
            </div>
            <div className={styles["search-results-container"]}>
                {isLoading ? (
                    <div className={styles["no-result-loading-container"]}>
                        <BeatLoader size={20} color="#F59E0B" />
                    </div>
                ) : searchUserText.trim().length <
                  2 ? null : foundUsers.length === 0 ? (
                    <div className={styles["no-result-loading-container"]}>
                        <p>Nema pronađenih korisnika</p>
                    </div>
                ) : (
                    usersElements
                )}
            </div>
        </section>
    )
}
