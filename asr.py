import os
import random
import string
import time
from enum import Enum
from typing import List

import whisper
from faster_whisper import WhisperModel
from faster_whisper.transcribe import Segment, TranscriptionInfo
from pydantic import BaseModel
from whisper.audio import SAMPLE_RATE
from whisper.tokenizer import LANGUAGES


class ASREngine(str, Enum):
    whisper = 'whisper'
    faster_whisper = 'faster_whisper'


# engine = ASREngine.whisper
engine = ASREngine.faster_whisper

model_sizes = ["tiny", "base", "small", "medium", "turbo", "large"]
whisper_models = {}
faster_whisper_models = {}
for size in model_sizes:
    if engine == ASREngine.whisper:
        whisper_models[size] = whisper.load_model(size)
    else:
        faster_whisper_models[size] = WhisperModel(size, device="cuda", compute_type="float16")

preprocess_model_size = 'base'
whisper_model = whisper_models[preprocess_model_size] if engine == ASREngine.whisper else whisper.load_model(
    preprocess_model_size)

word_timestamps = True


class DecodeConfig(BaseModel):
    performance: str = 'fast'
    limit: str = 'full'
    task: str = 'transcribe'
    prompt: str = ''


class DecodeResult(BaseModel):
    segments: List[Segment | dict] | None = None
    lang: str = 'en'
    language: str = 'English'
    info: TranscriptionInfo | None = None
    task: str = 'transcribe'
    duration: float
    decoded: bool = False
    limited: bool = False
    decode_time: float | None = None
    tokens: int | None = None
    cost: float | None = None
    estimated_cost: float | None = None


def crop_audio(path):
    # load audio and pad/trim it to fit 60 seconds
    audio = whisper.load_audio(path)
    audio = whisper.pad_or_trim(audio, 60 * SAMPLE_RATE)
    return audio


def generate_id() -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))


class Media:
    id = generate_id()
    type: str = 'video'
    filename: str
    path: str
    duration: float | None = None
    result: DecodeResult | None = None

    def __init__(self, filename, path):

        self.filename = filename
        self.path = path
        extension = os.path.splitext(filename)[1][1:].lower()
        self.type = 'audio' if extension in ['wav', 'mp3'] else 'video'

        # load audio and pad/trim it to fit 30 seconds
        audio = whisper.load_audio(path)
        self.duration = audio.shape[0] / SAMPLE_RATE
        audio = whisper.pad_or_trim(audio)

        # make log-Mel spectrogram and move to the same device as the model
        mel = whisper.log_mel_spectrogram(audio, n_mels=whisper_model.dims.n_mels).to(whisper_model.device)

        # detect the spoken language
        _, probs = whisper_model.detect_language(mel)
        lang = max(probs, key=probs.get)
        lang = str(lang)
        self.result = DecodeResult(lang=lang, language=LANGUAGES[lang].title(),
                                   duration=self.duration, estimated_cost=self.duration * 0.006)

    def transcribe(self, config: DecodeConfig):
        task = config.task
        translate = task == 'translate'
        performance = config.performance
        limited = config.limit == 'head'
        prompt = config.prompt
        duration = self.result.duration
        lang = self.result.lang
        path = self.path

        audio = crop_audio(path) if limited else whisper.load_audio(path)

        if translate:
            size = 'base' if performance == 'fastest' else 'small' if performance == 'fast' else 'large' if performance == 'accurate' else 'medium'
        else:
            size = 'tiny' if performance == 'fastest' else 'base' if performance == 'fast' else 'large' if performance == 'accurate' else 'turbo'

        print(f'{'Translating' if translate else 'Transcribing'} {self.filename} with {engine} {size} model')

        start = time.time()
        if engine == ASREngine.faster_whisper:
            segments, _ = faster_whisper_models[size].transcribe(audio,
                                                                 # language=lang,
                                                                 task=task,
                                                                 beam_size=5,
                                                                 # batch_size=8,
                                                                 word_timestamps=word_timestamps and not translate,
                                                                 vad_filter=True,
                                                                 initial_prompt=prompt
                                                                 )
            segments = list(segments)
            tokens = sum(len(segment.tokens) for segment in segments)
        else:
            result = whisper_models[size].transcribe(audio,
                                                     task=task,
                                                     # language=lang,
                                                     # no_speech_threshold=0.4,
                                                     # verbose=True,
                                                     word_timestamps=word_timestamps and not translate,
                                                     initial_prompt=prompt
                                                     )
            segments = result['segments']
            tokens = sum(len(segment['tokens']) for segment in segments)
        end = time.time()
        cost = tokens * 6 / 1_000_000
        self.result = DecodeResult(segments=segments, lang=lang, language=LANGUAGES[lang].title(),
                                   duration=duration, task=task,
                                   decoded=True, limited=limited,
                                   tokens=tokens, cost=cost,
                                   estimated_cost=60 * 0.006 if limited else self.result.estimated_cost,
                                   decode_time=end - start)
        return self
