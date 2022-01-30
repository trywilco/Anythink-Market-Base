# frozen_string_literal: true
include Faraday

class PingController < ApplicationController
  def index
    wilcoId = File.read("../.wilco")

    conn = Faraday.new(
      url: "https://wilco-engine.herokuapp.com/users/#{wilcoId}/",
      headers: {'Content-Type' => 'application/json'}
    )

    response = conn.post('event') do |req|
      req.headers['Content-Type'] = 'application/json'
      req.body = { event: 'ping'}.to_json
    end

    render json: response.body
  end

end
