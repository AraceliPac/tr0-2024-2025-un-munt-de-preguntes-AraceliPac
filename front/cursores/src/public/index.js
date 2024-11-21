function init() {
    // console.log("funcionando!")
    let mouse = {
        click: false,
        move: false,
        pos: { x: 0, y: 0 },
        pos_prev: false
    }
    //canvas
    const canvas = document.getElementById('drawing')
    const context = canvas.getContext('2d')
    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width
    canvas.height = height

    const socket = io() //con per enviar i recibir dades, enviar posiciones

    canvas.addEventListener('mousedown', (e) => {
        mouse.click = true
    })
    canvas.addEventListener('mouseup', (e) => {
        mouse.click = false;
        // console.log(mouse)
    })
    canvas.addEventListener('mousemove', (e) => {
        //event es igual a la posicion x del user / width posicion relativa al tam de pantalla
        mouse.pos.x = e.clientX / width
        mouse.pos.y = e.clientY / height
        mouse.move = true
        // console.log(mouse)
    })
    socket.on('draw_line', data => {
        const line = data.line
        //dibu amb les coordenades
        context.beginPath()
        context.lineWith = 2
        context.moveTo(line[0].x * width, line[0].y * height)
        context.lineTo(line[1].x * width, line[1].y * height)
        context.stroke()
    })
    //la primera ejecu no te res porque no te previ la segona si
    //si user esta intentant dibuixar -> recursividad se ejectua para comprobar que hace user
    function mainLoop() { //bucle principal
        if (mouse.click && mouse.move && mouse.pos_prev) {
            //revisar a cada moment, client emite dades quan dibuixa diem abans i despres position
            //IMPORTANT es te que dir igual draw_line en socket.js socket.on
            socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev] })
            mouse.move = false
        }
        //servidor pot escoltar aixo
        mouse.pos_prev = {
            x: mouse.pos.x,
            y: mouse.pos.y
        }
        setTimeout(mainLoop, 25) //repetir cada 25 segundos
    }
    mainLoop()
}
document.addEventListener('DOMContentLoaded', init)