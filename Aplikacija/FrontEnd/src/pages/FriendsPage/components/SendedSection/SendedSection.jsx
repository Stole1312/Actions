import { useState } from "react"
import styles from "./SendedSection.module.css"
import {
    MagnifyingGlassIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline"
import { formatTimeAgo } from "../formatTimeAgo.js"
import { BeatLoader } from "react-spinners"

export default function SendedSection(props) {
    //STATES
    const [searchRequestText, setSearchRequestText] = useState("")

    //VARIABLES
    const filteredSentRequests = props.sentRequests?.filter((sr) =>
        sr.receiverUsername
            ?.toLowerCase()
            .includes(searchRequestText.toLowerCase()),
    )

    const sentRequestsElements = filteredSentRequests?.map((sr) => (
        <div className={styles["request-card"]} key={sr.id}>
            <img
                src={sr.receiverProfilePicture}
                alt=""
                className={styles["request-card-icon"]}
            />
            <div className={styles["user-info-container"]}>
                <p>{sr.receiverUsername}</p>
                <span>Zahtev poslat {formatTimeAgo(sr.created)}</span>
            </div>
            <div className={styles["request-card-buttons-container"]}>
                <button
                    className={styles["reject-button"]}
                    onClick={() => props.cancelFriendRequest(sr.id, 1)}
                >
                    <XMarkIcon className={styles["request-card-button-icon"]} />
                    Otkaži zahtev
                </button>
            </div>
        </div>
    ))

    return (
        <section className={styles["section-container"]}>
            <main className={styles["main-section"]}>
                <div className={styles["main-title"]}>
                    <h1>Poslati zahtevi</h1>
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

                {props.sentRequests === null ? (
                    <div className={styles["requests-loading-container"]}>
                        <BeatLoader size={30} color="#F59E0B" />
                    </div>
                ) : filteredSentRequests.length === 0 ? (
                    <div className={styles["no-requests"]}>
                        <p>Nema pristiglih zahteva</p>
                    </div>
                ) : (
                    <div className={styles["requests-container"]}>
                        {sentRequestsElements}
                    </div>
                )}
            </main>

            <section className={styles["following-section"]}></section>
        </section>
    )
}
