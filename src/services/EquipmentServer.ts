import axios from 'axios'
import { Types } from 'mongoose'

import env from '../config/env'
import { IResponseData } from '../core/interfaces/Response'
import CustomResponse from '../utils/CustomResponse'

interface IAddAccessToEquipmentProps {
  schedules?: Array<string>
  initDate?: Date
  endDate?: Date

  personId: Types.ObjectId
  personCode: Types.ObjectId
  personName: string
  personPictureUrl: string
  equipmentIp: string
}

class EquipmentServer {
  private baseUrl: string

  constructor (baseUrl: string = env.equipmentServerUrl) {
    this.baseUrl = baseUrl
  }

  async AddAccess ({
    personId,
    personCode,
    personName,
    personPictureUrl,
    schedules,
    equipmentIp,
    initDate,
    endDate
  }: IAddAccessToEquipmentProps): Promise<void> {
    const response = await axios.post<IResponseData>(`${this.baseUrl}/add`, {
      pessoaId: personId,
      pessoaNome: personName,
      pessoaCodigo: personCode,
      pessoaDiretorioFoto: personPictureUrl,
      jornadas: schedules,
      equipamentoIp: equipmentIp,
      dtInicio: initDate,
      dtFim: endDate
    })

    if (response.data.code !== 201) throw CustomResponse.BAD_REQUEST('Ocorreu um erro ao adicionar cadastro no equipamento!')
  }
}

export default new EquipmentServer()
