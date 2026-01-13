import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

interface Todo {
  id: string | number
  title?: string
  text?: string
  content?: string
  name?: string
  [key: string]: unknown
}

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from('todos').select()

  const getTodoDisplayText = (todo: Todo): string => {
    return todo.title || todo.text || todo.content || todo.name || `Todo ${todo.id}`
  }

  if (error) {
    return (
      <div>
        <h1>Error loading todos</h1>
        <p>{error.message}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  if (!todos || todos.length === 0) {
    return (
      <div>
        <h1>No todos found</h1>
        <p>The todos table is empty or doesn&apos;t exist.</p>
      </div>
    )
  }

  return (
    <ul>
      {todos.map((todo: Todo) => (
        <li key={String(todo.id)}>{getTodoDisplayText(todo)}</li>
      ))}
    </ul>
  )
}
