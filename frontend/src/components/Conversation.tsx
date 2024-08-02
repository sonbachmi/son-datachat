import {ChangeEvent, FormEvent, useEffect, useRef, useState} from 'react'
import {ActionIcon, Alert, Stack, TextInput} from '@mantine/core'
import {IconAlertCircle, IconInfoCircle, IconMessage, IconSend} from '@tabler/icons-react'

import {DataSelection} from '../models/selection.ts'
import {Message} from '../models/conversation.ts'
import {postData} from '../hooks/fetch.ts'

import ChatMessage from './ChatMessage.tsx'

import './Conversation.css'

const iconInput = <IconMessage/>

let id = 0

const messages: Message[] = [
    {id: ++id, role: 'ai', message: 'Hello, how can I help you?'}
]

function Conversation({selection}: { selection: DataSelection | null }) {
    const [input, setInput] = useState<string>('')
    const [fetching, setFetching] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const lastMessageId = messages[messages.length - 1].id
    useEffect(() => {
        inputRef.current?.focus()
    }, [lastMessageId, selection?.committed])

    const handleMessageClick = (id: number) => {
        const message = messages.find(message => message.id === id)
        if (message) {
            setInput(message.message)
            inputRef.current.focus()
            inputRef.current.scrollIntoView({
                behavior: 'smooth'
            })
        }
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError(false)
        setInput(e.currentTarget.value)
    }
    const clearIndicator = () => {
        messages.splice(-1)
    }
    const handleSend = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setInput('')
        setError(false)
        messages.push({
                id: ++id,
                role: 'user',
                message: input
            },
            {
                id: Date.now(),
                role: 'ai',
                type: 'fetching',
                message: ''
            })
        setFetching(true)
        try {
            const data = await postData('/query', {
                query: input
            })
            // console.log(data)
            const message = messages[messages.length - 1]
            message.id = ++id
            message.message = data.answer
            message.type = data.html ? 'html' : 'text'
        } catch (error) {
            console.error(error)
            setError(true)
            clearIndicator()
        } finally {
            setFetching(false)
        }
    }
    return <div className="Conversation">
        {!selection?.committed ?
            <Alert variant="light" color="orange" title="Data selection required"
                   icon={<IconInfoCircle/>}>
                Please complete selecting data to feed to this conversation.
            </Alert> :
            <Stack>
                <Alert variant="light" color="blue" title="Data selection applied"
                       icon={<IconInfoCircle/>}>
                    You selected {selection?.head} rows from source <strong>{selection?.filename}</strong>. The
                    discussion is now limited to this set of data.
                </Alert>
                <div className="messages" key={lastMessageId}>
                    {messages.map((message) =>
                        <ChatMessage key={message.id} message={message} onMessageClick={handleMessageClick}/>)
                    }
                </div>
                {error && <Alert variant="light" color="orange" title="Query error"
                                 icon={<IconAlertCircle/>}>
                    Oops! There was an error processing your query. Please check again, retry or rephrase.
                </Alert>}
                <form onSubmit={handleSend}>
                    <TextInput className='input' ref={inputRef}
                               leftSectionPointerEvents="none"
                               leftSection={iconInput}
                               rightSection={<ActionIcon variant="filled" aria-label="Send"
                                                         type="submit" disabled={fetching}>
                                   <IconSend style={{width: '70%', height: '70%'}} stroke={1.5}/>
                               </ActionIcon>}
                               placeholder="Ask anything about the data"
                               value={input} onChange={handleInputChange}
                               disabled={fetching}
                    />
                </form>
            </Stack>
        }
    </div>
}

export default Conversation