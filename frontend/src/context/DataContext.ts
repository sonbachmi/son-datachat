import {createContext} from 'react'

export interface DataState {
    byDefault: boolean,
    clearByDefault?: () => void
}

const defaultDataState: DataState = {
    byDefault: true,
}

export const DataContext = createContext<DataState>(defaultDataState)

export const DataContextProvider = DataContext.Provider