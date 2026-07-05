const imagenes = [
    "../assets/img/gato/a.png",
    "../assets/img/gato/b.png",
    "../assets/img/gato/c.png",
    "../assets/img/gato/d.png",
    "../assets/img/gato/e.png",
    "../assets/img/gato/f.png"
];

function obtenerImagenesAleatorias() {

    const copia = [...imagenes];

    copia.sort(() => Math.random() - 0.5);

    return {

        X: copia[0],
        O: copia[1]

    };

}

const jugadores = obtenerImagenesAleatorias();

const casillas = document.querySelectorAll(".casilla");
const turnoTexto = document.getElementById("turno");

let tablero = ["","","","","","","","",""];

let turno = "X";

let jugando = true;

const ganar = [

[0,1,2],
[3,4,5],
[6,7,8],

[0,3,6],
[1,4,7],
[2,5,8],

[0,4,8],
[2,4,6]

];

turnoTexto.innerHTML = `
<img src="${jugadores.X}" class="turnoImg">
`;

casillas.forEach(casilla=>{
    casilla.addEventListener("click",clickCasilla);
});

function clickCasilla(){
    const indice=this.dataset.index;
    if(tablero[indice]!=="" || !jugando) return;
    tablero[indice]=turno;

    const img=document.createElement("img");

    img.src=jugadores[turno];
    img.classList.add("ficha");

    this.appendChild(img);

    if(revisarGanador()){
        mostrarGanador(turno);
        return;
    }

    if(!tablero.includes("")){

        jugando=false;
        document
        .getElementById("modalEmpate")
        .classList.remove("oculto");
        return;
    }

    turno=(turno==="X")?"O":"X";

    turnoTexto.innerHTML=`
    <img src="${jugadores[turno]}" class="turnoImg">
    `;
}

function revisarGanador(){

    for(let combo of ganar){

        const[a,b,c]=combo;

        if(

            tablero[a]!=="" &&
            tablero[a]===tablero[b] &&
            tablero[a]===tablero[c]
        ){
            return true;
        }
    }
    return false;
}

function mostrarGanador(ganador){
    jugando=false;
    document.getElementById("imagenGanadora").src=jugadores[ganador];
    document
    .getElementById("modalGanador")
    .classList.remove("oculto");

    confetti({

        particleCount:180,
        spread:120,
        origin:{y:.6}
    });
}

document.getElementById("jugarOtra").onclick=()=>{
    location.reload();
}

document.getElementById("jugarOtraEmpate").onclick=()=>{
    location.reload();
}