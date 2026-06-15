export interface ChecklistItem {
  text: string
  completed: boolean
}

export interface TaskLabel {
  name: string
  color: string
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  columnId: string | null
  order: number
  checklist: ChecklistItem[]
  labels: TaskLabel[]
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface TaskColumn {
  _id: string
  name: string
  color: string
  order: number
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  columnId?: string | null
  order?: number
  checklist?: ChecklistItem[]
  labels?: TaskLabel[]
}

export type UpdateTaskDto = Partial<CreateTaskDto>

export interface MoveTaskDto {
  columnId: string | null
  order?: number
}

export interface CreateTaskColumnDto {
  name: string
  color?: string
  order?: number
}

export type UpdateTaskColumnDto = Partial<CreateTaskColumnDto>
