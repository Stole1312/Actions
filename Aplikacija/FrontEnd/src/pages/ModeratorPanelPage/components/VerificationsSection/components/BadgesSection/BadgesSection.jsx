import styles from "./BadgesSection.module.css"

export default function BadgesSection(props) {
    const Icon = props.icon

    return (
        <div className={styles["user-info-badge"]}>
            <Icon className={styles["icon"]} />
            {props.number && <p>{props.number}</p>}
            <p>{props.text}</p>
        </div>
    )
}
