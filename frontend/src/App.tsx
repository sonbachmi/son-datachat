import {useDisclosure} from '@mantine/hooks'
import {Alert, AppShell, Burger, MantineProvider} from '@mantine/core'
import {IconInfoCircle} from '@tabler/icons-react'
import {ErrorBoundary} from 'react-error-boundary'

import Header from './components/Header.tsx'
import Settings from './components/Settings.tsx'
import Main from './components/Main.tsx'

import './App.css'
import {logError} from './hooks/error.ts'
import ErrorFallback from './components/ErrorFallback.tsx'

function App() {
    const [opened, {toggle}] = useDisclosure()

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
                    padding="md">
                    <AppShell.Header>
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <Header/>
                    </AppShell.Header>

                    <AppShell.Navbar p="md" className="navbar">
                        <Settings/>
                    </AppShell.Navbar>

                    <AppShell.Main className="main">
                        <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}
                                       onReset={(details) => {
                                           // Reset the state of your app so the error doesn't happen again
                                       }}>
                            <Main/>
                        </ErrorBoundary>
                    </AppShell.Main>
                </AppShell>

            </div>
        </MantineProvider>
    )
}

export default App
