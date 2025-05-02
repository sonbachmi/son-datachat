import {useState} from 'react'
import {Accordion} from '@mantine/core'
import {IconDatabaseExport, IconMessageChatbot} from '@tabler/icons-react'
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
const iconChat = <IconMessageChatbot/>


function Main() {
    /*const session = */
    useSession()
    const [selection, setSelection] = useState<DataSelection | null>(null)
    const [transcribe, setTranscribe] = useState(true)

    return (
        <div className="Main">
            <Accordion multiple defaultValue={['datasource', 'conversation', 'media']}>
                <Accordion.Item key="datasource" value="datasource">
                    <Accordion.Control icon={iconData}>Data Source</Accordion.Control>
                    <Accordion.Panel>
                        <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
                            <DataSource setSelection={setSelection}/>
                        </ErrorBoundary>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item key="conversation" value="conversation">
                    <Accordion.Control icon={iconChat}>Conversation</Accordion.Control>
                    <Accordion.Panel>
                        <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
                            <Conversation selection={selection}/>
                        </ErrorBoundary>
                    </Accordion.Panel>
                </Accordion.Item>
                {transcribe && (
                    <Accordion.Item key="media" value="media">
                        <Accordion.Control icon={iconChat}>Media</Accordion.Control>
                        <Accordion.Panel>
                            <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
                                <Media path={''}/>
                            </ErrorBoundary>
                        </Accordion.Panel>
                    </Accordion.Item>
                )}
            </Accordion>

        </div>
    )
}

export default Main
