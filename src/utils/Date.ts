import moment from 'moment'

export const DateUtils = {
  getCurrent: (): Date => {
    const date = new Date(moment().local().format('YYYY-MM-DD HH:mm:ss'))

    date.setHours(date.getHours() - 3)

    return date
  },
  parse: (dateInput: string | Date): Date | null => {
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput
    }

    const dateFormats = [
      'DD/MM/YYYY HH:mm',
      'MM/DD/YYYY HH:mm',
      'YYYY-MM-DD HH:mm',
      'DD/MM/YYYY',
      'MM/DD/YYYY',
      'YYYY-MM-DD',
      moment.ISO_8601
    ]

    const parsedDate = moment(dateInput, dateFormats, true)

    if (parsedDate.isValid()) {
      return parsedDate.toDate()
    }

    return null
  },
  getNextWeekDate: (): Date => {
    const date = DateUtils.getCurrent()

    date.setDate(date.getDate() + 7)

    return date
  }
}
