import fs from 'fs'

import express from 'express'

import { generateOptimalZones } from './zones'
import { Position } from './types'

// Configuration

/** Path for the file to read data from */
const inputFilePath = process.env.INPUT_PATH ?? './data.csv'

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

// Fetch data
function getPositions(): Position[] {
    const data = fs.readFileSync(inputFilePath, 'utf-8')
    const lines = data.split('\n').slice(1)
    return lines.map(line => {
        const unescapedComma = /(?<!"),(?!")/g
        const split = line.split(unescapedComma)
        const position: Position = {
            timestamp: parseInt(split[0]),
            zoneId: parseInt(split[1]),
            line: split[2],
            direction: split[3],
            transportMode: split[4],
            latitude: parseFloat(split[5]),
            longitude: parseFloat(split[6]),
        }
        return position
    })
}

// Start server
const app = express()

app.use('/', express.static('./dist/public'))

app.get('/positions', (req, res) => {
    const positions = getPositions()
    res.json(positions)
})

app.get('/zones', (req, res) => {
    const positions = getPositions()
    const maxPositionsPerZone: number = req.query.maxPositionsPerZone ? parseInt(req.query.maxPositionsPerZone.toString()) : 180
    const zones = generateOptimalZones(positions, maxPositionsPerZone)
    res.json(zones)
})

app.listen(port)
console.log(`Listening on port ${port}`)
