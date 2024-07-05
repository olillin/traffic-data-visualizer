import fs from 'fs'

import express from 'express'

// Configuration

/** Path for the file to read data from */
const inputFilePath = process.env.INPUT_PATH ?? './data.csv'

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

// Fetch data
function getPositions() {
    const data = fs.readFileSync(inputFilePath, 'utf-8')
    const lines = data.split('\n').slice(1)
    return lines.map(line => {
        const unescapedComma = /(?<!"),(?!")/g
        return line.split(unescapedComma)
    })
}

// Start server
const app = express()

app.use('/', express.static('./dist/public'))

app.get('/positions', (req, res) => {
    res.json(getPositions())
})

app.listen(port)
console.log(`Listening on port ${port}`)
