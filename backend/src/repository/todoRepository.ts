import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { Todo } from '../models/Todo'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodoRepository')

export class TodoRepository {
  constructor(
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly docClient: DocumentClient = createDynamoDBClient()
  ) {}

  async getTodos(userId: string): Promise<Todo[]> {
    logger.info('Getting todos by userId')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items as Todo[]
  }

  async createTodo(todo: Todo): Promise<Todo> {
    logger.info(`Creating new todo: ${todo.todoId}`)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<void> {
    logger.info(`Updating a todo: ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        }
      })
      .promise()
  }

  async deleteTodo(todoId: string): Promise<void> {
    logger.info(`Deleting a todo: ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId }
      })
      .promise()
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    bucketName: string
  ): Promise<void> {
    logger.info(`Saving a todo image: ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
        }
      })
      .promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.debug('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
