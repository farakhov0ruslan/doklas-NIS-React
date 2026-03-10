export type Category = 'museums' | 'food' | 'music' | 'excursions' | 'shopping' | 'extreme'
export type Budget = 'low' | 'medium' | 'high'
export type Pace = 'relaxed' | 'moderate' | 'intensive'
export type TravelStyle = 'cultural' | 'party' | 'nature' | 'gastro' | 'adventure' | 'mixed'
export type RecalculateAction = 'lighter' | 'more' | 'optimize'

export interface Place {
  id: string
  name: string
  category: Category
  description: string
  shortDescription: string
  duration: number
  price: number
  image: string
  rating: number
  location: string
  address: string
  openHours: string
  tags: string[]
}

export interface UserPreferences {
  interests: Category[]
  budget: Budget
  travelStyle: TravelStyle[]
  tripDays: number
  pace: Pace
}

export interface CartItem {
  placeId: string
  addedAt: string
}

export interface PlaceInDay {
  placeId: string
  startTime: string
  endTime: string
}

export interface DayPlan {
  dayNumber: number
  places: PlaceInDay[]
  totalDuration: number
}

export interface RecommendationsRequest {
  preferences: UserPreferences
}

export interface RecommendationsResponse {
  places: Place[]
}

export interface GenerateRouteRequest {
  placeIds: string[]
  tripDays: number
}

export interface GenerateRouteResponse {
  days: DayPlan[]
}

export interface RecalculateRequest {
  days: DayPlan[]
  action: RecalculateAction
  preferences: UserPreferences
}

export interface RecalculateResponse {
  days: DayPlan[]
}
