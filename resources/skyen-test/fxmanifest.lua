fx_version 'adamant'
games { 'gta5' }

client_script {
    'client.js',
    'dist/index.js'
}

server_script {
    'server.js',
    '@mysql-async/lib/MySQL.lua',
    'server.lua'
}

files {
    'ui/index.html'
}

ui_page 'ui/index.html'

dependency 'webpack'
dependency 'yarn'

webpack_config 'client.config.js'