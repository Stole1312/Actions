import React from "react"
import styles from "../FriendsPage.module.css"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

export default function NavButton(props) {
    return (
        <button
            style={
                props.currentView === props.isCurrentView
                    ? {
                          borderBottom: "2px solid #F59E0B",
                          pointerEvents: "none",
                      }
                    : {}
            }
            onClick={props.onClick}
        >
            <span
                style={
                    props.currentView === props.isCurrentView
                        ? {
                              color: "#F59E0B",
                          }
                        : {}
                }
            >
                {props.text}
            </span>
            {props.isSearchButton === true ? (
                <>
                    <MagnifyingGlassIcon
                        className={styles["main-nav-page-search-icon"]}
                    />
                </>
            ) : (
                <div
                    style={
                        props.currentView === props.isCurrentView
                            ? {
                                  backgroundColor: "#F59E0B",
                                  color: "white",
                              }
                            : {}
                    }
                >
                    {props.number}
                </div>
            )}
        </button>
    )
}
