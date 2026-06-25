import BadgesSection from "./components/BadgesSection/BadgesSection"
import styles from "./VerificationsSection.module.css"
import {
    CheckBadgeIcon,
    BoltIcon,
    StarIcon,
    CalendarIcon,
    ClipboardDocumentCheckIcon,
    EyeIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import DocumentPreview from "./components/DocumentPreview/DocumentPreview.jsx"
import VerificationBio from "./components/VerificationBio/VerificationBio"
import { BeatLoader } from "react-spinners"

export default function VerificationsSection(props) {
    //STATES
    const [openedDocument, setOpenedDocument] = useState(null)
    const [processingRequestId, setProcessingRequestId] = useState(null)

    //FUNCTIONS
    function formatMemberSince(dateString) {
        if (!dateString) return ""

        return new Intl.DateTimeFormat("sr-Latn-RS", {
            month: "long",
            year: "numeric",
        }).format(new Date(dateString))
    }

    async function handleReviewVerification(requestId, newStatus) {
        if (processingRequestId !== null) {
            return
        }

        setProcessingRequestId(requestId)

        try {
            await props.reviewVerification(requestId, newStatus)
        } finally {
            setProcessingRequestId(null)
        }
    }

    //VARIABLES
    const verificationElements = props.verificationRequests?.map((vr) => (
        <div className={styles["verification-card"]} key={vr.id}>
            <img
                src={vr.sender.profilePicture}
                alt=""
                className={styles["verification-user-icon"]}
            />
            <div className={styles["user-info-container"]}>
                <h1>{vr.sender.username}</h1>
                <VerificationBio bio={vr.sender.bio} />
                <div className={styles["user-info-badges-container"]}>
                    <BadgesSection
                        icon={BoltIcon}
                        number={vr.sender.akcijeCount}
                        text={"akcija"}
                    />
                    <BadgesSection
                        icon={StarIcon}
                        number={vr.sender.rating}
                        text={"ocena"}
                    />
                    <BadgesSection
                        icon={CalendarIcon}
                        text={`član od ${formatMemberSince(vr.sender.created)}`}
                    />
                    <button
                        type="button"
                        className={styles["document-button"]}
                        onClick={() =>
                            setOpenedDocument({
                                url: vr.document,
                                username: vr.sender.username,
                            })
                        }
                    >
                        <BadgesSection
                            icon={ClipboardDocumentCheckIcon}
                            text="Otvori dokument"
                        />
                    </button>
                </div>
            </div>
            <div className={styles["user-info-buttons-container"]}>
                <button
                    className={styles["profile-view-button"]}
                    onClick={() => props.openUserProfile(vr.sender.id)}
                >
                    <EyeIcon className={styles["profile-view-icon"]} />
                    Pregled profila
                </button>
                <button
                    className={styles["reject-button"]}
                    onClick={() => handleReviewVerification(vr.id, 3)}
                    style={
                        processingRequestId === vr.id
                            ? {
                                  pointerEvents: "none",
                                  opacity: 0.5,
                              }
                            : undefined
                    }
                >
                    <XMarkIcon className={styles["reject-icon"]} />
                    Odbij
                </button>
                <button
                    className={styles["accept-button"]}
                    onClick={() => handleReviewVerification(vr.id, 2)}
                    style={
                        processingRequestId === vr.id
                            ? {
                                  pointerEvents: "none",
                                  opacity: 0.5,
                              }
                            : undefined
                    }
                >
                    <CheckBadgeIcon className={styles["accept-icon"]} />
                    Verifikuj
                </button>
            </div>
        </div>
    ))

    return (
        <>
            <section className={styles["verifications-container"]}>
                <div className={styles["main-title"]}>
                    <CheckBadgeIcon className={styles["main-title-icon"]} />
                    <h1>Zahtevi za verifikaciju</h1>
                    <p>Pregled profila i odobravanje verifikovanog bedža</p>
                </div>
                <div className={styles["verifications-list"]}>
                    {props.verificationRequests === null ? (
                        <div
                            className={
                                styles["verifications-loading-container"]
                            }
                        >
                            <BeatLoader size={25} color="#F59E0B" />
                        </div>
                    ) : props.verificationRequests.length === 0 ? (
                        <div
                            className={
                                styles["verifications-loading-container"]
                            }
                        >
                            <p>Trenutno ne postoje zahtevi za verifikaciju</p>
                        </div>
                    ) : (
                        reportsElements
                    )}
                    {verificationElements}
                </div>
            </section>

            {openedDocument && (
                <DocumentPreview
                    documentUrl={openedDocument.url}
                    username={openedDocument.username}
                    onClose={() => setOpenedDocument(null)}
                />
            )}
        </>
    )
}
