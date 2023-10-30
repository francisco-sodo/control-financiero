const formulario = document.getElementById("_formulario");
const formSelect = document.getElementById("_categoria");

const addCategoriaBtn = document.getElementById("_btn-add-categoria");

const contenedorNuevaCategoria = document.getElementById(
  "_input-search-wrapper"
);
const inputNuevaCategoria = document.getElementById("_input-nueva-categoria");

const submitBtn = document.getElementById("_submitBtn");

const resumenIngresos = document.getElementById("_ingresos");
const resumenEgresos = document.getElementById("_egresos");
const resumenSaldo = document.getElementById("_saldo");
const tBody = document.getElementById("_tbody");

const btnModo = document.getElementById("_modo");

let MOVIMIENTOS = [];
let arrCategorias = [];

//*FECHA DEL DIA EN CABECERA //
function fechaCompleta() {
  const showDataFecha = document.querySelector("#_showDataFecha");
  let longDate = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    weekday: "long",
    month: "long",
    year: "numeric",
  });
  showDataFecha.innerHTML = `${longDate}`;
}

//* API COTIZACION DOLAR
function dolarApi() {
  const showDolar = document.querySelector("#_showDolar");

  fetch("https://dolarapi.com/v1/dolares")
    .then((response) => response.json())
    .then((data) => {
      let oficial = data[0];
      let blue = data[1];
      showDolar.innerHTML = `
            
              <li>
              <p><span class="moneda-titulo">${oficial.moneda} ${oficial.nombre}</span>
              <span class="para-la-compra">$${oficial.compra}</span>  Compra /  
              <span class="para-la-venta">$${oficial.venta}</span> Venta.</p>
              </li>
              
              <li>
              <p><span class="moneda-titulo">${blue.moneda} ${blue.nombre}</span>
              <span class="para-la-compra">$${blue.compra}</span>  Compra /  
              <span class="para-la-venta">$${blue.venta}</span> Venta.</p>
              </li>
            
            `;
    })

    .catch((err) => {
      console.log("Ha ocurrido un Error-- " + err);
    });
}

//* DARK / LIGHT MODE

function modoGet() {
  localStorage.getItem("modoLS") === "true"
    ? document.documentElement.classList.add("dark-mode")
    : document.documentElement.classList.remove("dark-mode");
}

btnModo.addEventListener("click", () => {
  let modoSet = document.documentElement.classList.toggle("dark-mode");
  modoSet
    ? localStorage.setItem("modoLS", "true")
    : localStorage.setItem("modoLS", "false");
});

//* DOMCONTENTLOADED

window.addEventListener("DOMContentLoaded", () => {
  const getMovimientosLS =
    JSON.parse(localStorage.getItem("movimientosLS")) || [];
  MOVIMIENTOS = getMovimientosLS;
  anotar.dibujarTabla();
  anotar.dibujarResumen();

  const getCategoriasLS =
    JSON.parse(localStorage.getItem("nuevasCategoriasLS")) || [];
  arrCategorias = getCategoriasLS;
  anotar.dibujarCategoria();

  fechaCompleta();
  dolarApi();

  modoGet();
});

class ANOTACION {
  constructor(tipo, item, monto, categoria, id) {
    this.fecha = this.fechaDeHoy();
    this.tipo = tipo;
    this.item = item;
    this.monto = monto;
    this.categoria = categoria;
    this.id = id;
  }

  fechaDeHoy() {
    let fecha = new Date();
    let dia = fecha.getDate();
    let mes = fecha.getMonth() + 1;
    return `${dia}/${mes}`;
  }

