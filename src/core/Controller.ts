import { Router } from 'express'

import Rules from './Rules'

export abstract class Controller {
  protected router = Router()

  protected abstract rules: Rules

  abstract handle (): Router
}
