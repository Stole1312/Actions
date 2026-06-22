import React from "react"
import { 
    BoltIcon, 
    UsersIcon, 
    StarIcon, 
    HeartIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline"
import styles from "./ProfileStats.module.css"
import { useState, useEffect } from "react";

export default function ProfileStats({ stats }) {
    // Ako podaci ne stignu, stavljamo placeholder vrednosti sa slike
    const [akcijeCount, setAkcijeCout] = useState(null);
    const [prijateljiCount, setPrijateljiCount] = useState(null);
    const [ocenaValue, setOcenaValue] = useState(null);
    const [followersCount, setFollowersCount] = useState(null);
 
    //posto treba vreme za statistike
    useEffect(()=>{
        if (!stats || Object.keys(stats).length === 0) return;

        setAkcijeCout(stats.akcijeCount);
        setPrijateljiCount(stats.prijateljiCount);
        setOcenaValue(stats.rating);
        setFollowersCount(stats.followersCount);
    },[stats])

    const renderValue = (value) => {
        if (value === null) {
            return <ArrowPathIcon className={styles["spinner"]} />;
        }
        return value;
    };

    return (
        <div className={styles["stats-container"]}>
            {/* Kartica 1: Akcije */}
            <div className={styles["stat-card"]}>
                <div className={styles["icon-wrapper"]}>
                    <BoltIcon className={styles["stat-icon"]} />
                </div>
                <h3 className={styles["stat-number"]}>{renderValue(akcijeCount)}</h3>
                <p className={styles["stat-label"]}>Akcija</p>
            </div>

            {/* Kartica 2: Pratioci */}
            <div className={styles["stat-card"]}>
                <div className={styles["icon-wrapper"]}>
                    <HeartIcon className={styles["stat-icon"]} />
                </div>
                <h3 className={styles["stat-number"]}>{renderValue(followersCount)}</h3>
                <p className={styles["stat-label"]}>Pratioca</p>
            </div>

            {/* Kartica 3: Ocena */}
            <div className={styles["stat-card"]}>
                <div className={styles["icon-wrapper"]}>
                    <StarIcon className={styles["stat-icon"]} />
                </div>
                <h3 className={styles["stat-number"]}>{renderValue(ocenaValue)}</h3>
                <p className={styles["stat-label"]}>Ocena</p>
            </div>

            {/* Kartica 4: Sačuvano */}
            <div className={styles["stat-card"]}>
                <div className={styles["icon-wrapper"]}>
                    <UsersIcon className={styles["stat-icon"]} />
                </div>
                <h3 className={styles["stat-number"]}>{renderValue(prijateljiCount)}</h3>
                <p className={styles["stat-label"]}>Prijatelja</p>
            </div>
        </div>
    )
}