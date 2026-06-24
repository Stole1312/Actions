import { useEffect, useRef, useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { reportStatuses } from "./reportStatuses"
import styles from "./StatusDropdown.module.css"

export default function StatusDropdown({ status, reportId, updateStatus }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const dropdownRef = useRef(null)

    const selectedStatus = reportStatuses.find(
        (statusOption) => statusOption.value === Number(status),
    )

    useEffect(() => {
        function closeDropdown(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", closeDropdown)

        return () => {
            document.removeEventListener("mousedown", closeDropdown)
        }
    }, [])

    async function selectStatus(newStatus) {
        setIsOpen(false)

        if (newStatus === Number(status)) {
            return
        }

        setIsUpdating(true)

        try {
            await updateStatus(reportId, newStatus)
        } finally {
            setIsUpdating(false)
        }
    }

    if (!selectedStatus) {
        return null
    }

    return (
        <div ref={dropdownRef} className={styles["status-dropdown-container"]}>
            <button
                type="button"
                disabled={isUpdating}
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles["status-button"]} ${
                    styles[`status-${selectedStatus.className}`]
                }`}
            >
                <span className={styles["status-info"]}>
                    <span
                        className={`${styles["status-dot"]} ${
                            styles[`dot-${selectedStatus.className}`]
                        }`}
                    ></span>

                    <span>{selectedStatus.label}</span>
                </span>

                <ChevronDownIcon
                    className={`${styles["arrow-icon"]} ${
                        isOpen ? styles["arrow-open"] : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className={styles["status-menu"]}>
                    {reportStatuses.map((statusOption) => (
                        <button
                            key={statusOption.value}
                            type="button"
                            onClick={() => selectStatus(statusOption.value)}
                            className={`${styles["status-option"]} ${
                                statusOption.value === Number(status)
                                    ? styles["selected-option"]
                                    : ""
                            }`}
                        >
                            <span
                                className={`${styles["option-dot"]} ${
                                    styles[`dot-${statusOption.className}`]
                                }`}
                            ></span>

                            <span>{statusOption.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
