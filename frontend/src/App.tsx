import {useState} from 'react'
import {useDisclosure} from '@mantine/hooks'
import {Accordion, AppShell, Burger, MantineProvider, Stack} from '@mantine/core'
import {IconDatabaseExport, IconMessageChatbot} from '@tabler/icons-react'

import {useSession} from './hooks/fetch.ts'
import {DataSelection} from './models/selection.ts'
import DataSource from './components/DataSource'
import Conversation from './components/Conversation.tsx'

import './App.css'
import Settings from './components/Settings.tsx'

const iconData = <IconDatabaseExport/>
const iconChat = <IconMessageChatbot/>

function App() {
    const [opened, {toggle}] = useDisclosure()
    /*const session = */useSession()
    const [byDefault, setByDefault] = useState<boolean>(true)
    const [selection, setSelection] = useState<DataSelection | null>(null)

    return (
        <MantineProvider>
            <div className="App">
                <AppShell
                    header={{height: 60}}
                    navbar={{
                        width: 300,
                        breakpoint: 'sm',
                        collapsed: {mobile: !opened},
                    }}
                    padding="md"
                >
                    <AppShell.Header>
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <div>Son's Data Chat</div>
                    </AppShell.Header>

                    <AppShell.Navbar p="md" className="navbar">
                        <Settings/>
                    </AppShell.Navbar>

                    <AppShell.Main>
                        <div className="main">
                            <Accordion multiple defaultValue={['datasource', 'conversation']}>
                                <Accordion.Item key="datasource" value="datasource">
                                    <Accordion.Control icon={iconData}>Data Source</Accordion.Control>
                                    <Accordion.Panel>
                                        <DataSource byDefault={byDefault} clearByDefault={() => setByDefault(false)} setSelection={setSelection}/>
                                    </Accordion.Panel>
                                </Accordion.Item>
                                <Accordion.Item key="conversation" value="conversation">
                                    <Accordion.Control icon={iconChat}>Conversation</Accordion.Control>
                                    <Accordion.Panel>
                                        <Stack>
                                            <Conversation selection={selection}/>
                                        </Stack>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    </AppShell.Main>
                </AppShell>
            </div>
        </MantineProvider>
    )
}

export default App
