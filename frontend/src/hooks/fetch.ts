import {useEffect, useState} from 'react'

import {Session} from '../models/session.ts'

const apiUrl = 'http://localhost:8000'

let session: Session | null = null

export interface fetchOptions {
    params?: Record<string, string|number>
}

export function postData<T>(path: string, data: unknown | null, options?: fetchOptions): Promise<T> {
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
    }).then(response => {
        if (!response.ok) {
            if (response.status === 403)
                return Promise.reject(new Error('Invalid session'))
            return Promise.reject(new Error('Fetch error: ' + response.status))
        }
        return response.json()
    })
}

export function postFormData<T>(path: string, data: FormData, options?: fetchOptions): Promise<T> {
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
    }).then(response => {
        if (!response.ok) {
            if (response.status === 403)
                return Promise.reject(new Error('Invalid session'))
            return Promise.reject(new Error('Fetch error: ' + response.status))
        }
        return response.json()
    })
}

export function useFetch<T>(path: string, method = 'GET', data?: unknown) {
    const [value, setValue] = useState<T | null>(null)
    const url = new URL(apiUrl + path)
    if (session) {
        url.searchParams.append('token', session.token)
    }
    useEffect(() => {
        let ignore = false
        fetch(url.toString(), {
            method,
            headers: data ? {'Content-Type': 'application/json'} : undefined
        }).then(response => {
            if (!response.ok) {
                if (response.status === 403)
                    return Promise.reject(new Error('Invalid session'))
                return Promise.reject(new Error('Fetch error: ' + response.status))
            }
            return response.json()
        }).then(data => {
            if (!ignore) setValue(data)
        })
        return () => {
            ignore = true
        }
    }, [])
    return value
}

export function useSession() {
    session = useFetch<Session>('/session', 'POST')
    return session
}

