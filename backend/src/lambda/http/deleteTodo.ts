import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getToken } from '../../auth/utils'
import { deleteTodo } from '../../service/todoService'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing DeleteTodo event...')

    const jwtToken: string = getToken(event)
    const todoId = event.pathParameters.todoId

    try {
      await deleteTodo(jwtToken, todoId)

      logger.info(`Successfully deleted todo item: ${todoId}`)

      return {
        statusCode: 204
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
