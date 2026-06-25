import { useEffect, useRef, useState } from "react"
import styles from "./VerificationBio.module.css"

export default function VerificationBio({ bio }) {
    const textRef = useRef(null)

    const [isOverflowing, setIsOverflowing] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const element = textRef.current

        if (!element) return

        function checkOverflow() {
            setIsOverflowing(element.scrollWidth > element.clientWidth)
        }

        checkOverflow()

        const resizeObserver = new ResizeObserver(checkOverflow)
        resizeObserver.observe(element)

        return () => resizeObserver.disconnect()
    }, [bio])

    return (
        <>
            <div className={styles["bio-container"]}>
                <p ref={textRef} className={styles["bio-text"]}>
                    {bio || "Korisnik nema opis profila."}
                </p>

                {isOverflowing && (
                    <button
                        type="button"
                        className={styles["show-bio-button"]}
                        onClick={() => setIsOpen(true)}
                    >
                        Prikaži
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className={styles["modal-overlay"]}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className={styles["modal-container"]}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles["modal-header"]}>
                            <h2>Opis profila</h2>

                            <button
                                type="button"
                                className={styles["close-button"]}
                                onClick={() => setIsOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <p className={styles["full-bio"]}>{bio}</p>
                    </div>
                </div>
            )}
        </>
    )
}
