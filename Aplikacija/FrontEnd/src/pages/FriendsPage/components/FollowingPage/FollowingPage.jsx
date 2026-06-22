import { useState } from "react"
import styles from "./FollowingPage.module.css"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { formatTimeAgo } from "../formatTimeAgo"
import { BeatLoader } from "react-spinners"

export default function FollowingPage(props) {
    //STATES
    const [searchFollowingUsers, setSearchFollowingUsers] = useState("")

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
            />
            <div className={styles["following-user-info-container"]}>
                <p>{fu.username}</p>
                <span>{formatTimeAgo(fu.followedSince)}</span>
            </div>
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