  formatearMoneda(valor) {
    return (valor / 100).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  sweetAlertError1() {
    Swal.fire({
      text: "Debes rellenar todos los campos",
      timer: 2500,
      background: "#ff5e5e",
      color: "#fff",
      backdrop: false,
      showConfirmButton: false,
      width: "16rem",
      customClass: "swalert",
    });
  }
  sweetAlertError2() {
    Swal.fire({
      text: "Esa categoria ya existe",
      timer: 2500,
      background: "#0aa03f",
      color: "#fff",
      backdrop: false,
      showConfirmButton: false,
      width: "16rem",
      customClass: "swalert",
    });
  }

  dibujarResumen() {
    let dibujarIngreso = MOVIMIENTOS.reduce(
      (total, item) => (item.tipo === "Ingreso" ? total + item.monto : total),
      0
    );
    let dibujarEgreso = MOVIMIENTOS.reduce(
      (total, item) => (item.tipo === "Egreso" ? total + item.monto : total),
      0
    );
    let dibujarSaldo = dibujarIngreso - dibujarEgreso;

    resumenIngresos.textContent = this.formatearMoneda(dibujarIngreso);
    resumenIngresos.classList.add("green");
    resumenEgresos.textContent = this.formatearMoneda(dibujarEgreso);
    resumenEgresos.classList.add("red");
    resumenSaldo.textContent = this.formatearMoneda(dibujarSaldo);
  }

  dibujarTabla() {
    if (MOVIMIENTOS.length == []) {
      tBody.innerHTML = `
    <tr id="_tbodyExample" class="tbodyExample">
      <td>${this.fecha}</td>
      <td>Ej: Egreso</td>
      <td>Ej: Pasajes</td>
      <td>Ej: 30000</td>
      <td>Ej: Vacaciones</td>
      <td></td>
    </tr>
    `;
    } else {
      tBody.innerHTML = "";
      MOVIMIENTOS.forEach((movimiento) => {
        let nuevaFila = tBody.insertRow(0);
        nuevaFila.setAttribute("id", movimiento.id);

        let nuevaCeldaEnFila = nuevaFila.insertCell(0);
        nuevaCeldaEnFila.textContent = movimiento.fecha;

        nuevaCeldaEnFila = nuevaFila.insertCell(1);
        nuevaCeldaEnFila.textContent = movimiento.tipo;

        nuevaCeldaEnFila = nuevaFila.insertCell(2);
        nuevaCeldaEnFila.textContent = movimiento.item;

        nuevaCeldaEnFila = nuevaFila.insertCell(3);
        movimiento.tipo == "Egreso"
          ? nuevaCeldaEnFila.classList.add("red")
          : nuevaCeldaEnFila.classList.add("green");
        nuevaCeldaEnFila.textContent = this.formatearMoneda(movimiento.monto);

        nuevaCeldaEnFila = nuevaFila.insertCell(4);
        nuevaCeldaEnFila.textContent = movimiento.categoria;

        const celdaBorrarFila = nuevaFila.insertCell(5);
        const btnBorrarFila = document.createElement("button");
        btnBorrarFila.innerHTML = "&#10060";
        btnBorrarFila.classList.add("delete-cell");
        celdaBorrarFila.appendChild(btnBorrarFila);

        btnBorrarFila.addEventListener("click", (e) => {
          let filaSeleccionada = e.target.parentNode.parentNode;
          let idFila = filaSeleccionada.getAttribute("id");
          filaSeleccionada.remove();
          anotar.eliminarDataLS(idFila);
        });
      });
    }
  }

  generarId() {
    let ultimoId = localStorage.getItem("ultimoId") || "-1";
    let nuevoId = JSON.parse(ultimoId) + 1;
    localStorage.setItem("ultimoId", JSON.stringify(nuevoId));
    return nuevoId;
  }

  nuevaAnotacion() {
    formulario.addEventListener("submit", (e) => {
      e.preventDefault();

      let datosFormulario = new FormData(formulario);
      let tipo = datosFormulario.get("tipo");
      let item = datosFormulario.get("item");
      let monto = Number(datosFormulario.get("monto") * 100);
      let categoria = datosFormulario.get("categoria");
      let id = anotar.generarId();

      if (tipo && item && !isNaN(monto) && categoria) {
        let nuevaAnotacion = new ANOTACION(tipo, item, monto, categoria, id);
        MOVIMIENTOS.push(nuevaAnotacion);
        anotar.guardarEnLS();

        formulario.reset();
      } else {
        anotar.sweetAlertError1();
      }
    });
  }

  guardarEnLS() {
    localStorage.setItem("movimientosLS", JSON.stringify(MOVIMIENTOS));
    anotar.dibujarTabla();
    anotar.dibujarResumen();
  }

  eliminarDataLS(dataId) {
    const getMovimientosLS =
      JSON.parse(localStorage.getItem("movimientosLS")) || [];
    MOVIMIENTOS = getMovimientosLS;
    let indexInArray = MOVIMIENTOS.findIndex((element) => element.id == dataId);
    if (indexInArray !== -1) {
      MOVIMIENTOS.splice(indexInArray, 1);
      anotar.guardarEnLS();
    }
  }

  dibujarCategoria() {
    formSelect.innerHTML = `
  <option disabled selected>- Categorias -</option>
  <option>gasto extraordianario</option>
  <option>sueldo</option>
  <option>alquiler</option>
  `;
    for (let cat of arrCategorias) {
      let addCategoriaHtml = `<option selected>${cat}</option>`;
      formSelect.insertAdjacentHTML("beforeend", addCategoriaHtml);
    }
  }

  agregarNuevaCategoria() {

    addCategoriaBtn.addEventListener("click", (e) => {
      e.preventDefault();

      contenedorNuevaCategoria.classList.toggle("toggle");
      contenedorNuevaCategoria.addEventListener("click", (e) => {
        e.preventDefault();
        addCategoriaBtn.classList.add("color-transition");
      });
      addCategoriaBtn.classList.remove("color-transition");

      let nuevaCategoriaIngresada = inputNuevaCategoria.value.toLowerCase();

      if (nuevaCategoriaIngresada) {
        if (!arrCategorias.includes(nuevaCategoriaIngresada)) {
          arrCategorias.push(nuevaCategoriaIngresada);
          this.dibujarCategoria();
          localStorage.setItem(
            "nuevasCategoriasLS",
            JSON.stringify(arrCategorias)
          );
        } else {
          this.sweetAlertError2();
        }
        inputNuevaCategoria.value = "";
      }

      formSelect.innerHTML = "";
      this.dibujarCategoria();
    });
  }


} //* fin clase ANOTACION



const anotar = new ANOTACION("", "", 0, "", "");

anotar.nuevaAnotacion();
anotar.agregarNuevaCategoria();
