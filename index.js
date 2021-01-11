const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const particleGrid = []
const particleMaxLifeTime = 40
const cursorPosition = {
    x: 0,
    y: 0
}
const fps = 15
const smokeInterval = 250
const repeatOnClickInterval = 75
const repeatOnClick = 10
const clickSpread = 15
const moveSpread = 5
const smokeSpread = 7
let particleSize = 4
let particleMoving = false

const throttle = (callback, delay) => {
    let last
    let timer
    return function () {
        const context = this
        const now = +new Date()
        if (last && now < last + delay) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                last = now
                callback.apply(context, arguments)
            }, delay)
        } else {
            last = now
            callback.apply(context, arguments)
        }
    };
}
const resize = () => {
    canvas.height = window.innerHeight
    canvas.width = window.outerWidth
}
const coordinateCurve = (random, spread) => Math.round(((-2 * (random - 0.5)) ** 3) * spread * 4) - (spread * 2)
const lifeTimeCurve = (randomX, randomY) => Math.round(particleMaxLifeTime * ((-4 * (randomX - 0.25) ** 2 + 1) * (-4 * (randomY - 0.25) ** 2 + 1) / 2))
const setCursorPosition = (x, y) => {
    cursorPosition.x = x - x % particleSize
    cursorPosition.y = y - y % particleSize
}
const drawParticle = (x, y, lifeTime = 50, color = '#333333') => {
    const opacity = Math.round(160 + (91 / (lifeTime / 1.25)))
    
    context.fillStyle = color + opacity.toString(16)
    context.fillRect(x, y, particleSize, particleSize)
}
const drawParticleCircle = (spread = 10, repeat = 0, repeatInterval = 100) => {
    const spreadHalf = spread * 2

    for (let i = 0; i < 500 * spread; i++) {
        const randomX = Math.random()
        const randomY = Math.random()
        let x = coordinateCurve(randomX, spread)
        let y = coordinateCurve(randomY, spread)

        x = x - x % particleSize
        y = y - y % particleSize

        if (x ** 2 + y ** 2 < (spreadHalf * (Math.random() ** 14)) ** 2) {
            x = x + cursorPosition.x
            y = y + cursorPosition.y

            if (!particleGrid[x]) particleGrid[x] = []
        
            particleGrid[x][y] = lifeTimeCurve(randomX, randomY)
            particleMoving = true
        }
    }
    if (repeat > 0) setTimeout(() => drawParticleCircle(spread - 1, repeat - 1), repeatInterval)
}

resize()

window.addEventListener('resize', resize)
canvas.addEventListener('click', e => {
    setCursorPosition(e.clientX, e.clientY)
    drawParticleCircle(clickSpread, repeatOnClick, repeatOnClickInterval)
})
canvas.addEventListener('mousemove', throttle(e => {
    setCursorPosition(e.clientX, e.clientY)
    drawParticleCircle(moveSpread)
}, 5), { passive: true })
canvas.addEventListener('touchmove', throttle(e => {
    e = e.changedTouches[0]
    setCursorPosition(e.clientX, e.clientY)
    drawParticleCircle(moveSpread)
}, 5), { passive: true })

setInterval(() => drawParticleCircle(smokeSpread), smokeInterval)
setInterval(() => {
    if (particleMoving) {
        particleMoving = false

        for (let x = 0; x < particleGrid.length; x++) {
            if (Array.isArray(particleGrid[x])) {
                for (let y = 0; y < particleGrid[x].length; y++) {
                    if (particleGrid[x][y]) {
                        if (y > 0) {
                            for (let offset = particleSize; offset > 0; offset--) {
                                const checkLeftFirst = Math.round(Math.random())

                                if (!particleGrid[x - particleSize]) particleGrid[x - particleSize] = []
                                if (!particleGrid[x + particleSize]) particleGrid[x + particleSize] = []

                                if (!particleGrid[x][y - particleSize]) {
                                    particleGrid[x][y - particleSize] = particleGrid[x][y] - 1
                                    particleGrid[x][y] = 0
                                    particleMoving = true
                                    break
                                } else if (!(checkLeftFirst ? particleGrid[x - particleSize][y - particleSize] : particleGrid[x + particleSize][y - particleSize])) {
                                    particleGrid[x - particleSize][y - particleSize] = particleGrid[x][y] - 1
                                    particleGrid[x - particleSize][y] = 0
                                    particleMoving = true
                                    break
                                } else if (!(!checkLeftFirst ? particleGrid[x - particleSize][y - particleSize] : particleGrid[x + particleSize][y - particleSize])) {
                                    particleGrid[x + particleSize][y - particleSize] = particleGrid[x][y] - 1
                                    particleGrid[x + particleSize][y] = 0
                                    particleMoving = true
                                    break
                                }
                            }
                        }
                    }
                }
            }
        }

        context.clearRect(0, 0, canvas.width, canvas.height)
        
        for (let x = 0; x < particleGrid.length; x++) {
            if (Array.isArray(particleGrid[x])) {
                for (let y = 0; y < particleGrid[x].length; y++) {
                    if (particleGrid[x][y]) {
                        drawParticle(x, y, particleGrid[x][y])
                        particleGrid[x][y] -= 1
                        particleMoving = true
                    }
                }
            }
        }
    }
}, 1000 / fps)