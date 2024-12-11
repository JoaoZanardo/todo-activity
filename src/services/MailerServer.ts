import axios from 'axios'

import env from '../config/env'

export interface ISendEmailProps {
  subject: string
  html: string
  receiver: string
}

class MailerServer {
  private baseUrl: string

  constructor (baseUrl: string = env.mailerServerUrl) {
    this.baseUrl = baseUrl
  }

  async sendEmail ({
    subject,
    html,
    receiver
  }: ISendEmailProps): Promise<void> {
    await axios.post(`${this.baseUrl}/emails`, {
      subject,
      html,
      receiver
    })
  }
}

export default new MailerServer()
