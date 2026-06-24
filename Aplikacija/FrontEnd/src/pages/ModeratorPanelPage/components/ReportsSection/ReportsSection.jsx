import { useState } from "react"
import styles from "./ReportsSection.module.css"
import {
    FlagIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    CheckIcon,
    TrashIcon,
} from "@heroicons/react/24/outline"
import StatusDropdown from "./components/StatusDropDown/StatusDropdown"
import { reportReasons } from "./components/reportReasons.js"
import { formatTimeAgo } from "./components/formatTimeAgo.js"
import ReportDescription from "./components/ReportDescription/ReportDescription.jsx"

export default function ReportsSection(props) {
    //STATES
    const [searchReportText, setSearchReportText] = useState("")

    //VARIABLES
    const reportsElements = props.reports?.map((report) => (
        <div className={styles["report-card"]} key={report.id}>
            <div className={styles["report-user-container"]}>
                <img
                    src={report.sender.profilePicture}
                    alt=""
                    className={styles["report-user-icon"]}
                />
                <p>{report.sender.username}</p>
            </div>
            <div className={styles["report-user-container"]}>
                <img
                    src={report.reportedUser.profilePicture}
                    alt=""
                    className={styles["report-user-icon"]}
                />
                <p>{report.reportedUser.username}</p>
            </div>
            <p>{reportReasons[report.reason]}</p>
            <div className={styles["description-section-container"]}>
                <ReportDescription description={report.description} />
            </div>
            <p>{formatTimeAgo(report.created)}</p>
            <div className={styles["report-status-container"]}>
                <StatusDropdown
                    status={report.status}
                    reportId={report.id}
                    updateStatus={() => {}}
                />
            </div>
            <div className={styles["actions-buttons-container"]}>
                <button className={styles["action-button"]}>
                    <EyeIcon className={styles["actions-button-icon"]} />
                </button>
                <button className={styles["action-button"]}>
                    <CheckIcon
                        className={styles["actions-button-icon"]}
                        style={{ color: "#065F46" }}
                    />
                </button>
                <button className={styles["action-button"]}>
                    <TrashIcon
                        className={styles["actions-button-icon"]}
                        style={{ color: "#EF4444" }}
                    />
                </button>
            </div>
        </div>
    ))

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
                <p>Vreme</p>
                <p>Status</p>
                <p>Akcija</p>
            </div>
            <div className={styles["reports-list"]}>{reportsElements}</div>
        </section>
    )
}
