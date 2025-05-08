import random
import string
import time
from enum import Enum
from typing import List

import whisper
from faster_whisper import WhisperModel, BatchedInferencePipeline
from faster_whisper.transcribe import Segment, TranscriptionInfo
from pydantic import BaseModel
from whisper.audio import SAMPLE_RATE
from whisper.tokenizer import LANGUAGES

model_size = "small"
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
    segments: List[Segment | dict] | None = None
    lang: str = 'en'
    language: str = 'English'
    info: TranscriptionInfo | None = None
    task: str = 'transcribe'
    duration: float
    decoded: bool = False
    decode_time: float | None = None
    tokens: int | None = None
    cost: float | None = None
    estimated_cost: float | None = None


class Media(BaseModel):
    id: str
    filename: str
    path: str
    result: DecodeResult | None = None


def generate_id() -> str:
    return (
        ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))
    )


def preprocess(filename, path):
    # load audio and pad/trim it to fit 30 seconds
    audio = whisper.load_audio(path)
    duration = audio.shape[0] / SAMPLE_RATE
    audio = whisper.pad_or_trim(audio)

    # make log-Mel spectrogram and move to the same device as the model
    mel = whisper.log_mel_spectrogram(audio, n_mels=whisper_model.dims.n_mels).to(whisper_model.device)

    # detect the spoken language
    _, probs = whisper_model.detect_language(mel)
    lang = max(probs, key=probs.get)
    lang = str(lang)
    result = DecodeResult(lang=lang, language=LANGUAGES[lang].title(),
                          duration=duration, estimated_cost=duration * 0.006)
    return Media(id=generate_id(), filename=filename, path=path, result=result)


def transcribe(media: Media):
    # load audio and pad/trim it to fit 30 seconds
    english = media.result.lang == 'en'
    task = 'transcribe' if english else 'translate'
    prompt = ''

    start = time.time()
    if engine == ASREngine.faster_whisper:
        segments, info = faster_whisper_model.transcribe(media.path,
                                                         # language=lang,
                                                         task=task,
                                                         beam_size=5,
                                                         # batch_size=8,
                                                         word_timestamps=word_timestamps and english,
                                                         vad_filter=True,
                                                         initial_prompt=prompt
                                                         )
        segments = list(segments)
        tokens = sum(len(segment.tokens) for segment in segments)
    else:
        result = whisper_model.transcribe(media.path,
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
    cost = tokens * 6 / 1_000_000
    media.result = DecodeResult(segments=segments, info=info, language=LANGUAGES[media.result.lang].title(),
                                duration=media.result.duration, task=task, decoded=True,
                                tokens=tokens, cost=cost, estimated_cost=media.result.estimated_cost,
                                decode_time=end - start)
    return media
