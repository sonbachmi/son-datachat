import {useEffect, useRef, useState} from 'react'
import {Alert, Group, Paper, SimpleGrid, Stack, Text} from '@mantine/core'
import {IconClock, IconClockHour4, IconInfoCircle, IconLanguage, IconReceipt2} from '@tabler/icons-react'
import {MediaPlayer, MediaPlayerInstance, MediaProvider, MediaStartedEvent} from '@vidstack/react';
import {DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout} from '@vidstack/react/player/layouts/default';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import './Media.css'

import {DataSelection} from '../models/selection.ts'
import {getTextAtTime} from '../hooks/transcribe.ts'
import {capitalize, querySelectorDefer} from '../hooks/utils.ts'

function Media({selection, showMedia}: { selection: DataSelection | null, showMedia: boolean }) {
    const player = useRef<MediaPlayerInstance>(null)
    const subtitle = useRef<HTMLDivElement>(null)
    const [started, setStarted] = useState(false)

    const result = selection?.result
    const {type = 'video'} = selection
    const duration = result.limited ? 60 : result.duration
    const stats =
        {
            language: result.language,
            duration: result.duration.toFixed(0),
            decodeTime: result.decode_time?.toFixed(0),
            speed: (result.decode_time / duration * 100),
            diff: ((duration - result.decode_time) / duration * 100),
            estimatedCost: Intl.NumberFormat('en-US',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result.estimated_cost),
        }
    const translate = result.task === 'translate'

    // useEffect(() => {
    //     return player.current?.subscribe(({started}) => {
    //         if (started) {
    //             setStarted(true)
    //             querySelectorDefer(type).then((media: HTMLMediaElement) => {
    //                 media.addEventListener('timeupdate', () => {
    //                     const currentText = getTextAtTime(media.currentTime, selection?.result)
    //                     // if (currentText !== text) {
    //                     //     setText(currentText)
    //                     // }
    //                     if (subtitle.current)
    //                         subtitle.current.textContent = currentText
    //                 })
    //             })
    //         }
    //     })
    // }, [selection?.result, type, player.current])

    function onStarted(nativeEvent: MediaStartedEvent) {
        setStarted(true)
        querySelectorDefer(type).then((media: HTMLMediaElement) => {
            media.addEventListener('timeupdate', () => {
                if (!selection?.result.decoded) return
                const currentText = getTextAtTime(media.currentTime, selection?.result)
                // if (currentText !== text) {
                //     setText(currentText)
                // }
                if (subtitle.current)
                    subtitle.current.textContent = currentText
            })
        })
    }

    return <div className="Media">
        <Stack>
            <Alert variant="light" color="blue"
                   title={selection?.result.decoded ? `${capitalize(type)} transcribed and subtitled` :
                       showMedia ? `${capitalize(type)} ready for transcription` : `${capitalize(type)} transcription in progress...`}
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
                            <Text className="value">{result.limited ? '60' : stats.duration} <span className="unit">secs</span></Text>
                            {result.limited && <Text c="teal" fz="sm" fw={500} className="diff">
                                <span>/ {stats.duration}s</span>
                            </Text>}
                        </Group>
                        <Text fz="xs" c="dimmed" mt={7}>
                            Transcribed duration {result.limited ? '(limited)' : ''}
                        </Text>
                    </Paper>
                    {result.decoded && <>
                        <Paper withBorder p="md" radius="md" key={stats.decodeTime} className="stat">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed" className="title">
                                    Processing Time
                                </Text>
                                <IconClockHour4 className="icon" size={22} stroke={1.5}/>
                            </Group>

                            <Group align="flex-end" gap="xs" mt={25}>
                                <Text className="value">{stats.decodeTime} <span className="unit">secs</span></Text>
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
                            <Text className="value"> <span className="unit">USD</span> {stats.estimatedCost}</Text>
                        </Group>

                        <Text fz="xs" c="dimmed" mt={7}>
                            Per OpenAI standard rate
                        </Text>
                    </Paper>
                </SimpleGrid>

            </div>}
            {showMedia &&
            <div className="player">
                <MediaPlayer ref={player}
                             title={result.decoded ? `Transcribed ${capitalize(type)}` : `Source ${capitalize(type)}`}
                             src={selection?.url} crossOrigin={true}
                             onStarted={onStarted}>
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
            }
        </Stack>
    </div>
}

export default Media