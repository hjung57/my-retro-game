# 🎮 Pac-Kiro

A retro arcade game inspired by Pac-Man, featuring the Kiro logo as the player character. Built during AWS re:Invent 2024 workshop.

![Pac-Kiro Game](kiro-logo.png)

## 🎯 About

Navigate through a classic maze as Kiro, collecting dots while avoiding colorful ghosts. Grab power pellets to turn the tables and chase down your pursuers! Features smooth grid-based movement, particle effects, and high score tracking.

## ✨ Features

- **Classic Arcade Gameplay** - Grid-based movement with arrow key controls
- **Smart Ghost AI** - 4 ghosts with chase behavior and varying speeds
- **Power-Up System** - Power pellets let you eat ghosts temporarily
- **Visual Effects** - Particle systems for dots, power pellets, and ghost consumption
- **Lives System** - Start with 3 lives, lose one when caught
- **High Score Tracking** - Backend API stores top scores
- **Smooth Animations** - 60 FPS gameplay with frame-based timing
- **Kiro Branding** - Uses official Kiro colors and logo

## 🚀 Quick Start

### Prerequisites
- Ruby 2.7+ 
- Bundler

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hjung57/my-retro-game.git
cd my-retro-game
```

2. Install dependencies:
```bash
bundle install
```

3. Start the server:
```bash
ruby app.rb
```

4. Open your browser to `http://localhost:4567`

## 🎮 How to Play

### Controls
- **Arrow Keys** - Move Kiro up, down, left, right
- Movement is grid-based and queued for smooth gameplay

### Objective
- Collect all dots to complete the level
- Avoid ghosts or lose a life
- Grab power pellets (large dots) to eat ghosts temporarily
- Survive and rack up the highest score!

### Scoring
- **Regular Dot**: 10 points
- **Power Pellet**: 50 points  
- **Eating Ghost**: 200 points

### Game Rules
- Start with 3 lives
- Lose a life when caught by a ghost (unless powered up)
- Power pellets last for 300 frames (~5 seconds)
- Game over when all lives are lost
- Complete the level by collecting all dots

## 🛠️ Technology Stack

### Backend
- **Ruby** with **Sinatra** framework
- **Puma** web server
- In-memory high score storage

### Frontend
- **Vanilla JavaScript** (no frameworks)
- **HTML5 Canvas** for rendering
- **CSS3** for styling
- Particle system for visual effects

### Architecture
- RESTful API for high scores
- Frame-based game loop (requestAnimationFrame)
- Grid-based collision detection
- Simple pathfinding AI for ghosts

## 📁 Project Structure

```
├── app.rb                 # Sinatra server & API endpoints
├── Gemfile               # Ruby dependencies
├── public/
│   ├── index.html        # Game UI structure
│   ├── game.js           # Core game logic
│   ├── particles.js      # Particle effects system
│   ├── style.css         # Visual styling
│   └── kiro-logo.png     # Player sprite
└── README.md
```

## 🎨 Design

Built with Kiro's brand colors:
- **Primary Green**: #5CB54D
- **Dark Theme**: Black-900 background
- Smooth animations and visual feedback
- Retro arcade aesthetic with modern polish

## 🧪 Testing

Run the particle system tests:
```bash
npm test
```

## 🤝 Contributing

This project was created as part of an AWS re:Invent workshop. Feel free to fork and enhance!

## 📝 License

MIT License - feel free to use this code for learning and fun!

## 🎉 Acknowledgments

- Built with [Kiro AI](https://kiro.dev)
- Inspired by the classic Pac-Man arcade game
- Created during AWS re:Invent 2024 workshop

---

**Have fun playing Pac-Kiro! 👾**
