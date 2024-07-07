var map

var zonesLayer
var optimizedZonesLayer
var positionBoundsLayer
var positionsLayer

window.addEventListener('load', () => {
    map = L.map('map').setView([57.7089, 11.9746], 10)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    zonesLayer = L.layerGroup().addTo(map)
    optimizedZonesLayer = L.layerGroup().addTo(map)
    positionBoundsLayer = L.layerGroup().addTo(map)
    positionsLayer = L.layerGroup().addTo(map)

    registerLayerToggles()

    // Show positions
    fetch('/positions')
        .then(res => res.json())
        .then(positions => {
            const positionBounds = [Infinity, Infinity, -Infinity, -Infinity]

            positions.forEach(position => {
                const { timestamp, zoneId, line, direction, transportMode, latitude, longitude } = position

                // Update positionBounds
                if (latitude < positionBounds[0]) {
                    positionBounds[0] = latitude
                } else if (latitude > positionBounds[2]) {
                    positionBounds[2] = latitude
                }
                if (longitude < positionBounds[1]) {
                    positionBounds[1] = longitude
                } else if (longitude > positionBounds[3]) {
                    positionBounds[3] = longitude
                }

                // Create marker
                const marker = L.circle([latitude, longitude], {
                    color: '#13b',
                    fillColor: '#13b',
                    fillOpacity: 1,
                    radius: 50,
                })
                    .bindPopup(
                        '<div class="positionContext">' + //
                            `<span><b>Recorded at</b> ${new Date(parseInt(timestamp)).toISOString()}</span>` +
                            `<span><b>Zone</b> ${zoneId}</span>` +
                            `<span><b>Line</b> ${line}</span>` +
                            `<span><b>Direction</b> ${direction}</span>` +
                            `<span><b>Transport mode</b> ${transportMode}</span>` +
                            '</div>'
                    )
                    .addTo(positionsLayer)
            })

            return positionBounds
        })
        .then(positionBounds => {
            // Show position bounds
            L.rectangle(
                [
                    [positionBounds[0], positionBounds[1]],
                    [positionBounds[2], positionBounds[3]],
                ],
                {
                    color: '#13b',
                    opacity: 0.5,
                    fill: false,
                }
            ).addTo(positionBoundsLayer)
        })

    // Show zones
    const bounds = [56.1496278, 10.2134046, 60.670150574324886, 17.148177023103646]

    function generateZones(gridSize) {
        const boundsHeight = Math.abs(bounds[2] - bounds[0])
        const boundsWidth = Math.abs(bounds[3] - bounds[1])
        const gridPartitionLatitude = boundsHeight / gridSize
        const gridPartitionLongitude = boundsWidth / gridSize

        const zones = []
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                zones.push([
                    bounds[0] + gridPartitionLatitude * i, //
                    bounds[1] + gridPartitionLongitude * j,
                    bounds[0] + gridPartitionLatitude * (i + 1),
                    bounds[1] + gridPartitionLongitude * (j + 1),
                ])
            }
        }
        return zones
    }

    const zones = generateZones(6)
    zones.forEach(zone => {
        L.rectangle(
            [
                [zone[0], zone[1]],
                [zone[2], zone[3]],
            ],
            {
                color: '#fa2',
                opacity: 0.3,
                fill: false,
            }
        ).addTo(zonesLayer)
    })

    refreshOptimizedZones()
})

function registerLayerToggles() {
    const positionsToggle = document.getElementById('positionsToggle')
    positionsToggle.addEventListener('change', () => {
        if (positionsToggle.checked == true) {
            positionsLayer.addTo(map)
        } else {
            positionsLayer.remove()
        }
    })
    const positionBoundsToggle = document.getElementById('positionBoundsToggle')
    positionBoundsToggle.addEventListener('change', () => {
        if (positionBoundsToggle.checked) {
            positionBoundsLayer.addTo(map)
        } else {
            positionBoundsLayer.remove()
        }
    })
    const zonesToggle = document.getElementById('zonesToggle')
    zonesToggle.addEventListener('change', () => {
        if (zonesToggle.checked) {
            zonesLayer.addTo(map)
        } else {
            zonesLayer.remove()
        }
    })
    const optimizedZonesToggle = document.getElementById('optimizedZonesToggle')
    optimizedZonesToggle.addEventListener('change', () => {
        if (optimizedZonesToggle.checked) {
            optimizedZonesLayer.addTo(map)
        } else {
            optimizedZonesLayer.remove()
        }
    })
}

function refreshOptimizedZones() {
    // Clear layer
    optimizedZonesLayer.eachLayer(layer => {
        layer.remove()
    })
    // Get zones
    const maxPositionsPerZone = document.getElementById('maxPositionsPerZone').value
    fetch(`/zones?maxPositionsPerZone=${maxPositionsPerZone}`)
        .then(res => res.json())
        .then(zones => {
            zones.forEach((zone, index) => {
                L.rectangle(
                    [
                        [zone.lowerLeftLat, zone.lowerLeftLong],
                        [zone.upperRightLat, zone.upperRightLong],
                    ],
                    {
                        fillColor: index % 2 === 0 ? '#f3b' : '#a3b',
                        opacity: 0.5,
                        stroke: false,
                        fill: true,
                    }
                )
                    .bindPopup(`Optimized zone ${index}`)
                    .addTo(optimizedZonesLayer)
            })
        })
}
