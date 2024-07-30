import {Alert} from '@mantine/core'
import {IconInfoCircle} from '@tabler/icons-react'

function ErrorFallback({error, resetErrorBoundary}) {
    return (
        <div role="alert" className="ErrorFallback">
            <Alert variant="light" color="orange" title="Oops!"
                   icon={<IconInfoCircle/>}
                   withCloseButton={true} onClose={resetErrorBoundary}>
                There is a problem: {error.message}
            </Alert>
        </div>
    )
}
export default ErrorFallback