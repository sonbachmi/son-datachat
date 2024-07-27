import {useState} from 'react'

import {Alert, Button, Fieldset, FileInput, Group, NumberInput, rem, Select, Stack} from '@mantine/core'
import {IconFileCheck, IconFileTypeCsv, IconInfoCircle} from '@tabler/icons-react'

import './DataSource.css'

const icon = <IconFileTypeCsv style={{width: rem(28), height: rem(28)}} stroke={1.5}/>
const iconFile = <IconFileCheck/>

function DataSource() {
    const [files, setFiles] = useState<File[]>([])
    const verb = files.length ? 'Replace' : 'Upload'
    const onFilesChange = (files: File[]) => {
        console.log(files)
        setFiles(files)
    }

    const [index, setIndex] = useState<string | null>('0')
    const selectFiles = [
        {value: '0', label: 'test.csv'},
        {value: '1', label: 'test.xlsx'},
    ]
    const onIndexChange = (value: string | null) => {
        setIndex(value)
        setMax(100)
        setHead(100)
    }
    const [max, setMax] = useState<number>(100)
    const [head, setHead] = useState<string | number>('')
    const onHeadChange = (value: string | number) => {
        setHead(value)
    }

    return <div className="DataSource">

        <Group align="flex-start">
            <Fieldset legend="Data Input" className="fieldset">
                <FileInput multiple clearable
                           value={files} onChange={onFilesChange}
                           accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                           size="md" inputSize="lg"
                           leftSection={icon}
                           label={verb + ' one or more files'}
                           description="CSV or XLSX format only"
                           placeholder={verb + ' files'}/>
            </Fieldset>
            <Fieldset legend="Data Selector" className="fieldset">
                {!files.length ?
                    <Alert variant="light" color="blue" title="Data input required" icon={<IconInfoCircle/>}>
                        Please upload data for selection
                    </Alert>
                    : <Stack>
                        <Select size="md"
                                label="Select file"
                                description="Only feed data from this file"
                                leftSection={iconFile}
                                data={selectFiles} value={index} onChange={onIndexChange}/>

                        <NumberInput
                            label="Limit number of rows"
                            description={`From total ${max}`}
                            placeholder="Enter number"
                            value={head} min={1} max={max}
                            onChange={onHeadChange}
                            size="md"
                        />

                        <Button disabled={!head}>Select</Button>
                    </Stack>}
            </Fieldset>
        </Group>

    </div>
}

export default DataSource