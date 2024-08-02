import {useCallback, useEffect, useState} from 'react'
import {useErrorBoundary} from 'react-error-boundary'

import {Session} from '../models/session.ts'

const apiUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'

let session: Session | null = null

export interface FetchOptions {
    params?: {
        [name: string]: string | number
    }
}

// interface ApiErrorResponse {
//     detail: string
// }

function handleError(error: Error) {
    // console.error(error)
    return Promise.reject(error instanceof TypeError ? new TypeError('Cannot connect to server') : error)
}

function jsonOrError(response: Response) {
    if (!response.ok) {
        if (response.status === 403)
            return Promise.reject(new Error('Invalid session'))
    }
    return response.json()
        .then((json) => {
            if (!response.ok && 'detail' in json) {
                const detail = (typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail))
                return Promise.reject(new Error('API error: ' + detail))
            }
            return json
        })
}

export function postData(path: string, data?: object | null, options?: FetchOptions) {
    const url = new URL(apiUrl + path)
    if (options?.params) {
        Object.entries(options.params).forEach(([name, value]) => {
            url.searchParams.append(name, value.toString())
        })
    }
    if (session) {
        url.searchParams.append('token', session.token)
    }
    const headers = {
        'Content-Type': 'application/json',
    }
    return fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    }).then(jsonOrError)
        .catch(handleError)
}

export function postFormData(path: string, data: FormData, options?: FetchOptions) {
    const url = new URL(apiUrl + path)
    if (options?.params) {
        Object.entries(options.params).forEach(([name, value]) => {
            url.searchParams.append(name, value.toString())
        })
    }
    if (session) {
        url.searchParams.append('token', session.token)
    }
    return fetch(url.toString(), {
        method: 'POST',
        body: data
    }).then(jsonOrError).catch(handleError)
}

export function useFetch(path: string, data?: object | FormData, options?: FetchOptions) {
    const [value, setValue] = useState(null)
    const [fetching, setFetching] = useState<boolean>(false)
    const [error, setError] = useState<Error>(null)
    // const {showBoundary} = useErrorBoundary()

    const doFetch = useCallback((_options: FetchOptions = options) => {
        const url = new URL(apiUrl + path)
        if (session) {
            url.searchParams.append('token', session.token)
        }
        if (_options?.params) {
            Object.entries(_options.params).forEach(([name, value]) => {
                url.searchParams.append(name, value.toString())
            })
        }
        setError(null)
        setFetching(true)
        return fetch(url.toString(), data == null ?
            {method: 'GET'}
            : {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: data instanceof FormData ? data : JSON.stringify(data)
            }).then(jsonOrError).then(json => {
            setValue(json)
            return json
        }).catch(error => {
            // showBoundary(
            //     error instanceof TypeError ? new TypeError('Cannot connect to server') : error)
            setError(error instanceof TypeError ? new TypeError('Cannot connect to server') : error)
        })
            .finally(() => setFetching(false))
    }, [path, data, options])
    return [value, fetching, error, doFetch]
}

export function useSession() {
    const [_session, setSession] = useState<Session>(null)
    const {showBoundary} = useErrorBoundary()
    useEffect(() => {
        if (!session)
            fetch(apiUrl + '/session', {method: 'POST'})
                .then(jsonOrError)
                .then(json => {
                    setSession(json)
                    session = json
                }).catch(error => showBoundary(
                error instanceof TypeError ? new TypeError('Cannot connect to server') : error))
    }, [showBoundary])
    return _session
}

