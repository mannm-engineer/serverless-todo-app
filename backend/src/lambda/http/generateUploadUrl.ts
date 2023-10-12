import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../../auth/utils'
import { createAttachmentPresignedUrl } from '../../service/todoService'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing GenerateUploadUrl event...')

    try {
      const todoId = event.pathParameters.todoId
      const userId: string = getUserId(event)
      const signedUrl: string = await createAttachmentPresignedUrl(userId, todoId)
      logger.info('Successfully created signed url.')

      return {
        statusCode: 201,
        body: JSON.stringify({ uploadUrl: signedUrl })
      }
    } catch (error) {
      logger.error(`Error: ${error.message}`)

      return {
        statusCode: 500,
        body: JSON.stringify({ error })
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
