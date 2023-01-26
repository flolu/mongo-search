/* eslint-disable @next/next/no-img-element */

import axios from 'axios'
import Head from 'next/head'
import {useForm} from 'react-hook-form'
import debounce from 'debounce'
import {ChangeEvent, useState} from 'react'

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

  return (
    <>
      <Head>
        <title>MongoDB Text Search</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex flex-col items-center p-24 min-h-[100vh] bg-gray-100">
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

        <div className="">
          <form
            onSubmit={handleSubmit((data) => {
              if (selectedAutocompleteResultIndex !== null) {
                runSearch(autocompleteResults[selectedAutocompleteResultIndex])
              } else {
                runSearch(currentValue)
              }
            })}
          >
            <input
              {...register('search')}
              onChange={debounce(async (data: ChangeEvent<HTMLInputElement>) => {
                if (searchResults.length) {
                  setSearchResults([])
                }
                setSelectedAutocompleteResultIndex(null)
                const query = data.target.value

                setCurrentValue(query)

                if (query) {
                  const response = await axios.get(`http://localhost:3001/autocomplete?query=${query}`)
                  setAutocompleteResults(response.data.map((u: any) => u.fullName))
                } else {
                  setAutocompleteResults([])
                  setSearchResults([])
                }
              }, 100)}
              onKeyDown={(event) => {
                if (event.code === 'ArrowDown') {
                  const current =
                    selectedAutocompleteResultIndex === null ? -1 : selectedAutocompleteResultIndex
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
              }}
            />
          </form>

          <div>
            {autocompleteResults.map((result, index) => {
              return (
                <div
                  key={index}
                  onClick={() => runSearch(result)}
                  onMouseOver={() => setSelectedAutocompleteResultIndex(index)}
                  onMouseOut={() => setSelectedAutocompleteResultIndex(null)}
                  className={selectedAutocompleteResultIndex === index ? 'font-bold' : ''}
                >
                  {result}
                </div>
              )
            })}
          </div>

          {isLoading && <div>Loading...</div>}

          <div className="space-y-4">
            {searchResults.map((result, index) => {
              return (
                <div key={index} className="flex items-center space-x-2">
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

        <div className="flex-1"></div>
        <div>
          <a href="https://github.com/flolu/mongo-search" target="_blank" rel="noopener noreferrer">
            <p>Source Code</p>
          </a>
        </div>
      </main>
    </>
  )
}
