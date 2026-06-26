import { useState } from "react"
import styles from "./ProcessReportPopup.module.css"
import {
    NoSymbolIcon,
    ShieldExclamationIcon,
} from "@heroicons/react/24/outline"

export default function ProcessReportPopup(props) {
    const report = props.reportToProcess
    const [isProcessing, setIsProcessing] = useState(false)

    if (!report) {
        return null
    }

    const status = Number(report.status)

    //FUNCTIONS
    async function handleProcess(action) {
        if (isProcessing) {
            return
        }

        setIsProcessing(true)

        try {
            const success = await props.processReport(report.id, action)

            if (success) {
                props.setReportToProcess(null)
                return
            }

            setIsProcessing(false)
        } catch (error) {
            console.log("Greška pri obradi prijave:", error)
            setIsProcessing(false)
        }
    }

    return (
        <div className={styles["popup-overlay"]}>
            <div className={styles["popup-card"]}>
                <h1>Obrada prijave</h1>

                <p>
                    Prijavljeni korisnik:{" "}
                    <strong>{report.reportedUser.username}</strong>
                </p>

                {status === 1 && (
                    <>
                        <p>
                            Ova prijava je označena kao odbijena. Da li želite
                            da završite obradu prijave?
                        </p>

                        <div className={styles["buttons-container"]}>
                            <button
                                className={styles["cancel-button"]}
                                onClick={() => props.setReportToProcess(null)}
                            >
                                Odustani
                            </button>

                            <button
                                className={styles["reject-button"]}
                                onClick={() => handleProcess(0)}
                            >
                                Potvrdi
                            </button>
                        </div>
                    </>
                )}

                {status === 2 && (
                    <>
                        <p>Izaberite kaznu za prijavljenog korisnika.</p>

                        <div className={styles["buttons-container"]}>
                            <button
                                className={styles["cancel-button"]}
                                onClick={() => props.setReportToProcess(null)}
                                style={
                                    isProcessing
                                        ? {
                                              pointerEvents: "none",
                                              opacity: 0.6,
                                          }
                                        : undefined
                                }
                            >
                                Odustani
                            </button>

                            <button
                                className={styles["warn-button"]}
                                onClick={() => handleProcess(1)}
                                style={
                                    isProcessing
                                        ? {
                                              pointerEvents: "none",
                                              opacity: 0.6,
                                          }
                                        : undefined
                                }
                            >
                                {isProcessing ? (
                                    "Obrada..."
                                ) : (
                                    <div className={styles["button-container"]}>
                                        Upozori
                                        <ShieldExclamationIcon
                                            className={styles["button-icon"]}
                                        />
                                    </div>
                                )}
                            </button>

                            <button
                                className={styles["ban-button"]}
                                onClick={() => handleProcess(2)}
                                style={
                                    isProcessing
                                        ? {
                                              pointerEvents: "none",
                                              opacity: 0.6,
                                          }
                                        : undefined
                                }
                            >
                                {isProcessing ? (
                                    "Obrada..."
                                ) : (
                                    <div className={styles["button-container"]}>
                                        Banuj
                                        <NoSymbolIcon
                                            className={styles["button-icon"]}
                                        />
                                    </div>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
