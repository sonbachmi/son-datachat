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
    duration: number,
    task: string,
    language: string,
    decoded: boolean
    decode_time: number,
    estimated_cost: number,
    info?: object
}