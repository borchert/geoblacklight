begin
  require 'bundler/gem_tasks'
  require 'bundler/setup'
rescue LoadError
  puts 'You must `gem install bundler` and `bundle install` to run rake tasks'
end

BLACKLIGHT_JETTY_VERSION = '4.10.3'
ZIP_URL = "https://github.com/projectblacklight/blacklight-jetty/archive/v#{BLACKLIGHT_JETTY_VERSION}.zip"
APP_ROOT = File.dirname(__FILE__)

require 'rspec/core/rake_task'
require 'engine_cart/rake_task'
require 'jettywrapper'

Dir.glob('lib/tasks/configure_solr.rake').each { |r| load r}

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
task :ci do
  if Rails.env.test?
    Rake::Task['engine_cart:generate'].invoke
    Rake::Task['jetty:clean'].invoke
    Rake::Task['geoblacklight:configure_solr'].invoke
    ENV['environment'] = "test"
    jetty_params = Jettywrapper.load_config
    jetty_params[:startup_wait]= 60

    Jettywrapper.wrap(jetty_params) do
      Rake::Task["fixtures"].invoke

      # run the tests
      Rake::Task["spec"].invoke
    end
  else
    system('rake ci RAILS_ENV=test')
  end
end
