import {ChangeEvent, FC, FormEvent, useState} from 'react'

import {
    Alert,
    Button,
    Fieldset,
    FileInput,
    Loader,
    Notification,
    NumberInput,
    rem,
    Select,
    Stack,
    Textarea
} from '@mantine/core'
import {
    IconBadgeCc,
    IconClockMinus, IconDownload,
    IconExclamationCircle,
    IconFileCheck,
    IconFiles,
    IconInfoCircle,
    IconMessageDown,
    IconMessageLanguage,
    IconSettingsBolt
} from '@tabler/icons-react'

import {postFormData, useFetch} from '../hooks/fetch.ts'
import {DataSelection} from '../models/selection.ts'
import {TranscribeResult} from '../models/asr.ts'

import './DataSource.css'
import {capitalize} from '../hooks/utils.ts'

const icon = <IconFiles style={{width: rem(28), height: rem(28)}} stroke={1.5}/>
const iconFile = <IconFileCheck/>
const iconPerformance = <IconSettingsBolt/>
const iconLimit = <IconClockMinus/>
const iconTranslation = <IconMessageLanguage/>
const iconDescription = <IconMessageDown/>

interface UploadedFile {
    value: string
    label: string
    rows?: number
    url?: string
    result?: TranscribeResult
    tokens?: number
}

interface Props {
    selection: DataSelection | null
    setSelection: (selection: DataSelection | null) => void;
    isMedia: boolean
    setIsMedia: (is: boolean) => void;
    setShowMedia: (shown: boolean) => void;
}

