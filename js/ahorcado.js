const PALABRAS = [
    // Fandom
    { palabra: "WALK THE LINE", categoria: "Border: Day One" },
    { palabra: "LET ME IN", categoria: "Border: Day One" },
    { palabra: "FLICKER", categoria: "Border: Day One" },
    //Español
    { palabra: "FEVER",    categoria: "BORDER : CARNIVAL" },
    { palabra: "MIXED UP",    categoria: "BORDER : CARNIVAL" },
    { palabra: "DRUNK DAZED",    categoria: "BORDER : CARNIVAL" },
    { palabra: "NOT FOR SALE",    categoria: "BORDER : CARNIVAL" },
    //Inglés
    { palabra: "WHITEOUT",   categoria: "DIMENSION : DILEMMA" },
    { palabra: "BLOCKBUSTER",     categoria: "DIMENSION : DILEMMA" },
    { palabra: "QUESTION",     categoria: "DIMENSION : DILEMMA" },

    { palabra: "WHITEOUT",     categoria: "DIMENSION : ANSWER" },
    { palabra: "POLAROID LOVE",     categoria: "DIMENSION : ANSWER" },

    { palabra: "PARADOXXX INVASION",     categoria: "MANIFESTO : DAY 1" },
    { palabra: "SHOUT OUT",     categoria: "MANIFESTO : DAY 1" },
    { palabra: "FORESHADOW",     categoria: "MANIFESTO : DAY 1" },
    { palabra: "TFW",     categoria: "MANIFESTO : DAY 1" },

    { palabra: "FATE",     categoria: "DARK BLOOD" },
    { palabra: "SACRIFICE",     categoria: "DARK BLOOD" },
    { palabra: "BILLS",     categoria: "DARK BLOOD" },
    { palabra: "KARMA",     categoria: "DARK BLOOD" },
    { palabra: "CHACONNE",     categoria: "DARK BLOOD" },
    { palabra: "BITE ME",     categoria: "DARK BLOOD" },

    { palabra: "MORTAL",     categoria: "ORANGE BLOOD" },
    { palabra: "BLIND",     categoria: "ORANGE BLOOD" },
    { palabra: "SWEET VENOM",     categoria: "ORANGE BLOOD" },
];

const PARTES = ["p1","p2","p3","p4","p5","p6","p7"];

let palabraActual   = "";
let categoriaActual = "";
let letrasAdivinadas = new Set();
let letrasErradas    = new Set();
let intentosMax      = 7;

const divPalabra       = document.getElementById("palabra");
const divTeclado       = document.getElementById("teclado");
const spanCategoria    = document.getElementById("categoria");
const pLetrasUsadas    = document.getElementById("letrasUsadas");
const modalVictoria    = document.getElementById("modalVictoria");
const modalDerrota     = document.getElementById("modalDerrota");
const palabraFinalV    = document.getElementById("palabraFinalV");
const palabraFinalD    = document.getElementById("palabraFinalD");

function elegirPalabra() {
    const i = Math.floor(Math.random() * PALABRAS.length);
    return PALABRAS[i];
}


function actualizarDibujo() {
    PARTES.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (idx < letrasErradas.size) {
            el.classList.remove("oculto");
            el.classList.add("visible");
        } else {
            el.classList.add("oculto");
            el.classList.remove("visible");
        }
    });
}

function actualizarVidas() {
    const vidasRestantes = intentosMax - letrasErradas.size;
    for (let i = 1; i <= intentosMax; i++) {
        const c = document.getElementById("corazon" + i);
        if (i > vidasRestantes) {
            c.classList.add("perdido");
        } else {
            c.classList.remove("perdido");
        }
    }
}


function renderizarPalabra() {
    divPalabra.innerHTML = "";

    for (const letra of palabraActual) {

        // Si es un espacio, crear un separador sin línea
        if (letra === " ") {
            const espacio = document.createElement("div");
            espacio.classList.add("espacio-palabra");
            divPalabra.appendChild(espacio);
            continue;
        }

        const slot = document.createElement("div");
        slot.classList.add("letra-slot");

        const char = document.createElement("div");
        char.classList.add("letra-char");

        if (letrasAdivinadas.has(letra)) {
            char.textContent = letra;
            char.classList.add("revelada");
        }

        const linea = document.createElement("div");
        linea.classList.add("letra-linea");

        slot.appendChild(char);
        slot.appendChild(linea);
        divPalabra.appendChild(slot);
    }
}

const LETRAS_ES = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function renderizarTeclado() {
    divTeclado.innerHTML = "";
    LETRAS_ES.forEach(letra => {
        const btn = document.createElement("button");
        btn.classList.add("tecla");
        btn.textContent = letra;
        btn.id = "tecla-" + letra;
        btn.addEventListener("click", () => clickLetra(letra));
        divTeclado.appendChild(btn);
    });
}

function deshabilitarTecla(letra, tipo) {
    const btn = document.getElementById("tecla-" + letra);
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add(tipo); // "correcta" o "incorrecta"
}

function actualizarLetrasUsadas() {
    const todas = [...letrasErradas].sort().join("  ");
    pLetrasUsadas.textContent = todas.length ? "Letras: " + todas : "";
}


function clickLetra(letra) {
    if (letrasAdivinadas.has(letra) || letrasErradas.has(letra)) return;

    if (palabraActual.includes(letra)) {
        letrasAdivinadas.add(letra);
        renderizarPalabra();
        deshabilitarTecla(letra, "correcta");

        // ¿Ganó?
        const gano = [...palabraActual]
    .filter(l => l !== " ")
    .every(l => letrasAdivinadas.has(l));
        if (gano) {
            setTimeout(mostrarVictoria, 500);
        }
    } else {
        letrasErradas.add(letra);
        actualizarDibujo();
        actualizarVidas();
        actualizarLetrasUsadas();
        deshabilitarTecla(letra, "incorrecta");

        if (letrasErradas.size >= intentosMax) {
            setTimeout(mostrarDerrota, 500);
        }
    }
}

function mostrarVictoria() {
    palabraFinalV.textContent = palabraActual;
    modalVictoria.classList.remove("oculto");
}

function mostrarDerrota() {
    // Revelar toda la palabra
    [...palabraActual].forEach(l => letrasAdivinadas.add(l));
    renderizarPalabra();
    palabraFinalD.textContent = palabraActual;
    modalDerrota.classList.remove("oculto");
}

function iniciarJuego() {
    letrasAdivinadas = new Set();
    letrasErradas    = new Set();

    modalVictoria.classList.add("oculto");
    modalDerrota.classList.add("oculto");

    const entrada = elegirPalabra();
    palabraActual   = entrada.palabra;
    categoriaActual = entrada.categoria;

    spanCategoria.textContent = "Categoría: " + categoriaActual;

    actualizarDibujo();
    actualizarVidas();
    renderizarPalabra();
    renderizarTeclado();
    actualizarLetrasUsadas();
}

document.getElementById("btnOtraVictoria").addEventListener("click", iniciarJuego);
document.getElementById("btnOtraDerrota").addEventListener("click", iniciarJuego);

document.addEventListener("keydown", (e) => {
    const letra = e.key.toUpperCase();
    if (LETRAS_ES.includes(letra)) clickLetra(letra);
});

iniciarJuego();