export function formatTimeAgo(dateString) {
    const differenceInSeconds = Math.round(
        (new Date(dateString).getTime() - Date.now()) / 1000,
    )

    const absoluteDifference = Math.abs(differenceInSeconds)

    let value
    let unit

    switch (true) {
        case absoluteDifference < 60:
            value = differenceInSeconds
            unit = "second"
            break

        case absoluteDifference < 3600:
            value = Math.round(differenceInSeconds / 60)
            unit = "minute"
            break

        case absoluteDifference < 86400:
            value = Math.round(differenceInSeconds / 3600)
            unit = "hour"
            break

        case absoluteDifference < 2592000:
            value = Math.round(differenceInSeconds / 86400)
            unit = "day"
            break

        case absoluteDifference < 31536000:
            value = Math.round(differenceInSeconds / 2592000)
            unit = "month"
            break

        default:
            value = Math.round(differenceInSeconds / 31536000)
            unit = "year"
    }

    return new Intl.RelativeTimeFormat("sr-Latn-RS", {
        numeric: "auto",
    }).format(value, unit)
}
