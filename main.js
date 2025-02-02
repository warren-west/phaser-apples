import Phaser from 'phaser'

// game constants
const sizes = {
  width: 500,
  height: 500,
}

const isDev = false

const speedDown = 300
const roundTime = 30000

// DOM Elements
const gameStartDiv = document.getElementById('gameStartDiv')
const gameStartBtn = document.getElementById('gameStartButton')
const gameEndDiv = document.getElementById('gameEndDiv')
const gameWinLoseSpan = document.getElementById('gameWinLoseSpan')
const gameEndScoreSpan = document.getElementById('gameEndScoreSpan')
const gameRetryBtn = document.getElementById('retryButton')

// create GameScene class
class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game")
    this.player // the basket
    this.cursor
    this.playerSpeed = speedDown + 50
    this.target // the falling apple
    this.points = 0
    this.textScore
    this.textTime
    this.timedEvent
    this.remainingTime
    this.coinMusic
    this.bgMusic
    this.emitter
  }

  // get required assets
  preload() {
    this.load.image("bg", "/assets/bg.png")
    this.load.image("basket", "/assets/basket.png")
    this.load.image("apple", "/assets/apple.png")
    this.load.audio("coinMusic", "/assets/coin.mp3")
    this.load.audio("bgMusic", "/assets/bgMusic.mp3")
    this.load.image("money", "/assets/money.png")
  }

  create() {
    // don't start game until start button is pressed
    this.scene.pause("scene-game")

    // add the game audio
    this.coinMusic = this.sound.add("coinMusic").setVolume(0.15)
    this.bgMusic = this.sound.add("bgMusic").setVolume(0.2)
    // start playing background music
    this.bgMusic.play()

    // add the start position of the background image
    this.add
      .image(0, 0, "bg")
      .setOrigin(0, 0)

    // add the start position of the basket
    this.player = this.physics.add
      .image(sizes.width * 0.5, sizes.height - 100, "basket")
      .setOrigin(0.5, 0)

    // disable gravity, and moving off-screen for the basket
    this.player.setImmovable(true)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)

    // shrink the hit-box on the basket
    this.player
      .setSize(this.player.width - this.player.width / 4, this.player.height / 2)
      .setOffset(this.player.width / 10, this.player.height - this.player.height / 2)

    // add the start position of the apple
    this.target = this.physics.add
      .image(Math.floor(Math.random() * sizes.width - 20), 0, "apple")
      .setOrigin(0, 0)
    this.target.setMaxVelocity(0, speedDown * 1.25)

    // deal with apple-basket collision
    this.physics.add.overlap(this.player, this.target, this.targetHit, null, this)

    // get keyboard input
    this.cursor = this.input.keyboard.createCursorKeys()

    // UI
    this.textScore = this.add.text(sizes.width / 1.4, 10, "Score: 0", {
      font: "22px Poppins",
      fill: "#101010",
    })
    this.textTime = this.add.text(sizes.width / 10, 10, "Time: 00", {
      font: "22px Poppins",
      fill: "#101010",
    })

    // Timer stuff
    this.timedEvent = this.time.delayedCall(roundTime, this.gameOver, [], this)

    // Add and configure the emitter (it emits on targetHit)
    this.emitter = this.add
      .particles(0, 0, "money", {
        speed: 100,
        gravityY: speedDown - 200,
        scale: 0.04,
        duration: 90,
        emitting: false,
      })
      .startFollow(this.player, this.player.width / 10, this.player.height / 10, true)
  }

  update() {
    // Get the remaining time and display it on the UI
    this.remainingTime = this.timedEvent.getRemainingSeconds()
    this.textTime.setText(`Time: ${Math.trunc(this.remainingTime).toString()}`)

    // respawn apple at the top if it hits the bottom
    if (this.target.y >= sizes.height) {
      this.target.setY(0)
      this.target.setX(this.getRandomX())
    }

    // destructure the left & right keys from the input key
    const { left, right } = this.cursor

    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed)
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed)
    } else {
      this.player.setVelocityX(0)
    }
  }

  // generate valid X position for apple
  getRandomX() {
    return Math.floor(Math.random() * (sizes.width - this.target.width))
  }

  // handler function for apple-basket collision
  targetHit() {
    // play coin sound
    this.coinMusic.play()

    // emit the emitter ($)
    this.emitter.start()

    // reset apple position and increase score
    this.target.setY(0)
    this.target.setX(this.getRandomX())
    this.points += 100

    this.textScore.text = `Score: ${this.points}`
  }

  // when the time runs out
  gameOver() {
    this.sys.game.destroy(true)
    // this.game.scene.destroy()

    // display score and win / lose text
    gameEndScoreSpan.textContent = this.points
    gameWinLoseSpan.textContent = this.points >= 1000 ? "You WIN!" : "You LOSE!"

    gameEndDiv.style.display = "flex"
  }
}

// game config
const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: isDev
    }
  },
  scene: [GameScene]
}

// create game
let game = new Phaser.Game(config)


// Start button event listener
gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none"
  game.scene.resume("scene-game")
  console.log(`isDev: ${isDev}`)
})

gameRetryBtn.addEventListener("click", () => {
  // gameEndDiv.style.display = "none"

  // game = new Phaser.Game(config)
  // game.scene.resume("scene-game")
  window.location.reload()
})