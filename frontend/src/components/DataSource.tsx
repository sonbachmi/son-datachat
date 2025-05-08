import {FC, FormEvent, useState} from 'react'

import {Alert, Button, Fieldset, FileInput, Loader, Notification, NumberInput, rem, Select, Stack} from '@mantine/core'
import {IconExclamationCircle, IconFileCheck, IconFiles, IconInfoCircle} from '@tabler/icons-react'

import {postFormData, useFetch} from '../hooks/fetch.ts'
import {DataSelection} from '../models/selection.ts'
import {TranscribeResult} from '../models/whisper.ts'

import './DataSource.css'

const icon = <IconFiles style={{width: rem(28), height: rem(28)}} stroke={1.5}/>
const iconFile = <IconFileCheck/>

interface UploadedFile {
    value: string
    label: string
    rows?: number
    url?: string
    result?: TranscribeResult
    tokens?: number
}

interface Props {
    setSelection: (selection: DataSelection | null) => void;
}

const DataSource: FC<Props> = ({setSelection}) => {
    const [files, setFiles] = useState<File[]>([])
    const [isMedia, setIsMedia] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const verb = files.length && uploadedFiles.length ? 'Replace' : 'Upload'
    const onFilesChange = (files: File[]) => {
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
                <Fieldset legend="Data Detection" className="fieldset">
                    <Alert variant="light" color="blue" title="Media detected" icon={<IconInfoCircle/>}>
                        Configure your preferences before transcribing media
                    </Alert>
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