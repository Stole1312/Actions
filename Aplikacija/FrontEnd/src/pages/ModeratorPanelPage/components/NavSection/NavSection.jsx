import NavButton from "../NavButton"
import styles from "./NavSection.module.css"

export default function NavSection(props) {
    return (
        <section className={styles["nav-section-container"]}>
            <section className={styles["nav-header"]}>
                <div className={styles["header-title-container"]}>
                    <h1>Prijave i Verifikacije</h1>
                    <p>Upravljaj prijavama i zahtevima za verifikaciju</p>
                </div>
            </section>
            <div className={styles["main-nav-page"]}>
                <NavButton
                    currentView={props.currentView}
                    isCurrentView="reportsView"
                    text="Prijavljeni korisnici"
                    number={props.numberOfReports}
                    onClick={() => props.setCurrentView("reportsView")}
                />
                <NavButton
                    currentView={props.currentView}
                    isCurrentView="verificationView"
                    text="Zahtevi za verifikaciju"
                    number={props.numberOfVerificationRequests}
                    onClick={() => props.setCurrentView("verificationView")}
                />
            </div>
        </section>
    )
}
