export const format = {
  boolean: (boolean: string): boolean => boolean === 'true' ? true : false,
  searchRegex: (search: string) => {
    return { $regex: new RegExp(`${search}`, 'i') }
  }
}
