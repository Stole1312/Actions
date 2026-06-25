import styles from "./BadgesSection.module.css"

export default function BadgesSection(props) {
    const Icon = props.icon

    return (
        <div className={styles["user-info-badge"]}>
            <Icon className={styles["icon"]} />
            <p>
                {props.number !== undefined && `${props.number} `}
                {props.text}
            </p>
        </div>
    )
}
