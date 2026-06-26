import styles from "./NotificationPopup.module.css"

export default function NotificationPopup(props) {
    const notification = props.notification

    if (!notification) {
        return null
    }

    const reportStatus = Number(notification.reportStatus)

    return (
        <div className={styles["notification-overlay"]}>
            <div className={styles["notification-card"]}>
                <h1>{notification.title}</h1>

                {notification.reportStatus !== null && (
                    <div
                        className={`${styles["status"]} ${
                            reportStatus === 2
                                ? styles["approved-status"]
                                : styles["rejected-status"]
                        }`}
                    >
                        {reportStatus === 2 ? "Prihvaćena" : "Odbijena"}
                    </div>
                )}

                <p>{notification.message}</p>

                <button
                    className={styles["close-button"]}
                    onClick={() => {
                        props.closeNotification()
                        notification.type === 2
                            ? props.setCurrentView("login")
                            : {}
                    }}
                >
                    U redu
                </button>
            </div>
        </div>
    )
}
