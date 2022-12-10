export default (start: number, end: number | null = null, step = 1): number[] => {
    if (end == null) {
        end = start
        start = 0
    }

    step = step || Math.sign(end - start)
    const length = Math.max(Math.ceil((end - start) / (step || 1)), 0) + 1
    return new Array(length).fill(0).map((value, index) => start + index * step)
}
