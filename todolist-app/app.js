const http = require('http')
const url = require('url')
const fs= require('fs')
const qs = require('querystring')

const hostname = '127.0.0.1'
const port = 3000

function generateErrorPage(code, msg) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
        <title>Error ${code}</title>
    </head>
    <body>
        <main class="container min-vh-100">
            <div class="d-flex flex-column min-vh-100 row mx-auto align-items-center justify-content-center gap-5">
                <h1 class="text-center">Error ${code}: ${msg}/h1>
            </div>const { url } = require('inspector')
        </main>
    </body>
    </html>
    `
}

function generateTodoItems(todo) {
    let generatedTodoItems = ''
    if (todo && todo.length > 0) {
        todo.forEach((task, index) => {
            const taskTemplate = `
            <div class="d-flex border p-4 text-left w-100 align-items-center">
                <div class="flex-fill">
                    <h4>${task.title}</h4>
                    <p><small>Created: ${task.date}</small></p>
                    ${task.description ? '<p>'+task.description+'</p>' : ''}
                </div>
                <div>
                    <button type="button" class="btn btn-outline-danger" onclick="deleteTask(${index})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"></path>
                        </svg>
                    </button>
                </div>
            </div>`
            generatedTodoItems = generatedTodoItems + taskTemplate
        })
        return generatedTodoItems
    } else {
        return `<h3>No Tasks yet</h3>`
    }
}

function homePage(todo) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
        <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
        <title>To Do List App</title>
    </head>
    <body>
        <main class="container min-vh-100">
            <div class="d-flex flex-column min-vh-100 row mx-auto align-items-center justify-content-center gap-5">
                <h1 class="text-center">To Do List App</h1>
                <form action="" method="POST" class="min-vw-75 d-flex flex-column flex-md-row align-items-center justify-content-center gap-2">
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">Task</span>
                        <input type="text" name="title" id="title" placeholder="Buy Apples" class="form-control"/>
                    </div>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">Description</span>
                        <input type="text" name="description" id="description" placeholder="Buy 10 Apples" class="form-control"/>
                    </div>
                    <input type="submit" value="Add Task" class="d-flex d-md-none btn btn-outline-secondary w-100"/>
                    <input type="submit" value="Add Task" class="d-none d-md-flex btn btn-outline-secondary"/>
                </form>
                <div class="d-flex flex-column flex-md-row mx-auto align-items-center justify-content-center gap-5 min-vw-75">
                    ${generateTodoItems(todo)}
                </div>
            </div>
        </main>
        <script>
            function deleteTask(id) {
                $.ajax({
                    type: "DELETE",
                    url: "?index="+id,
                    success: function(msg){
                        window.location.replace("http://${hostname}:${port}")
                    }
                })
            }
        </script>
    </body>
    </html>`
}

let todo = []

const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    const urlparse = url.parse(req.url, true)

    if (req.method === 'GET') {
        res.end(homePage(todo))

    } else if (req.method === 'POST'){
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            const data = qs.parse(body)
            const now = new Date()
            const date = now.getDate()+ '/' +((now.getMonth() + 1) < 10 ? '0'+(now.getMonth() + 1) : (now.getMonth() + 1)) +'/'+ now.getFullYear() + ' (' + (now.getHours() < 10 ? '0'+now.getHours() : now.getHours()) + ':' + (now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes()) + ')';
            data.date = date
            todo.push(data)
            console.log(todo)
            res.end(homePage(todo))
        })
    } else if (req.method === "DELETE") {
        const search = urlparse.search
        if (search) {
            const [, query] = urlparse.search.split('?')
            const data = qs.parse(query)
            todo.splice(data.index, 1)
            res.end('Success')
        }
    } else {
        req.end(generateErrorPage('501', 'Unsupported method type'))
        console.log('unsupported method type :(')
    }
})


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})