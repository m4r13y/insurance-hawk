
"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useForm, type UseFormReturn } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Loader2, MapPin } from "lucide-react"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "./form"

interface AddressSearchInputProps {
  form: UseFormReturn<any>
  initialZip?: string
  className?: string
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

export function AddressSearchInput({ form, initialZip, className }: AddressSearchInputProps) {
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
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Street Address</FormLabel>
            <FormControl>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <CommandInput
                        {...field}
                        placeholder="Start typing your address..."
                        className="pl-10"
                    />
                </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className={cn("md:col-span-2 grid grid-cols-1 sm:grid-cols-5 gap-x-4 gap-y-6", className)}>
        <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
            <FormItem className="sm:col-span-2">
                <FormLabel>City</FormLabel>
                <FormControl>
                    <CommandInput {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
            <FormItem className="sm:col-span-1">
                <FormLabel>State</FormLabel>
                <FormControl>
                    <CommandInput {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
            <FormItem className="sm:col-span-2">
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                    <CommandInput {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>
    </>
  )
}
