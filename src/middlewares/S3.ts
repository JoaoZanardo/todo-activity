import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { Jimp, JimpMime } from 'jimp'

import { s3 } from '../config/s3'
import CustomResponse from '../utils/CustomResponse'

const MAX_IMAGE_SIZE = 200 * 1024

export const S3Middleware = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const file = request.file
    if (!file) throw CustomResponse.UNPROCESSABLE_ENTITY('Arquivo inválido!')

    const validMimeTypes = ['image/jpeg', 'image/png']
    if (!validMimeTypes.includes(file.mimetype)) {
      throw CustomResponse.UNPROCESSABLE_ENTITY('Tipo de arquivo inválido. Apenas imagens são permitidas.')
    }

    const image = (await Jimp.read(file.buffer)).resize({ w: 300, h: 400 })

    let quality = 90
    let compressedImageBuffer = await image.getBuffer(JimpMime.jpeg)

    while (compressedImageBuffer.length > MAX_IMAGE_SIZE && quality > 10) {
      quality -= 10
      // image.quality(quality)
      compressedImageBuffer = await image.getBuffer(JimpMime.jpeg)
    }

    const params = {
      Bucket: 'modernizesoftwares',
      Key: `${randomUUID()}-${file.originalname}`,
      Body: compressedImageBuffer,
      ContentType: JimpMime.jpeg
    }

    const filePath = `${process.env.URL_AWS}${params.Key}`
    request.filePath = filePath

    await s3.upload(params).promise()

    next()
  } catch (error) {
    next(error)
  }
}
