import {Message} from '../models/conversation.ts'
import {Avatar, Group} from '@mantine/core'
import {IconMoodEmpty, IconRobotFace} from '@tabler/icons-react'

import './ChatMessage.css'
import imgFetching from '@/assets/typing.gif'

const iconUser = <IconMoodEmpty size="1.7rem"/>
const iconAi = <IconRobotFace size="1.7rem"/>

function ChatMessage({message, onMessageClick}: { message: Message, onMessageClick: (id: number) => void }) {
    const isUser = message.role === 'user'
    const handleClick = () => {
        if (isUser)
            onMessageClick(message.id)
    }
    return (
        <div className={`ChatMessage ${message.role}`}>
            <Group justify={isUser ? 'flex-end' : 'flex-start'}>
                {isUser ?
                    <Avatar color="pink" radius="md" className="avatar">
                        {iconUser}
                    </Avatar> :
                    <Avatar color="orange" radius="md" className="avatar">
                        {iconAi}
                    </Avatar>
                }
                <div className="text" onClick={handleClick} title={isUser ? 'Ask again' : null}>
                    {message.type === 'fetching' ? <img className="fetching" src={imgFetching} alt="Loading..."/> :
                        message.type === 'html' ? <div dangerouslySetInnerHTML={{__html: message.message}}/>
                            : message.message.toString()}
                </div>
            </Group>
        </div>)
}

export default ChatMessage