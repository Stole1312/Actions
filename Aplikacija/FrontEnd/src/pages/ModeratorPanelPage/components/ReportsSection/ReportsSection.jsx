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
import ProcessReportPopup from "./components/ProcessReportPopup/ProcessReportPopup.jsx"
import { BeatLoader } from "react-spinners"

export default function ReportsSection(props) {
    //STATES
    const [searchReportText, setSearchReportText] = useState("")
    const [reportToProcess, setReportToProcess] = useState(null)
    const [deletingReportId, setDeletingReportId] = useState(null)

    //FUNCTIONS
    async function handleDeleteReport(reportId) {
        if (deletingReportId !== null) {
            return
        }

        setDeletingReportId(reportId)

        try {
            await props.deleteReport(reportId)
        } finally {
            setDeletingReportId(null)
        }
    }

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
                    updateStatus={props.updateReportStatus}
                />
            </div>
            <div className={styles["actions-buttons-container"]}>
                <button
                    className={styles["action-button"]}
                    onClick={() =>
                        props.openReportedUserProfile(report.reportedUser.id)
                    }
                >
                    <EyeIcon className={styles["actions-button-icon"]} />
                </button>
                <button
                    className={styles["action-button"]}
                    onClick={() => setReportToProcess(report)}
                    style={
                        Number(report.status) === 0
                            ? {
                                  pointerEvents: "none",
                                  opacity: 0.4,
                              }
                            : undefined
                    }
                >
                    <CheckIcon
                        className={styles["actions-button-icon"]}
                        style={{ color: "#065F46" }}
                    />
                </button>
                <button
                    className={styles["action-button"]}
                    onClick={() => handleDeleteReport(report.id)}
                    style={
                        deletingReportId === report.id
                            ? {
                                  pointerEvents: "none",
                                  opacity: 0.5,
                              }
                            : undefined
                    }
                >
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
            <div className={styles["reports-list"]}>
                {props.reports === null ? (
                    <div className={styles["reports-loading-container"]}>
                        <BeatLoader size={25} color="#F59E0B" />
                    </div>
                ) : props.reports.length === 0 ? (
                    <div className={styles["reports-loading-container"]}>
                        <p>Trenutno ne postoje reportovi</p>
                    </div>
                ) : (
                    reportsElements
                )}

                {reportToProcess && (
                    <ProcessReportPopup
                        reportToProcess={reportToProcess}
                        setReportToProcess={setReportToProcess}
                        processReport={props.processReport}
                    />
                )}
            </div>
        </section>
    )
}
