export interface Todo {
  todoId: string
  userId: string
  name: string
  dueDate: string
  attachmentUrl?: string
  done: boolean
  createdAt: string
}
