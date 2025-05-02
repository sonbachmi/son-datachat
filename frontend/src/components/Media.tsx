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

function Media({selection}: { selection: DataSelection | null }) {
    const isAudio = /\.(wav|mp3)$/i.test(selection?.filename)
    const type = isAudio ? 'Audio' : 'Video'
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
            <Alert variant="light" color="blue" title={`${type} transcribed`}
                   icon={<IconInfoCircle/>}>
                Play with subtitles
            </Alert>
            <div className="player">
                <MediaPlayer title={`Transcribed ${type}`} src={selection?.url}>
                    <MediaProvider/>
                    <DefaultAudioLayout colorScheme="dark" icons={defaultLayoutIcons}/>
                    <DefaultVideoLayout icons={defaultLayoutIcons}/>
                </MediaPlayer>
            </div>
        </Stack>
    </div>
}

export default Media