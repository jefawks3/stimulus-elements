export default (str: string | null | undefined): string | null | undefined =>
    str ? `${str.substring(0, 1).toUpperCase()}${str.substring(1).toLowerCase()}` : str
