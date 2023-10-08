import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../../auth/utils'
import { getTodos } from '../../service/todoService'
import { Todo } from '../../models/Todo'

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing GetTodos event...')

    try {
      const userId: string = getUserId(event)
      
      const todos: Todo[] = await getTodos(userId)

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
