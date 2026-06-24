import { useEffect, useRef, useState } from "react"
import styles from "./ReportDescription.module.css"

export default function ReportDescription({ description }) {
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
    }, [description])

    return (
        <>
            <div className={styles["description-container"]}>
                <p ref={textRef} className={styles["description-text"]}>
                    {description}
                </p>

                {isOverflowing && (
                    <button
                        type="button"
                        className={styles["show-description-button"]}
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
                            <h2>Opis prijave</h2>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className={styles["close-button"]}
                            >
                                ×
                            </button>
                        </div>

                        <p className={styles["full-description"]}>
                            {description}
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
