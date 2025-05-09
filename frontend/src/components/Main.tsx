import {useState} from 'react'
import {Accordion} from '@mantine/core'
import {IconDatabaseExport, IconPlayerPlayFilled, IconMessageChatbot} from '@tabler/icons-react'
import {ErrorBoundary} from 'react-error-boundary'

import {useSession} from '../hooks/fetch.ts'
import {logError} from '../hooks/error.ts'
import {DataSelection} from '../models/selection.ts'

import DataSource from './DataSource'
import Conversation from './Conversation.tsx'
import ErrorFallback from './ErrorFallback.tsx'

import './Main.css'
import Media from './Media.tsx'

const iconData = <IconDatabaseExport/>
const iconMedia = <IconPlayerPlayFilled/>
const iconChat = <IconMessageChatbot/>


function Main() {
    /*const session = */
    useSession()
    const [showMedia, setShowMedia] = useState(false)
    const [isMedia, setIsMedia] = useState(false)
    const [selection, setSelection] = useState<DataSelection | null>(null)

    return (
        <div className="Main">
            <Accordion multiple defaultValue={['datasource', 'conversation', 'media']}>
                <Accordion.Item key="datasource" value="datasource">
                    <Accordion.Control icon={iconData}>Data Source</Accordion.Control>
                    <Accordion.Panel>
                        <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
                            <DataSource selection={selection} setSelection={setSelection}
                                        isMedia={isMedia} setIsMedia={setIsMedia} setShowMedia={setShowMedia}/>
                        </ErrorBoundary>
                    </Accordion.Panel>
                </Accordion.Item>
                {!isMedia &&
                    <Accordion.Item key="conversation" value="conversation">
                        <Accordion.Control icon={iconChat}>Conversation</Accordion.Control>
                        <Accordion.Panel>
                            <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
                                <Conversation selection={selection}/>
                            </ErrorBoundary>
                        </Accordion.Panel>
                    </Accordion.Item>
                }
                {isMedia && selection?.media && (
                    <Accordion.Item key="media" value="media">
                        <Accordion.Control icon={iconMedia}>
                            Media {!selection?.result.decoded ? 'Preview' : 'Transcription Result'}
                        </Accordion.Control>
                        <Accordion.Panel>
                            <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
                                <Media selection={selection} showMedia={showMedia}/>
                            </ErrorBoundary>
                        </Accordion.Panel>
                    </Accordion.Item>
                )}
            </Accordion>

        </div>
    )
}

export default Main
