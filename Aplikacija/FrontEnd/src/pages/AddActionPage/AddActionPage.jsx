import styles from "./AddActionPage.module.css"
import Main from "./components/Main/Main.jsx"

export default function AddActionPage({
    handleGoBackClick,
    setCurrentView,
    setUserAsProducer,
}) {
    return (
        <>
            <Main
                handleGoBackClick={handleGoBackClick}
                setCurrentView={setCurrentView}
                setUserAsProducer={setUserAsProducer}
            />
        </>
    )
}
