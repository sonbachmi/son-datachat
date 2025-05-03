export interface TranscribeSegment {
    id: string
    seek: number
    start: number
    end: number
    text: string
    tokens: number[]
}

export interface TranscribeResult {
    segments: TranscribeSegment[]
    info?: object
}