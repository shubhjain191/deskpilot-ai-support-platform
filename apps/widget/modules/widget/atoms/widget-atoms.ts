import { atom } from "jotai"
import { WidgetScreen } from "../types"
import { atomWithStorage } from "jotai/utils"
import { atomFamily } from "jotai-family"
import { CONTACT_SESSION_KEY } from "../constants"
import { Id } from "@workspace/backend/_generated/dataModel"

// screen atom
export const screenAtom = atom<WidgetScreen>("loading")

// organization id atom
export const organizationIdAtom = atom<string | null>(null)


export const contactSessionId = atomWithStorage("some_key", {"orgId": "..."})

// contact session id atom
export const contactSessionIdAtomFamily = atomFamily((organizationId: string) => atomWithStorage<string | null>(`${CONTACT_SESSION_KEY}-${organizationId}`, null))

// error message atom
export const errorMessageAtom = atom<string | null>(null)

// loading message atom
export const loadingMessageAtom = atom<string | null>(null)

// conversation id atom
export const conversationIdAtom = atom<Id<"conversations"> | null>(null)