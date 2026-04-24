export type TicketStatus = 'Open' | 'Closed' | 'Pending'

export interface TicketType {
  Id: number
  ticketTitle: string
  ticketDescription: string
  Status: TicketStatus
  Label: string
  thumb: string
  AgentName: string
  Date: string | Date
  deleted: boolean
}
