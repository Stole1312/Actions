import HeaderCard from "./components/HeaderCard/HeaderCard"
import styles from "./ModeratorPanelPage.module.css"
import {
    UsersIcon,
    BoltIcon,
    FlagIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline"
import { authFetch } from "../../api.js"
import { useEffect, useState } from "react"
import NavSection from "./components/NavSection/NavSection.jsx"
import ReportsSection from "./components/ReportsSection/ReportsSection.jsx"

export default function ModeratorPanelPage() {
    //STATES
    const [totalUsers, setTotalUsers] = useState(null)
    const [activeActionsCount, setActiveActionsCount] = useState(null)
    const [reports, setReports] = useState(null)
    const [verificationRequests, setVerificationRequests] = useState(null)

    const [currentView, setCurrentView] = useState("reportsView")

    //SIDE EFFECTS
    useEffect(() => {
        loadTotalUsers()
        loadActiveActionsCount()
        loadReports()
        loadVerificationRequests()
    }, [])

    //FUNCTIONS
    async function loadTotalUsers() {
        const response = await authFetch("/User/GetTotalUsers")
        if (!response.ok) {
            console.log("Greška pri učitavanju broja korisnika")
            return
        }

        const data = await response.json()
        setTotalUsers(data.totalUsers)
    }

    async function loadActiveActionsCount() {
        const response = await authFetch("/Action/GetActiveActionsCount")
        if (!response.ok) {
            console.log("Greška pri učitavanju aktivnih akcija")
            return
        }

        const data = await response.json()
        setActiveActionsCount(data.activeActionsCount)
    }

    async function loadReports() {
        const response = await authFetch("/Feedback/GetReports")

        if (!response.ok) {
            console.log("Greška pri učitavanju prijava")
            return
        }

        const data = await response.json()
        setReports(data)
    }

    async function loadVerificationRequests(params) {
        const response = await authFetch("/User/PendingVerifications")

        if (!response.ok) {
            console.log("Greška pri učitavanju zahteva za verifikaciju")
            return
        }

        const data = await response.json()
        setVerificationRequests(data)
    }

    return (
        <div className={styles["moderator-panel-page-container"]}>
            <section className={styles["page-header"]}>
                <div className={styles["header-title-container"]}>
                    <h1>Moderator panel</h1>
                    <p>Pregled i upravljanje sistemom</p>
                </div>
            </section>
            <main className={styles["main-container"]}>
                <section className={styles["stats-container"]}>
                    <HeaderCard
                        title="Ukupno korisnika"
                        icon={UsersIcon}
                        number={totalUsers}
                    />
                    <HeaderCard
                        title="Aktivnih akcija"
                        icon={BoltIcon}
                        number={activeActionsCount}
                    />
                    <HeaderCard
                        title="Prijavljenih korisnika"
                        icon={FlagIcon}
                        number={reports?.length}
                    />
                    <HeaderCard
                        title="Zahteva za vreifikaciju"
                        icon={CheckBadgeIcon}
                        number={verificationRequests?.length}
                    />
                </section>
                <section className={styles["report-verification-container"]}>
                    <NavSection
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        numberOfReports={reports?.length}
                        numberOfVerificationRequests={
                            verificationRequests?.length
                        }
                    />
                    <ReportsSection reports={reports} />
                </section>
            </main>
        </div>
    )
}
