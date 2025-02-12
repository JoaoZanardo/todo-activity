export const getPersonCode = (): string => {
  const timestamp = Date.now().toString()

  const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0')

  return `${timestamp}${randomPart}`
}
