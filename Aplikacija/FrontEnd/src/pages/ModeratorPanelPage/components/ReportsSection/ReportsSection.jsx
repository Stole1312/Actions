import { useState } from "react"
import styles from "./ReportsSection.module.css"
import { FlagIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import StatusDropdown from "./components/StatusDropDown/StatusDropdown"

export default function ReportsSection() {
    //STATES
    const [searchReportText, setSearchReportText] = useState("")

    return (
        <section className={styles["report-section"]}>
            <div className={styles["main-title"]}>
                <FlagIcon className={styles["main-title-icon"]} />
                <h1>Prijavljeni korisnici</h1>
                <p>Promeni status klikom na dropdown</p>
                <div className={styles["reports-search-container"]}>
                    <MagnifyingGlassIcon
                        className={styles["reports-search-icon"]}
                    />
                    <input
                        type="text"
                        placeholder="Pretraži..."
                        value={searchReportText}
                        onChange={(event) =>
                            setSearchReportText(event.target.value)
                        }
                        className={styles["reports-search-input"]}
                    />
                </div>
            </div>
            <div className={styles["header-container"]}>
                <p>Prijavio</p>
                <p>Prijavljen</p>
                <p>Razlog</p>
                <p>Opis</p>
                <p>Status</p>
                <p>Akcija</p>
            </div>
            <div className={styles["report-card"]}>
                <div className={styles["report-user-container"]}>
                    <img
                        src="https://webshop.rs/image/cache/catalog/slike-standardne/portret/01-prikaz/Panda%20Dream-slika-na-platnu-700x700.jpg"
                        alt=""
                        className={styles["report-user-icon"]}
                    />
                    <p>Gorila konj kamila</p>
                </div>
                <div className={styles["report-user-container"]}>
                    <img
                        src="https://webshop.rs/image/cache/catalog/slike-standardne/portret/01-prikaz/Panda%20Dream-slika-na-platnu-700x700.jpg"
                        alt=""
                        className={styles["report-user-icon"]}
                    />
                    <p>Ona rumunska</p>
                </div>
                <p>Uncomfortable</p>
                <div className={styles["description-section-container"]}>
                    <p>Napeo me</p>
                </div>
                <div className={styles["report-status-container"]}>
                    <StatusDropdown
                        status={0}
                        reportId={1}
                        updateStatus={() => {}}
                    />
                </div>
            </div>
        </section>
    )
}
