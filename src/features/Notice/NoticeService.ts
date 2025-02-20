/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { IDeleteNoticeProps, IListNoticesFilters, INotice, IUpdateNoticeProps, NoticeModel } from '../../models/Notice/NoticeModel'
import { NoticeRepositoryImp } from '../../models/Notice/NoticeMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class NoticeService {
  constructor (
    private noticeRepositoryImp: typeof NoticeRepositoryImp
  ) {
    this.noticeRepositoryImp = noticeRepositoryImp
  }

  async list (filters: IListNoticesFilters): Promise<IAggregatePaginate<INotice>> {
    return await this.noticeRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<NoticeModel> {
    const notice = await this.noticeRepositoryImp.findById({
      id,
      tenantId
    })
    if (!notice) throw CustomResponse.NOT_FOUND('Aviso não cadastrado!')

    return notice
  }

  async create (notice: NoticeModel): Promise<NoticeModel> {
    const createdNotice = await this.noticeRepositoryImp.create(notice)

    return createdNotice
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateNoticeProps): Promise<void> {
    const notice = await this.findById({
      id,
      tenantId
    })

    const updated = await this.noticeRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...notice.actions!,
          (
            data.deletionDate ? {
              action: ModelAction.delete,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            } : {
              action: ModelAction.update,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            }
          )
        ]
      }
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar aviso!', {
        noticeId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteNoticeProps) {
    const Notice = await this.findById({
      id,
      tenantId
    })

    if (Notice.object.deletionDate) {
      throw CustomResponse.CONFLICT('Aviso já removido!', {
        NoticeId: id
      })
    }

    return await this.update({
      id,
      tenantId,
      data: {
        active: false,
        deletionDate: DateUtils.getCurrent()
      },
      responsibleId
    })
  }
}
