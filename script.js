
/**
 * Valida que se llenen todos los campos del formulario
 * @method enviarFormulario
 */
let enviarFormulario = () => {
    const nickname = document.getElementById("nickname").value;
    const mail = document.getElementById("mail").value;
    const experiencia = document.querySelector('input[name="experiencia"]:checked');
    const dificultad = document.getElementById("dificultad").value;
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("mail", mail);
    localStorage.setItem("experiencia", experiencia);
    localStorage.setItem("dificultad", dificultad);

    if (nickname == null || mail === "" || experiencia == null) {
        alert("Por favor, complete todo el formulario antes de jugar");
        document.location.reload();
        document.getElementById("nickname").value = "";
        document.getElementById("mail").value = "";
    } else {
        window.open("juego.html");
    }
}

/**
 * Funcionamiento del juego
 * @method juego
 */
let juego = () => {
    let canvas = document.getElementById("screen");
    let ctx = canvas.getContext("2d");

    const nickname = localStorage.getItem("nickname");
    const experiencia = localStorage.getItem("experiencia");
    const dificultad = localStorage.getItem("dificultad");

    let vidas = 3;
    let puntos = 0;
    let nivel = 1;

    let dx = 0.5;
    let dy = -0.5;

    let anchoPaleta;
    switch (dificultad) {
        case "Fácil":
            anchoPaleta = 75;
            break;
        case "Regular":
            anchoPaleta = 50;
            break;
        case "Difícil":
            anchoPaleta = 25;
            break;
        default:
            anchoPaleta = 50;
            break;
    }

    let flechaDerecha = false;
    let flechaIzquierda = false;

    let c, f;

    const filas = 8;
    const columnas = 16;
    let cantidadLadrillos = filas * columnas;

    const margenSuperior = 5;
    const margenIzquierdo = 5;

    /* Se inicia un array de c elementos (una columna de ladrillos)
    *  Donde cada elemento es, a su vez, otro array de f elementos (las filas en la columna)
    *  Cada elemento de la fila es un objeto de clase ladrillo que tiene una posicion x,y y un estado
    *  El estado del ladrillo se define al dibujarlo más adelante.
    * */
    const ladrillos = [];
    for (c = 0; c < columnas; c++) {
        ladrillos[c] = [];
        for (f = 0; f < filas; f++) {
            ladrillos[c][f] = {
                x: 0,
                y: 0,
                estado: 1,
                ancho: 16,
                altura: 6,
                separacion: 2,
            };
        }
    }


    /**
     * Capta el 'KeyboardEvent' y compara para saber si se están apretando las flechas
     * @method listener
     */
    document.addEventListener(
        "keydown",
        (evento) => {
            if (evento.key === "ArrowRight") {
                flechaDerecha = true;
            } else if (evento.key === "ArrowLeft") {
                flechaIzquierda = true;
            }
        },
        false
    );

    /**
     * Capta el 'KeyboardEvent' y compara para saber si se dejaron de apretar las flechas
     * @method listener
     */
    document.addEventListener(
        "keyup",
        (evento) => {
            if (evento.key === "ArrowRight") {
                flechaDerecha = false;
            } else if (evento.key === "ArrowLeft") {
                flechaIzquierda = false;
            }
        },
        false
    );


    let Paleta = {
        x: canvas.width / 2,
        y: canvas.height - (canvas.height / 8),
        ancho: anchoPaleta,
        altura: 2,
        /**
         * Dibuja la paleta
         * @method Paleta.dibujar
         */
        dibujar: function () {
            ctx.beginPath();
            ctx.rect(this.x - this.ancho / 2, this.y, this.ancho, this.altura);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.closePath();
        },
        /**
         * Mueve la paleta. Se verifica el estado de las flechas y se actualiza la posicion para el siguiente cuadro
         * @method Paleta.mover
         */
        mover: function () {
            if (flechaDerecha === true && this.x < canvas.width - this.ancho / 2) {
                this.x += 2;
            }
            if (flechaIzquierda === true && this.x > this.ancho / 2) {
                this.x -= 2;
            }
        }
    }

    let Pelota = {
        x: Paleta.x,
        y: Paleta.y - 4,
        radio: 2,
        /**
         * Dibuja la pelota
         * @method Pelota.dibujar
         */
        dibujar: function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.closePath();
        },

        /**
         * Calcula la posicion de la pelota en el siguiente cuadro. Si se sobrepone con un elemento, se cambia la direccion
         * @method Pelota.rebotar
         */
        rebotar: function () {
            if (this.x + dx > canvas.width - this.radio || this.x + dx < this.radio) {
                dx *= -1;
            }
            if (this.y + dy < this.radio) {
                dy *= -1;
            } else if (this.y + dy > canvas.height - this.radio) {
                vidas -= 1;
                resetPos();
            }
            if (this.y + dy*2 === Paleta.y && (this.x + dx > Paleta.x - Paleta.ancho / 2 && this.x + dx < Paleta.x + Paleta.ancho / 2)) {
                dy *= -1;
            }
        },
        mover: function () {
            this.x += dx;
            this.y += dy;
        },
    }

    /**
     * Resetea la posición de la pelota y la paleta a la inicial.
     * @method resetPos
     */
    let resetPos = () => {
        Paleta.x = canvas.width / 2;
        Paleta.y = canvas.height - (canvas.height / 8);
        Pelota.x = Paleta.x;
        Pelota.y = Paleta.y - 4;
        dx = 0.5;
        dy = -0.5;
    }

    /**
     * Dibuja los ladrillos en el canvas
     * @method dibujarLadrillos
     */
    let dibujarLadrillos = () => {
        for (c = 0; c < columnas; c++) {
            for (f = 0; f < filas; f++) {
                let ladrillo = ladrillos[c][f];
                if (ladrillo.estado === 1) {
                    let posx = (c * (ladrillo.ancho + ladrillo.separacion)) + margenIzquierdo;
                    let posy = (f * (ladrillo.altura + ladrillo.separacion)) + margenSuperior;
                    ladrillos[c][f].x = posx;
                    ladrillos[c][f].y = posy;
                    ctx.beginPath();
                    ctx.rect(posx, posy, ladrillo.ancho, ladrillo.altura);
                    switch (f) {
                        case 0:
                            ctx.fillStyle = "#ab6553";
                            break;
                        case 1:
                            ctx.fillStyle = "#d225a3";
                            break;
                        case 2:
                            ctx.fillStyle = "#e70648";
                            break;
                        case 3:
                            ctx.fillStyle = "#ff0000";
                            break;
                        case 4:
                            ctx.fillStyle = "#ff3900";
                            break;
                        case 5:
                            ctx.fillStyle = "#e5e527";
                            break;
                        case 6:
                            ctx.fillStyle = "#33ff04";
                            break;
                        case 7:
                            ctx.fillStyle = "#180ef3";
                            break;
                        case 8:
                            ctx.fillStyle = "#9704bb";
                            break;
                        case 9:
                            ctx.fillStyle = "#00ffff";
                            break;
                    }
                    ctx.fill();
                }
            }
        }
    }

    /**
     * Detecta las colisiones de la pelota (con los ladrillos)
     * @method detectarColision
     */
    let detectarColision = () => {
        for (c = 0; c < columnas; c++) {
            for (f = 0; f < filas; f++) {
                let ladrillo = ladrillos[c][f];
                if (ladrillo.estado === 1) {
                    if (Pelota.x + Pelota.radio + dx >= ladrillo.x && Pelota.x + Pelota.radio + dx <= ladrillo.x + ladrillo.ancho && Pelota.y + Pelota.radio + dy >= ladrillo.y && Pelota.y + Pelota.radio + dy <= ladrillo.y + ladrillo.altura) {
                        if(Pelota.x + Pelota.radio < ladrillo.x || Pelota.x + Pelota.radio > ladrillo.x + ladrillo.ancho){
                            dx *= -1;
                            ladrillo.estado = 0;
                            puntos += 1;
                            cantidadLadrillos -= 1;
                        }else if(Pelota.y + Pelota.radio < ladrillo.y || Pelota.y + Pelota.radio > ladrillo.y + ladrillo.altura){
                            dy *= -1;
                            ladrillo.estado = 0;
                            puntos += 1;
                            cantidadLadrillos -= 1;
                        }
                    }
                }
            }
        }
    }


    /**
     * Muestra el status del jugador en la partida (puntos, vidas, nivel)
     * @method status
     */
    let status = () => {
        if (puntos >= 100) {
            document.getElementById("puntos").textContent = puntos;
        } else if (puntos >= 10) {
            document.getElementById("puntos").textContent = "0" + puntos;
        } else {
            document.getElementById("puntos").textContent = "00" + puntos;
        }
        document.getElementById("vidas").textContent = "00" + vidas;
        if (nivel >= 100) {
            document.getElementById("nivel").textContent = nivel;
        } else if (nivel >= 10) {
            document.getElementById("nivel").textContent = "0" + nivel;
        } else {
            document.getElementById("nivel").textContent = "00" + nivel;
        }
    }

    /**
     * Dibuja mensaje game over en el canvas al perder.
     * @method gameOver
     */
    let gameOver = () => {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#ff0000"
        ctx.fillText("GAME OVER", canvas.width / 2 - 60, canvas.height / 2);

        let mensaje;
        if (experiencia === "novato") {
            mensaje = "Felicitaciones, " + nickname + ", hiciste " + puntos + " puntos. Nada mal para un principiante!";
        } else {
            mensaje = "Felicitaciones, " + nickname + ", hiciste " + puntos + " puntos. Sigue así, siempre se puede hacer mejor!";
        }

        alert(mensaje);
        mostrarBoton();
    }

    /**
     * Verifica que se hayan destruido todos los bloques y carga un nuevo nivel
     * @method avanzarNivel
     */
    let avanzarNivel = () => {
        puntos += 40;
        nivel += 1;
        resetPos();
        for (c = 0; c < columnas; c++) {
            for (f = 0; f < filas; f++) {
                ladrillos[c][f].estado = 1;
            }
        }
    }

    /**
     * Puesta en marcha del juego. Dibuja todos los elementos.
     * @method jugar
     */
    let jugar = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (cantidadLadrillos === 0) {
            avanzarNivel();
            cantidadLadrillos = columnas * filas;
        }
        if (vidas === 0) {
            gameOver();
            cancelAnimationFrame();
        }else{
            Pelota.dibujar();
            Paleta.dibujar();
            dibujarLadrillos()
            Pelota.rebotar();
            detectarColision();
            Pelota.mover();
            Paleta.mover();
            status();
            requestAnimationFrame(jugar);
        }
    }

    requestAnimationFrame(jugar);

}


/**
 * Muestra el boton de iniciar el juego
 * @method mostrarBoton
 */
let mostrarBoton = () => {
    document.getElementById("iniciar").style.display = 'block';
}

/**
 * Oculta el boton de iniciar el juego
 * @method ocultarBoton
 */
let ocultarBoton = () => {
    document.getElementById("iniciar").style.display = 'none';
}


