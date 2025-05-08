import {useRef, useState} from 'react'
import {Alert, Group, Paper, SimpleGrid, Stack, Text} from '@mantine/core'
import {IconClock, IconInfoCircle, IconLanguage, IconReceipt2, IconTimeDurationOff} from '@tabler/icons-react'
import {
    MediaEndedEvent,
    MediaPlayer,
    MediaPlayerInstance,
    type MediaPlayEvent,
    type MediaPlayRequestEvent,
    MediaProvider,
    MediaStartedEvent,
    MediaTimeUpdateEvent,
    MediaTimeUpdateEventDetail
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

    const result = selection?.result
    const stats =
        {
            language: result.language,
            duration: result.duration.toFixed(0) + 's',
            decodeTime: result.decode_time?.toFixed(0) + 's',
            speed: (result.decode_time / result.duration * 100),
            diff: ((result.duration - result.decode_time) / result.duration * 100),
            estimatedCost: 'USD ' + Intl.NumberFormat().format(result.estimated_cost),
        }
    const translate = result.task === 'translate'

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
            <Alert variant="light" color="blue" title={`${type} transcribed and subtitled`}
                   icon={<IconInfoCircle/>}>
            </Alert>
            {result && <div className="stats">
                <SimpleGrid cols={{base: 1, xs: 2, md: 4}}>
                    <Paper withBorder p="md" radius="md" key={stats.language} className="stat">
                        <Group justify="space-between">
                            <Text size="xs" c="dimmed" className="title">
                                Detected Language
                            </Text>
                            <IconLanguage className="icon" size={22} stroke={1.5}/>
                        </Group>

                        <Group align="flex-end" gap="xs" mt={25}>
                            <Text className="value">{stats.language}</Text>
                        </Group>
                        <Text fz="xs" c="dimmed" mt={7}>
                            {translate ? 'Auto translated to English' : ''}
                        </Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md" key={stats.duration} className="stat">
                        <Group justify="space-between">
                            <Text size="xs" c="dimmed" className="title">
                                Duration
                            </Text>
                            <IconClock className="icon" size={22} stroke={1.5}/>
                        </Group>

                        <Group align="flex-end" gap="xs" mt={25}>
                            <Text className="value">{stats.duration}</Text>
                        </Group>
                        <Text fz="xs" c="dimmed" mt={7}>
                            Total media duration
                        </Text>
                    </Paper>
                    {result.decoded && <>
                        <Paper withBorder p="md" radius="md" key={stats.decodeTime} className="stat">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed" className="title">
                                    Processing Time
                                </Text>
                                <IconTimeDurationOff className="icon" size={22} stroke={1.5}/>
                            </Group>

                            <Group align="flex-end" gap="xs" mt={25}>
                                <Text className="value">{stats.decodeTime}</Text>
                                <Text c="teal" fz="sm" fw={500} className="diff">
                                    <span>{stats.speed.toFixed(0)}%</span>
                                </Text>
                            </Group>
                            {/*                        <Group justify="space-between">
                            <Text fz="xs" c="teal" fw={700}>
                                {stats.speed.toFixed(0)}%
                            </Text>
                            <Text fz="xs" c="lightgray" fw={700}>
                                {stats.diff.toFixed(0)}%
                            </Text>
                        </Group>
                        <Progress.Root>
                            <Progress.Section
                                className="progress-section"
                                value={stats.speed}
                                color="teal"
                            />

                            <Progress.Section
                                className="progress-section"
                                value={stats.diff}
                                color="lightgray"
                            />
                        </Progress.Root>*/}

                            <Text fz="xs" c="dimmed" mt={7}>
                                Compared to duration
                            </Text>
                        </Paper>
                    </>}
                    <Paper withBorder p="md" radius="md" key={stats.estimatedCost} className="stat">
                        <Group justify="space-between">
                            <Text size="xs" c="dimmed" className="title">
                                Estimated Cost
                            </Text>
                            <IconReceipt2 className="icon" size={22} stroke={1.5}/>
                        </Group>

                        <Group align="flex-end" gap="xs" mt={25}>
                            <Text className="value">{stats.estimatedCost}</Text>
                        </Group>

                        <Text fz="xs" c="dimmed" mt={7}>
                            Per OpenAI standard rate
                        </Text>
                    </Paper>
                </SimpleGrid>

            </div>}
            <div className="player">
                <MediaPlayer ref={player} title={`Transcribed ${type}`} src={selection?.url} crossOrigin={true}
                             onStarted={onStarted} onEnded={onEnded} onPlay={onPlay} onMediaPlayRequest={onPlayRequest}
                             onTimeUpdate={onTimeUpdate}>
                    <MediaProvider/>
                    <DefaultAudioLayout colorScheme="dark" icons={defaultLayoutIcons}/>
                    <DefaultVideoLayout icons={defaultLayoutIcons}/>
                </MediaPlayer>
                {result.decoded && started &&
                    <div className="subtitle" ref={subtitle}>
                        {/*{text}*/}
                    </div>
                }
            </div>
        </Stack>
    </div>
}

export default Media