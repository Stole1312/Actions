import styles from "./CardReview.module.css"
import { CalendarIcon } from "@heroicons/react/24/solid"
import { MapPinIcon, UsersIcon } from "@heroicons/react/24/outline"

export default function CardReview(props) {
    //formatiranja
    const formattedDate =
        props.date &&
        props.date.toLocaleDateString("sr-Latn-RS", {
            weekday: "short",
            day: "numeric",
            month: "long",
        })

    const formattedStartTime =
        props.startTime &&
        props.startTime.toLocaleTimeString("sr-RS", {
            hour: "2-digit",
            minute: "2-digit",
        })

    return (
        <div className={styles["card-review-container"]}>
            <h1 className={styles["review-title"]}>Pregled kartice</h1>
            <div className={styles["card-review"]}>
                <div className={styles["preview-image-container"]}>
                    <img
                        src={
                            props.img
                                ? URL.createObjectURL(props.img)
                                : "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200"
                        }
                        className={styles["preview-image"]}
                        alt="preview"
                    />
                    {props.type && (
                        <div className={styles["preview-type-badge"]}>
                            <p>{props.type}</p>
                        </div>
                    )}
                    <div className={styles["preview-price-badge"]}>
                        <p>
                            {props.price === ""
                                ? "Besplatno"
                                : `${props.price} RSD`}
                        </p>
                    </div>
                </div>
                <div className={styles["info-container"]}>
                    <h1>
                        {!props.title ? "Naziv vaše akcije" : `${props.title}`}
                    </h1>
                    <div className={styles["info-child-container"]}>
                        <CalendarIcon className={styles["info-icon"]} />
                        <p>
                            {!formattedDate
                                ? "Ned, 1. mart"
                                : `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`}
                        </p>
                        <p>
                            {!formattedStartTime
                                ? "· 18:00"
                                : `· ${formattedStartTime}`}
                        </p>
                    </div>
                    <div className={styles["info-child-container"]}>
                        <MapPinIcon className={styles["info-icon"]} />
                        <p>
                            {!props.locationText
                                ? "Kalemegdan, Beograd"
                                : `${props.locationText}`}
                        </p>
                    </div>
                </div>
                <hr />
                <div className={styles["footer-container"]}>
                    <UsersIcon className={styles["info-icon"]} />
                    <p>
                        0 /{" "}
                        {!props.maxParticipants
                            ? "20"
                            : `${props.maxParticipants}`}{" "}
                        učesnika
                    </p>
                    <button>Prijavi se</button>
                </div>
            </div>
        </div>
    )
}
