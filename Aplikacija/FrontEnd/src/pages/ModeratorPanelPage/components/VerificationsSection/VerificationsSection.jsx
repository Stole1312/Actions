import BadgesSection from "./components/BadgesSection/BadgesSection"
import styles from "./VerificationsSection.module.css"
import {
    CheckBadgeIcon,
    BoltIcon,
    StarIcon,
    CalendarIcon,
    ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline"

export default function VerificationsSection() {
    return (
        <section className={styles["verifications-container"]}>
            <div className={styles["main-title"]}>
                <CheckBadgeIcon className={styles["main-title-icon"]} />
                <h1>Zahtevi za verifikaciju</h1>
                <p>Pregled profila i odobravanje verifikovanog bedža</p>
            </div>
            <div className={styles["verification-card"]}>
                <img
                    src="https://webshop.rs/image/cache/catalog/slike-standardne/portret/01-prikaz/Panda%20Dream-slika-na-platnu-700x700.jpg"
                    alt=""
                    className={styles["verification-user-icon"]}
                />
                <div className={styles["user-info-container"]}>
                    <h1>Stefan N.</h1>
                    <p>
                        Organizujem šah i društvene igre u Beogradu već 3
                        godine.
                    </p>
                    <div className={styles["user-info-badges-container"]}>
                        <BadgesSection
                            icon={BoltIcon}
                            number={42}
                            text={"akcija"}
                        />
                        <BadgesSection
                            icon={StarIcon}
                            number={4.9}
                            text={"ocena"}
                        />
                        <BadgesSection
                            icon={CalendarIcon}
                            text={"član od мај 2022."}
                        />
                        <BadgesSection
                            icon={ClipboardDocumentCheckIcon}
                            text={"Otvori dokument"}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
