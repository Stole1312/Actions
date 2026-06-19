import styles from "./Header.module.css"
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid"

export default function Header(props) {
    return (
        <header className={styles["header-add-action-page"]}>
            <button
                className={styles["back-button-add-action-page"]}
                onClick={props.handleGoBackClick}
            >
                <ArrowLeftIcon
                    className={styles["back-button-icon-add-action-page"]}
                />
            </button>
            <div className={styles["header-text-container"]}>
                <h1>Kreiraj novu akciju</h1>
                <p>Popuni detalje i objavi desavanje</p>
            </div>
            <div className={styles["header-buttons-container"]}>
                <button className={styles["save-button-add-action-page"]}>
                    Sačuvaj nacrt
                </button>
                <button
                    type="button"
                    className={styles["publish-button-add-action-page"]}
                    onClick={() =>
                        document
                            .getElementById("add-action-form")
                            .requestSubmit()
                    }
                >
                    <PaperAirplaneIcon
                        className={styles["publish-button-icon"]}
                    />
                    Objavi akciju
                </button>
            </div>
        </header>
    )
}
