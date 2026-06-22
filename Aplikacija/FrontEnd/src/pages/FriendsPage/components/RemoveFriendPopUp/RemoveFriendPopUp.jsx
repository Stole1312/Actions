import styles from "./RemoveFriendPopUp.module.css"

export default function RemoveFriendPopUp(props) {
    return (
        <div className={styles["remove-friend-container"]}>
            <div className={styles["remove-friend-card"]}>
                <h1>Uklanjanje prijatelja</h1>
                <p>
                    Da li ste sigurni da želite da uklonite korisnika{" "}
                    <strong>{props.friendToRemove.username}</strong> iz
                    prijatelja?
                </p>
                <div className={styles["buttons-container"]}>
                    <button
                        className={styles["cancel-button"]}
                        onClick={() => props.setFriendToRemove(null)}
                    >
                        Odustani
                    </button>
                    <button
                        className={styles["confirm-button"]}
                        onClick={props.confirmRemoveFriend}
                    >
                        Ukloni
                    </button>
                </div>
            </div>
        </div>
    )
}
