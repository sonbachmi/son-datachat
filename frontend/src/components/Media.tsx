import {FormEvent, useState} from 'react'
import {Alert, Stack} from '@mantine/core'
import {IconInfoCircle} from '@tabler/icons-react'
import {MediaPlayer, MediaProvider} from '@vidstack/react';
import {DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout} from '@vidstack/react/player/layouts/default';

import {getData} from '../hooks/fetch.ts'

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import './Media.css'

import {DataSelection} from '../models/selection.ts'

const mediaUrl = (import.meta.env.VITE_SERVER_URL || 'http://localhost:8000') + '/media'

function Media({selection}: { selection: DataSelection | null }) {
    const fileName = 'harvard.wav'
    // const fileName = 'sprite-flight-360p.mp4'
    const [fetching, setFetching] = useState<boolean>(false)
    const fetchTranscribe = async (e: FormEvent<HTMLFormElement>) => {
        setFetching(true)
        try {
            const data = await getData('/transcribe')
            console.log(data)
        } catch (error) {
            console.error(error)
        } finally {
            setFetching(false)
        }
    }
    return <div className="Media">
        <Stack>
            <Alert variant="light" color="blue" title="Media transcribed"
                   icon={<IconInfoCircle/>}>
                Play with subtitles
            </Alert>
            <div className="player">
                <MediaPlayer title="Transcribed Media" src={`${mediaUrl}/${fileName}`}>
                    <MediaProvider/>
                    <DefaultAudioLayout icons={defaultLayoutIcons}/>
                    <DefaultVideoLayout icons={defaultLayoutIcons}/>
                </MediaPlayer>
            </div>
        </Stack>
    </div>
}

export default Media