import { createApp, ref, reactive, onBeforeMount } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { getProductes } from './communicationManager.js';

createApp({
  setup() {
    const divActual = ref('portada');
    const pagament = ref(0);
    const infoTotal = reactive({ datos: [] });
    const llistaCompra = reactive([]);
    const productAdded = ref(false);

    onBeforeMount(async () => {
      const data = await getProductes();
      infoTotal.datos = data;
    });

    function canviarDiv(nombreDiv) {
      divActual.value = nombreDiv;
    };

    function mostrar(div) {
      return divActual.value === div;
    };

    function afegirProducte(producte) {
      const item = {
        id: producte.id,
        nom: producte.title,
        preu: producte.price,
        imatge: producte.image
      };

      llistaCompra.push(item);
      let preuProd = parseFloat(item.preu);
      sumaPagament(preuProd);

      alertCarrito(item);

      productAdded.value = true;
      setTimeout(() => {
        productAdded.value = false;
      }, 2000);
    };

    function eliminarProducte(producte) {
      const index = llistaCompra.findIndex(item => item.id === producte.id);
      if (index !== -1) {
        pagament.value -= llistaCompra[index].preu;
        llistaCompra.splice(index, 1);
      }
    };

    function sumaPagament(price) {
      pagament.value += price;
    };

    // Función de alerta usando SweetAlert2
    function alertCarrito(item) {
      Swal.fire({
        title: 'Producte agregat', // Título de la alerta
        text: `Has agregat ${item.nom} al carrito`, // Mensaje dinámico con el nombre del producto
        icon: 'success', // Icono de éxito
        timer: 3000, // Duración en milisegundos (3 segundos)
        showConfirmButton: false, // No mostrar el botón de confirmación
        position: 'bottom-end', // Posición en la esquina inferior derecha
        toast: true, // Estilo "toast"
        background: '#333', // Color de fondo
        color: '#fff', // Color del texto
        timerProgressBar: true // Barra de progreso visual
      });
    }

    return {
      infoTotal,
      divActual,
      llistaCompra,
      pagament,
      canviarDiv,
      mostrar,
      afegirProducte,
      eliminarProducte,
      alertCarrito,
      productAdded
    };
  }
}).mount('#appVue');
