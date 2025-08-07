"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PokemonTypeSelector({ pokemonTypes, selectedType, onTypeChange, loading }) {
  return (
    <div className="w-full h-full">
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full h-full">
            <SelectValue placeholder="Select a Pokémon type" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {pokemonTypes.map((type) => (
              <SelectItem key={type.name} value={type.name} className="w-full">
                <span className="capitalize w-full">{type.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}