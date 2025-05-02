export interface TranscribeSegment {
    id: string
    seek: number
    start: number
    end: number
    text: string
}

export interface TranscribeResult {
    segments: TranscribeSegment[]
}