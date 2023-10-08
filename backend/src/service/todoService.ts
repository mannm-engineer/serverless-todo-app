import * as uuid from 'uuid'
import * as createError from 'http-errors'

import { getPutSignedUrl } from '../helpers/attachmentUtils'
import { TodoRepository } from '../repository/todoRepository'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { Todo } from '../models/Todo'
import { TodoUpdate } from '../models/TodoUpdate'

const todoRepository = new TodoRepository()

export async function getTodos(userId: string): Promise<Todo[]> {
  return todoRepository.getTodos(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<Todo> {
  const newTodo: Todo = {
    todoId: uuid.v4(),
    userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest
  }

  return todoRepository.createTodo(newTodo)
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  const todoUpdate: TodoUpdate = {
    ...updateTodoRequest
  }

  return todoRepository.updateTodo(todoId, todoUpdate)
}

export async function deleteTodo(todoId: string): Promise<void> {
  return todoRepository.deleteTodo(todoId)
}

export async function createAttachmentPresignedUrl(
  todoId: string
): Promise<string> {
  const bucket = process.env.IMAGES_S3_BUCKET
  const expires = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)

  const signedUrl = getPutSignedUrl(bucket, todoId, expires)
  await todoRepository.updateTodoAttachmentUrl(todoId, bucketName)

  return signedUrl
}
