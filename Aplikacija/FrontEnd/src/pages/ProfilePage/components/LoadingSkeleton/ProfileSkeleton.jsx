import React from 'react';
import styles from './ProfileSkeleton.module.css';

export default function ProfileSkeleton() {
    return (
        <div className={styles["page-container"]}>
            {/* Gornji veliki profilni karton */}
            <div className={`${styles["header-card"]} ${styles["skeleton-pulse"]}`}></div>

            {/* 4 statističke kartice na sredini */}
            <div className={styles["stats-container"]}>
                <div className={`${styles["stat-card"]} ${styles["skeleton-pulse"]}`}></div>
                <div className={`${styles["stat-card"]} ${styles["skeleton-pulse"]}`}></div>
                <div className={`${styles["stat-card"]} ${styles["skeleton-pulse"]}`}></div>
                <div className={`${styles["stat-card"]} ${styles["skeleton-pulse"]}`}></div>
            </div>

            {/* Mreža sa lažnim karticama akcija pri dnu (generišemo npr. 3 komada) */}
            <div className={styles["actions-grid"]}>
                <div className={`${styles["action-card"]} ${styles["skeleton-pulse"]}`}></div>
                <div className={`${styles["action-card"]} ${styles["skeleton-pulse"]}`}></div>
                <div className={`${styles["action-card"]} ${styles["skeleton-pulse"]}`}></div>
            </div>
        </div>
    );
}