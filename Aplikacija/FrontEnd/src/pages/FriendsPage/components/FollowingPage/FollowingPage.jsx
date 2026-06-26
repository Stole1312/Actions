import { useState } from "react"
import styles from "./FollowingPage.module.css"
import {
    MagnifyingGlassIcon,
    MinusCircleIcon,
} from "@heroicons/react/24/outline"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { formatTimeAgo } from "../formatTimeAgo"
import { BeatLoader } from "react-spinners"
import { authFetch } from "../../../../api"

export default function FollowingPage(props) {
    //STATES
    const [searchFollowingUsers, setSearchFollowingUsers] = useState("")

    //FUNCTIONS
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

        props.loadFollowingUsers()
    }

    //VARIABLES
    const filteredFollowingUsers = props.followingUsers?.filter((fu) =>
        fu.username?.toLowerCase().includes(searchFollowingUsers.toLowerCase()),
    )

    const followingUsersElements = filteredFollowingUsers?.map((fu) => (
        <div className={styles["following-user-card"]} key={fu.producerID}>
            <img
                src={fu.profilePicture}
                alt=""
                className={styles["following-user-card-icon"]}
                onClick={() => props.onUserClick(fu.producerID)}
            />
            <div className={styles["following-user-info-container"]}>
                <div className={styles["user-info"]}>
                    <p>{fu.username}</p>
                    {fu.verificationStatus === 2 && (
                        <CheckBadgeIcon
                            className={styles["user-info-verification-icon"]}
                        />
                    )}
                </div>
                <span>{formatTimeAgo(fu.followedSince)}</span>
            </div>
            <button
                className={styles["unfollow-button"]}
                onClick={() => unfollowUser(fu.producerID)}
            >
                <MinusCircleIcon className={styles["user-button-icon"]} />
                Odprati
            </button>
        </div>
    ))

    return (
        <section className={styles["section-container"]}>
            <div className={styles["main-title"]}>
                <h1>Korisnici koje pratim</h1>
                <div className={styles["following-number"]}>{props.number}</div>
                <div className={styles["following-search-container"]}>
                    <MagnifyingGlassIcon
                        className={styles["following-search-icon"]}
                    />
                    <input
                        type="text"
                        placeholder="Pretraži..."
                        value={searchFollowingUsers}
                        onChange={(event) =>
                            setSearchFollowingUsers(event.target.value)
                        }
                        className={styles["following-search-input"]}
                    />
                </div>
            </div>
            <div className={styles["following-users-list-container"]}>
                {props.followingUsers === null ? (
                    <div
                        className={styles["following-users-loading-container"]}
                    >
                        <BeatLoader size={30} color="#F59E0B" />
                    </div>
                ) : filteredFollowingUsers.length === 0 ? (
                    <div className={styles["no-following-users"]}>
                        <p>Nema osoba koje pratite</p>
                    </div>
                ) : (
                    followingUsersElements
                )}
            </div>
        </section>
    )
}
