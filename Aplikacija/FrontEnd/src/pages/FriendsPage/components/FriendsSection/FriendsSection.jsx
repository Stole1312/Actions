import styles from "./FriendsSection.module.css"
import {
    ChatBubbleOvalLeftIcon,
    UserMinusIcon,
} from "@heroicons/react/24/outline"

export default function FriendsSection(props) {
    return (
        <section className={styles["section-container"]}>
            <main className={styles["main-section"]}>
                <div className={styles["main-title"]}>
                    <h1>Svi prijatelji</h1>
                    <div>{props.number}</div>
                </div>
                <div className={styles["friends-grid-container"]}>
                    <div className={styles["friend-card"]}>
                        <div className={styles["friend-info-container"]}>
                            <img
                                src="https://webshop.rs/image/cache/catalog/slike-standardne/portret/01-prikaz/Panda%20Dream-slika-na-platnu-700x700.jpg"
                                alt=""
                                className={styles["friend-card-icon"]}
                            />
                            <p>Stefan N.</p>
                        </div>
                        <div
                            className={styles["friend-card-buttons-container"]}
                        >
                            <button className={styles["send-message-button"]}>
                                <ChatBubbleOvalLeftIcon
                                    className={
                                        styles["send-message-button-icon"]
                                    }
                                />
                                Poruka
                            </button>
                            <button className={styles["remove-friend-button"]}>
                                <UserMinusIcon
                                    className={
                                        styles["remove-friend-button-icon"]
                                    }
                                />
                                Ukloni
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <section className={styles["following-section"]}></section>
        </section>
    )
}
