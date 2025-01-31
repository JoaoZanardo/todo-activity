import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import sharp from 'sharp'

import { s3 } from '../config/s3'
import CustomResponse from '../utils/CustomResponse'

const MAX_IMAGE_SIZE = 500 * 1024

export const S3Middleware = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const file = request.file
    if (!file) throw CustomResponse.UNPROCESSABLE_ENTITY('Arquivo inválido!')

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validMimeTypes.includes(file.mimetype)) {
      throw CustomResponse.UNPROCESSABLE_ENTITY('Tipo de arquivo inválido. Apenas imagens são permitidas.')
    }

    let compressedImageBuffer = await sharp(file.buffer)
      .resize(300, 400)
      .jpeg({ quality: 90 })
      .toBuffer()

    let quality = 90

    while (compressedImageBuffer.length > MAX_IMAGE_SIZE && quality > 10) {
      compressedImageBuffer = await sharp(compressedImageBuffer)
        .jpeg({ quality })
        .toBuffer()

      quality -= 10
    }

    const mimeType = 'image/jpeg'

    const params = {
      Bucket: 'modernizesoftwares',
      Key: `${randomUUID()}-${file.originalname}`,
      Body: compressedImageBuffer,
      ContentType: mimeType
    }

    const filePath = `${process.env.URL_AWS}${params.Key}`
    request.filePath = filePath

    await s3.upload(params).promise()

    next()
  } catch (error) {
    next(error)
  }
}
