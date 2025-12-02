require 'sinatra'
require 'sinatra/json'
require 'json'

set :public_folder, 'public'

# In-memory game history (stores all game sessions)
GAME_HISTORY = []

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

# Get game history (all sessions sorted by score descending)
get '/api/history' do
  sorted_history = GAME_HISTORY.sort_by { |s| -s['score'] }
  json sorted_history
end

# Get top 10 high scores
get '/api/highscores' do
  json GAME_HISTORY.sort_by { |s| -s['score'] }.take(10)
end

# Save a new game session
post '/api/highscores' do
  data = JSON.parse(request.body.read)
  
  # Validate score is a non-negative integer
  score = data['score']
  
  # Check if score is valid
  unless score.is_a?(Integer) || (score.is_a?(String) && score.match?(/^\d+$/))
    halt 400, json({ success: false, error: 'Score must be a non-negative integer' })
  end
  
  score_int = score.to_i
  
  if score_int < 0
    halt 400, json({ success: false, error: 'Score must be a non-negative integer' })
  end
  
  # Get current high score
  current_high_score = GAME_HISTORY.empty? ? 0 : GAME_HISTORY.max_by { |s| s['score'] }['score']
  is_new_high_score = score_int > current_high_score
  
  # Store game session
  game_session = {
    'name' => data['name'] || 'Anonymous',
    'score' => score_int,
    'timestamp' => Time.now.to_i,
    'isHighScore' => is_new_high_score
  }
  
  GAME_HISTORY << game_session
  
  json success: true, isNewHighScore: is_new_high_score
end
