//quan un user es conecti 
module.exports = (io) => {
    //client me envia arrays
    let line_history = []
    io.on('connection', socket => {
        console.log('new user connected')
        //escoltar les conexions i daddes (moviment ratoli)
        //recorrer el historial de dibus 
        for(let index in line_history){
            //quan un user nou es conn empezara a enviar dades. Enviar aqui const line = data.line
            socket.emit('draw_line', {
                line: line_history[index]
            })
        }
        
        socket.on('draw_line', data => {
            console.log(data)
            //enviar dades a la resta clients, recorda que es array posar push
            line_history.push(data.line) //objecte propietat line
            //serviddor emit event amb mateix nom , reenviar dades
            io.emit('draw_line', data)
        })
    })
}