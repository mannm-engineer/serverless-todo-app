import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import { TodoRepository } from '../dataLayer/todoRepository'
import { getUserId } from '../utils/getJwt'
import { Todo } from '../models/Todo'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoRepository = new TodoRepository()

export async function getTodosForUser(jwtToken: string): Promise<Todo[]> {
  const userId: string = getUserId(jwtToken)
  return todoRepository.getTodos(userId)
}

export async function createTodo(
  jwtToken: string,
  createTodoRequest: CreateTodoRequest
): Promise<Todo> {
  const todoId = uuid.v4()
  const userId = getUserId(jwtToken)
  const createdAt = new Date().toISOString()
  const done = false

  const newTodo: Todo = {
    todoId,
    userId,
    createdAt,
    done,
    ...createTodoRequest
  }

  return todoRepository.createTodo(newTodo)
}

export async function updateTodo(
  jwtToken: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  const userId = getUserId(jwtToken)

  const todoUpdate: TodoUpdate = {
    ...updateTodoRequest
  }

  return todoRepository.updateTodo(userId, todoId, todoUpdate)
}

export async function deleteTodo(
  jwtToken: string,
  todoId: string
): Promise<void> {
  const userId = getUserId(jwtToken)
  return todoRepository.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(
  jwtToken: string,
  todoId: string
): Promise<string> {
  const userId = getUserId(jwtToken)
  const bucketName = process.env.IMAGES_S3_BUCKET
  const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)
  const s3 = new AWS.S3({ signatureVersion: 'v4' })

  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })

  await todoRepository.saveImgUrl(userId, todoId, bucketName)
  return signedUrl
}
