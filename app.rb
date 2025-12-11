require 'sinatra'
require 'sinatra/json'
require 'json'
require 'sequel'

set :public_folder, 'public'

# Database setup
DB = if ENV['RACK_ENV'] == 'production'
  # Production: Use SQLite with production database name
  Sequel.sqlite('game_scores_production.db')
else
  # Development: Use SQLite with development database name
  Sequel.sqlite('game_scores_development.db')
end

# Create high_scores table if it doesn't exist
DB.create_table? :high_scores do
  primary_key :id
  String :name, null: false
  Integer :score, null: false
  Integer :timestamp, null: false
  String :game_type, null: false # Required field - no default
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

# Migration: Remove default value from game_type and make it required
# Check if game_type column has a default value or allows NULL
column_info = DB.schema(:high_scores).find { |col| col[0] == :game_type }
has_default = column_info && column_info[1][:default]
allows_null = column_info && column_info[1][:allow_null] != false

if has_default || allows_null
  puts "🔄 Migrating game_type column to remove default and make required..."
  
  # First, update any NULL game_type values (shouldn't be any, but just in case)
  null_count = DB[:high_scores].where(game_type: nil).count
  if null_count > 0
    puts "⚠️  Found #{null_count} records with NULL game_type, setting to 'pac-gator'"
    DB[:high_scores].where(game_type: nil).update(game_type: 'pac-gator')
  end
  
  # Update any empty string game_type values
  empty_count = DB[:high_scores].where(game_type: '').count
  if empty_count > 0
    puts "⚠️  Found #{empty_count} records with empty game_type, setting to 'pac-gator'"
    DB[:high_scores].where(game_type: '').update(game_type: 'pac-gator')
  end
  
  # SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
  # Create a backup table
  DB.create_table :high_scores_backup do
    primary_key :id
    String :name, null: false
    Integer :score, null: false
    Integer :timestamp, null: false
    String :game_type, null: false # No default, required
    index :score
    index :timestamp
    index :game_type
  end
  
  # Copy data to backup table
  DB[:high_scores_backup].insert(DB[:high_scores].select(:id, :name, :score, :timestamp, :game_type))
  
  # Drop original table
  DB.drop_table :high_scores
  
  # Rename backup table
  DB.rename_table :high_scores_backup, :high_scores
  
  puts "✓ Successfully migrated game_type column: removed default, made required"
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
  
  # Validate game type is provided and valid
  game_type = data['game_type']
  if game_type.nil? || game_type.empty?
    halt 400, json({ success: false, error: 'game_type is required' })
  end
  
  # Validate game type is one of the supported games
  valid_game_types = ['pac-gator', 'flappy-gator']
  unless valid_game_types.include?(game_type)
    halt 400, json({ success: false, error: "game_type must be one of: #{valid_game_types.join(', ')}" })
  end
  
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

# Test endpoint to verify deployment
get '/api/test-deployment' do
  json({ status: "deployed", rack_env: ENV['RACK_ENV'], timestamp: Time.now.to_i })
end

# GET version of reset for easier testing
get '/api/reset-flappy-scores-preview' do
  flappy_scores = DB[:high_scores].where(game_type: 'flappy-gator')
  count = flappy_scores.count
  high_score = count > 0 ? flappy_scores.max(:score) : 0
  avg_score = count > 0 ? flappy_scores.avg(:score).round(1) : 0
  
  json({ 
    message: "Preview - would delete #{count} scores",
    rack_env: ENV['RACK_ENV'],
    current_stats: {
      high_score: high_score,
      games_played: count,
      average_score: avg_score
    }
  })
end

# Temporary endpoint to reset flappy-gator scores (REMOVE AFTER USE)
delete '/api/reset-flappy-scores' do
  # Get stats before deletion
  flappy_scores = DB[:high_scores].where(game_type: 'flappy-gator')
  count = flappy_scores.count
  high_score = count > 0 ? flappy_scores.max(:score) : 0
  avg_score = count > 0 ? flappy_scores.avg(:score).round(1) : 0
  
  # Delete all flappy-gator scores
  deleted_count = DB[:high_scores].where(game_type: 'flappy-gator').delete
  
  json({ 
    success: true, 
    message: "Reset complete",
    deleted_count: deleted_count,
    rack_env: ENV['RACK_ENV'],
    previous_stats: {
      high_score: high_score,
      games_played: count,
      average_score: avg_score
    }
  })
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
