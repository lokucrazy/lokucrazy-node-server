#! /usr/bin/env node
const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
const flags = [
  ['PORT', '--PORT', '-p'],
  ['PATH', '--PATH', '-pa'],
]

const args = {
  PORT: '8080',
  PATH: './dist',
}

const mimeTypes = [
  ['.html', 'text/html'],
  ['.css', 'text/css'],
  ['.js', 'text/javascript'],
]

process.argv.slice(2).forEach((arg) => {
  flags.forEach((flag) => {
    const matchArr = arg.match(`^(${flag[1]}|${flag[2]})[=](.+)$`)
    if (matchArr && matchArr.length === 3) {
      args[flag[0]] = matchArr[2]
    }
  })
})

const findMimeType = (url) => {
  let foundType = 'text/plain'
  mimeTypes.forEach((type) => {
    if (url.endsWith(type[0])) {
      foundType = type[1]
    }
  })
  return foundType
}

const processPath = (filePath) => path.normalize(filePath.replace(/^~/, os.homedir()))

console.log(`Listening on localhost:${args.PORT}`)
http.createServer((request, response) => {
  console.log(request.url)
  if (request.url === '/') {
    request.url = '/index.html'
  }
  if (!request.url.match(/\/[a-zA-Z]+\.[a-z]+$/)) {
    request.url += '.js'
  }
  
  fs.readFile(`${processPath(args.PATH)}${request.url}`, (err, data) => {
    if (err) {
      console.log(err)
      response.writeHeader(404, {
          'Content-Type': 'text/plain'
      })
      response.write('404 Not Found')
      response.end()
      return
    }

    response.writeHeader(200, {
      'Content-Type': findMimeType(request.url)
    })
    response.write(data)
    response.end()
  })
}).listen(Number(args.PORT))