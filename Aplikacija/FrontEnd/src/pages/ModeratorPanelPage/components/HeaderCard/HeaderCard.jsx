import styles from "./HeaderCard.module.css"
import { PuffLoader } from "react-spinners"

export default function HeaderCard(props) {
    const Icon = props.icon

    return (
        <div className={styles["stats-card"]}>
            <div className={styles["card-title"]}>
                <p>{props.title}</p>
                <div className={styles["card-icon-container"]}>
                    <Icon className={styles["card-icon"]} />
                </div>
            </div>

            {props.number == null ? (
                <div className={styles["loading-container"]}>
                    <PuffLoader size={40} color="#F59E0B" />
                </div>
            ) : (
                <h1>{Number(props.number).toLocaleString("en-US")}</h1>
            )}
        </div>
    )
}
