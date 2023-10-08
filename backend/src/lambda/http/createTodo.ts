import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../../auth/utils'
import { createTodo } from '../../service/todoService'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { Todo } from '../../models/Todo'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing CreateTodo event...')

    try {
      const userId: string = getUserId(event)
      const createTodoRequest: CreateTodoRequest = JSON.parse(event.body)

      const createdTodo: Todo = await createTodo(userId, createTodoRequest)
      logger.info('Successfully created a new todo.')

      return {
        statusCode: 201,
        body: JSON.stringify(createdTodo)
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
