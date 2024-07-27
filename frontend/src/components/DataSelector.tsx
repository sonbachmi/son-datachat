import {useDisclosure} from '@mantine/hooks'

import {Button, Collapse, Container, Fieldset} from '@mantine/core'
import {IconChevronDown, IconChevronUp} from '@tabler/icons-react'

const iconUp = <IconChevronUp size={20}/>
const iconDown = <IconChevronDown size={20}/>

function DataSelector() {
    const [opened, {toggle}] = useDisclosure(true)

    return <Container fluid className="DataSource">
        <Button fullWidth
                variant="transparent"
                leftSection={opened ? iconUp : iconDown}
                onClick={toggle}>Data Selector</Button>
        <Collapse in={opened} transitionDuration={700} transitionTimingFunction="ease">
            <Fieldset legend="Select File">
            </Fieldset>
        </Collapse>

    </Container>
}

export default DataSelector