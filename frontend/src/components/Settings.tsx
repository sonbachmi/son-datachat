import {useState} from 'react'

import {rem, Select, Stack, Notification, Loader} from '@mantine/core'
import {IconAi, IconCheck, IconExclamationCircle} from '@tabler/icons-react'

import {postData} from '../hooks/fetch.ts'
import {ChatResponse} from '../models/conversation.ts'

import Logo from './Logo.tsx'

import './Settings.css'
import ErrorFallback from './ErrorFallback.tsx'
import {logError} from '../hooks/error.ts'
import {ErrorBoundary} from 'react-error-boundary'

const models = [
    {value: 'bamboo', label: 'BambooLLM'},
    {value: 'openai', label: 'OpenAI'}
]

const iconCheck = <IconCheck style={{width: rem(20), height: rem(20)}}/>;

function Settings() {
    const [model, setModel] = useState<string>('openai')
    const [modelChange, setModelChange] = useState<string | null>(null)
    const [fetching, setFetching] = useState<boolean>(false)
    const [error, setError] = useState<Error>(null)
    const handleModelChange = async (model: string | null): Promise<void> => {
        setError(null)
        if (!model) return
        setModel(model)
        try {
            setFetching(true)
            await postData('/model', null, {
                params: {model}
            })
            const item = models.find(m => m.value === model)
            setModelChange(item?.label)
            setTimeout(() => {
                setModelChange(null)
            }, 3000)
        } catch (error) {
            setError(error)
        } finally {
            setFetching(false)
        }
    }
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
            <Stack className="Settings" align="center">
                <div className="logo">
                    <Logo/>
                </div>
                <Select size="md"
                        label="Select model"
                        description="Use this LLM for conversation"
                        leftSection={<IconAi/>} checkIconPosition="left"
                        data={models} value={model} onChange={handleModelChange}/>
                {fetching && <Loader color="blue"/>}
                {/*{error && <ErrorFallback error={error} resetErrorBoundary={() => setError(null)}/>}*/}
                {error && <Notification icon={<IconExclamationCircle/>} withCloseButton={false}
                                        color="orange" mt="md">
                    There was a problem changing model: {error.message}</Notification>}
                {modelChange && <Notification icon={iconCheck} withCloseButton={false}
                                              color="teal" mt="md">
                    Model switched to <strong>{modelChange}</strong>. Conversation is now in a new context.
                </Notification>}
            </Stack>
        </ErrorBoundary>
    )
}

export default Settings