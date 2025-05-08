import {TranscribeResult} from './asr.ts'

export interface DataSelection {
    filename: string
    head?: number
    committed?: boolean
    media: boolean
    type?: string
    url?: string
    result?: TranscribeResult
}