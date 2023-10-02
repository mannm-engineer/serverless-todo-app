import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getToken } from '../../auth/utils'
import { getTodosForUser } from '../../service/todoService'
import { Todo } from '../../models/Todo'

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing GetTodos event...')

    const jwtToken: string = getToken(event)

    try {
      const todos: Todo[] = await getTodosForUser(jwtToken)

      logger.info('Successfully retrieved todolist')

      return {
        statusCode: 200,
        body: JSON.stringify(todos)
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

handler.use(
  cors({
    credentials: true
  })
)
