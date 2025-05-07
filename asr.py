import time
from enum import Enum
from typing import List

import whisper
from faster_whisper import WhisperModel, BatchedInferencePipeline
from faster_whisper.transcribe import Segment, TranscriptionInfo
from pydantic import BaseModel
from whisper.tokenizer import LANGUAGES

model_size = "medium"
whisper_model = whisper.load_model(model_size)

faster_whisper_model = WhisperModel(model_size, device="cuda", compute_type="float16")
batched_model = BatchedInferencePipeline(model=faster_whisper_model)


class ASREngine(str, Enum):
    whisper = 'whisper'
    faster_whisper = 'faster_whisper'


engine = ASREngine.whisper
# engine = ASREngine.faster_whisper

word_timestamps = True


class DecodeResult(BaseModel):
    segments: List[Segment | dict]
    lang: str
    info: TranscriptionInfo | None
    tokens: int
    task: str
    duration: float
    cost: float
    estimated_cost: float
    decode_time: float


def transcribe(path):
    # load audio and pad/trim it to fit 30 seconds
    audio = whisper.load_audio(path)
    duration = float(audio.shape[0] / 16_000)
    audio = whisper.pad_or_trim(audio)

    # make log-Mel spectrogram and move to the same device as the model
    mel = whisper.log_mel_spectrogram(audio, n_mels=whisper_model.dims.n_mels).to(whisper_model.device)

    # detect the spoken language
    _, probs = whisper_model.detect_language(mel)
    lang = max(probs, key=probs.get)
    lang = str(lang)
    english = lang == 'en'
    task = 'transcribe' if english else 'translate'
    prompt = ''

    start = time.time()
    if engine == ASREngine.faster_whisper:
        segments, info = faster_whisper_model.transcribe(path,
                                                         # language=lang,
                                                         task=task,
                                                         beam_size=5,
                                                         # batch_size=8,
                                                         word_timestamps=word_timestamps and english,
                                                         vad_filter=True,
                                                         initial_prompt=prompt
                                                         )
        segments = list(segments)
        tokens =  sum(len(segment.tokens) for segment in segments)
    else:
        result = whisper_model.transcribe(path,
                                          task=task,
                                          # language=lang,
                                          # no_speech_threshold=0.4,
                                          # verbose=True,
                                          word_timestamps=word_timestamps and english,
                                          initial_prompt=prompt
                                          )
        segments = result['segments']
        info = None
        tokens = sum(len(segment['tokens']) for segment in segments)
    end = time.time()
    cost = tokens*6/1_000_000
    cost = round(cost, 0 if cost > 5 else 2)
    estimated_cost = duration * 0.006
    estimated_cost = round(estimated_cost, 0 if estimated_cost > 5 else 2)
    return DecodeResult(segments=segments, info=info, lang=LANGUAGES[lang].title(),
                        duration=round(duration), task=task,
                        tokens=tokens, cost=cost, estimated_cost=estimated_cost,
                        decode_time=round(end - start))

