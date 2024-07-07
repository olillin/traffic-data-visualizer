export interface Position {
    timestamp: number
    zoneId: number
    line: string
    direction: string
    transportMode: string
    latitude: number
    longitude: number
}

export interface Zone {
    lowerLeftLat: number
    lowerLeftLong: number
    upperRightLat: number
    upperRightLong: number
}
