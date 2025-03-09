import axios from 'axios'
import { Types } from 'mongoose'

import env from '../config/env'
import { IResponseData } from '../core/interfaces/Response'
import { Day } from '../models/WorkSchedule/WorkScheduleModel'
import CustomResponse from '../utils/CustomResponse'

interface IAddAccessToEquipmentProps {
  schedules?: Array<{
    scheduleCode: number
    description: string
  }>
  initDate?: Date
  endDate?: Date

  personId: Types.ObjectId
  personCode: string
  personName: string
  personPictureUrl: string
  equipmentIp: string
}

interface IRemoveAccessFromEquipmentProps {
  personId: Types.ObjectId
  equipmentIp: string
}

interface IAddWorkScheduleTemplateProps {
  workSchedule: {
    id: number
    name: string
  }
  equipmentIp: string
}

interface IAddWorkScheduleProps {
  workScheduleId: number
  equipmentIp: string
  days: Array<Day>
  startTime: string
  endTime: string
}

class EquipmentServer {
  private baseUrl: string

  constructor (baseUrl: string = env.equipmentServerUrl) {
    this.baseUrl = baseUrl
  }

  async addAccess ({
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
      jornadas: (schedules || [])?.map(schedule => {
        return {
          id: String(schedule.scheduleCode),
          descricao: schedule.description
        }
      }),
      equipamentoIp: equipmentIp,
      dtInicio: initDate,
      dtFim: endDate
    })

    if (response.data.code !== 201) {
      throw CustomResponse.BAD_REQUEST('Ocorreu um erro ao adicionar cadastro no equipamento!', {
        personId,
        equipmentIp
      })
    }
  }

  async removeAccess ({
    personId,
    equipmentIp
  }: IRemoveAccessFromEquipmentProps): Promise<void> {
    const response = await axios.post<IResponseData>(`${this.baseUrl}/delete`, {
      pessoaId: personId,
      equipamentoIp: equipmentIp
    })

    if (response.data.code !== 201) {
      throw CustomResponse.BAD_REQUEST('Ocorreu um erro ao remover cadastro no equipamento!', {
        personId,
        equipmentIp
      })
    }
  }

  async addWorkScheduleTemplate ({
    equipmentIp,
    workSchedule
  }: IAddWorkScheduleTemplateProps): Promise<void> {
    const response = await axios.post<IResponseData>(`${this.baseUrl}/add-user-right-week-plan-template`, {
      id: String(workSchedule.id),
      ip: equipmentIp,
      nome: workSchedule.name,
      idPlano: String(workSchedule.id)
    })

    if (response.data.code !== 201) {
      throw CustomResponse.BAD_REQUEST('Ocorreu um erro ao cadastrar template de jornada de horário!', {
        workSchedule,
        equipmentIp
      })
    }
  }

  async addWorkSchedule ({
    days,
    endTime,
    equipmentIp,
    startTime,
    workScheduleId
  }: IAddWorkScheduleProps): Promise<void> {
    const response = await axios.post<IResponseData>(`${this.baseUrl}/add-user-right-week-plan`, {
      id: String(workScheduleId),
      ip: equipmentIp,
      dias: days,
      horaInicio: startTime,
      horaFim: endTime
    })

    if (response.data.code !== 201) {
      throw CustomResponse.BAD_REQUEST('Ocorreu um erro ao cadastrar jornada de horário!', {
        equipmentIp
      })
    }
  }

  async healthCheck (equipmentIp: string): Promise<void> {
    const response = await axios.post<IResponseData>(`${this.baseUrl}/sistema/equipamento-health-check`, {
      ip: equipmentIp
    })

    if (response.data.code !== 200) {
      throw CustomResponse.BAD_REQUEST('Ocorreu um erro ao consultar equipamento!', {
        equipmentIp
      })
    }
  }
}

export default new EquipmentServer()
