import {TranscribeResult} from '../models/transcribe.ts'

const offset = 0

export function getTextAtTime(time: number, result: TranscribeResult) {
    const segments = result.segments.filter(segment =>
        segment.end + offset >= time && segment.start + offset <= time)
    return segments.map(s => s.text).join(' ')
}