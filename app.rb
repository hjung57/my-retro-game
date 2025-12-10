require 'sinatra'
require 'sinatra/json'
require 'json'
require 'sequel'

set :public_folder, 'public'

# Database setup
DB = if ENV['DATABASE_URL']
  # Production: Use Render's PostgreSQL
  Sequel.connect(ENV['DATABASE_URL'])
else
  # Development: Use SQLite
  Sequel.sqlite('game_scores.db')
end

# Create high_scores table if it doesn't exist
DB.create_table? :high_scores do
  primary_key :id
  String :name, null: false
  Integer :score, null: false
  Integer :timestamp, null: false
  String :game_type, default: 'pac-gator' # Default to pac-gator for backwards compatibility
  index :score
  index :timestamp
  index :game_type
end

# Migration: Add game_type column if it doesn't exist
unless DB[:high_scores].columns.include?(:game_type)
  DB.alter_table :high_scores do
    add_column :game_type, String, default: 'pac-gator'
  end
  
  # Add index for game_type
  DB.add_index :high_scores, :game_type
  
  puts "✓ Added game_type column to high_scores table"
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

get '/pac-gator' do
  send_file File.join(settings.public_folder, 'pac-gator', 'pac-gator.html')
end

get '/flappy-gator' do
  send_file File.join(settings.public_folder, 'flappy-gator', 'flappy-gator.html')
end

# Get game history (all sessions sorted by score descending)
get '/api/history' do
  history = DB[:high_scores]
    .order(Sequel.desc(:timestamp))
    .limit(20)
    .all
  json history
end

# Get top 10 high scores (optionally filtered by game type)
get '/api/highscores' do
  game_type = params['game_type']
  
  query = DB[:high_scores]
  
  # Filter by game type if provided
  if game_type && !game_type.empty?
    query = query.where(game_type: game_type)
  end
  
  scores = query
    .order(Sequel.desc(:score))
    .limit(10)
    .all
  json scores
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
  
  # Get game type, default to 'pac-gator' for backwards compatibility
  game_type = data['game_type'] || 'pac-gator'
  
  # Insert into database and get the ID
  score_id = DB[:high_scores].insert(
    name: data['name'] || 'Player',
    score: score_int,
    timestamp: Time.now.to_i,
    game_type: game_type
  )
  
  # Check if it's a new high score for this game type
  top_score = DB[:high_scores]
    .where(game_type: game_type)
    .order(Sequel.desc(:score))
    .first
  is_new_high_score = top_score && score_int >= top_score[:score]
  
  json success: true, isNewHighScore: is_new_high_score, id: score_id
end

# Update player name for an existing score
put '/api/highscores/:id' do
  data = JSON.parse(request.body.read)
  score_id = params['id'].to_i
  
  # Find the score entry
  score_entry = DB[:high_scores].where(id: score_id).first
  
  unless score_entry
    halt 404, json({ success: false, error: 'Score not found' })
  end
  
  # Update only the name
  new_name = data['name'] || 'Player'
  DB[:high_scores].where(id: score_id).update(name: new_name)
  
  json success: true
end
