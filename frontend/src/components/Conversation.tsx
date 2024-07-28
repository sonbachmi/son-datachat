import {ChangeEvent, FormEvent, useEffect, useRef, useState} from 'react'
import {ActionIcon, Alert, Stack, TextInput} from '@mantine/core'
import {IconInfoCircle, IconMessage, IconSend} from '@tabler/icons-react'

import {DataSelection} from '../models/selection.ts'
import {ChatResponse, Message} from '../models/conversation.ts'
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
    const inputRef = useRef<HTMLInputElement>(null)

    const lastMessageId = messages[messages.length - 1].id
    useEffect(() => {
        inputRef.current?.focus()
    }, [lastMessageId])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInput(e.currentTarget.value)
    }
    const handleSend = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setInput('')
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
            const data = await postData<ChatResponse>('/query', {
                query: input
            })
            // console.log(data)
            const message = messages[messages.length - 1]
            message.id = ++id
            message.message = data.answer
            message.type = data.html ? 'html' : 'text'
        } catch (error) {
            console.error(error)
        } finally {
            setFetching(false)
        }
    }
    return <div className="Conversation">
        {!selection ?
            <Alert variant="light" color="blue" title="Data selection required"
                   icon={<IconInfoCircle/>}>
                Please select data to feed to this conversation
            </Alert> :
            <Stack>
                <Alert variant="light" color="green" title="Data selection applied"
                       icon={<IconInfoCircle/>}>
                    You selected {selection?.head} rows from source <strong>{selection?.filename}</strong>. The
                    discussion is now limited to this set of data.
                </Alert>
                <div className="messages" key={lastMessageId}>
                    {messages.map((message) => <ChatMessage key={message.id} message={message}/>)}
                </div>
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