/* eslint-disable @next/next/no-img-element */

import axios from 'axios'
import Head from 'next/head'
import {useForm} from 'react-hook-form'
import debounce from 'debounce'
import {ChangeEvent, KeyboardEvent, useState} from 'react'

const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  const {register, handleSubmit, setValue} = useForm()
  const [currentValue, setCurrentValue] = useState('')
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([])
  const [selectedAutocompleteResultIndex, setSelectedAutocompleteResultIndex] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setLoading] = useState(false)

  const runSearch = async (query: string) => {
    setLoading(true)
    setAutocompleteResults([])
    setValue('search', query)
    const response = await axios.get(`http://localhost:3001/search?query=${query}`)
    setSearchResults(response.data)
    setLoading(false)
  }

  const onFormSubmit = () => {
    if (selectedAutocompleteResultIndex !== null) {
      runSearch(autocompleteResults[selectedAutocompleteResultIndex])
    } else {
      runSearch(currentValue)
    }
  }

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (searchResults.length) {
      setSearchResults([])
    }
    setSelectedAutocompleteResultIndex(null)
    const query = event.target.value

    setCurrentValue(query)

    if (query) {
      const response = await axios.get(`http://localhost:3001/autocomplete?query=${query}`)
      setAutocompleteResults(response.data.map((u: any) => u.fullName))
    } else {
      setAutocompleteResults([])
      setSearchResults([])
    }
  }

  const onInputKeypress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'ArrowDown') {
      const current = selectedAutocompleteResultIndex === null ? -1 : selectedAutocompleteResultIndex
      if (current === autocompleteResults.length - 1) {
        setSelectedAutocompleteResultIndex(0)
      } else {
        setSelectedAutocompleteResultIndex(current + 1)
      }
    }
    if (event.code === 'ArrowUp') {
      const current =
        selectedAutocompleteResultIndex === null
          ? autocompleteResults.length
          : selectedAutocompleteResultIndex
      if (current === 0) {
        setSelectedAutocompleteResultIndex(autocompleteResults.length - 1)
      } else {
        setSelectedAutocompleteResultIndex(current - 1)
      }
    }
  }

  return (
    <>
      <Head>
        <title>MongoDB Text Search</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex px-24 py-12 min-h-[100vh] bg-gray-100">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
          {/* Header */}
          <div className="flex justify-between items-center w-full z-10 text-sm font-mono">
            <p>
              <span className="font-bold">MongoDB</span> Text Search
            </p>
            <div>
              <a href="https:flolu.de" target="_blank" rel="noopener noreferrer">
                By <span className="font-bold">Florian Ludewig</span>
              </a>
            </div>
          </div>

          <div className="py-8 w-full max-w-md">
            {/* Input field */}
            <form className="pb-2" onSubmit={handleSubmit(onFormSubmit)}>
              <input
                {...register('search')}
                className="py-2 px-4 rounded-full w-full border-2 border-gray-300"
                onChange={debounce(onInputChange, 100)}
                onKeyDown={onInputKeypress}
              />
            </form>

            {/* Autocomplete suggestions */}
            {autocompleteResults.length >= 1 && (
              <div className="bg-white rounded-md border border-gray-300">
                {autocompleteResults.map((result, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => runSearch(result)}
                      onMouseOver={() => setSelectedAutocompleteResultIndex(index)}
                      onMouseOut={() => setSelectedAutocompleteResultIndex(null)}
                      className={classNames(
                        selectedAutocompleteResultIndex === index && 'bg-gray-100',
                        'px-4 py-2 border-b border-gray-100 cursor-pointer'
                      )}
                    >
                      {result}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && <div className="pt-6">Loading...</div>}

            {/* Search results */}
            <div className="space-y-4 pt-6">
              {searchResults.map((result, index) => {
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <img src={result.avatar} alt="avatar" className="w-16 rounded-full"></img>
                    <div>
                      <p className="font-bold">{result.fullName}</p>
                      <p className="font-mono text-sm">{result.email}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-1"></div>
          <div>
            <a href="https://github.com/flolu/mongo-search" target="_blank" rel="noopener noreferrer">
              <p className="font-mono font-bold">Source Code</p>
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
