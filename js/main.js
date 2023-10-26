//! VERSION 4 NUEVA

//todo   dibujar tabla fantasia si esta vacia. luego eliminar con la primer fila ingresada.
//todo   fetch 

const formulario = document.getElementById("_formulario");
const formSelect = document.getElementById("_categoria");


//const formularioCategoria = document.querySelector(".formulario-categoria");
const addCategoriaBtn = document.getElementById("_btn-add-categoria");

const contenedorNuevaCategoria = document.getElementById("_input-search-wrapper");
const inputNuevaCategoria = document.getElementById("_input-nueva-categoria");

const submitBtn = document.getElementById("_submitBtn");
// const errorMsg = document.getElementById("_errorMsg");
const resumenIngresos = document.getElementById("_ingresos");
const resumenEgresos = document.getElementById("_egresos");
const resumenSaldo = document.getElementById("_saldo");
const tBody = document.getElementById("_tbody");

let MOVIMIENTOS = [];

let arrCategorias = [
"Ocio y esparcimiento",
"Gasto extraordinario",
"Cuidado personal",
"Para el Hogar",
"Gasto Hormiga",
"Supermercado",
"Trabajo",
"Regalo",
"Otro"]



class ANOTACION {
  constructor(tipo, item, monto, categoria, id) {
    this.fecha = this.fechaDeHoy();
    this.tipo = tipo;
    this.item = item;
    this.monto = monto;
    this.categoria = categoria;
    this.id = id
  }

  fechaDeHoy() {
    let fecha = new Date();
    let dia = fecha.getDate();
    let mes = fecha.getMonth() + 1;
    return `${dia}/${mes}`;
  }

