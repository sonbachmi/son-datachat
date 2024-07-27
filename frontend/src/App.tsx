import {AppShell, Burger, MantineProvider} from '@mantine/core'
import {useDisclosure} from '@mantine/hooks'

import './App.css'

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

                    <AppShell.Main>Main</AppShell.Main>
                </AppShell>
            </div>
        </MantineProvider>
    )
}

export default App
