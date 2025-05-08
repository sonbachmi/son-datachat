import {TranscribeResult} from '../models/asr.ts'

const offset = 0

export function getTextAtTime(time: number, result: TranscribeResult) {
    const segments = result.segments.filter(segment =>
        segment.end + offset >= time && segment.start + offset <= time)
    return segments.map(s => s.text).join(' ')
}

export function countTokens(result: TranscribeResult) {
    return result.segments.reduce((count, segment) => count + segment.tokens.length, 0)
}