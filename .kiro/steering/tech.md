# Technology Stack

## Backend
- **Framework**: Sinatra (Ruby web framework)
- **Server**: Puma
- **Dependencies**: sinatra, sinatra-contrib, json, rackup

## Frontend
- **JavaScript**: Vanilla JS (no frameworks)
- **Graphics**: HTML5 Canvas API
- **Styling**: CSS3

## Data Storage
- In-memory array for high scores (no database currently)
- High scores persist only during server runtime

## Common Commands

### Setup
```bash
bundle install
```

### Run Development Server
```bash
ruby app.rb
```
Server runs on `http://localhost:4567`

### Install Dependencies
Uses Bundler for Ruby gem management. All dependencies defined in `Gemfile`.

## API Endpoints
- `GET /` - Serves the game HTML
- `GET /api/highscores` - Returns top 10 high scores (JSON)
- `POST /api/highscores` - Saves a new high score (JSON body: `{name, score}`)

## Performance Targets
- 60 FPS gameplay
- Frame-based movement timing (Kiro: 8 frames, Ghosts: 12-24 frames)
