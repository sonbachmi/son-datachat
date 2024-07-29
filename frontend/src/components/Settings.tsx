import {useState} from 'react'

import {Select, Stack} from '@mantine/core'
import {IconAi} from '@tabler/icons-react'
import {postData} from '../hooks/fetch.ts'
import {ChatResponse} from '../models/conversation.ts'

import './Settings.css'

const models = [
    {value: 'bamboo', label: 'Bamboo'},
    {value: 'openai', label: 'OpenAI'}
]

function Settings() {
    const [model, setModel] = useState<string>('openai')
    const handleModelChange = async (model: string | null): Promise<void> => {
        if (!model) return
        setModel(model)
        try {
            await postData<ChatResponse>('/model', null, {
                params: {model}
            })
        } catch (error) {
            console.error(error)
        }
    }
    return (<Stack className="Settings">
            <Select size="md"
                    label="Use model"
                    description="Select LLM for conversation"
                    leftSection={<IconAi/>} checkIconPosition="left"
                    data={models} value={model} onChange={handleModelChange}/>
        </Stack>
    )
}

export default Settings