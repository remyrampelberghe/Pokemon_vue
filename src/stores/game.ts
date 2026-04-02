import { createDiscreteApi } from 'naive-ui'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'
import { computed, ref } from 'vue'

import router, { ROUTES } from '../router.js'
import type { Card } from '../types/index.js'
import { useAuthStore } from './auth.js'

interface Room {
  id: string
  hostName?: string
  guestName?: string
  status?: string
}

interface PlayerSide {
  userId: number | null
  username: string
  koCount: number
  deckCount: number
  hand: Card[]
  activeCard: Card | null
  activeHp: number | null
}

interface NormalizedGameState {
  roomId: string | null
  host: PlayerSide
  guest: PlayerSide
  currentTurnUserId: number | null
  currentTurnRole: 'host' | 'guest' | null
  message: string
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
const { message } = createDiscreteApi(['message'])

const emptySide = (): PlayerSide => ({
  userId: null,
  username: '',
  koCount: 0,
  deckCount: 0,
  hand: [],
  activeCard: null,
  activeHp: null,
})

const toRoomList = (payload: unknown): Room[] => {
  const raw = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === 'object' &&
        Array.isArray((payload as { rooms?: unknown[] }).rooms)
      ? (payload as { rooms: unknown[] }).rooms
      : []

  return raw
    .map((room) => {
      if (!room || typeof room !== 'object') return null
      const data = room as Record<string, unknown>
      const id = String(data.id ?? data.roomId ?? '')
      if (!id) return null

      return {
        id,
        hostName: typeof data.hostName === 'string' ? data.hostName : undefined,
        guestName:
          typeof data.guestName === 'string' ? data.guestName : undefined,
        status: typeof data.status === 'string' ? data.status : undefined,
      } as Room
    })
    .filter((room): room is Room => !!room)
}

const toCard = (raw: unknown): Card | null => {
  if (!raw || typeof raw !== 'object') return null
  const card = raw as Partial<Card>
  if (
    typeof card.id !== 'number' ||
    typeof card.name !== 'string' ||
    typeof card.hp !== 'number' ||
    typeof card.attack !== 'number' ||
    typeof card.type !== 'string' ||
    typeof card.pokedexNumber !== 'number' ||
    typeof card.imgUrl !== 'string'
  ) {
    return null
  }
  return card as Card
}

const toSide = (raw: unknown): PlayerSide => {
  if (!raw || typeof raw !== 'object') return emptySide()
  const data = raw as Record<string, unknown>

  const activeFromState =
    toCard(data.activeCard) ?? toCard(data.activePokemon) ?? toCard(data.active)
  const handRaw = Array.isArray(data.hand)
    ? data.hand
    : Array.isArray(data.cardsInHand)
      ? data.cardsInHand
      : []

  return {
    userId: typeof data.userId === 'number' ? data.userId : null,
    username: typeof data.username === 'string' ? data.username : '',
    koCount:
      typeof data.koCount === 'number'
        ? data.koCount
        : typeof data.score === 'number'
          ? data.score
          : 0,
    deckCount:
      typeof data.deckCount === 'number'
        ? data.deckCount
        : typeof data.remainingDeckCards === 'number'
          ? data.remainingDeckCards
          : 0,
    hand: handRaw.map(toCard).filter((card): card is Card => !!card),
    activeCard: activeFromState,
    activeHp:
      typeof data.activeHp === 'number'
        ? data.activeHp
        : typeof data.currentHp === 'number'
          ? data.currentHp
          : null,
  }
}

const normalizeGameState = (payload: unknown): NormalizedGameState => {
  if (!payload || typeof payload !== 'object') {
    return {
      roomId: null,
      host: emptySide(),
      guest: emptySide(),
      currentTurnUserId: null,
      currentTurnRole: null,
      message: '',
    }
  }

  const data = payload as Record<string, unknown>
  const hostSource =
    data.host ??
    data.hostPlayer ??
    (data.players as { host?: unknown } | undefined)?.host
  const guestSource =
    data.guest ??
    data.guestPlayer ??
    (data.players as { guest?: unknown } | undefined)?.guest

  return {
    roomId:
      typeof data.roomId === 'string'
        ? data.roomId
        : typeof data.id === 'string'
          ? data.id
          : null,
    host: toSide(hostSource),
    guest: toSide(guestSource),
    currentTurnUserId:
      typeof data.currentTurnUserId === 'number'
        ? data.currentTurnUserId
        : null,
    currentTurnRole:
      data.currentTurnRole === 'host' || data.currentTurnRole === 'guest'
        ? data.currentTurnRole
        : data.turnRole === 'host' || data.turnRole === 'guest'
          ? data.turnRole
          : null,
    message:
      typeof data.message === 'string'
        ? data.message
        : typeof data.eventMessage === 'string'
          ? data.eventMessage
          : '',
  }
}

export const useGameStore = defineStore('game', () => {
  const auth = useAuthStore()

  const socket = ref<Socket | null>(null)
  const rooms = ref<Room[]>([])
  const currentRoomId = ref<string | null>(null)

  const gameState = ref<NormalizedGameState>({
    roomId: null,
    host: emptySide(),
    guest: emptySide(),
    currentTurnUserId: null,
    currentTurnRole: null,
    message: '',
  })

  const gameResult = ref<'win' | 'lose' | null>(null)
  const lobbyError = ref('')
  const liveMessage = ref('')

  const playerRole = computed<'host' | 'guest' | null>(() => {
    const myUserId = auth.user?.id ?? null
    if (!myUserId) return null
    if (gameState.value.host.userId === myUserId) return 'host'
    if (gameState.value.guest.userId === myUserId) return 'guest'
    return null
  })

  const myBoard = computed(() =>
    playerRole.value === 'host' ? gameState.value.host : gameState.value.guest,
  )
  const opponentBoard = computed(() =>
    playerRole.value === 'host' ? gameState.value.guest : gameState.value.host,
  )

  const isMyTurn = computed(() => {
    if (!auth.user) return false
    if (gameState.value.currentTurnUserId) {
      return gameState.value.currentTurnUserId === auth.user.id
    }
    if (gameState.value.currentTurnRole && playerRole.value) {
      return gameState.value.currentTurnRole === playerRole.value
    }
    return false
  })

  const inGame = computed(() => !!currentRoomId.value)

  const setError = (text: string) => {
    lobbyError.value = text
    message.error(text)
  }

  const cleanupSocket = () => {
    if (!socket.value) return
    socket.value.removeAllListeners()
    socket.value.disconnect()
    socket.value = null
  }

  const bindSocketEvents = (instance: Socket) => {
    instance.on('roomsList', (payload: unknown) => {
      rooms.value = toRoomList(payload)
    })

    instance.on('roomsListUpdated', (payload: unknown) => {
      if (Array.isArray(payload)) {
        rooms.value = toRoomList(payload)
        return
      }
      instance.emit('getRooms')
    })

    instance.on('roomCreated', (payload: unknown) => {
      if (typeof payload === 'string') {
        currentRoomId.value = payload
        return
      }
      if (!payload || typeof payload !== 'object') return
      const roomId =
        (payload as { roomId?: string; id?: string }).roomId ??
        (payload as { id?: string }).id
      if (roomId) currentRoomId.value = roomId
    })

    instance.on('gameStarted', (payload: unknown) => {
      const source =
        payload &&
        typeof payload === 'object' &&
        (payload as { gameState?: unknown }).gameState
          ? (payload as { gameState: unknown }).gameState
          : payload
      const next = normalizeGameState(source)
      gameState.value = next
      if (next.roomId) currentRoomId.value = next.roomId
      liveMessage.value = 'La partie a démarré'
      router.push(ROUTES.GAME)
    })

    instance.on('gameStateUpdated', (payload: unknown) => {
      gameState.value = normalizeGameState(payload)
      liveMessage.value = gameState.value.message || 'État de jeu mis à jour'
    })

    instance.on('gameEnded', (payload: unknown) => {
      const winnerUserId =
        payload &&
        typeof payload === 'object' &&
        typeof (payload as { winnerUserId?: number }).winnerUserId === 'number'
          ? (payload as { winnerUserId: number }).winnerUserId
          : null
      const winnerRole =
        payload &&
        typeof payload === 'object' &&
        ((payload as { winnerRole?: 'host' | 'guest' }).winnerRole === 'host' ||
          (payload as { winnerRole?: 'host' | 'guest' }).winnerRole === 'guest')
          ? (payload as { winnerRole: 'host' | 'guest' }).winnerRole
          : null

      if (winnerUserId && auth.user) {
        gameResult.value = winnerUserId === auth.user.id ? 'win' : 'lose'
      } else if (winnerRole && playerRole.value) {
        gameResult.value = winnerRole === playerRole.value ? 'win' : 'lose'
      } else {
        gameResult.value = 'lose'
      }

      liveMessage.value = gameResult.value === 'win' ? 'Victoire !' : 'Défaite.'
    })

    instance.on('opponentDisconnected', () => {
      const text = 'Votre adversaire s’est déconnecté.'
      liveMessage.value = text
      message.warning(text)
    })

    instance.on('error', (payload: unknown) => {
      const text =
        typeof payload === 'string'
          ? payload
          : payload &&
              typeof payload === 'object' &&
              typeof (payload as { message?: string }).message === 'string'
            ? (payload as { message: string }).message
            : 'Erreur Socket inconnue'
      setError(text)
    })
  }

  const connectLobby = () => {
    if (socket.value?.connected) return
    if (!auth.token) {
      setError('Token JWT manquant. Connectez-vous à nouveau.')
      return
    }

    cleanupSocket()

    const instance = io(SOCKET_URL, {
      auth: { token: auth.token },
      transports: ['websocket'],
    })

    bindSocketEvents(instance)
    socket.value = instance
  }

  const disconnectLobby = () => {
    cleanupSocket()
  }

  const requestRooms = () => {
    socket.value?.emit('getRooms')
  }

  const createRoom = (deckId: number) => {
    socket.value?.emit('createRoom', { deckId })
  }

  const joinRoom = (roomId: string, deckId: number) => {
    currentRoomId.value = roomId
    socket.value?.emit('joinRoom', { roomId, deckId })
  }

  const drawCards = () => {
    socket.value?.emit('drawCards')
  }

  const playCard = (cardId: number) => {
    socket.value?.emit('playCard', { cardId })
  }

  const attack = () => {
    socket.value?.emit('attack')
  }

  const endTurn = () => {
    socket.value?.emit('endTurn')
  }

  const resetGame = () => {
    currentRoomId.value = null
    gameResult.value = null
    liveMessage.value = ''
    lobbyError.value = ''
    gameState.value = {
      roomId: null,
      host: emptySide(),
      guest: emptySide(),
      currentTurnUserId: null,
      currentTurnRole: null,
      message: '',
    }
  }

  return {
    rooms,
    currentRoomId,
    gameResult,
    gameState,
    lobbyError,
    liveMessage,
    playerRole,
    myBoard,
    opponentBoard,
    isMyTurn,
    inGame,
    connectLobby,
    disconnectLobby,
    requestRooms,
    createRoom,
    joinRoom,
    drawCards,
    playCard,
    attack,
    endTurn,
    resetGame,
  }
})