const DataSource: FC<Props> = ({selection, setSelection, isMedia, setIsMedia, setShowMedia}) => {
    const [files, setFiles] = useState<File[]>([])
    const [mediaType, setMediaType] = useState('video')
    const [language, setLanguage] = useState('en')
    const [duration, setDuration] = useState<number | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const verb = files.length && uploadedFiles.length ? 'Replace' : 'Upload'
    const onFilesChange = (files: File[]) => {
        setIsMedia(files.some(f => !/csv|xlsx?/i.test(f.name)))
        setShowMedia(false)
        setFiles(files)
        setUploadedFiles([])
        setSelection(null)
    }
    const selectFile = (index: number, uploadedFiles: UploadedFile[]) => {
        if (!uploadedFiles.length) return
        const f = uploadedFiles[index]
        setIndex(index.toString())
        setMax(f.rows)
        setHead(f.rows)
        setSelection({
            filename: f.label,
            head: f.rows,
            committed: false,
            media: false
        })
    }
    const [fetching, setFetching] = useState<boolean>(false)
    const [error, setError] = useState<Error>(null)
    // const {showBoundary} = useErrorBoundary()

    const upload = async () => {
        setError(null)
        const formData = new FormData()
        for (const file of files) {
            formData.append('files', file)
        }
        setFetching(true)
        try {
            const data = await postFormData('/data/input', formData)
            const isMedia = !!data.result
            if (isMedia) {
                console.log(data)
                setIsMedia(true)
                setMediaType(data.type)
                setLanguage(data.result.lang)
                setDuration(data.result.duration)
                setDirty(true)
                setShowMedia(true)
            }
            if (!isMedia && data.rows.length !== files.length)
                return Promise.reject(new Error('Upload files out of sync'))
            const upFiles = files.map(((file, index) => {
                return isMedia ? {
                    value: index.toString(),
                    label: file.name,
                    url: data.url,
                    result: data.result
                } : {
                    value: index.toString(),
                    label: file.name,
                    rows: data.rows[index]
                }
            }))
            selectFile(0, upFiles)
            setUploadedFiles(upFiles)

            if (isMedia) {
                const f = upFiles[0]
                setSelection({
                    filename: f.label,
                    type: data.type,
                    url: f.url,
                    result: f.result,
                    media: true
                })
            }
        } catch
            (error) {
            setError(error)
            // showBoundary(error)
        } finally {
            setFetching(false)
        }
    }

    const [dirty, setDirty] = useState<boolean>(true)
    const [index, setIndex] = useState<string | null>('0')
    const onIndexChange = (value: string | null) => {
        if (value != null) {
            selectFile(+value, uploadedFiles)
            setDirty(true)
        }
    }
    const [max, setMax] = useState<number>(100)
    const [head, setHead] = useState<string | number>('')
    const [, fetchingSelect, errorSelect, doFetch] = useFetch('/data/select', {})

    const onHeadChange = (value: string | number) => {
        setHead(value)
        setDirty(true)
    }

    const applySelection = async (e: FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (index == null) return
        const f = uploadedFiles[0]
        doFetch({
            params: {
                index: index,
                head: head
            }
        }).then(() => {
            const f = uploadedFiles[+index]
            setSelection({
                filename: f.label,
                head: +head,
                committed: true,
                media: false
            })
            setDirty(!!errorSelect)
        })
    }

    const performanceLevels = [
        'Fastest', 'Fast', 'Balanced', 'Accurate'
    ]
    const [level, setLevel] = useState<string | null>('Fast')
    const onLevelChange = (value: string | null) => {
        if (value != null) {
            setDirty(true)
            setLevel(value)
        }
    }

    const durationLimits = [
        'Transcribe full duration', 'Transcribe only first 1 minute'
    ]
    const [limit, setLimit] = useState<string | null>(durationLimits[duration >= 61 ? 1 : 0])
    const onLimitChange = (value: string | null) => {
        if (value != null) {
            setDirty(true)
            setLimit(value)
        }
    }
    const translationOptions = [
        'Transcribe original language', 'Auto translate to English'
    ]
    const [translation, setTranslation] = useState<string | null>(translationOptions[0])
    const onTranslationChange = (value: string | null) => {
        if (value != null) {
            setDirty(true)
            setTranslation(value)
        }
    }
    const [description, setDescription] = useState('')
    const onDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value)
        setDirty(true)
    }

    const [, fetchingTranscribe, errorTranscribe, doFetchTranscribe] = useFetch('/transcribe')
    const transcribe = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setShowMedia(false)
        doFetchTranscribe({
            body: {
                performance: level.toLowerCase(),
                limit: durationLimits.indexOf(limit) === 0 ? 'full' : 'head',
                task: translationOptions.indexOf(translation) === 0 ? 'transcribe' : 'translate',
                prompt: description
            }
        }).then((data) => {
            console.log(data)
            setSelection({
                ...selection, ...{result: data.result}
            })
            setShowMedia(true)
            setDirty(!!errorTranscribe)
        })
    }


    return (
        <div className="DataSource">
            <Fieldset legend="Data Input" className="fieldset">
                <Stack>
                    <FileInput multiple clearable
                               value={files} onChange={onFilesChange}
                               accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,audio/wav,audio/mpeg,video/mpeg,video/mp4"
                               size="md" inputSize="lg"
                               leftSection={icon}
                               label={verb + ' one or more files'}
                               description="Datasheet (CSV, XLSX) or media (WAV, MP3, MP4, MPEG, WEBM), max 50MB"
                               placeholder="Choose files"/>
                    <Button disabled={!files.length} onClick={upload}>{verb}</Button>
                    {fetching && <Loader color="blue"/>}
                    {error && <Notification icon={<IconExclamationCircle/>} withCloseButton={false}
                                            color="orange" mt="md">
                        There was a problem uploading files: {error.message} <br/>{error.stack}</Notification>}
                </Stack>
            </Fieldset>
            {isMedia ?
                <Fieldset legend="Media Detection" className="fieldset">
                    {!uploadedFiles.length ?
                        <Alert variant="light" color="orange" title="Media file detected" icon={<IconInfoCircle/>}>
                            Please upload media for transcription
                        </Alert>
                        : <>
                            <Alert variant="light" color="blue" title={capitalize(mediaType) + ' detected'}
                                   icon={<IconInfoCircle/>}>
                                Configure your preferences before transcribing {mediaType}
                            </Alert>
                            <div className="media-prefs">
                                <form onSubmit={transcribe}>
                                    <Stack>
                                        <Select size="md"
                                                label="Performance"
                                                description="Set your priority between speed and accuracy"
                                                leftSection={iconPerformance} checkIconPosition="left"
                                                data={performanceLevels} value={level} onChange={onLevelChange}/>
                                        {duration >= 61 &&
                                            <Select size="md"
                                                    label="Coverage"
                                                    description="Limit duration to transcribe"
                                                    leftSection={iconLimit} checkIconPosition="left"
                                                    data={durationLimits} value={limit} onChange={onLimitChange}/>}
                                        {language !== 'en' && <Select size="md"
                                                                      label="Translation"
                                                                      description="Detected language not English, whether to translate"
                                                                      leftSection={iconTranslation}
                                                                      checkIconPosition="left"
                                                                      data={translationOptions} value={translation}
                                                                      onChange={onTranslationChange}/>}

                                        <Textarea
                                            label="Description"
                                            placeholder="Enter optional keywords, correct spellings, describe context for more accurate transcription"
                                            minRows={3}
                                            mt="md"
                                            radius="md"
                                            className=""
                                            value={description}
                                            onChange={onDescriptionChange}
                                        />
                                        <Button type="submit" disabled={!dirty} leftSection={<IconBadgeCc />}>Transcribe</Button>

                                        {fetchingTranscribe && <Loader color="blue"/>}
                                        {errorTranscribe &&
                                            <Notification icon={<IconExclamationCircle/>} withCloseButton={false}
                                                          color="orange" mt="md">
                                                There was a problem submitting
                                                request: {errorTranscribe.message}</Notification>}
                                    </Stack>
                                </form>
                            </div>
                        </>}

                </Fieldset> :
                <Fieldset legend="Data Selector" className="fieldset">
                    {!uploadedFiles.length ?
                        <Alert variant="light" color="orange" title="Data input required" icon={<IconInfoCircle/>}>
                            Please upload file for analysis
                        </Alert>
                        : <form onSubmit={applySelection}>
                            <Stack>
                                <Select size="md"
                                        label="Select file"
                                        description="Only feed data from this file"
                                        leftSection={iconFile} checkIconPosition="left"
                                        data={uploadedFiles} value={index} onChange={onIndexChange}/>
                                {!uploadedFiles[0].result &&
                                    <NumberInput
                                        label="Limit number of rows"
                                        description={`From total ${max}`}
                                        placeholder="Enter number"
                                        value={head} min={1} max={max}
                                        onChange={onHeadChange}
                                        size="md"
                                    />
                                }

                                <Button type="submit" disabled={!dirty}>Apply Selection</Button>

                                {fetchingSelect && <Loader color="blue"/>}
                                {errorSelect && <Notification icon={<IconExclamationCircle/>} withCloseButton={false}
                                                              color="orange" mt="md">
                                    There was a problem submitting selection: {errorSelect.message}</Notification>}
                            </Stack>
                        </form>}
                </Fieldset>
            }
        </div>
    )
}

export default DataSource