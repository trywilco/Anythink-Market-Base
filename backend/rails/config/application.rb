require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

CODESPACE_HOST = ENV['GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN']

module AnythinkMarket
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.2
    config.api_only = true

     # Allowed hosts
    config.hosts << ".anythink.market"
    config.hosts << ".#{CODESPACE_HOST}" if CODESPACE_HOST.present?

    config.to_prepare do
      DeviseController.respond_to :html, :json
    end
  end
end
