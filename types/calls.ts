// types/calls.ts
import { CallStatus } from "@prisma/client"

export const CALL_OUTCOMES = {
  INTERESTED: "Interested in applying",
  NEED_MORE_INFO: "Needs more information",
  CALLBACK_REQUESTED: "Requested callback",
  NOT_INTERESTED: "Not interested",
  WRONG_NUMBER: "Wrong number",
  NO_ANSWER: "No answer",
  BUSY: "Line busy",
  INVALID_NUMBER: "Invalid number",
  OTHER: "Other"
} as const

export type CallOutcome = typeof CALL_OUTCOMES[keyof typeof CALL_OUTCOMES]

export interface LogCallInput {
  leadId: string
  status: CallStatus
  notes?: string
  followUpDate?: Date
  outcome: CallOutcome
}