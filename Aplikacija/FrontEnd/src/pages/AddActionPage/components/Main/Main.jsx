import styles from "./Main.module.css"
import { useEffect, useState } from "react"
import {
    PhotoIcon,
    CalendarIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/24/solid"
import {
    ClockIcon,
    MapPinIcon,
    MapIcon,
    UsersIcon,
    GiftIcon,
    CreditCardIcon,
} from "@heroicons/react/24/outline"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import CardReview from "../CardReview/CardReview.jsx"
import Header from "../Header/Header.jsx"
import { authFetch } from "../../../../api.js"

export default function Main({ handleGoBackClick }) {
    //States
    const [selectedImage, setSelectedImage] = useState(null)
    const [title, setTitle] = useState("")
    const [selectedType, setSelectedType] = useState("")
    const [date, setDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [maxParticipants, setMaxParticipants] = useState("")
    const [paid, setPaid] = useState(false)
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    //Lokacija
    const [locationText, setLocationText] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [coords, setCoords] = useState(null)
    const [debouncedLocation, setDebouncedLocation] = useState("")
    const [hasSelectedLocation, setHasSelectedLocation] = useState(false)

    //Const variables
    //PRETVORITI U FETCH
    const types = ["Izlasci", "Sport", "Drustvene igre", "Ostalo"]
    const typesElements = types.map((type) => (
        <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={
                selectedType === type
                    ? styles["type-button-active"]
                    : styles["type-button"]
            }
            style={selectedType === type ? { pointerEvents: "none" } : {}}
        >
            {type}
        </button>
    ))

    const suggestionsElements = suggestions.map((place) => (
        <button
            key={place.place_id}
            type="button"
            onClick={() => selectLocation(place)}
            className={styles["location-suggestion"]}
        >
            {place.display_name}
        </button>
    ))

    //SideEffects
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedLocation(locationText)
        }, 500)
        return () => clearTimeout(timer)
    }, [locationText])

    useEffect(() => {
        if (hasSelectedLocation) return
        if (debouncedLocation.length < 3) return
        searchLocation(debouncedLocation)
    }, [debouncedLocation])

    //Functions

    function handleImageChange(event) {
        const file = event.target.files[0]

        if (!file) return

        setSelectedImage(file)
    }

    //Funkcija za pretragu
    async function searchLocation(value) {
        if (value.trim().length < 3) return

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`,
            )

            if (!response.ok) {
                console.log("Location API error:", response.status)
                return
            }

            const data = await response.json()
            setSuggestions(data)
        } catch (error) {
            console.log("Failed to fetch location:", error)
        }
    }

    //Pritisak na predlog
    function selectLocation(place) {
        setLocationText(place.display_name)
        setCoords({
            lat: Number(place.lat),
            lng: Number(place.lon),
        })
        setSuggestions([])
        setHasSelectedLocation(true)
    }

    //Promena mape sa promenom lokacije
    function ChangeMapCenter({ coords }) {
        const map = useMap()

        useEffect(() => {
            if (!coords) return

            map.setView([coords.lat, coords.lng], 15)
        }, [coords, map])

        return null
    }

    async function submitAction(event) {
        event.preventDefault()

        const missingFiles = []

        if (!selectedImage) missingFiles.push("Naslovna slika")
        if (!title.trim()) missingFiles.push("Naziv akcije")
        const description = document.getElementById("description").value
        if (!description.trim()) missingFiles.push("Opis")
        if (!selectedType) missingFiles.push("Tip dešavanja")
        if (!date) missingFiles.push("Datum")
        if (!startTime) missingFiles.push("Vreme početka akcije")
        if (!endTime) missingFiles.push("Vreme kraja akcije")
        if (!locationText.trim() && !coords) missingFiles.push("Lokacija")
        if (!maxParticipants) missingFiles.push("Maksimalan broj učesnika")
        if (paid && !price.trim()) missingFiles.push("Cena ulaznice")

        if (missingFiles.length > 0) {
            alert(
                `Morate popuniti sva polja da bi ste objavili akciju\n\nNedostaju sledeća polja:\n• ${missingFiles.join("\n• ")}`,
            )
            return
        }

        const typeMap = {
            Ostalo: 0,
            Izlasci: 1,
            Sport: 2,
            "Drustvene igre": 3,
        }

        const actionData = new FormData()
        actionData.append("Title", title)
        actionData.append("Description", description)
        actionData.append("Location", locationText)
        actionData.append("ActionPicture", selectedImage)
        actionData.append("Type", typeMap[selectedType])
        actionData.append("maxParticipants", maxParticipants)
        actionData.append("Price", paid ? price : 0)
        actionData.append("Created", new Date().toISOString())

        const dtStart = new Date(date)
        dtStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)
        const dtEnd = new Date(date)
        dtEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)
        actionData.append("DTStart", dtStart.toISOString())
        actionData.append("DTEnd", dtEnd.toISOString())

        const response = await authFetch("/Action/AddAkcija", {
            method: "POST",
            body: actionData,
        })

        console.log(response.status)
        console.log(await response.text())
    }
    return (
        <div className={styles["add-action-page"]}>
            <Header
                onSubmit={submitAction}
                handleGoBackClick={handleGoBackClick}
            />
            <main className={styles["main-add-action-page"]}>
                <section className={styles["form-container"]}>
                    <form id="add-action-form" onSubmit={submitAction}>
                        <section className={styles["form-title-container"]}>
                            <h1>Onsovne informacije</h1>
                            <hr />
                        </section>
                        <section className={styles["image-upload-container"]}>
                            <h2 className={styles["label-for-inputs"]}>
                                Naslovna slika
                            </h2>
                            <label
                                htmlFor="coverImage"
                                className={styles["image-upload-box"]}
                            >
                                <div className={styles["image-upload-content"]}>
                                    <div
                                        className={
                                            styles[
                                                "image-upload-icon-container"
                                            ]
                                        }
                                    >
                                        <PhotoIcon
                                            className={
                                                styles["image-upload-icon"]
                                            }
                                        />
                                    </div>
                                    <div
                                        className={styles["image-upload-text"]}
                                    >
                                        <p>Pritisnite ovde</p>
                                        <span>da odaberete sliku</span>
                                    </div>
                                    <div
                                        className={
                                            styles["image-upload-button"]
                                        }
                                    >
                                        Odaberi sliku
                                    </div>
                                </div>
                            </label>

                            <input
                                id="coverImage"
                                name="coverImage"
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleImageChange}
                                hidden
                            />

                            {selectedImage ? (
                                <p className={styles["selected-file"]}>
                                    ✅ Izabrana slika: {selectedImage.name}
                                </p>
                            ) : (
                                <p className={styles["text-for-inputs"]}>
                                    Preporučena veličina: 1200×630px. JPG ili
                                    PNG.
                                </p>
                            )}
                        </section>
                        <section className={styles["title-input-container"]}>
                            <label
                                htmlFor="title"
                                className={styles["label-for-inputs"]}
                            >
                                Naziv akcije
                            </label>
                            <input
                                id="title"
                                type="text"
                                placeholder="Unesite ime akcije"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={80}
                            />
                            <p className={styles["text-for-inputs"]}>
                                Maksimalno 80 karaktera
                            </p>
                        </section>
                        <section
                            className={styles["description-input-container"]}
                        >
                            <label
                                htmlFor="description"
                                className={styles["label-for-inputs"]}
                            >
                                Opis
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                name="description"
                                placeholder="Opišite vašu akciju — lokacija, šta poneti, ko je dobrodošao..."
                            ></textarea>
                            <p className={styles["text-for-inputs"]}>
                                Kratko opišite šta učesnici mogu da očekuju.
                            </p>
                        </section>
                        <section className={styles["type-input-container"]}>
                            <label
                                htmlFor="description"
                                className={styles["label-for-inputs"]}
                            >
                                Tip dešavanja
                            </label>
                            <div className={styles["types-container"]}>
                                {typesElements}
                            </div>
                        </section>
                        <section className={styles["form-title-container"]}>
                            <h1>Datum i mesto</h1>
                            <hr />
                        </section>
                        <section className={styles["date-and-time-container"]}>
                            <div className={styles["date-and-time-elements"]}>
                                <label
                                    htmlFor="date"
                                    className={styles["label-for-inputs"]}
                                >
                                    Datum
                                </label>
                                <div
                                    className={
                                        styles["date-and-time-picker-container"]
                                    }
                                >
                                    <CalendarIcon
                                        className={
                                            styles["date-and-time-picker-icon"]
                                        }
                                    />
                                    <DatePicker
                                        selected={date}
                                        onChange={(date) => setDate(date)}
                                        minDate={new Date()}
                                        placeholderText="Odaberi datum"
                                        className={
                                            styles["date-and-time-picker-input"]
                                        }
                                    />
                                </div>
                            </div>
                            <div className={styles["date-and-time-elements"]}>
                                <label
                                    htmlFor="date"
                                    className={styles["label-for-inputs"]}
                                >
                                    Početak
                                </label>
                                <div
                                    className={
                                        styles["date-and-time-picker-container"]
                                    }
                                >
                                    <ClockIcon
                                        className={
                                            styles["date-and-time-picker-icon"]
                                        }
                                    />
                                    <DatePicker
                                        selected={startTime}
                                        onChange={(date) => setStartTime(date)}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Vreme"
                                        dateFormat="HH:mm"
                                        timeFormat="HH:mm"
                                        placeholderText="18:00"
                                        className={
                                            styles["date-and-time-picker-input"]
                                        }
                                    />
                                </div>
                            </div>
                            <div className={styles["date-and-time-elements"]}>
                                <label
                                    htmlFor="date"
                                    className={styles["label-for-inputs"]}
                                >
                                    Kraj
                                </label>
                                <div
                                    className={
                                        styles["date-and-time-picker-container"]
                                    }
                                >
                                    <ClockIcon
                                        className={
                                            styles["date-and-time-picker-icon"]
                                        }
                                    />
                                    <DatePicker
                                        selected={endTime}
                                        onChange={(date) => setEndTime(date)}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Vreme"
                                        dateFormat="HH:mm"
                                        timeFormat="HH:mm"
                                        placeholderText="21:00"
                                        className={
                                            styles["date-and-time-picker-input"]
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                        <section className={styles["location-container"]}>
                            <label
                                htmlFor="date"
                                className={styles["label-for-inputs"]}
                            >
                                Lokacija
                            </label>
                            <div className={styles["location-input-container"]}>
                                <MapPinIcon
                                    className={styles["location-pin-icon"]}
                                />
                                <input
                                    type="text"
                                    value={locationText}
                                    onChange={(e) => {
                                        setLocationText(e.target.value)
                                        setHasSelectedLocation(false)
                                        if (e.target.value.trim().length < 3) {
                                            setSuggestions([])
                                        }
                                    }}
                                    placeholder="Kalemegdan, Beograd"
                                    className={styles["location-input"]}
                                />
                            </div>
                            <p className={styles["text-for-inputs"]}>
                                Unesite adresu ili naziv mesta.
                            </p>
                            {suggestions.length > 0 && (
                                <div className={styles["location-suggestions"]}>
                                    {suggestionsElements}
                                </div>
                            )}

                            <div className={styles["map-container"]}>
                                {coords ? (
                                    <MapContainer
                                        center={[coords.lat, coords.lng]}
                                        zoom={15}
                                        style={{
                                            height: "145px",
                                            width: "100%",
                                            borderRadius: "16px",
                                        }}
                                    >
                                        <ChangeMapCenter coords={coords} />
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker
                                            position={[coords.lat, coords.lng]}
                                        />
                                    </MapContainer>
                                ) : (
                                    <>
                                        <MapIcon
                                            className={styles["input-icon"]}
                                        />
                                        <p>
                                            Mapa će se prikazati nakon unosa
                                            lokacije
                                        </p>
                                    </>
                                )}
                            </div>
                        </section>
                        <section className={styles["form-title-container"]}>
                            <h1>Učesnici i cena</h1>
                            <hr />
                        </section>
                        <section
                            className={styles["participants-price-container"]}
                        >
                            <div className={styles["participants-container"]}>
                                <label
                                    htmlFor="max_participants"
                                    className={styles["label-for-inputs"]}
                                >
                                    Maksimalan broj učesnika
                                </label>
                                <div
                                    className={
                                        styles["input-template-container"]
                                    }
                                >
                                    <UsersIcon
                                        className={styles["input-icon"]}
                                    />
                                    <input
                                        id="max_participants"
                                        name="max_participants"
                                        type="number"
                                        value={maxParticipants}
                                        onChange={(e) => {
                                            setMaxParticipants(e.target.value)
                                        }}
                                        placeholder="20"
                                        className={styles["input-template"]}
                                    />
                                </div>
                            </div>
                            <div
                                className={
                                    paid
                                        ? styles["price-container-paid"]
                                        : styles["price-container"]
                                }
                            >
                                <label className={styles["label-for-inputs"]}>
                                    Cena
                                </label>
                                <div
                                    className={
                                        styles["price-buttons-container"]
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            paid
                                                ? styles["price-button"]
                                                : styles[
                                                      "selected-price-button"
                                                  ]
                                        }
                                        onClick={() => setPaid(false)}
                                        style={
                                            !paid
                                                ? { pointerEvents: "none" }
                                                : {}
                                        }
                                    >
                                        <GiftIcon
                                            className={styles["input-icon"]}
                                            style={
                                                !paid ? { color: "white" } : {}
                                            }
                                        />
                                        Besplatno
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            paid
                                                ? styles[
                                                      "selected-price-button"
                                                  ]
                                                : styles["price-button"]
                                        }
                                        onClick={() => {
                                            setPaid(true)
                                            setPrice("")
                                        }}
                                        style={
                                            paid
                                                ? { pointerEvents: "none" }
                                                : {}
                                        }
                                    >
                                        <CreditCardIcon
                                            className={styles["input-icon"]}
                                            style={
                                                paid ? { color: "white" } : {}
                                            }
                                        />
                                        Plaćeno
                                    </button>
                                </div>
                            </div>
                            {paid && (
                                <div
                                    className={styles["price-input-container"]}
                                >
                                    <label
                                        htmlFor="price"
                                        className={styles["label-for-inputs"]}
                                    >
                                        Cena ulaznice
                                    </label>
                                    <input
                                        id="price"
                                        name="price"
                                        type="text"
                                        placeholder="1000 RSD"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(e.target.value)
                                        }
                                    />
                                </div>
                            )}
                        </section>
                        <section
                            className={styles["publish-buttons-container"]}
                        >
                            <button
                                type="button"
                                className={styles["save-cancel-button"]}
                                onClick={handleGoBackClick}
                            >
                                Otkaži
                            </button>
                            <button
                                type="button"
                                className={styles["save-cancel-button"]}
                            >
                                Sačuvaj nacrt
                            </button>
                            <button
                                type="submit"
                                className={styles["publish-button"]}
                            >
                                <PaperAirplaneIcon
                                    className={styles["publish-icon"]}
                                />
                                Objavi Akciju
                            </button>
                        </section>
                    </form>
                </section>
                <section className={styles["action-preview-container"]}>
                    <CardReview
                        img={selectedImage}
                        type={selectedType}
                        price={price}
                        title={title}
                        date={date}
                        startTime={startTime}
                        locationText={locationText}
                        maxParticipants={maxParticipants}
                    />
                </section>
            </main>
        </div>
    )
}
