require 'sinatra'
require 'sinatra/json'
require 'json'

set :public_folder, 'public'

# In-memory high scores (replace with database later if needed)
HIGH_SCORES = []

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

get '/api/highscores' do
  json HIGH_SCORES.sort_by { |s| -s['score'] }.take(10)
end

post '/api/highscores' do
  data = JSON.parse(request.body.read)
  HIGH_SCORES << {
    'name' => data['name'] || 'Anonymous',
    'score' => data['score'].to_i,
    'timestamp' => Time.now.to_i
  }
  json success: true
end
