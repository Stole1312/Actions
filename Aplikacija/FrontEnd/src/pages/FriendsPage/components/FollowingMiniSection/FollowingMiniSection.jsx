import styles from "./FollowingMiniSection.module.css"
import { StarIcon } from "@heroicons/react/24/outline"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"

export default function FollowingMiniSection(props) {
    const followingElements = props.topFollowingUsers?.map((tfu) => (
        <div className={styles["following-card"]} key={tfu.producerID}>
            <img
                src={tfu.profilePicture}
                alt=""
                className={styles["following-card-icon"]}
                onClick={() => props.onUserClick(tfu.producerID)}
            />
            <div className={styles["following-info-container"]}>
                <div className={styles["user-info"]}>
                    <h2>{tfu.username}</h2>
                    {tfu.verificationStatus === 2 && (
                        <CheckBadgeIcon
                            className={styles["user-info-verification-icon"]}
                        />
                    )}
                </div>
                <p>{`${tfu.actionsCount} akcije`}</p>
                <p>{`${tfu.followersCount} pratioca`}</p>
            </div>
            <button>
                <StarIcon className={styles["following-icon"]} />
                Pratim
            </button>
        </div>
    ))

    return (
        <div className={styles["following-container"]}>
            <div className={styles["following-title-container"]}>
                <h1>Pratim</h1>
                <p onClick={() => props.setCurrentView("followingPage")}>Svi</p>
            </div>
            {props.topFollowingUsers?.length === 0 ? (
                <div className={styles["no-following"]}>
                    <p>Trenutno ne pratite ni jednu osobu</p>
                </div>
            ) : (
                followingElements
            )}
        </div>
    )
}
