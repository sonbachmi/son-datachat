import {TranscribeResult} from './transcribe.ts'

export interface DataSelection {
    filename: string
    head?: number
    committed?: boolean
    media: boolean
    url?: string
    result?: TranscribeResult
}