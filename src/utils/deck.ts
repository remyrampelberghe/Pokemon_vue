import type { Card, Deck } from '../types/index.js'

type MaybeDeckCard =
  | number
  | {
      cardId?: number
      id?: number
      hp?: number
      attack?: number
      type?: string
    }

const hasCardShape = (value: unknown): value is Card => {
  if (!value || typeof value !== 'object') return false
  const card = value as Partial<Card>
  return (
    typeof card.id === 'number' &&
    typeof card.name === 'string' &&
    typeof card.hp === 'number' &&
    typeof card.attack === 'number' &&
    typeof card.type === 'string' &&
    typeof card.pokedexNumber === 'number' &&
    typeof card.imgUrl === 'string'
  )
}

export const extractDeckCardIds = (deck: Deck | null) => {
  if (!deck || !Array.isArray(deck.cards)) return []

  return (deck.cards as MaybeDeckCard[])
    .map((item) => {
      if (typeof item === 'number') return item
      if (typeof item.cardId === 'number') return item.cardId
      if (typeof item.id === 'number') return item.id
      return null
    })
    .filter((id): id is number => typeof id === 'number')
}

export const extractDeckCards = (deck: Deck | null) => {
  if (!deck || !Array.isArray(deck.cards)) return []
  return (deck.cards as unknown[]).filter(hasCardShape)
}

export const sortCardsByIdOrder = (cards: Card[], orderedIds: number[]) => {
  const map = new Map(cards.map((card) => [card.id, card]))
  return orderedIds
    .map((id) => map.get(id))
    .filter((card): card is Card => typeof card !== 'undefined')
}
