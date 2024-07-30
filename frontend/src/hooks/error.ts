// Global function to log error provided by react-error-boundary
export function logError(error: Error, info: { componentStack: string }) {
    console.log(error, info.componentStack)
}