  formatearMoneda(valor) {
    return (valor / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // mostrarError(msg) {
  //   const mensajeError = document.createElement("p");
  //   mensajeError.textContent = msg;
  //   mensajeError.classList.add("red");
  //   errorMsg.appendChild(mensajeError);
  //   setTimeout(() => {
  //     mensajeError.remove();
  //   }, 2000);
  // }

  sweetAlertError1() {
  Swal.fire({
    text: 'Debes rellenar todos los campos',
    timer: 2500,
    background: "#ff5e5e",
    color: "#fff",
    backdrop: false,
    showConfirmButton: false,
    width: '16rem',
    customClass: 'swalert'
  })
}
sweetAlertError2() {
  Swal.fire({
    text: 'Esa categoria ya existe',
    timer: 2500,
    background: "#0aa03f",
    color: "#fff",
    backdrop: false,
    showConfirmButton: false,
    width: '16rem',
    customClass: 'swalert'
  })
}
  
  dibujarResumen() {
   
    let dibujarIngreso = MOVIMIENTOS.reduce((total, item) => (item.tipo === "Ingreso" ? total + item.monto : total), 0);
    let dibujarEgreso = MOVIMIENTOS.reduce((total, item) => (item.tipo === "Egreso" ? total + item.monto : total), 0);
    let dibujarSaldo = dibujarIngreso - dibujarEgreso;
    
    resumenIngresos.textContent = this.formatearMoneda(dibujarIngreso);
    resumenIngresos.classList.add('green');
    resumenEgresos.textContent = this.formatearMoneda(dibujarEgreso);
    resumenEgresos.classList.add('red');
    resumenSaldo.textContent = this.formatearMoneda(dibujarSaldo);
    resumenSaldo.style.color = 'blue';
  }

  

  dibujarTabla() {
    tBody.innerHTML = "";
    MOVIMIENTOS.forEach((movimiento) => {
      let nuevaFila = tBody.insertRow(0);
      nuevaFila.setAttribute("id", movimiento.id)
      
      let nuevaCeldaEnFila = nuevaFila.insertCell(0);
      nuevaCeldaEnFila.textContent = movimiento.fecha;

      nuevaCeldaEnFila = nuevaFila.insertCell(1);
      nuevaCeldaEnFila.textContent = movimiento.tipo;

      nuevaCeldaEnFila = nuevaFila.insertCell(2);
      nuevaCeldaEnFila.textContent = movimiento.item;

      nuevaCeldaEnFila = nuevaFila.insertCell(3);
      movimiento.tipo == "Egreso" ? nuevaCeldaEnFila.classList.add('red') : nuevaCeldaEnFila.classList.add('green')
      nuevaCeldaEnFila.textContent = this.formatearMoneda(movimiento.monto);
      
      nuevaCeldaEnFila = nuevaFila.insertCell(4);
      nuevaCeldaEnFila.textContent = movimiento.categoria;

      const celdaBorrarFila = nuevaFila.insertCell(5);
      const btnBorrarFila = document.createElement('button')
      btnBorrarFila.innerHTML = "&#10060"
      btnBorrarFila.classList.add('delete-cell')
      celdaBorrarFila.appendChild(btnBorrarFila)
   
      btnBorrarFila.addEventListener('click', (e) =>{
        let filaSeleccionada = e.target.parentNode.parentNode;
        let idFila = filaSeleccionada.getAttribute("id")
        
        filaSeleccionada.remove()
        anotar.eliminarDataLS(idFila)
      })
    });
  }

  agregarCategoria(){
    //const getNuevasCategorias = JSON.parse(localStorage.getItem("nuevasCategoriasLS"));
      for(let cat of arrCategorias) {
      let addCategoriaHtml = `<option>${cat}</option>`
      formSelect.insertAdjacentHTML("beforeend", addCategoriaHtml)
    }
  }

  generarId(){
    let ultimoId = localStorage.getItem("ultimoId") || '-1';
    let nuevoId = JSON.parse(ultimoId) + 1;
    localStorage.setItem("ultimoId", JSON.stringify(nuevoId))
    return nuevoId
  }

  nuevaAnotacion() {
    formulario.addEventListener("submit", (e) => {
      e.preventDefault();

      let datosFormulario = new FormData(formulario);
      let tipo = datosFormulario.get("tipo");
      let item = datosFormulario.get("item");
      let monto = Number((datosFormulario.get("monto"))*100);
      let categoria = datosFormulario.get("categoria");
      let id = anotar.generarId()

      if (tipo && item && !isNaN(monto) && categoria) {
        let nuevaAnotacion = new ANOTACION(tipo, item, monto, categoria, id);
        MOVIMIENTOS.push(nuevaAnotacion);
        anotar.guardarEnLS();
       
        formulario.reset();
      } else {
        //anotar.mostrarError("Complete todos los campos");
        anotar.sweetAlertError1()
      }
    });
  }

  guardarEnLS() {
    localStorage.setItem("movimientosLS", JSON.stringify(MOVIMIENTOS));
    anotar.dibujarTabla();
    anotar.dibujarResumen();
  }

eliminarDataLS(dataId){
  //obtengo y parseo el movimiento en el ls
  const getMovimientosLS = JSON.parse(localStorage.getItem("movimientosLS")) || [];
  //console.log(getMovimientosLS)
  MOVIMIENTOS = getMovimientosLS;

//busco indice del movimiento que quiero eliminar
  let indexInArray = MOVIMIENTOS.findIndex(element => element.id == dataId);

  //si no hay matcheo de ids me devuelve -1
  if (indexInArray !== -1) {
  
  MOVIMIENTOS.splice(indexInArray, 1);

  anotar.guardarEnLS();
  }
}


agregarNuevaCategoria(){
  addCategoriaBtn.addEventListener('click',(e)=>{
  e.preventDefault()
  
    contenedorNuevaCategoria.classList.toggle('toggle')
   
    let nuevaCategoriaIngresada = inputNuevaCategoria.value;


    if (nuevaCategoriaIngresada) {
      // Verificar si la categoría ya existe en el array
      if (!arrCategorias.includes(nuevaCategoriaIngresada)) {
        arrCategorias.push(nuevaCategoriaIngresada);
        this.agregarCategoria();

        localStorage.setItem("nuevasCategoriasLS", JSON.stringify(arrCategorias))
      } else{
        this.sweetAlertError2()
      }

    }
    inputNuevaCategoria.value = '';
    formSelect.innerHTML = '';
    this.agregarCategoria();

  })
}




} //! fin clase ANOTACION


const anotar = new ANOTACION("", "", 0, "", "");

window.addEventListener('DOMContentLoaded', ()=>{

  const getMovimientosLS = JSON.parse(localStorage.getItem("movimientosLS")) || [];
    MOVIMIENTOS = getMovimientosLS;
    anotar.dibujarTabla();
    anotar.dibujarResumen();
    //anotar.agregarCategoria()


    const getCategoriasLS = JSON.parse(localStorage.getItem("nuevasCategoriasLS")) || [];
    arrCategorias = getCategoriasLS;
    anotar.agregarCategoria()
    //anotar.agregarNuevaCategoria();
    
    
    
});

anotar.nuevaAnotacion();
anotar.agregarNuevaCategoria();



// Toastify({
//   text: "Eliminaste un anotacion",
//   duration: 3000,
//   position: "center", // `left`, `center` or `right`
//   backgroundColor:'#ffdd43',
//   color:'#000',
//   style:{
//   color:'#000'},
  
//   }).showToast();
  




