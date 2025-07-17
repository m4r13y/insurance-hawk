
"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useFormContext, type UseFormReturn } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Loader2, MapPin } from "lucide-react"

interface AddressSearchInputProps {
  form: UseFormReturn<any>
  initialZip?: string
}

interface GeocodeResult {
  place_id: number
  display_name: string
  address: {
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
  }
}

export function AddressSearchInput({ form, initialZip }: AddressSearchInputProps) {
  const [query, setQuery] = useState(initialZip || "")
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    if (query.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    setLoading(true)
    setIsOpen(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&q=${encodeURIComponent(query)}&countrycodes=us&limit=5`)
        if (!response.ok) throw new Error("Network response was not ok.")
        const data: GeocodeResult[] = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Failed to fetch address:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [query])

  const handleSelect = (result: GeocodeResult) => {
    const city = result.address.city || result.address.town || result.address.village || ""
    const state = result.address.state || ""
    const zip = result.address.postcode || ""

    form.setValue("city", city, { shouldValidate: true })
    form.setValue("state", state, { shouldValidate: true })
    form.setValue("zip", zip, { shouldValidate: true })
    
    setQuery(result.display_name.split(',').slice(0, 3).join(','))
    setIsOpen(false)
  }

  const handleBlur = () => {
    setTimeout(() => {
        setIsOpen(false)
    }, 150)
  }

  return (
    <div className="md:col-span-2 space-y-2">
      <label className="text-sm font-medium">City, State, Zip Code</label>
       <Command shouldFilter={false} className="relative overflow-visible">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <CommandInput
                    value={query}
                    onValueChange={setQuery}
                    onBlur={handleBlur}
                    onFocus={() => {if (results.length > 0) setIsOpen(true)}}
                    placeholder="Start typing your city, state, or zip..."
                    className="pl-10"
                />
                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
            </div>
            {isOpen && (
                 <CommandList className="absolute top-full z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                    {results.length === 0 && query.length >= 3 && !loading && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}
                    {results.length > 0 && (
                        <CommandGroup>
                            {results.map((result) => (
                                <CommandItem key={result.place_id} onSelect={() => handleSelect(result)} className="cursor-pointer">
                                    {result.display_name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            )}
       </Command>
    </div>
  )
}
