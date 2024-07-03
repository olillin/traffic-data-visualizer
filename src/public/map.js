window.addEventListener('load', () => {
    var map = L.map('map').setView([57.7089, 11.9746], 10)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const markerLayer = L.layerGroup().addTo(map)
    const zoneLayer = L.layerGroup().addTo(map)
    const positionBoundsLayer = L.layerGroup().addTo(map)

    // Show positions
    fetch('/positions')
        .then(res => res.json())
        .then(positions => {
            const positionBounds = [Infinity, Infinity, -Infinity, -Infinity]

            positions.forEach(position => {
                let [timestamp, zone, line, direction, transportMode, latitude, longitude] = position.map(value => value.replace(/","/g, ','))

                latitude = parseFloat(latitude)
                longitude = parseFloat(longitude)

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
                            `<span><b>Zone</b> ${zone}</span>` +
                            `<span><b>Line</b> ${line}</span>` +
                            `<span><b>Direction</b> ${direction}</span>` +
                            `<span><b>Transport mode</b> ${transportMode}</span>` +
                            '</div>'
                    )
                    .addTo(markerLayer)
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
        ).addTo(zoneLayer)
    })
})
