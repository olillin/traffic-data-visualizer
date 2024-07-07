import type { Position, Zone } from './types'

export function generateOptimalZones(positions: Position[], maxPositionsPerZone: number): Zone[] {
    const zones: Zone[] = []

    positions.sort((a, b) => a.longitude - b.longitude)

    var currentZone: Zone | null = null
    var currentZonePositions = 0
    positions.forEach(position => {
        if (currentZone === null) {
            // Create new zone
            currentZone = {
                lowerLeftLat: position.latitude,
                lowerLeftLong: position.longitude,
                upperRightLat: position.latitude,
                upperRightLong: position.longitude,
            }
        } else if (currentZonePositions >= maxPositionsPerZone) {
            // Complete zone
            zones.push(currentZone)
            currentZone = null
            currentZonePositions = 0
        } else {
            // Grow zone to contain position
            if (currentZone.lowerLeftLat > position.latitude) {
                currentZone.lowerLeftLat = position.latitude
            } else if (currentZone.upperRightLat < position.latitude) {
                currentZone.upperRightLat = position.latitude
            }
            if (currentZone.lowerLeftLong > position.longitude) {
                currentZone.lowerLeftLong = position.longitude
            } else if (currentZone.upperRightLong < position.longitude) {
                currentZone.upperRightLong = position.longitude
            }
            currentZonePositions++
        }
    })
    if (currentZone !== null) {
        zones.push(currentZone)
    }

    return zones
}
