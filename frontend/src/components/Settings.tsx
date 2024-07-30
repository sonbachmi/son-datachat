import {useState} from 'react'

import {rem, Select, Stack, Notification} from '@mantine/core'
import {IconAi, IconCheck} from '@tabler/icons-react'

import {postData} from '../hooks/fetch.ts'
import {ChatResponse} from '../models/conversation.ts'

import Logo from './Logo.tsx'

import './Settings.css'

const models = [
    {value: 'bamboo', label: 'BambooLLM'},
    {value: 'openai', label: 'OpenAI'}
]

const iconCheck = <IconCheck style={{width: rem(20), height: rem(20)}}/>;

function Settings() {
    const [model, setModel] = useState<string>('openai')
    const [modelChange, setModelChange] = useState<string | null>(null)
    const handleModelChange = async (model: string | null): Promise<void> => {
        if (!model) return
        setModel(model)
        try {
            await postData<ChatResponse>('/model', null, {
                params: {model}
            })
            const item = models.find(m => m.value === model)
            setModelChange(item?.label)
            setTimeout(() => {
                setModelChange(null)
            }, 2000)
        } catch (error) {
            console.error(error)
        }
    }
    return (<Stack className="Settings" align="center">
            <div className="logo">
                <Logo/>
            </div>
            <Select size="md"
                    label="Select model"
                    description="Use this LLM for conversation"
                    leftSection={<IconAi/>} checkIconPosition="left"
                    data={models} value={model} onChange={handleModelChange}/>
            {modelChange && <Notification icon={iconCheck} withCloseButton={false}
                                          color="teal" mt="md">
                Model switched to <strong>{modelChange}</strong>. Conversation is now in a new context.
            </Notification>}

        </Stack>
    )
}

export default Settings