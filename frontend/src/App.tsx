import {Accordion, Alert, AppShell, Burger, MantineProvider} from '@mantine/core'
import {useDisclosure} from '@mantine/hooks'
import {IconDatabaseExport, IconInfoCircle, IconMessageChatbot} from '@tabler/icons-react'

import {useSession} from './hooks/fetch.ts'
import DataSource from './components/DataSource'

import './App.css'

const iconData = <IconDatabaseExport/>
const iconChat = <IconMessageChatbot/>

function App() {
    const [opened, {toggle}] = useDisclosure()
    const session = useSession()
    console.log(session)

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
                        <div>Son's CS App</div>
                    </AppShell.Header>

                    <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

                    <AppShell.Main>
                        <div className="main">
                            <Accordion multiple defaultValue={['datasource', 'conversation']}>
                                <Accordion.Item key="datasource" value="datasource">
                                    <Accordion.Control icon={iconData}>Data Source</Accordion.Control>
                                    <Accordion.Panel>
                                        <DataSource/>
                                    </Accordion.Panel>
                                </Accordion.Item>
                                <Accordion.Item key="conversation" value="conversation">
                                    <Accordion.Control icon={iconChat}>Conversation</Accordion.Control>
                                    <Accordion.Panel>
                                        <Alert variant="light" color="blue" title="Data selection required"
                                               icon={<IconInfoCircle/>}>
                                            Please select data to feed to this conversation
                                        </Alert>
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
