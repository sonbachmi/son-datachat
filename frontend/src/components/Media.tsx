import {useEffect, useRef, useState} from 'react'
import {Alert, Stack} from '@mantine/core'
import {IconInfoCircle} from '@tabler/icons-react'
import {
    MediaEndedEvent,
    MediaPlayer,
    MediaPlayerInstance,
    type MediaPlayEvent,
    type MediaPlayRequestEvent,
    MediaProvider, MediaStartedEvent, MediaTimeUpdateEvent, MediaTimeUpdateEventDetail
} from '@vidstack/react';
import {DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout} from '@vidstack/react/player/layouts/default';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import './Media.css'

import {DataSelection} from '../models/selection.ts'
import {getTextAtTime} from '../hooks/transcribe.ts'

function Media({selection}: { selection: DataSelection | null }) {
    const player = useRef<MediaPlayerInstance>(null)
    const subtitle = useRef<HTMLDivElement>(null)
    const isAudio = /\.(wav|mp3)$/i.test(selection?.filename)
    const type = isAudio ? 'Audio' : 'Video'
    const [started, setStarted] = useState(false)
    const [text, setText] = useState<string>('')

    // useEffect(() => {
    //     return player.current?.subscribe(({started}) => {
    //         if (started) {
    //             setStarted(true)
    //             const media = document.querySelector(isAudio ? 'audio' : 'video')
    //             media.addEventListener('timeupdate', () => {
    //                 const currentText = getTextAtTime(media.currentTime, selection?.result)
    //                 // if (currentText !== text) {
    //                 //     setText(currentText)
    //                 // }
    //                 if (subtitle.current)
    //                     subtitle.current.textContent = currentText
    //             })
    //         }
    //     })
    // }, [player, selection?.result])

    function onStarted(nativeEvent: MediaStartedEvent) {
        setStarted(true)
        const media = document.querySelector(isAudio ? 'audio' : 'video')
        media.addEventListener('timeupdate', () => {
            const currentText = getTextAtTime(media.currentTime, selection?.result)
            // if (currentText !== text) {
            //     setText(currentText)
            // }
            if (subtitle.current)
                subtitle.current.textContent = currentText
        })
    }

    function onEnded(nativeEvent: MediaEndedEvent) {
        // setStarted(false)
    }

    function onTimeUpdate(detail: MediaTimeUpdateEventDetail, nativeEvent: MediaTimeUpdateEvent) {
        // console.log(detail, nativeEvent)
    }

    // 1. request was made
    function onPlayRequest(nativeEvent: MediaPlayRequestEvent) {
        // console.log('playrequest', nativeEvent);
    }

    // 2. request succeeded
    function onPlay(nativeEvent: MediaPlayEvent) {
        // request events are attached to media events
        // console.log('play', nativeEvent);
    }

    return <div className="Media">
        <Stack>
            <Alert variant="light" color="blue" title={`${type} transcribed`}
                   icon={<IconInfoCircle/>}>
                Play with subtitles
            </Alert>
            <div className="player">
                <MediaPlayer ref={player} title={`Transcribed ${type}`} src={selection?.url} crossOrigin={true}
                             onStarted={onStarted} onEnded={onEnded} onPlay={onPlay} onMediaPlayRequest={onPlayRequest}
                             onTimeUpdate={onTimeUpdate}>
                    <MediaProvider/>
                    <DefaultAudioLayout colorScheme="dark" icons={defaultLayoutIcons}/>
                    <DefaultVideoLayout icons={defaultLayoutIcons}/>
                </MediaPlayer>
                {started &&
                    <div className="subtitle" ref={subtitle}>
                        {/*{text}*/}
                    </div>
                }
            </div>
        </Stack>
    </div>
}

export default Media