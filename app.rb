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
  index :score
  index :timestamp
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

# Get game history (all sessions sorted by score descending)
get '/api/history' do
  history = DB[:high_scores]
    .order(Sequel.desc(:timestamp))
    .limit(20)
    .all
  json history
end

# Get top 10 high scores
get '/api/highscores' do
  scores = DB[:high_scores]
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
  
  # Insert into database
  DB[:high_scores].insert(
    name: data['name'] || 'Player',
    score: score_int,
    timestamp: Time.now.to_i
  )
  
  # Check if it's a new high score
  top_score = DB[:high_scores].order(Sequel.desc(:score)).first
  is_new_high_score = top_score && score_int >= top_score[:score]
  
  json success: true, isNewHighScore: is_new_high_score
end
