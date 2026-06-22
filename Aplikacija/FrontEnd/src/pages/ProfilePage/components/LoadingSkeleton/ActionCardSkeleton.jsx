import React from 'react';
import styles from './ActionCardSkeleton.module.css';

export default function ActionCardSkeleton() {
    return (
        <div className={styles["card-container"]}>
            <div className={`${styles["image-placeholder"]} ${styles["skeleton-pulse"]}`}></div>
            <div className={styles["info-container"]}>
                <div className={`${styles["title-line"]} ${styles["skeleton-pulse"]}`}></div>
                <div className={`${styles["meta-line"]} ${styles["skeleton-pulse"]}`}></div>
            </div>
        </div>
    );
}