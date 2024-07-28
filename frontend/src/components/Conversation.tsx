import {ActionIcon, Alert, Stack, TextInput} from '@mantine/core'
import {IconInfoCircle, IconMessage, IconSend} from '@tabler/icons-react'
import {DataSelection} from '../models/selection.ts'
import {ChangeEvent, FormEvent, useState} from 'react'
import {Message} from '../models/conversation.ts'
import ChatMessage from './ChatMessage.tsx'
import './Conversation.css'

const iconInput = <IconMessage/>

let id = 0


function Conversation({selection}: { byDefault: boolean, selection: DataSelection | null }) {
    const [messages, setMessages] = useState<Message[]>([
        {id: ++id, role: 'ai', message: 'Hello, how can I help you?'}
    ])
    const [input, setInput] = useState<string>('')

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInput(e.currentTarget.value)
    }
    const handleSend = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMessages([...messages, {
            id: ++id,
            role: 'user',
            message: input
        }])
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
                <div className="messages">
                    {messages.map((message) => <ChatMessage key={message.id} message={message}/>)}
                </div>
                <form onSubmit={handleSend}>
                    <TextInput className='input'
                               leftSectionPointerEvents="none"
                               leftSection={iconInput}
                               rightSection={<ActionIcon variant="filled" aria-label="Send" type="submit">
                                   <IconSend style={{width: '70%', height: '70%'}} stroke={1.5}/>
                               </ActionIcon>}
                               placeholder="Ask anything about the data"
                               value={input} onChange={handleInputChange}
                    />
                </form>
            </Stack>
        }
    </div>
}

export default Conversation