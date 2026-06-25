import { useEffect } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import styles from "./DocumentPreview.module.css"

export default function DocumentPreview({ documentUrl, username, onClose }) {
    const cleanUrl = documentUrl?.split("?")[0].toLowerCase()

    const isPdf = cleanUrl?.endsWith(".pdf")

    const isImage = /\.(jpg|jpeg|png|webp|gif)$/.test(cleanUrl)

    useEffect(() => {
        function closeOnEscape(event) {
            if (event.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", closeOnEscape)
        document.body.style.overflow = "hidden"

        return () => {
            document.removeEventListener("keydown", closeOnEscape)
            document.body.style.overflow = ""
        }
    }, [onClose])

    return (
        <div className={styles["overlay"]} onClick={onClose}>
            <div
                className={styles["modal"]}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles["modal-header"]}>
                    <div>
                        <h2>Dokument za verifikaciju</h2>
                        <p>{username}</p>
                    </div>

                    <button
                        type="button"
                        className={styles["close-button"]}
                        onClick={onClose}
                    >
                        <XMarkIcon />
                    </button>
                </div>

                <div className={styles["document-container"]}>
                    {isImage && (
                        <img
                            src={documentUrl}
                            alt={`Dokument korisnika ${username}`}
                            className={styles["document-image"]}
                        />
                    )}

                    {isPdf && (
                        <iframe
                            src={documentUrl}
                            title={`Dokument korisnika ${username}`}
                            className={styles["document-pdf"]}
                        />
                    )}

                    {!isImage && !isPdf && (
                        <div className={styles["unsupported-document"]}>
                            <p>Pregled ovog tipa dokumenta nije podržan.</p>

                            <a
                                href={documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Otvori originalni dokument
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
