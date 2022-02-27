module Event
  def sendEvent(eventName, metadata)
    wilcoId = ENV['WILCO_ID'] || File.read(Rails.root.join("../.wilco"))
    conn = Faraday.new(
      url: "https://wilco-engine.herokuapp.com/users/#{wilcoId}/",
      headers: {'Content-Type' => 'application/json'}
    )

    response = conn.post('event') do |req|
      req.headers['Content-Type'] = 'application/json'
      req.body = { event: eventName, metadata: metadata}.to_json
    end
  response
  end
end
