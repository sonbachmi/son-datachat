import time
from enum import Enum

import whisper
from faster_whisper import WhisperModel, BatchedInferencePipeline
from faster_whisper.transcribe import Segment
from pydantic import BaseModel

model_size = "turbo"
whisper_model = whisper.load_model(model_size)

faster_whisper_model = WhisperModel(model_size, device="cuda", compute_type="float16")
batched_model = BatchedInferencePipeline(model=faster_whisper_model)


class ASREngine(str, Enum):
    whisper = 'whisper'
    faster_whisper = 'faster_whisper'


engine = ASREngine.faster_whisper

word_timestamps = True


class DecodeResult(BaseModel):
    segments: list[Segment]
    info: object
    tokens: int
    estimated_cost: float
    decode_time: float


def transcribe(path):
    start = time.time()
    if engine == ASREngine.faster_whisper:
        segments, info = faster_whisper_model.transcribe(path,
                                                         beam_size=5,
                                                         # batch_size=8,
                                                         word_timestamps=word_timestamps,
                                                         vad_filter=True
                                                         )
        segments = list(segments)
    else:
        # audio = whisper.load_audio(path)
        # audio = whisper.pad_or_trim(audio)
        result = whisper_model.transcribe(path,
                                          # language="en",
                                          # no_speech_threshold=0.4,
                                          # verbose=True,
                                          word_timestamps=word_timestamps,
                                          # fp16=False
                                          )
        segments = result['segments']
        info = {}
    end = time.time()
    tokens = sum(len(segment.tokens) for segment in segments)
    estimated_cost = info.duration * 0.006
    estimated_cost = round(estimated_cost, 0 if estimated_cost > 5 else 2)
    return DecodeResult(segments=segments, info=info,
                        tokens=tokens, estimated_cost=estimated_cost,
                        decode_time=round(end - start))

