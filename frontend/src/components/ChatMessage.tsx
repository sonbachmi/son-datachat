import {Message} from '../models/conversation.ts'
import {Avatar, Group} from '@mantine/core'
import {IconMoodEmptyFilled, IconRobotFace} from '@tabler/icons-react'

import './ChatMessage.css'
import iagFetching from '@/assets/typing.gif'

function ChatMessage({message}: { message: Message }) {
    const isUser = message.role === 'user'
    return <div className={`ChatMessage ${message.role}`}>
        <Group justify={isUser ? 'flex-end' : 'flex-start'}>
            {isUser ?
                <Avatar color="pink" radius="md" className="avatar">
                    <IconMoodEmptyFilled size="1.7rem"/>
                </Avatar> :
                <Avatar color="orange" radius="md" className="avatar">
                    <IconRobotFace size="1.7rem"/>
                </Avatar>
            }
            <div className="text">
                {message.type === 'fetching' ? <img className="fetching" src={iagFetching} alt="Loading..."/> :
                    message.type === 'html' ? <div dangerouslySetInnerHTML={{__html: message.message}}/>
                    : message.message.toString()}
            </div>
        </Group>
    </div>
}

export default ChatMessage