import jwt, { JwtPayload } from 'jsonwebtoken'

import env from '../config/env'

class Jwt {
  private secret: string = env.secretJwt
  private timeToExpires: number = 3 ^ 25

  generate (payload: any, expiresIn = this.timeToExpires): string {
    return jwt.sign(payload, this.secret, {
      expiresIn
    })
  }

  decode (token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload
  }
}

export default new Jwt()
