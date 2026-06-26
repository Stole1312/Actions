import styles from "./FollowingMiniSection.module.css"
import { StarIcon } from "@heroicons/react/24/outline"

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
                <h2>{tfu.username}</h2>
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
            {followingElements}
        </div>
    )
}
