import { useState } from "react"
import styles from "./RequestSection.module.css"
import {
    MagnifyingGlassIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline"
import { formatTimeAgo } from "../formatTimeAgo.js"
import { BeatLoader } from "react-spinners"
import FollowingMiniSection from "../FollowingMiniSection/FollowingMiniSection.jsx"

export default function RequestSection(props) {
    //STATES
    const [searchRequestText, setSearchRequestText] = useState("")

    //VARIABLES
    const filteredPendingRequests = props.pendingRequests?.filter((pr) =>
        pr.initiatorUsername
            ?.toLowerCase()
            .includes(searchRequestText.toLowerCase()),
    )

    const pendingRequestsElements = filteredPendingRequests?.map((pr) => (
        <div className={styles["request-card"]} key={pr.id}>
            <img
                src={pr.initiatorProfilePicture}
                alt=""
                className={styles["request-card-icon"]}
                onClick={() => props.onUserClick(pr.initiatorID)}
            />
            <div className={styles["user-info-container"]}>
                <p>{pr.initiatorUsername}</p>
                <span>{formatTimeAgo(pr.created)}</span>
            </div>
            <div className={styles["request-card-buttons-container"]}>
                <button
                    className={styles["accept-button"]}
                    onClick={() => props.respondFriendRequest(pr.id, 2)}
                >
                    <CheckIcon className={styles["request-card-button-icon"]} />
                    Prihvati
                </button>
                <button
                    className={styles["reject-button"]}
                    onClick={() => props.respondFriendRequest(pr.id, 1)}
                >
                    <XMarkIcon className={styles["request-card-button-icon"]} />
                    Odbij
                </button>
            </div>
        </div>
    ))

    return (
        <section className={styles["section-container"]}>
            <main className={styles["main-section"]}>
                <div className={styles["main-title"]}>
                    <h1>Zahtevi za prijateljstvo</h1>
                    <div className={styles["request-number"]}>
                        {props.number}
                    </div>
                    <div className={styles["request-search-container"]}>
                        <MagnifyingGlassIcon
                            className={styles["request-search-icon"]}
                        />
                        <input
                            type="text"
                            placeholder="Pretraži..."
                            value={searchRequestText}
                            onChange={(event) =>
                                setSearchRequestText(event.target.value)
                            }
                            className={styles["request-search-input"]}
                        />
                    </div>
                </div>

                {props.pendingRequests === null ? (
                    <div className={styles["requests-loading-container"]}>
                        <BeatLoader size={30} color="#F59E0B" />
                    </div>
                ) : filteredPendingRequests.length === 0 ? (
                    <div className={styles["no-requests"]}>
                        <p>Nema pristiglih zahteva</p>
                    </div>
                ) : (
                    <div className={styles["requests-container"]}>
                        {pendingRequestsElements}
                    </div>
                )}
            </main>

            <section className={styles["following-section"]}>
                <FollowingMiniSection
                    topFollowingUsers={props.topFollowingUsers}
                    setCurrentView={props.setCurrentView}
                    onUserClick={props.onUserClick}
                />
            </section>
        </section>
    )
}
