import {Message} from '../models/conversation.ts'
import {Avatar, Group} from '@mantine/core'
import {IconMoodEmptyFilled, IconRobotFace} from '@tabler/icons-react'

import './ChatMessage.css'

function ChatMessage({message}: { message: Message }) {
    return <div className="ChatMessage">
        <Group>
            {message.role === 'user' ?
                <Avatar color="blue" radius="sm">
                    <IconMoodEmptyFilled size="1.5rem"/>
                </Avatar> :
                <Avatar color="pink" radius="sm">
                    <IconRobotFace size="1.5rem"/>
                </Avatar>
            }
                <div className="text">
                    {message.message}
                </div>
        </Group>
    </div>
}

export default ChatMessage