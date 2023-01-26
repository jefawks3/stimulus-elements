declare type Callback = (...args: any[]) => void

export default (callback: Callback, delay: number): Callback => {
    let timeout: NodeJS.Timeout

    return (...args: any[]) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => callback(...args), delay)
    }
}
