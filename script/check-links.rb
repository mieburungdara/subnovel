#!/usr/bin/env ruby
# frozen_string_literal: true

# Verifies that every internal link of the generated site points to a file that
# actually exists in the build output.
#
# Usage: ruby script/check-links.rb BUILD_DIR [BASEURL]
# The baseurl defaults to the value configured in _config.yml.

require "yaml"

site_dir = ARGV[0] or abort("usage: check-links.rb BUILD_DIR [BASEURL]")
config_path = File.expand_path("../_config.yml", __dir__)
config = File.file?(config_path) ? YAML.load_file(config_path) : {}
baseurl = (ARGV[1] || config["baseurl"]).to_s.chomp("/")

abort("build directory not found: #{site_dir}") unless File.directory?(site_dir)

missing = []
checked = 0

Dir.glob(File.join(site_dir, "**", "*.html")).sort.each do |file|
  html = File.read(file)

  html.scan(/(?:href|src)="([^"]+)"/).flatten.each do |link|
    next if link.empty? || link.start_with?("#", "mailto:", "tel:", "data:", "//")
    next if link.start_with?("http://", "https://")

    path = link.split("#").first.to_s.split("?").first.to_s
    next if path.empty?

    path = path.sub(%r{\A#{Regexp.escape(baseurl)}(?=/|\z)}, "") unless baseurl.empty?
    path = path.sub(%r{\A/}, "")

    checked += 1

    candidates = [
      File.join(site_dir, path),
      File.join(site_dir, "#{path}.html"),
      File.join(site_dir, path, "index.html")
    ]

    missing << [file.delete_prefix("#{site_dir}/"), link] unless candidates.any? { |c| File.file?(c) }
  end
end

if missing.empty?
  puts "OK: #{checked} internal links resolve to generated files."
  exit 0
end

puts "Broken internal links (#{missing.size}):"
missing.first(50).each { |page, link| puts "  #{page} -> #{link}" }
puts "  ... and #{missing.size - 50} more" if missing.size > 50
exit 1
