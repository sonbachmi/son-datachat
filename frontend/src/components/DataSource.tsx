import {FC, useState} from 'react'

import {Alert, Button, Fieldset, FileInput, Group, NumberInput, rem, Select, Stack} from '@mantine/core'
import {IconFileCheck, IconFileTypeCsv, IconInfoCircle} from '@tabler/icons-react'

import './DataSource.css'
import {postData} from '../hooks/fetch.ts'
import {DataSelection} from '../models/selection.ts'

const icon = <IconFileTypeCsv style={{width: rem(28), height: rem(28)}} stroke={1.5}/>
const iconFile = <IconFileCheck/>

interface UploadedFile {
    value: string
    label: string
    rows: number
}

interface Props {
    byDefault: boolean,
    clearByDefault: () => void,
    setSelection: (selection: DataSelection | null) => void;
}

const DataSource: FC<Props> = ({clearByDefault, setSelection}) => {
    const [files, setFiles] = useState<File[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const verb = files.length && uploadedFiles.length ? 'Replace' : 'Upload'
    const onFilesChange = (files: File[]) => {
        // console.log(files)
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
        setDirty(false)
        clearByDefault()
        setSelection({
            filename: f.label,
            head: f.rows
        })
    }
    const upload = async () => {
        const formData = new FormData()
        for (const file of files) {
            formData.append('files', file)
        }
        try {
            const data = await postData<{ rows: number[] }>('/data/input', formData, {
                useFormData: true
            })
            if (data.rows.length !== files.length)
                return Promise.reject(new Error('Upload files out of sync'))
            const upFiles = files.map(((file, index) => {
                return {
                    value: index.toString(),
                    label: file.name,
                    rows: data.rows[index]
                }
            }))
            selectFile(0, upFiles)
            setUploadedFiles(upFiles)
        } catch (error) {
            console.error(error)
        }

    }

    const [dirty, setDirty] = useState<boolean>(false)
    const [index, setIndex] = useState<string | null>('0')
    const onIndexChange = (value: string | null) => {
        if (value != null) {
            selectFile(+value, uploadedFiles)
            setDirty(true)
        }
    }
    const [max, setMax] = useState<number>(100)
    const [head, setHead] = useState<string | number>('')
    const onHeadChange = (value: string | number) => {
        setHead(value)
        setDirty(true)
    }
    const applySelection = async () => {
        if (index == null) return
        setDirty(false)
        const f = uploadedFiles[+index]
        setSelection({
            filename: f.label,
            head: +head
        })
        try {
            const data = await postData('/data/select', null, {
                params: {
                    index: index,
                    head: head
                }
            })
            console.log(data)
        } catch (error) {
            console.error(error)
        }
    }

    return <div className="DataSource">

        <Group align="flex-start">
            <Fieldset legend="Data Input" className="fieldset">
                <Stack>
                    <FileInput multiple clearable
                               value={files} onChange={onFilesChange}
                               accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                               size="md" inputSize="lg"
                               leftSection={icon}
                               label={verb + ' one or more files'}
                               description="CSV or XLSX format only"
                               placeholder="Choose files"/>

                    <Button disabled={!files.length} onClick={upload}>{verb}</Button>
                </Stack>
            </Fieldset>
            <Fieldset legend="Data Selector" className="fieldset">
                {!uploadedFiles.length ?
                    <Alert variant="light" color="blue" title="Data input required" icon={<IconInfoCircle/>}>
                        Please upload data for selection
                    </Alert>
                    : <Stack>
                        <Select size="md"
                                label="Select file"
                                description="Only feed data from this file"
                                leftSection={iconFile}
                                data={uploadedFiles} value={index} onChange={onIndexChange}/>

                        <NumberInput
                            label="Limit number of rows"
                            description={`From total ${max}`}
                            placeholder="Enter number"
                            value={head} min={1} max={max}
                            onChange={onHeadChange}
                            size="md"
                        />

                        <Button disabled={!dirty} onClick={applySelection}>Apply Selection</Button>
                    </Stack>}
            </Fieldset>
        </Group>

    </div>
}

export default DataSource