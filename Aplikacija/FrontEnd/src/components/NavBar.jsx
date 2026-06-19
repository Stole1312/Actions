import styles from "./NavBar.module.css"
import {
    UserIcon,
    HomeIcon,
    CalendarIcon,
    UsersIcon,
    ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/outline"
import { PlusIcon } from "@heroicons/react/24/solid"

export default function NavBar(props) {
    return (
        <nav className={styles["app-nav-bar"]}>
            <div className={styles["title-container"]}>
                <h1>Actions</h1>
                <p>Platforma za dešavanja</p>
            </div>
            <div className={styles["nav-buttons-container"]}>
                <button
                    onClick={() => props.setCurrentView("main")}
                    style={
                        props.selected === "main"
                            ? {
                                  backgroundColor: "#F59E0B",
                                  color: "white",
                                  pointerEvents: "none",
                              }
                            : {}
                    }
                >
                    <HomeIcon className={styles["nav-icons"]} />
                    Početna
                </button>
                <button>
                    <CalendarIcon className={styles["nav-icons"]} /> Moje Akcije
                </button>
                <button>
                    <UsersIcon className={styles["nav-icons"]} />
                    Prijatelji
                </button>
                <button>
                    <ChatBubbleOvalLeftIcon className={styles["nav-icons"]} />
                    Poruke
                </button>
                <button>
                    <UserIcon className={styles["nav-icons"]} />
                    Profil
                </button>
                {!props.addActionButton && (
                    <button
                        className={styles["add-action-button"]}
                        onClick={props.handleAddActionClick}
                    >
                        <PlusIcon className={styles["nav-icons"]} />
                        Nova Akcija
                    </button>
                )}
            </div>
        </nav>
    )
}
