export type Role = 'user' | 'ai'

export interface Message {
    id: number
    role: Role,
    type?: 'text' | 'fetching' | 'html'
    message: string
}

export interface ChatResponse {
    answer: string
    type: string
    html?: boolean
}