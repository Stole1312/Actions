import { useState } from "react"
import styles from "./FriendsPage.module.css"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import NavButton from "./components/NavButton"
import FriendsSection from "./components/FriendsSection/FriendsSection"

export default function FriendsPage() {
    //STATES
    const [currentView, setCurrentView] = useState("friendsPage")
    return (
        <div className={["friends-page-container"]}>
            <nav className={styles["main-nav-page-container"]}>
                <div className={styles["nav-header"]}>
                    <div className={styles["nav-title-container"]}>
                        <h1>Prijatelji</h1>
                        <p>Upravljaj prijateljima i pratiocima</p>
                    </div>
                </div>
                <div className={styles["main-nav-page"]}>
                    <NavButton
                        currentView={currentView}
                        isCurrentView="friendsPage"
                        text="Prijatelji"
                        number={24}
                        onClick={() => setCurrentView("friendsPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="requestsPage"
                        text="Zahtevi"
                        number={3}
                        onClick={() => setCurrentView("requestsPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="sendedPage"
                        text="Poslato"
                        number={2}
                        onClick={() => setCurrentView("sendedPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="followingPage"
                        text="Pratim"
                        number={18}
                        onClick={() => setCurrentView("followingPage")}
                    />
                    <NavButton
                        currentView={currentView}
                        isCurrentView="searchPage"
                        text="Pronadji"
                        number={0}
                        onClick={() => setCurrentView("searchPage")}
                        isSearchButton={true}
                    />
                </div>
            </nav>
            {currentView === "friendsPage" && <FriendsSection number={24} />}
        </div>
    )
}
