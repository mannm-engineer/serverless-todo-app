import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../../auth/utils'
import { updateTodo } from '../../service/todoService'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing UpdateTodo event...')

    try {
      const todoId = event.pathParameters.todoId
      const userId: string = getUserId(event)
      const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)

      await updateTodo(userId, todoId, updateTodoRequest)
      logger.info(`Successfully updated the todo: ${todoId}`)

      return {
        statusCode: 204,
        body: ''
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
