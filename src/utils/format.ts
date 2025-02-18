export const format = {
  boolean: (boolean: any): boolean => boolean === 'true' ? true : false,
  searchRegex: (search: string) => {
    return { $regex: new RegExp(`${search}`, 'i') }
  }
}
