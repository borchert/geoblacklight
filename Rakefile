begin
  require 'bundler/gem_tasks'
  require 'bundler/setup'
rescue LoadError
  puts 'You must `gem install bundler` and `bundle install` to run rake tasks'
end

BLACKLIGHT_JETTY_VERSION = '4.10.2'
ZIP_URL = "https://github.com/projectblacklight/blacklight-jetty/archive/v#{BLACKLIGHT_JETTY_VERSION}.zip"
APP_ROOT = File.dirname(__FILE__)


require 'rspec/core/rake_task'
require 'engine_cart/rake_task'
require 'jettywrapper'


task default: :ci

RSpec::Core::RakeTask.new(:spec)

desc "Load fixtures"
task :fixtures => ['engine_cart:generate'] do
  EngineCart.within_test_app do
    system "rake geoblacklight:solr:seed RAILS_ENV=test"
    system 'rake geoblacklight:downloads:mkdir'
  end
end

desc "Execute Continuous Integration build"
task :ci => ['engine_cart:generate', 'jetty:clean', 'geoblacklight:configure_jetty'] do
  ENV['environment'] = "test"
  jetty_params = Jettywrapper.load_config
  jetty_params[:startup_wait]= 60

  Jettywrapper.wrap(jetty_params) do
    Rake::Task["fixtures"].invoke

    # run the tests
    Rake::Task["spec"].invoke
  end
end


namespace :geoblacklight do
  desc "Copies the default SOLR config for the bundled Testing Server"
  task :configure_jetty do
    system 'curl -o jetty/solr/blacklight-core/conf/schema.xml https://raw.githubusercontent.com/geoblacklight/geoblacklight-schema/master/conf/schema.xml'
    system 'curl -o jetty/solr/blacklight-core/conf/solrconfig.xml https://raw.githubusercontent.com/geoblacklight/geoblacklight-schema/master/conf/solrconfig.xml'
  end
end
