import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getToken } from '../../auth/utils'
import { createAttachmentPresignedUrl } from '../../service/todoService'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing GenerateUploadUrl event...')

    const jwtToken: string = getToken(event)
    const todoId = event.pathParameters.todoId
    try {
      const signedUrl: string = await createAttachmentPresignedUrl(
        jwtToken,
        todoId
      )

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
