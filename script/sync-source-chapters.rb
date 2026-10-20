#!/usr/bin/env ruby
# frozen_string_literal: true

# Refreshes the chapter manifest of the source site and reports which chapters
# are still missing from this repository.
#
# Usage: ruby script/sync-source-chapters.rb [SLUG]
#
# Only the chapter list (number, title, release date, URL) is downloaded - the
# chapter text itself is not fetched, it is behind the source site's human
# verification and is copied by the translator when needed.

require "json"
require "net/http"
require "uri"
require "yaml"

ROOT = File.expand_path("..", __dir__)
CONFIG = YAML.load_file(File.join(ROOT, "_config.yml"))

novels = CONFIG["novels"] or abort "no novels configured in _config.yml"
slug = ARGV[0] || novels.keys.first
meta = novels[slug] or abort "unknown novel: #{slug}"
source = meta["source"] or abort "no source url for #{slug}"

api_url = source.sub(%r{/series/}, "/api/new/v2/series/") + "/chapters"

puts "Fetching #{api_url}"
uri = URI.parse(api_url)
response = Net::HTTP.start(uri.host, uri.port, use_ssl: true) do |http|
  http.request(Net::HTTP::Get.new(uri))
end
abort "request failed: #{response.code}" unless response.is_a?(Net::HTTPSuccess)

payload = JSON.parse(response.body)
chapters = payload.is_a?(Array) ? payload : (payload["chapters"] || payload["data"])
abort "unexpected payload" unless chapters.is_a?(Array)

manifest = chapters.map do |chapter|
  {
    "number" => chapter["number"],
    "title" => chapter["title"],
    "released_at" => chapter["created_at"],
    "url" => "#{source}/#{chapter["number"]}"
  }
end.sort_by { |chapter| chapter["number"] }

manifest_path = File.join(ROOT, "chapter", slug, "source-chapters.json")
File.write(manifest_path, JSON.pretty_generate(manifest) + "\n")

published = Dir.glob(File.join(ROOT, "_#{slug}", "*.md")).map do |file|
  File.basename(file)[/chapter-(\d+)/, 1].to_i
end
tracked = Dir.glob(File.join(ROOT, "chapter", slug, "{done,undone}", "*.txt")).map do |file|
  File.basename(file, ".txt").to_i
end

source_numbers = manifest.map { |chapter| chapter["number"] }
missing = source_numbers - published - tracked
pending = source_numbers - published

missing_path = File.join(ROOT, "chapter", slug, "missing-chapters.md")
File.write(missing_path, <<~MARKDOWN)
  # Chapter yang belum ada di repo ini

  Dibuat otomatis oleh `script/sync-source-chapters.rb` pada #{Time.now.utc.strftime("%Y-%m-%d")}.
  Sumber: #{source}

  #{missing.size} chapter belum punya file sumber di `chapter/#{slug}/done` maupun
  `chapter/#{slug}/undone`. Ambil teks sumbernya dari URL di bawah, lalu simpan sebagai
  `chapter/#{slug}/undone/<nomor>.txt` untuk diterjemahkan.

  | # | Judul | Rilis | URL |
  | --- | --- | --- | --- |
  #{missing.map { |number| chapter = manifest.find { |item| item["number"] == number }; "| #{number} | #{chapter["title"]} | #{chapter["released_at"]&.slice(0, 10)} | #{chapter["url"]} |" }.join("\n")}
MARKDOWN

puts
puts "Source site       : #{source}"
puts "Source chapters   : #{source_numbers.size} (nomor #{source_numbers.min}..#{source_numbers.max})"
puts "Published here    : #{published.size} (chapter #{published.min}..#{published.max})"
puts "In tracker        : #{tracked.size} file sumber"
puts "Missing entirely  : #{missing.size} (chapter #{missing.min}..#{missing.max})" if missing.any?
puts "Not published yet : #{pending.size}"
puts "Manifest written  : #{manifest_path.sub("#{ROOT}/", "")}"
puts "Work list written : #{missing_path.sub("#{ROOT}/", "")}"
