import {TranscribeResult} from './whisper.ts'

export interface DataSelection {
    filename: string
    head?: number
    committed?: boolean
    media: boolean
    url?: string
    result?: TranscribeResult
}