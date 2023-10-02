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
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
  ) {}

  async getTodos(userId: string): Promise<Todo[]> {
    logger.info('Getting all todos')

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

  async getTodo(userId: string, todoId: string): Promise<Todo> {
    logger.info(`Getting todo: ${todoId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise()
    const todoItem = result.Items[0]

    return todoItem as Todo
  }

  async createTodo(newTodo: Todo): Promise<Todo> {
    logger.info(`Creating new todo: ${newTodo.todoId}`)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodo
      })
      .promise()

    return newTodo
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updateData: TodoUpdate
  ): Promise<void> {
    logger.info(`Updating a todo: ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: {
          ':n': updateData.name,
          ':due': updateData.dueDate,
          ':dn': updateData.done
        }
      })
      .promise()
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    logger.info(`Deleting a todo: ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise()
  }

  async saveImgUrl(
    userId: string,
    todoId: string,
    bucketName: string
  ): Promise<void> {
    logger.info(`Saving a todo image: ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
        }
      })
      .promise()
  }
}
