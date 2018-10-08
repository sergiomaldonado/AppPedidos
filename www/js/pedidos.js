var config = {
  apiKey: "AIzaSyA19j6-VLNcXLJfBkfd_lZfFFbzg6z0Imc",
  authDomain: "xico-netcontrol.firebaseapp.com",
  databaseURL: "https://xico-netcontrol.firebaseio.com",
  projectId: "xico-netcontrol",
  storageBucket: "xico-netcontrol.appspot.com",
  messagingSenderId: "248615705793"
};
firebase.initializeApp(config);

const db = firebase.database(),
  auth = firebase.auth(),
  storage = firebase.storage();
var listaProductosPedido = [],
  listaClavesProductos = [],
  listaMaterialesPedido = [],
  listaClavesMateriales = [],
  TKilos, TPiezas,
  TCantidad, TCosto,
  promotoraFb;

function logout() {
  auth.signOut();
}

function mostrarDatosPerfil() {
  let uid = auth.currentUser.uid;
  let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuariosRef.on('value', function (snapshot) {
    let usuario = snapshot.val();
    $('#nombrePerfil').val(usuario.nombre);
    $('#nombreUsuario').val(usuario.username);
  });
}

$('#btnHabilitarEditar').click(function (e) {
  e.preventDefault();
  $('#nombrePerfil').removeAttr('readonly');
  $('#nombreUsuario').removeAttr('readonly');
  $('#btnEditarPerfil').attr('disabled', false);
  $('#btnHabilitarEditar').attr('disabled', true);
});

function editarPerfil() {
  let uid = auth.currentUser.uid, nombre = $('#nombrePerfil').val(), usuario = $('#nombreUsuario').val();

  if (nombre.length > 0 && usuario.length > 0) {
    let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/`);
    usuariosRef.child(uid).update({
      nombre: nombre,
      usuario: usuario
    }, function () {
      mostrarDatosPerfil();
      $('#nombrePerfil').attr('readonly', true);
      $('#nombreUsuario').attr('readonly', true);
      $('#btnEditarPerfil').attr('disabled', true);
      $('#btnHabilitarEditar').attr('disabled', false);

      $.toaster({ priority: 'success', title: 'Mensaje de información', message: 'Se actualizaron sus datos con exito' });
    });
  }
  else {
    if (nombre.length < 0) {
      $('#nombrePerfil').parent().addClass('has-error');
      $('#helpblockNombrePerfil').show();
    }
    else {
      $('#nombrePerfil').parent().removeClass('has-error');
      $('#helpblockNombrePerfil').hide();
    }
    if (usuario.length < 0) {
      $('#nombreUsuario').parent().addClass('has-error');
      $('#helpblockNombreUsuario').show();
    }
    else {
      $('#nombreUsuario').parent().removeClass('has-error');
      $('#helpblockNombreUsuario').hide();
    }
  }
}

$('#btnEditarPerfil').click(function (e) {
  e.preventDefault();
  editarPerfil();
})

function cambiarContraseña() {
  let nuevaContraseña = $('#nuevaContraseña').val();

  if (nuevaContraseña.length > 0) {
    auth.currentUser.updatePassword(contraseñaNueva)
      .then(function () {
        $.toaster({ priority: 'success', title: 'Mensaje de información', message: 'Se actualizó su contraseña exitosamente' });
        $('#nuevaContraseña').parent().removeClass('has-error');
        $('#helpblockNuevaContraseña').hide();
      }, function (error) {
        $.toaster({ priority: 'danger', title: 'Error al cambiar contraseña', message: 'La contraseña debe ser de 8 caracteres como mínimo y puede contener números y letras' });
        console.log(error);
        $('#nuevaContraseña').parent().addClass('has-error');
        $('#helpblockNuevaContraseña').show();
      });
  }
  else {
    $('#nuevaContraseña').parent().addClass('has-error');
    $('#helpblockNuevaContraseña').show();
  }
}

function mostrarTicketsCalidadProducto() {
  let uid = auth.currentUser.uid;

  let ticketsRef = db.ref('tickets/calidadProducto');
  ticketsRef.orderByChild("promotora").equalTo(uid).on("value", function (snapshot) {
    let tickets = snapshot.val();
    $('#ticketsCalidadProducto tbody').empty();

    for (let ticket in tickets) {
      let datos = tickets[ticket];

      let dia = datos.fecha.substr(0, 2);
      let mes = datos.fecha.substr(3, 2);
      let año = datos.fecha.substr(6, 4);
      let fecha = mes + '/' + dia + '/' + año;
      moment.locale('es');
      let fechaMostrar = moment(fecha).format('LL');

      let tr = $('<tr/>');
      let td = $('<td/>');
      let a = $('<a/>', {
        'onclick': 'abrirModalTicket("' + ticket + '")',
        text: 'Clave: ' + datos.clave + ' Producto: ' + datos.producto + ' Problema: ' + datos.problema + ' Fecha: ' + fechaMostrar
      })
      td.append(a);
      tr.append(td);
      $('#ticketsCalidadProducto tbody').append(tr);
    }

    //$('#ticketsCalidadProducto tbody').html(trs);
  });
}

function abrirModalTicket(idTicket) {
  $('#modalTicket').modal('show');

  let ticketRef = db.ref('tickets/calidadProducto/' + idTicket);
  ticketRef.once('value', function (snapshot) {
    let datos = snapshot.val();
    $('#claveTicket').val(datos.clave);
    $('#claveProducto').val(datos.producto);

    let dia = datos.fecha.substr(0, 2);
    let mes = datos.fecha.substr(3, 2);
    let año = datos.fecha.substr(6, 4);
    let fechaMostrar = año + '-' + mes + '-' + dia;

    $('#fechaTicket').val(fechaMostrar);
    $('#respuesta').val(datos.respuesta);
    $('#problemaTicket').val(datos.problema);
  });
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/tiendas/${usuario}/lista`);
  notificacionesRef.on('value', function (snapshot) {
    let lista = snapshot.val();
    // let trs = "";
    let lis = "";

    let arrayNotificaciones = [], idsNotificaciones = [];
    for (let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
      idsNotificaciones.push(notificacion);
    }

    arrayNotificaciones.reverse();

    for (let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      // trs += `<tr><td>'${arrayNotificaciones[i].mensaje} ${fecha}</td></tr>`;
      if (i % 2 == 0) {
        lis += `<li class="list-group-item list-group-item-info"><button type="button" onclick="quitarNotificacion('${idsNotificaciones[i]}')" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> ${arrayNotificaciones[i].mensaje} ${fecha}</li>`;
      }
      else {
        lis += `<li class="list-group-item"><button type="button" onclick="quitarNotificacion('${idsNotificaciones[i]}')" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> ${arrayNotificaciones[i].mensaje} ${fecha}</li>`;
      }
    }

    // $('#notificaciones').empty().append(trs);
    $('#notificaciones').html(lis);
  });
}

function quitarNotificacion(idNotificacion) {
  let usuario = auth.currentUser.uid;
  let rutaNotificaciones = db.ref(`notificaciones/tiendas/${usuario}/lista`);
  rutaNotificaciones.child(idNotificacion).remove();
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/tiendas/' + uid);
  notificacionesRef.on('value', function (snapshot) {
    let cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/tiendas/' + uid);
  notificacionesRef.update({ cont: 0 });
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarTicketsCalidadProducto();
      llenarSelectTiendas();
      mostrarHistorialPedidos();
      mostrarNotificaciones();
      mostrarContador();
      checarPorOfertas();
      llenarSelectPromotoras();

      mostrarContadorKilos();
      llenarSelectConsorcioChequeo();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function llenarSelectTiendas() {
  let uid = auth.currentUser.uid;
  let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuariosRef.once('value', function (snapshot) {
    let region = snapshot.val().region;
    $('.region').html(`Pedidos Región ${region}`);
    $('#coordinadoraExistencias').val(snapshot.val().nombre);

    let tiendasRef = db.ref(`regiones/${region}`);
    tiendasRef.on('value', function (snapshot) {
      let tiendas = snapshot.val();
      let row = '<option value="Tiendas" disabled selected>Selecciona una tienda para visitar</option>';

      for (let tienda in tiendas) {
        let imagen = "";
        switch (tiendas[tienda].consorcio) {
          case "SORIANA":
            imagen = "assets/tiendas/soriana.png";
            break;
          case "SMART":
            imagen = "assets/tiendas/smart.png";
            break;
          case "GRAND":
            imagen = "assets/tiendas/grand.png";
            break;
          case "IBARRA":
            imagen = "assets/tiendas/ibarra.png";
            break;
          case "CHEDRAUI":
            imagen = "assets/tiendas/chedraui.png";
            break;
          case "STM":
            imagen = "assets/tiendas/stm.png";
            break;
          case "MASBODEGA":
            imagen = "assets/tiendas/masbodega.png";
            break;
          case "CHUPER":
            imagen = "assets/tiendas/chuper.png";
            break;
          case "ARTELI":
            imagen = "assets/tiendas/arteli.png";
            break;
        }

        row += `<option value="${tienda}" data-image="${imagen}">${tiendas[tienda].nombre}</option>`;
      }

      $('#tiendas').show().empty().append(row).msDropdown();
    });
  });
}

function llenarSelectProductos() {
  let consorcio = $('#consorcio').val();

  let productosRef = db.ref(`productos/${consorcio}`);
  productosRef.on('value', function (snapshot) {
    let productos = snapshot.val();
    let options = '<option id="SeleccionarProducto" value="Seleccionar" disabled selected>Seleccionar</option>';

    for (let producto in productos) {
      if (productos[producto].activo) {
        options += `<option value="${producto}"> ${producto} ${productos[producto].nombre} ${productos[producto].empaque}</option>`;
      }
    }
    $('#productos').html(options);
    $('#productosTicket').html(options);
  });
}

$('#tiendas').change(function () {
  let idTienda = $("#tiendas").val();

  let uid = auth.currentUser.uid;
  let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuariosRef.once('value', function (snapshot) {
    let region = snapshot.val().region;

    let tiendaActualRef = db.ref(`regiones/${region}/${idTienda}`);
    tiendaActualRef.once('value', function (snapshot) {
      let tienda = snapshot.val();
      $('#tienda').val(tienda.nombre);
      $('#tiendaExistencias').val(tienda.nombre);
      $('#tiendaMateriales').val(tienda.nombre);
      $('#tiendaVentaDiaria').val(tienda.nombre);
      $('#region').val(region);
      $('#zonaExistencias').val(region);
      $('#regionMateriales').val(region);
      $('#zonaVentaDiaria').val(region);
      $('#consorcio').val(tienda.consorcio);
      $('#consorcioVentaDiaria').val(tienda.consorcio);
      $('#consorcioMateriales').val(tienda.consorcio);
      $('#consorcioTicket').val(tienda.consorcio);
      $('#consorcioExistencias').val(tienda.consorcio);
      //$('#promotora').val(tienda.promotora);
      promotoraFb = tienda.promotora;

      db.ref(`estandares/${region}/${idTienda}`).once('value', function (snapshot) {
        let tienda = snapshot.val();
        let estandarVenta = tienda.estandarVenta;

        $('#estandarVenta').val(estandarVenta);
      });

      llenarSelectProductos();
      llenarMultisSelect();
      llenarTablaExistencias();
      $('#productosPedido tbody').empty();
      $('#productosPedido tfoot').empty()
        .append(`<tr id="filaTotales">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>Totales</td>
                <td class="hidden"></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`);
    });
  });
});

let productosExistencias = {};

/* new Vue({
  el: '#app',
  data: {
    consorcioExistencias: '',
    productos: [],
    mostrar: false,
    productosExistencia: {}, 
  },
  methods: {
    llenarProductos: function() {
      db.ref(`consorcios/${this.consorcioExistencias}/productos`).on('value', function(productos) {
        productos.forEach(function (producto) {
          this.productosExistencias[producto.key] = {
            nombreProducto: producto.val().nombre,
          };

          this.productos.push({
            key: producto.key,
            ...producto.val(),
          });
          this.mostrar = true;
        })
      })
    }
  }
  // firebase: {
  //   productosExistencias: db.ref(`consorcios/${consorcio}/productos`)
  // }
}) */

function llenarTablaExistencias() {
  let consorcio = $('#consorcioExistencias').val();

  db.ref(`consorcios/${consorcio}/productos`).on('value', function (productos) {
    let filas = "";
    //Object.assign(productosExistencias, productos.val());
    productos.forEach(function (producto) {
      // productosExistencias[producto.key] = {}
      /* filas += `<tr>
                  <td>
                    Clave | Nombre | Empaque <br>
                    <strong>${producto.key} | ${producto.val().nombre} | ${producto.val().empaque}</strong>
                    <input id="existencia-${producto.key}" data-clave="${producto.key}" type="number" class="form-control input-sm text-right inputChequeo" value="0" min="0">
                  </td>
                </tr>`; */
      filas += `<li class="list-group-item">
                  Clave | Nombre | Empaque <br>
                  <strong>${producto.key} | ${producto.val().nombre} | ${producto.val().empaque}</strong>
                  <div class="form-group">
                    <input id="existencia-${producto.key}" data-clave="${producto.key}" data-empaque="${producto.val().empaque}" data-nombre="${producto.val().nombre}" type="number" class="form-control input-sm text-right inputExistencias">
                    <span style="display: none;" id="helpblock${producto.key}" class="help-block">Campo obligatorio</span>
                  </div>
                </li>`;
    });

    $('#tabla-existencias tbody').html(filas);
    $('#tabla-existencias').html(filas);
  });
}

function ocultarInputsExistencias() {
  $('#btnScan').removeClass('hidden');
  $('#tabla-existencias').addClass('hidden');
  $('#btnGuardarExistencias').addClass('hidden');
  $('#alertExistencias').addClass('hidden');
}

function scanQR() {
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      if (!result.cancelled) {
        if (result.format == "QR_CODE") {
          let capturaQR = result.text;
          let region = $('#zonaExistencias').val();
          let idTienda = $('#tiendas').val()
          db.ref(`regiones/${region}/${idTienda}`).once('value', function (snapshot) {
            let codigoQR = snapshot.val().codigoQR;
            if (capturaQR === codigoQR) {
              swal({
                type: 'info',
                title: 'Mensaje',
                text: 'El código QR es correcto. Bienvenido',
              });
              $('#btnScan').addClass('hidden');
              $('#tabla-existencias').removeClass('hidden');
              $('#btnGuardarExistencias').removeClass('hidden');
              $('#alertExistencias').removeClass('hidden');
            } else {
              swal({
                type: 'warning',
                title: 'Alerta',
                text: 'Este código QR no pertenece a esta tienda',
              });
            }
          });

        }
        else {
          alert('Ops se escaneo un código pero al parecer no es QR');
        }
      } else {
        alert('El usuario se ha saltado el escaneo');
      }
    },
    function (error) {
      alert(`Ha ocurrido un error: ${error}`);
    },
    {
      preferFrontCamera: false,
      showFlipCameraButton: false,
      showTorchButton: false,
      torchOn: false,
      saveHistory: true,
      prompt: 'Coloca el código QR dentro del área de escaneo',
      resultDisplayDuration: 500,
      formats: 'QR_CODE',
      orientation: 'portrait',
      disableAnimations: true,
      disableSuccessBeep: true,
    }
  )
}

function guardarExistencia() {
  let inputs = $('.inputExistencias');
  let bandera = false;
  inputs.each(function () {
    if ($(this).val().length > 0) {
      let piezas = Number($(this).val());
      let claveProducto = $(this).attr('data-clave');
      let nombreProducto = $(this).attr('data-nombre');
      let empaque = Number($(this).attr('data-empaque'));
      let totalKilos = Number((piezas * empaque).toFixed(4));
      productosExistencias[claveProducto] = {
        piezas: piezas,
        nombre: nombreProducto,
        totalKilos: totalKilos,
      };
    }
    else {
      // $(`#existencia-${$(this).attr('id')}`).parent().addClass('has-error');
      // $(`#helpblock${$(this).attr('id')}`).show();
      bandera = true;
    }
  });

  if (bandera) {
    swal({
      type: 'warning',
      title: 'Alerta',
      text: 'Llena las existencias de todos los productos',
    });
  }
  else {
    let zona = $('#zonaExistencias').val();
    let tienda = $('#tiendaExistencias').val();
    let idTienda = $('#tiendas').val();
    let fecha = moment().format('DD/MM/YYYY');
    let consorcio = $('#consorcioExistencias').val();
    let coordinadora = $('#coordinadoraExistencias').val();

    let existencia = {
      zona: zona,
      tienda: tienda,
      fecha: fecha,
      coordinadora: coordinadora,
      consorcio: consorcio,
      productos: productosExistencias
    };

    swal({
      title: 'Mensaje',
      text: `¿Está seguro de enviar las existencias?`,
      type: 'info',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Enviar',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        db.ref(`existencias/`).push(existencia);
        db.ref(`regiones/${zona}/${idTienda}`).update({
          ultimaExistencia: fecha
        });

        $('.inputExistencias').val('');
        swal({
          type: 'success',
          title: 'Mensaje',
          text: 'Las existencias se enviaron correctamente',
        });
      }
    });
  }
}


/* function guardarExistencia() {
  let consorcio = $('#consorcio').val();

  $('#tabla-existencias tbody tr td input').each(function () {
    let clave = $(this).attr('data-clave');
    let existencia = Number($(this).val());

    let productoRef = db.ref(`productos/${consorcio}/${clave}`);
    productoRef.update({ existencia: existencia });
  });

  $.toaster({ priority: 'success', title: 'Mensaje de información', message: `La existencia se guardó correctamente` });
} */

$('#tabla-existencias tbody tr td input').keypress(function () {
  if (!$.trim(this.value).length) { // zero-length string AFTER a trim
    $(this).parents('p').addClass('warning');
  }
});

$('#productos').change(function () {
  let consorcio = $('#consorcio').val();
  let idProducto = $('#productos').val();

  let productoActualRef = db.ref('productos/' + consorcio + '/' + idProducto);
  productoActualRef.on('value', function (snapshot) {
    let producto = snapshot.val();
    $('#clave').val(idProducto);
    $('#claveConsorcio').val(producto.claveConsorcio);
    $('#nombre').val(producto.nombre);
    $('#empaque').val(producto.empaque);
    $('#precioUnitario').val(producto.precioUnitario);
    $('#unidad').val(producto.unidad);
  });

  if (this.value != null || this.value != undefined) {
    $('#productos').parent().removeClass('has-error');
    $('#helpblockProductos').hide();
  } else {
    $('#productos').parent().addClass('has-error');
    $('#helpblockProductos').show();
  }
});

$('#productosTicket').change(function () {
  let consorcio = $('#consorcioTicket').val();
  let idProducto = $('#productos').val();

  let productoActualRef = db.ref('productos/' + consorcio + '/' + idProducto);
  productoActualRef.on('value', function (snapshot) {
    let producto = snapshot.val();
    $('#productoTicket').val(idProducto);
  });

  if (this.value != null || this.value != undefined) {
    $('#productosTicket').parent().parent().removeClass('has-error');
    $('#helpblockProductoTicket').hide();
  }
  else {
    $('#productosTicket').parent().parent().addClass('has-error');
    $('#helpblockProductoTicket').show();
  }
});

$('#pedidoPz').keyup(function () {
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($('#cambioFisicoPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz + degusPz + cambioFisicoPz;
  let totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);

  if (this.value.length < 1) {
    $('#pedidoPz').parent().addClass('has-error');
    $('#helpblockPedidoPz').show();
  }
  else {
    $('#pedidoPz').parent().removeClass('has-error');
    $('#helpblockPedidoPz').hide();
  }
});

$('#degusPz').keyup(function () {
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($('#cambioFisicoPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz + degusPz + cambioFisicoPz;
  let totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);

  if (this.value.length < 1) {
    $('#degusPz').parent().addClass('has-error');
    $('#helpblockDegusPz').show();
  }
  else {
    $('#degusPz').parent().removeClass('has-error');
    $('#helpblockDegusPz').hide();
  }
});

$('#cambioFisicoPz').keyup(function () {
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($(this).val());
  if (cambioFisicoPz == undefined || cambioFisicoPz == null) {
    cambioFisicoPz = 0;
  }
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz + degusPz + cambioFisicoPz;
  let totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$(document).ready(function () {
  //llenarSelectTiendas();
  //llenarSelectProductos();
  $('.input-group.date').datepicker({
    autoclose: true,
    format: "dd/mm/yyyy",
    language: "es"
  });

  $('#productosVentaDiaria').multiselect({
    buttonText: function(options, select) {
        if (options.length === 0) {
          return 'Seleccionar...';
        }
        else if (options.length > 3) {
          return `${options.length} productos seleccionados`;
        }
        else {
          var labels = [];
          options.each(function() {
            if ($(this).attr('label') !== undefined) {
              labels.push($(this).attr('label'));
            }
            else {
              labels.push($(this).html());
            }
          });
          return labels.join(', ') + '';
        }
      }
  });
  /* $('#productosVentaDiaria').select2({
    placeholder: 'Seleccionar',
  }); */

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });

  /*$('#head-blog').xpull({
    'callback': function () {
      location.reload();
    }
  });*/

  $('#tabPerfil').on('shown.bs.tab', function (e) {
    mostrarDatosPerfil();
  })

  $('#collapseContraseña').on('show.bs.collapse', function () {
    $('#btnExpandir').text('Cerrar');
  })

  $('#collapseContraseña').on('hide.bs.collapse', function () {
    $('#btnExpandir').text('Expandir');
  });

  llenarSelectMateriales();

  /* Push.create("Luis Rene Mas Mas", { //Titulo de la notificación
    body: "Desarrollador front-end.", //Texto del cuerpo de la notificación
    icon: 'https://01luisrene.com/content/images/2017/04/autor.png', //Icono de la notificación
    timeout: 6000, //Tiempo de duración de la notificación
    onClick: function () {//Función que se cumple al realizar clic cobre la notificación
      window.location = "https://01luisrene.com"; //Redirige a la siguiente web
      this.close(); //Cierra la notificación
    }
  }); */

  var slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': 256,
    'tolerance': 70
  });

  document.querySelector('#enlaceVentaDiaria').addEventListener('click', function() {
    slideout.close();
  });

  document.querySelector('#enlaceChequeo').addEventListener('click', function() {
    ocultarInputsExistencias();    
    slideout.close();
  });

  document.querySelector('#logo-xico').addEventListener('click', function () {
    slideout.toggle();
  });
});

function eliminarProductoDePedido(claveProducto) {
  let mensajeConfirmacion = confirm("¿Realmente desea quitar este producto?");
  if (mensajeConfirmacion) {

    $("#productosPedido tbody tr").each(function (i) {
      if ($(this).children("td")[0].outerText == claveProducto) {
        $(this).remove();
        listaProductosPedido.splice(i, 1);

        if (listaClavesProductos.includes(claveProducto)) {
          let index = listaClavesProductos.indexOf(claveProducto);
          listaClavesProductos.splice(index, 1);
        }
        calcularTotales();
      }
    });
  }
}

$('#pedidoPzEditar').keyup(function () {
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisico = Number($('#cambioFisicoEditar').val());
  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz + degusPz + cambioFisico;
  let totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);

  if (this.value.length < 1) {
    $('#pedidoPzEditar').parent().addClass('has-error');
    $('#helpblockPedidoPzEditar').show();
  }
  else {
    $('#pedidoPzEditar').parent().removeClass('has-error');
    $('#helpblockPedidoPzEditar').hide();
  }
});

$('#degusPzEditar').keyup(function () {
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisico = Number($('#cambioFisicoEditar').val());
  if (degusPz == undefined || degusPz == null) {
    degusPz = 0;
  }

  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz + degusPz + cambioFisico;
  let totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

$('#cambioFisicoEditar').keyup(function () {
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisico = Number($(this).val());
  if (cambioFisico == undefined || cambioFisico == null) {
    cambioFisico = 0;
  }
  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz + degusPz + cambioFisico;
  let totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

function modalEditarProducto(claveProducto) {
  $('#modalEditarProducto').modal('show');

  $('#productosPedido tbody tr').each(function (i) {
    let columnas = $(this).children('td');

    if (columnas[0].outerText == claveProducto) {
      $('#modalEditarProducto').attr('data-i', i);
      $('#claveProductoEditar').val(columnas[0].outerText);
      $('#nombreProductoEditar').val(columnas[1].outerText);
      $('#pedidoPzEditar').val(columnas[2].outerText);
      $('#degusPzEditar').val(columnas[3].outerText);
      $('#cambioFisicoEditar').val(columnas[4].outerText);
      $('#empaqueEditar').val(columnas[5].outerText);
      $('#totalPzEditar').val(columnas[6].outerText);
      $('#totalKgEditar').val(columnas[7].outerText);
    }
  });
}

function guardarCambiosProducto() {
  let pedidoPz = $('#pedidoPzEditar').val();
  let degusPz = $('#degusPzEditar').val();
  let cambioFisico = $('#cambioFisicoEditar').val();
  let totalPz = $('#totalPzEditar').val();
  let totalKg = $('#totalKgEditar').val();
  let i = Number($('#modalEditarProducto').attr('data-i'));

  if (pedidoPz.length > 0 && degusPz.length > 0) {
    listaProductosPedido[i].pedidoPz = Number(pedidoPz);
    listaProductosPedido[i].degusPz = Number(degusPz);
    listaProductosPedido[i].cambioFisico = Number(cambioFisico);
    listaProductosPedido[i].totalPz = Number(totalPz);
    listaProductosPedido[i].totalKg = Number(totalKg);

    let fila = $('#productosPedido tbody tr')[i];
    let columnas = fila.children;
    columnas[2].innerHTML = pedidoPz;
    columnas[3].innerHTML = degusPz;
    columnas[4].innerHTML = cambioFisico;
    columnas[6].innerHTML = totalPz;
    columnas[7].innerHTML = totalKg;

    calcularTotales();

    /*$('#productosPedido tbody tr').each(function(j) {
      if(j == i) {
        let columnas = $(this).children('td');
        columnas[2].innerHTML = pedidoPz;
        columnas[3].innerHTML = degusPz;
        columnas[4].innerHTML = cambioFisico;
        columnas[6].innerHTML = totalPz;
        columnas[7].innerHTML = totalKg;
      }
    });*/
  }
  else {
    if (pedidoPz.length < 1) {
      $('#pedidoPzEditar').parent().addClass('has-error');
      $('#helpblockPedidoPzEditar').show();
    }
    else {
      $('#pedidoPzEditar').parent().removeClass('has-error');
      $('#helpblockPedidoPzEditar').hide();
    }
    if (degusPz.length < 1) {
      $('#degusPzEditar').parent().addClass('has-error');
      $('#helpblockDegusPzEditar').show();
    }
    else {
      $('#degusPzEditar').parent().removeClass('has-error');
      $('#helpblockDegusPzEditar').hide();
    }
  }
}

function calcularTotales() {
  let $filaTotales = $('#filaTotales');
  //let hermanos = $filaTotales.siblings();
  let filas = $('#productosPedido tbody tr');

  let TotalPiezas = 0, TotalKilos = 0;

  filas.each(function () {
    TotalPiezas += Number($(this)[0].cells[6].innerHTML);
    TotalKilos += Number($(this)[0].cells[7].innerHTML);
  });

  TKilos = TotalKilos.toFixed(4);
  TPiezas = TotalPiezas;
  $filaTotales[0].cells[6].innerHTML = TotalPiezas;
  $filaTotales[0].cells[7].innerHTML = TotalKilos.toFixed(4);
}

function calcularTotalesHistorial() {
  let filas = $('#productosPedidoHistorial tbody tr');
  let TotalPiezas = 0, TotalKilos = 0;

  filas.each(function () {
    TotalPiezas += Number($(this)[0].cells[5].innerHTML);
    TotalKilos += Number($(this)[0].cells[6].innerHTML);
  });

  let filaTotales = `<tr id="filaTotalesHistorial">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>Totales</td>
                      <td>${TotalPiezas}</td>
                      <td>${TotalKilos.toFixed(4)}</td>
                    </tr>`;

  $('#productosPedidoHistorial tbody').append(filaTotales);
}

function limpiarCampos() {
  $('#productos').val($('#productos > option:first').val());
  $('#productos').focus();
  $('#clave').val('');
  $('#claveConsorcio').val('');
  $('#pedidoPz').val('');
  $('#degusPz').val('');
  $('#cambioFisicoPz').val('');
  $('#totalPz').val('');
  $('#totalKg').val('')
  $('#precioUnitario').val('');
  $('#unidad').val('');
}

function agregarProducto() {
  let clave = $('#clave').val();
  let claveConsorcio = $('#claveConsorcio').val();
  let nombre = $('#nombre').val();
  let pedidoPz = $('#pedidoPz').val();
  let degusPz = $('#degusPz').val();
  let cambioFisicoPz = $('#cambioFisicoPz').val();
  let empaque = $('#empaque').val();
  let totalPz = $('#totalPz').val();
  let totalKg = $('#totalKg').val();
  let precioUnitario = $('#precioUnitario').val();
  let unidad = $('#unidad').val();
  let productoSeleccionado = $('#productos').val();

  if (productoSeleccionado != null && productoSeleccionado != undefined && productoSeleccionado != "SeleccionarProducto" && pedidoPz.length > 0) {
    if (cambioFisicoPz.length < 1) {
      cambioFisicoPz = 0;
    }
    if (degusPz.length < 1) {
      degusPz = 0;
    }

    if (listaClavesProductos.length > 0) {
      if (listaClavesProductos.includes(clave)) {
        limpiarCampos();
        $.toaster({ priority: 'warning', title: 'Mensaje de información', message: `El producto ${clave} ya fue agregado` });
      }
      else {
        let fila = `<tr>
                      <td>${clave}</td>
                      <td>${nombre}</td>
                      <td>${pedidoPz}</td>
                      <td>${degusPz}</td>
                      <td>${cambioFisicoPz}</td>
                      <td style="display:none;">${empaque}</td>
                      <td>${totalPz}</td>
                      <td>${totalKg}</td>
                      <td><button class="btn btn-warning" type="button" onclick="modalEditarProducto('${clave}')"><span class="glyphicon glyphicon-pencil"></span></button></td>
                      <td><button class="btn btn-danger" type="button" onclick="eliminarProductoDePedido('${clave}')"><span class="glyphicon glyphicon-trash"></span></button></td>
                    </tr>`;

        //$('#filaTotales').before(fila);
        $('#productosPedido tbody').append(fila);
        calcularTotales();

        let degusKg = (degusPz * empaque).toFixed(4);
        let cambioFisicoKg = (cambioFisicoPz * empaque).toFixed(4);
        let pedidoKg = (pedidoPz * empaque).toFixed(4);

        let datosProducto = {
          clave: clave,
          claveConsorcio: claveConsorcio,
          nombre: nombre,
          pedidoPz: Number(pedidoPz),
          pedidoKg: Number(pedidoKg),
          degusPz: Number(degusPz),
          degusKg: Number(degusKg),
          cambioFisicoPz: Number(cambioFisicoPz),
          cambioFisicoKg: Number(cambioFisicoKg),
          totalPz: Number(totalPz),
          totalKg: Number(totalKg),
          precioUnitario: Number(precioUnitario),
          unidad: unidad
        };
        listaProductosPedido.push(datosProducto);
        listaClavesProductos.push(clave);

        limpiarCampos();
        $.toaster({ priority: 'info', title: 'Mensaje de producto', message: `Se agregó el producto ${clave} a la lista` });
      }
    }
    else {
      let fila = `<tr>
                    <td>${clave}</td>
                    <td>${nombre}</td>
                    <td>${pedidoPz}</td>
                    <td>${degusPz}</td>
                    <td>${cambioFisicoPz}</td>
                    <td style="display:none;">${empaque}</td>
                    <td>${totalPz}</td>
                    <td>${totalKg}</td>
                    <td><button class="btn btn-warning" type="button" onclick="modalEditarProducto('${clave}')"><span class="glyphicon glyphicon-pencil"></span></button></td>
                    <td><button class="btn btn-danger" type="button" onclick="eliminarProductoDePedido('${clave}')"><span class="glyphicon glyphicon-trash"></span></button></td>
                  </tr>`;

      //$('#filaTotales').before(fila);
      $('#productosPedido tbody').append(fila);
      calcularTotales();

      let degusKg = (degusPz * empaque).toFixed(4);
      let cambioFisicoKg = (cambioFisicoPz * empaque).toFixed(4);
      let pedidoKg = (pedidoPz * empaque).toFixed(4);

      let datosProducto = {
        clave: clave,
        claveConsorcio: claveConsorcio,
        nombre: nombre,
        pedidoPz: Number(pedidoPz),
        degusPz: Number(degusPz),
        cambioFisicoPz: Number(cambioFisicoPz),
        totalPz: Number(totalPz),
        totalKg: Number(totalKg),
        precioUnitario: Number(precioUnitario),
        unidad: unidad,
        degusKg: Number(degusKg),
        cambioFisicoKg: Number(cambioFisicoKg),
        pedidoKg: Number(pedidoKg)
      };
      listaProductosPedido.push(datosProducto);
      listaClavesProductos.push(clave);

      limpiarCampos();
      $.toaster({ priority: 'info', title: 'Mensaje de producto', message: 'Se agregó el producto ' + clave + ' a la lista' });
    }
  }
  else {
    if (productoSeleccionado == null || productoSeleccionado == undefined) {
      $('#productos').parent().addClass('has-error');
      $('#helpblockProductos').show();
    }
    else {
      $('#productos').parent().removeClass('has-error');
      $('#helpblockProductos').hide();
    }
    if (pedidoPz.length < 1) {
      $('#pedidoPz').parent().addClass('has-error');
      $('#helpblockPedidoPz').show();
    }
    else {
      $('#pedidoPz').parent().removeClass('has-error');
      $('#helpblockPedidoPz').hide();
    }
  }
}

$('#checkMostrar').change(function () {
  if ($(this).prop('checked')) {
    $('#nuevaContraseña').attr('type', 'text');
  }
  else {
    $('#nuevaContraseña').attr('type', 'password');
  }
});

function mostrarContadorKilos() {
  let uid = auth.currentUser.uid;
  let rutaUsuario = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  rutaUsuario.on('value', function (snapshot) {
    let contadorKilos = snapshot.val().contadorKilos;

    if (contadorKilos == undefined) {
      $('#contadorKilos').html('0');
    }
    else {
      $('#contadorKilos').html(contadorKilos);
    }
  });
}

function guardarEstadistica(claveProducto, nombreProducto, zona, fecha, totalKilos, totalPiezas) {
  db.ref(`estadisticasProductos/`).push({
    clave: claveProducto,
    nombre: nombreProducto,
    zona: zona,
    totalKilos: totalKilos,
    totalPiezas: totalPiezas,
    fecha: fecha
  });
}

function vaciarCampos() {
  $("#tiendas").val($('#tiendas > option:first').val());
  $('#promotora').val('');
  $('#productos').val($('#productos > option:first').val());
  $('#productos').focus();
  $('#claveConsorcio').val('');
  $('#productosPedido tbody').empty();
  $('#productosPedido tfoot').empty()
    .append(`<tr id="filaTotales">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>Totales</td>
              <td class="hidden"></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>`);
  listaProductosPedido.length = 0;
  listaClavesProductos.length = 0;
  $('#pedido').removeClass('active in');
  $('#home').addClass('active in');
}

function enviarPedido(encabezado, idTienda) {
  let key = db.ref('pedidoEntrada/').push(encabezado).getKey(),
    pedidoDetalleRef = db.ref(`pedidoEntrada/${key}/detalle`);

  for (let producto in listaProductosPedido) {
    pedidoDetalleRef.push(listaProductosPedido[producto]);
    let claveProducto = listaProductosPedido[producto].clave;
    let nombre = listaProductosPedido[producto].nombre;
    let ruta = encabezado.encabezado.ruta
    let fechaCaptura = encabezado.encabezado.fechaCaptura;
    let totalKg = Number(listaProductosPedido[producto].totalKg);
    let totalPz = Number(listaProductosPedido[producto].totalPz);

    guardarEstadistica(claveProducto, nombre, ruta, fechaCaptura, totalKg, totalPz);
  }

  /* $.ajax({
    data:  parametros, //datos que se envian a traves de ajax
    url:   'ejemplo_ajax_proceso.php', //archivo que recibe la peticion
    type:  'post', //método de envio
    beforeSend: function () {
            $("#resultado").html("Procesando, espere por favor...");
    },
    success:  function (response) { //una vez que el archivo recibe el request lo procesa y lo devuelve
            $("#resultado").html(response);
    }
  }); */

  let uid = auth.currentUser.uid;

  let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuarioRef.once('value', function (snapshot) {
    let region = snapshot.val().region,
      contadorKilos = snapshot.val().contadorKilos,
      historialPedidosRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`),
      keyHistorial = historialPedidosRef.push(encabezado).getKey(),
      pedidoDetalleHistorialRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos/${keyHistorial}/detalle`),
      //variables para mandar pedidos a historial para que los gerentes vean cuantos pedidos manda cada quien de su zona
      rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`),
      claveHistorial = rutaHistorialPedidosGerentes.push(encabezado).getKey(),
      rutaDetallesHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos/${claveHistorial}/detalle`);

    for (let producto in listaProductosPedido) {
      pedidoDetalleHistorialRef.push(listaProductosPedido[producto]);
      rutaDetallesHistorialPedidosGerentes.push(listaProductosPedido[producto]);
    }

    if (contadorKilos == undefined) {
      contadorKilos = 0
    }
    let kilos = Number(contadorKilos) + Number(TKilos);
    kilos = Number(kilos.toFixed(2));

    usuarioRef.update({
      contadorKilos: kilos
    });

    vaciarCampos();
  });

  let rutaContadorPedidos = db.ref('contadorPedidos');
  rutaContadorPedidos.once('value', function (snapshot) {
    let cantidad = snapshot.val().cantidad;
    rutaContadorPedidos.update({
      cantidad: cantidad + 1
    });
  });

  //Envío de notificación al almacen
  let usuariosAlmacenRef = db.ref('usuarios/planta/almacen');
  usuariosAlmacenRef.once('value', function (snapshot) {
    let usuarios = snapshot.val();
    for (let usuario in usuarios) {
      let notificacionesListaRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
      moment.locale('es');
      let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
      let fecha = formato.toString();
      let notificacion = {
        fecha: fecha,
        leida: false,
        mensaje: `Se ha generado un pedido con id: ${key} y clave: ${clave}`,
        idPedido: key,
        clavePedido: clave,
      };
      notificacionesListaRef.push(notificacion);

      let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}`);
      notificacionesRef.once('value', function (snapshot) {
        let notusuario = snapshot.val();
        let cont = notusuario.cont + 1;

        notificacionesRef.update({ cont: cont });
      });
    }
  });

  swal({
    title: 'Mensaje de pedido',
    text: 'El pedido se ha enviado con éxito',
  })
}

let count = 0;

function guardarPedido() {
  if (listaProductosPedido.length > 0) {
    let pedidosRef = db.ref('pedidoEntrada');
    pedidosRef.once('value', function (snapshot) {
      let existe = (snapshot.val() != null);
      if (existe) {
        let listapedidos = snapshot.val();

        let keys = Object.keys(listapedidos),
            last = keys[keys.length - 1],
            ultimoPedido = listapedidos[last],
            lastclave = ultimoPedido.encabezado.clave,
            //pedidoRef = db.ref('pedidoEntrada/'),
            tienda = $('#tienda').val(),
            regionTienda = $('#region').val(),
            consorcio = $('#consorcio').val(),
            ruta = $('#region').val(),
            fechaCaptura = moment().format('DD/MM/YYYY'),
            uid = auth.currentUser.uid,
            idTienda = $('#tiendas').val(),
            estandarVenta = Number($('#estandarVenta').val());

        let encabezado = {
          encabezado: {
            clave: lastclave + 1,
            fechaCaptura: fechaCaptura,
            tienda: tienda,
            consorcio: consorcio,
            ruta: ruta,
            fechaRuta: "",
            estado: "Pendiente",
            promotora: uid,
            numOrden: "",
            //cantidadProductos: listaProductosPedido.length,
            totalKilos: Number(TKilos),
            totalPiezas: Number(TPiezas),
            agrupado: false,
            pedidoBajo: false,
            estandarVenta: estandarVenta
          }
        };

        let tKilosIf = Number(TKilos);

        if (promotoraFb && tKilosIf < 135) {
          //let diferencia = (TKilos / estandarVenta * 100).toFixed(2);

          /* swal({
            title: 'Alerta',
            text: `El pedido está al ${diferencia} % del estándar de venta de esta tienda. ¿Deseas enviarlo de todas formas?`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Enviar'
          }).then((result) => {
            if (result.value) {
              encabezado.encabezado.pedidoBajo = true;
              enviarPedido(encabezado, idTienda)
            }
          }); */
          count++;

          if(count <= 2) {
            swal({
              type: 'warning',
              title: 'Alerta',
              text: 'Tu pedido no alcanza los 135 kg, favor de verificarlo.',
            });
          } else {
            swal({
              type: 'warning',
              title: 'Alerta',
              text: 'Tu pedido no pudo ser enviado, favor de contactar al gerente de zona o gerente de ventas.',
            });

            vaciarCampos();
            count = 0;
          }
        }
        else {
          tKilosIf < 135 ? encabezado.encabezado.pedidoBajo = true : encabezado.encabezado.pedidoBajo = false;
          //alert('Se envio el pedido')
          let diferencia = (tKilosIf / estandarVenta * 100).toFixed(2);

          swal({
            title: 'Mensaje',
            text: `El pedido está al ${diferencia} % del estándar de venta de esta tienda. ¿Deseas enviarlo?`,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Enviar',
            reverseButtons: true
          }).then((result) => {
            if (result.value) {
              // encabezado.encabezado.pedidoBajo = true;
              enviarPedido(encabezado, idTienda)
            }
          });
        }
      }
      else {
        let pedidoRef = db.ref('pedidoEntrada/');
        let tienda = $('#tienda').val();
        let consorcio = $('#consorcio').val();
        // let ruta = $('#region').val();
        let fechaCaptura = moment().format('DD/MM/YYYY');
        let uid = auth.currentUser.uid;
        let idTienda = $('#tiendas').val();
        let regionTienda = $('#region').val();
        let estandarVenta = Number($('#estandarVenta').val());

        let encabezado = {
          encabezado: {
            clave: 1,
            fechaCaptura: fechaCaptura,
            tienda: tienda,
            consorcio: consorcio,
            ruta: ruta,
            fechaRuta: "",
            estado: "Pendiente",
            promotora: uid,
            numOrden: "",
            //cantidadProductos: listaProductosPedido.length,
            totalKilos: Number(TKilos),
            totalPiezas: Number(TPiezas),
            agrupado: false,
            pedidoBajo: false
          }
        };

        let tKilosIf = Number(TKilos);

        if (promotoraFb && tKilosIf < 135) {
          count++;

          if(count <= 3) {
            swal({
              type: 'warning',
              title: 'Alerta',
              text: 'Tu pedido no alcanza los 135 kg, favor de verificarlo',
            });
          } else {
            swal({
              type: 'warning',
              title: 'Alerta',
              text: 'Tu pedido no pudo ser enviado, favor de contactar al gerente de zona o gerente de ventas.',
            });

            vaciarCampos();
          }
        }
        else {
          //alert('Se envio el pedido')
          tKilosIf < 135 ? encabezado.encabezado.pedidoBajo = true : encabezado.encabezado.pedidoBajo = false;
          let diferencia = (tKilosIf / estandarVenta * 100).toFixed(2);

          swal({
            title: 'Mensaje',
            text: `El pedido está al ${diferencia} % del estándar de venta de esta tienda. ¿Deseas enviarlo?`,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Enviar',
            reverseButtons: true
          }).then((result) => {
            if (result.value) {
              // encabezado.encabezado.pedidoBajo = true;
              enviarPedido(encabezado, idTienda)
            }
          });
        }
      }
    });
  }
  else {
    $.toaster({ priority: 'danger', title: 'Mensaje de error', message: 'No se puede enviar un pedido sin productos' });
  }
}

/* function guardarPedido() {
  if (listaProductosPedido.length > 0) {
    let confirmar = confirm("¿Está seguro(a) de enviar el pedido?");
    if (confirmar) {

      let pedidosRef = db.ref('pedidoEntrada');
      pedidosRef.once('value', function (snapshot) {
        let existe = (snapshot.val() != null);
        if (existe) {
          let listapedidos = snapshot.val();

          let keys = Object.keys(listapedidos);
          last = keys[keys.length - 1],
            ultimoPedido = listapedidos[last],
            lastclave = ultimoPedido.encabezado.clave,
            //pedidoRef = db.ref('pedidoEntrada/'),
            tienda = $('#tienda').val(),
            regionTienda = $('#region').val(),
            consorcio = $('#consorcio').val(),
            ruta = $('#region').val(),
            fechaCaptura = moment().format('DD/MM/YYYY'),
            uid = auth.currentUser.uid,
            idTienda = $('#tiendas').val();

          let encabezado = {
            encabezado: {
              clave: lastclave + 1,
              fechaCaptura: fechaCaptura,
              tienda: tienda,
              consorcio: consorcio,
              ruta: ruta,
              fechaRuta: "",
              estado: "Pendiente",
              promotora: uid,
              numOrden: "",
              //cantidadProductos: listaProductosPedido.length,
              totalKilos: Number(TKilos),
              totalPiezas: Number(TPiezas),
              agrupado: false,
              pedidoBajo: false
            }
          };

          db.ref(`estandares/${regionTienda}/${idTienda}`).once('value', function (snapshot) {
            let tienda = snapshot.val();
            let estandarVenta = tienda.estandarVenta;

            if (TKilos < estandarVenta) {
              let diferencia = (TKilos / estandarVenta * 100).toFixed(2);

              swal({
                title: 'Alerta',
                text: `El pedido está al ${diferencia} % del estándar de venta de esta tienda. ¿Deseas enviarlo de todas formas?`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Enviar'
              }).then((result) => {
                if (result.value) {
                  encabezado.encabezado.pedidoBajo = true;

                  let key = db.ref('pedidoEntrada/').push(encabezado).getKey(),
                    pedidoDetalleRef = db.ref(`pedidoEntrada/${key}/detalle`);

                  for (let producto in listaProductosPedido) {
                    pedidoDetalleRef.push(listaProductosPedido[producto]);
                    let claveProducto = listaProductosPedido[producto].clave;
                    let nombre = listaProductosPedido[producto].nombre;
                    let totalKg = Number(listaProductosPedido[producto].totalKg);
                    let totalPz = Number(listaProductosPedido[producto].totalPz);

                    guardarEstadistica(claveProducto, nombre, ruta, fechaCaptura, totalKg, totalPz);
                  }

                  // $.ajax({
                  //   data:  parametros, //datos que se envian a traves de ajax
                  //   url:   'ejemplo_ajax_proceso.php', //archivo que recibe la peticion
                  //   type:  'post', //método de envio
                  //   beforeSend: function () {
                  //           $("#resultado").html("Procesando, espere por favor...");
                  //   },
                  //   success:  function (response) { //una vez que el archivo recibe el request lo procesa y lo devuelve
                  //           $("#resultado").html(response);
                  //   }
                  // });

                  let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
                  usuarioRef.once('value', function (snapshot) {
                    let region = snapshot.val().region,
                      contadorKilos = snapshot.val().contadorKilos,
                      historialPedidosRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`),
                      keyHistorial = historialPedidosRef.push(encabezado).getKey(),
                      pedidoDetalleHistorialRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos/${keyHistorial}/detalle`),
                      //variables para mandar pedidos a historial para que los gerentes vean cuantos pedidos manda cada quien de su zona
                      rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`),
                      claveHistorial = rutaHistorialPedidosGerentes.push(encabezado).getKey(),
                      rutaDetallesHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos/${claveHistorial}/detalle`);

                    for (let producto in listaProductosPedido) {
                      pedidoDetalleHistorialRef.push(listaProductosPedido[producto]);
                      rutaDetallesHistorialPedidosGerentes.push(listaProductosPedido[producto]);
                    }

                    if (contadorKilos == undefined) {
                      contadorKilos = 0
                    }
                    let kilos = Number(contadorKilos) + Number(TKilos);
                    kilos = Number(kilos.toFixed(2));

                    usuarioRef.update({
                      contadorKilos: kilos
                    });

                    $("#tiendas").val($('#tiendas > option:first').val());
                    $('#productos').val($('#productos > option:first').val());
                    $('#productos').focus();
                    $('#claveConsorcio').val('');
                    $('#productosPedido tbody').empty()
                      .append(`<tr id="filaTotales">
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>Totales</td>
                              <td class="hidden"></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>`);
                    listaProductosPedido.length = 0;
                    listaClavesProductos.length = 0;
                    $('#panel').addClass('active in');
                    $('#pedido').removeClass('active in');
                  });

                  let rutaContadorPedidos = db.ref('contadorPedidos');
                  rutaContadorPedidos.once('value', function (snapshot) {
                    let cantidad = snapshot.val().cantidad;
                    rutaContadorPedidos.update({
                      cantidad: cantidad + 1
                    });
                  });

                  //Envío de notificación al almacen
                  let usuariosAlmacenRef = db.ref('usuarios/planta/almacen');
                  usuariosAlmacenRef.once('value', function (snapshot) {
                    let usuarios = snapshot.val();
                    for (let usuario in usuarios) {
                      let notificacionesListaRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
                      moment.locale('es');
                      let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
                      let fecha = formato.toString();
                      let notificacion = {
                        fecha: fecha,
                        leida: false,
                        mensaje: `Se ha generado un pedido con id: ${key} y clave: ${clave}`,
                        idPedido: key,
                        clavePedido: clave,
                      };
                      notificacionesListaRef.push(notificacion);

                      let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}`);
                      notificacionesRef.once('value', function (snapshot) {
                        let notusuario = snapshot.val();
                        let cont = notusuario.cont + 1;

                        notificacionesRef.update({ cont: cont });
                      });
                    }
                  });

                  swal({
                    type: 'success',
                    title: 'Mensaje de pedido',
                    text: 'El pedido se ha enviado con éxito',
                  })
                  // $.toaster({ priority : 'success', title : 'Mensaje de pedido', message : 'Tu pedido se ha enviado con éxito'});
                }
              })
            }
            else {
              let key = db.ref('pedidoEntrada/').push(encabezado).getKey(),
                pedidoDetalleRef = db.ref(`pedidoEntrada/${key}/detalle`);

              for (let producto in listaProductosPedido) {
                pedidoDetalleRef.push(listaProductosPedido[producto]);
                let claveProducto = listaProductosPedido[producto].clave;
                let nombre = listaProductosPedido[producto].nombre;
                let totalKg = Number(listaProductosPedido[producto].totalKg);
                let totalPz = Number(listaProductosPedido[producto].totalPz);

                guardarEstadistica(claveProducto, nombre, ruta, fechaCaptura, totalKg, totalPz);
              }

              // $.ajax({
              //   data:  parametros, //datos que se envian a traves de ajax
              //   url:   'ejemplo_ajax_proceso.php', //archivo que recibe la peticion
              //   type:  'post', //método de envio
              //   beforeSend: function () {
              //           $("#resultado").html("Procesando, espere por favor...");
              //   },
              //   success:  function (response) { //una vez que el archivo recibe el request lo procesa y lo devuelve
              //           $("#resultado").html(response);
              //   }
              // });

              let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
              usuarioRef.once('value', function (snapshot) {
                let region = snapshot.val().region,
                  contadorKilos = snapshot.val().contadorKilos,
                  historialPedidosRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`),
                  keyHistorial = historialPedidosRef.push(encabezado).getKey(),
                  pedidoDetalleHistorialRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos/${keyHistorial}/detalle`),
                  //variables para mandar pedidos a historial para que los gerentes vean cuantos pedidos manda cada quien de su zona
                  rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`),
                  claveHistorial = rutaHistorialPedidosGerentes.push(encabezado).getKey(),
                  rutaDetallesHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos/${claveHistorial}/detalle`);

                for (let producto in listaProductosPedido) {
                  pedidoDetalleHistorialRef.push(listaProductosPedido[producto]);
                  rutaDetallesHistorialPedidosGerentes.push(listaProductosPedido[producto]);
                }

                if (contadorKilos == undefined) {
                  contadorKilos = 0
                }
                let kilos = Number(contadorKilos) + Number(TKilos);
                kilos = Number(kilos.toFixed(2));

                usuarioRef.update({
                  contadorKilos: kilos
                });

                $("#tiendas").val($('#tiendas > option:first').val());
                $('#productos').val($('#productos > option:first').val());
                $('#productos').focus();
                $('#claveConsorcio').val('');
                $('#productosPedido tbody').empty()
                  .append(`<tr id="filaTotales">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Totales</td>
                          <td class="hidden"></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>`);
                listaProductosPedido.length = 0;
                listaClavesProductos.length = 0;
                $('#panel').addClass('active in');
                $('#pedido').removeClass('active in');
              });

              let rutaContadorPedidos = db.ref('contadorPedidos');
              rutaContadorPedidos.once('value', function (snapshot) {
                let cantidad = snapshot.val().cantidad;
                rutaContadorPedidos.update({
                  cantidad: cantidad + 1
                });
              });

              //Envío de notificación al almacen
              let usuariosAlmacenRef = db.ref('usuarios/planta/almacen');
              usuariosAlmacenRef.once('value', function (snapshot) {
                let usuarios = snapshot.val();
                for (let usuario in usuarios) {
                  let notificacionesListaRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
                  moment.locale('es');
                  let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
                  let fecha = formato.toString();
                  let notificacion = {
                    fecha: fecha,
                    leida: false,
                    mensaje: `Se ha generado un pedido con id: ${key} y clave: ${clave}`,
                    idPedido: key,
                    clavePedido: clave,
                  };
                  notificacionesListaRef.push(notificacion);

                  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}`);
                  notificacionesRef.once('value', function (snapshot) {
                    let notusuario = snapshot.val();
                    let cont = notusuario.cont + 1;

                    notificacionesRef.update({ cont: cont });
                  });
                }
              });
            }
          });
        }
        else {
          let pedidoRef = db.ref('pedidoEntrada/');
          let tienda = $('#tienda').val();
          let consorcio = $('#consorcio').val();
          // let ruta = $('#region').val();
          let fechaCaptura = moment().format('DD/MM/YYYY');
          let uid = auth.currentUser.uid;
          let idTienda = $('#tiendas').val();
          let regionTienda = $('#region').val();

          let encabezado = {
            encabezado: {
              clave: 1,
              fechaCaptura: fechaCaptura,
              tienda: tienda,
              consorcio: consorcio,
              ruta: ruta,
              fechaRuta: "",
              estado: "Pendiente",
              promotora: uid,
              numOrden: "",
              //cantidadProductos: listaProductosPedido.length,
              totalKilos: Number(TKilos),
              totalPiezas: Number(TPiezas),
              agrupado: false,
              pedidoBajo: false
            }
          };

          db.ref(`estandares/${region}/${idTienda}`).once('value', function (snapshot) {
            let tienda = snapshot.val();
            let estandarVenta = tienda.estandarVenta;

            if (TKilos < estandarVenta) {
              let diferencia = (TKilos / estandarVenta * 100).toFixed(2);

              swal({
                title: 'Alerta',
                text: `El pedido está al ${diferencia} % del estándar de venta de esta tienda. ¿Deseas enviarlo de todas formas?`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Enviar'
              }).then((result) => {
                if (result.value) {

                  let key = db.ref('pedidoEntrada/').push(encabezado).getKey(),
                    pedidoDetalleRef = db.ref(`pedidoEntrada/${key}/detalle`);

                  for (let producto in listaProductosPedido) {
                    pedidoDetalleRef.push(listaProductosPedido[producto]);
                    let claveProducto = listaProductosPedido[producto].clave;
                    let nombre = listaProductosPedido[producto].nombre;
                    let totalKg = Number(listaProductosPedido[producto].totalKg);
                    let totalPz = Number(listaProductosPedido[producto].totalPz);

                    guardarEstadistica(claveProducto, nombre, ruta, fechaCaptura, totalKg, totalPz);
                  }

                  let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
                  usuarioRef.once('value', function (snapshot) {
                    let region = snapshot.val().region,
                      contadorKilos = snapshot.val().contadorKilos,
                      historialPedidosRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`),
                      keyHistorial = historialPedidosRef.push(encabezado).getKey(),
                      pedidoDetalleHistorialRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos/${keyHistorial}/detalle`),
                      //variables para mandar pedidos a historial para que los gerentes vean cuantos pedidos manda cada quien de su zona
                      rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`),
                      claveHistorial = rutaHistorialPedidosGerentes.push(encabezado).getKey(),
                      rutaDetallesHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos/${claveHistorial}/detalle`);

                    for (let producto in listaProductosPedido) {
                      pedidoDetalleHistorialRef.push(listaProductosPedido[producto]);
                      rutaDetallesHistorialPedidosGerentes.push(listaProductosPedido[producto]);
                    }

                    if (contadorKilos == undefined) {
                      contadorKilos = 0
                    }

                    kilos = Number(contadorKilos) + Number(TKilos);
                    kilos = Number(kilos.toFixed(2));

                    usuarioRef.update({
                      contadorKilos: kilos
                    });

                    $("#tiendas").val($('#tiendas > option:first').val());
                    $('#productos').val($('#productos > option:first').val());
                    $('#productos').focus();
                    $('#claveConsorcio').val('');
                    $('#productosPedido tbody').empty()
                      .append(`<tr id="filaTotales">
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>Totales</td>
                                <td class="hidden"></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>`);
                    listaProductosPedido.length = 0;
                    listaClavesProductos.length = 0;
                    $('#panel').addClass('active in');
                    $('#pedido').removeClass('active in');
                  });

                  let rutaContadorPedidos = db.ref('contadorPedidos');
                  rutaContadorPedidos.once('value', function (snapshot) {
                    let cantidad = snapshot.val().cantidad;
                    rutaContadorPedidos.update({
                      cantidad: cantidad + 1
                    });
                  });

                  //Envío de notificación al almacen
                  let usuariosAlmacenRef = db.ref('usuarios/planta/almacen');
                  usuariosAlmacenRef.once('value', function (snapshot) {
                    let usuarios = snapshot.val();
                    for (let usuario in usuarios) {
                      let notificacionesListaRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
                      moment.locale('es');
                      let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
                      let fecha = formato.toString();
                      let notificacion = {
                        fecha: fecha,
                        leida: false,
                        mensaje: `Se ha generado un pedido con id: ${key} y clave: ${clave}`,
                        idPedido: key,
                        clavePedido: clave,
                      };
                      notificacionesListaRef.push(notificacion);

                      let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}`);
                      notificacionesRef.once('value', function (snapshot) {
                        let notusuario = snapshot.val();
                        let cont = notusuario.cont + 1;

                        notificacionesRef.update({ cont: cont });
                      });
                    }
                  });

                  swal({
                    type: 'success',
                    title: 'Mensaje de pedido',
                    text: 'El pedido se ha enviado con éxito',
                  })
                  // $.toaster({ priority : 'success', title : 'Mensaje de pedido', message : 'Tu pedido se ha enviado con éxito'});
                }
              });
            }
            else {
              let key = db.ref('pedidoEntrada/').push(encabezado).getKey(),
                pedidoDetalleRef = db.ref(`pedidoEntrada/${key}/detalle`);

              for (let producto in listaProductosPedido) {
                pedidoDetalleRef.push(listaProductosPedido[producto]);
                let claveProducto = listaProductosPedido[producto].clave;
                let nombre = listaProductosPedido[producto].nombre;
                let totalKg = Number(listaProductosPedido[producto].totalKg);
                let totalPz = Number(listaProductosPedido[producto].totalPz);

                guardarEstadistica(claveProducto, nombre, ruta, fechaCaptura, totalKg, totalPz);
              }

              // $.ajax({
              //   data:  parametros, //datos que se envian a traves de ajax
              //   url:   'ejemplo_ajax_proceso.php', //archivo que recibe la peticion
              //   type:  'post', //método de envio
              //   beforeSend: function () {
              //           $("#resultado").html("Procesando, espere por favor...");
              //   },
              //   success:  function (response) { //una vez que el archivo recibe el request lo procesa y lo devuelve
              //           $("#resultado").html(response);
              //   }
              // });

              let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
              usuarioRef.once('value', function (snapshot) {
                let region = snapshot.val().region,
                  contadorKilos = snapshot.val().contadorKilos,
                  historialPedidosRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`),
                  keyHistorial = historialPedidosRef.push(encabezado).getKey(),
                  pedidoDetalleHistorialRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos/${keyHistorial}/detalle`),
                  //variables para mandar pedidos a historial para que los gerentes vean cuantos pedidos manda cada quien de su zona
                  rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`),
                  claveHistorial = rutaHistorialPedidosGerentes.push(encabezado).getKey(),
                  rutaDetallesHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos/${claveHistorial}/detalle`);

                for (let producto in listaProductosPedido) {
                  pedidoDetalleHistorialRef.push(listaProductosPedido[producto]);
                  rutaDetallesHistorialPedidosGerentes.push(listaProductosPedido[producto]);
                }

                if (contadorKilos == undefined) {
                  contadorKilos = 0
                }
                let kilos = Number(contadorKilos) + Number(TKilos);
                kilos = Number(kilos.toFixed(2));

                usuarioRef.update({
                  contadorKilos: kilos
                });

                $("#tiendas").val($('#tiendas > option:first').val());
                $('#productos').val($('#productos > option:first').val());
                $('#productos').focus();
                $('#claveConsorcio').val('');
                $('#productosPedido tbody').empty()
                  .append(`<tr id="filaTotales">
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>Totales</td>
                              <td class="hidden"></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>`);
                listaProductosPedido.length = 0;
                listaClavesProductos.length = 0;
                $('#panel').addClass('active in');
                $('#pedido').removeClass('active in');
              });

              let rutaContadorPedidos = db.ref('contadorPedidos');
              rutaContadorPedidos.once('value', function (snapshot) {
                let cantidad = snapshot.val().cantidad;
                rutaContadorPedidos.update({
                  cantidad: cantidad + 1
                });
              });

              //Envío de notificación al almacen
              let usuariosAlmacenRef = db.ref('usuarios/planta/almacen');
              usuariosAlmacenRef.once('value', function (snapshot) {
                let usuarios = snapshot.val();
                for (let usuario in usuarios) {
                  let notificacionesListaRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
                  moment.locale('es');
                  let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
                  let fecha = formato.toString();
                  let notificacion = {
                    fecha: fecha,
                    leida: false,
                    mensaje: `Se ha generado un pedido con id: ${key} y clave: ${clave}`,
                    idPedido: key,
                    clavePedido: clave,
                  };
                  notificacionesListaRef.push(notificacion);

                  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}`);
                  notificacionesRef.once('value', function (snapshot) {
                    let notusuario = snapshot.val();
                    let cont = notusuario.cont + 1;

                    notificacionesRef.update({ cont: cont });
                  });
                }
              });

              swal({
                type: 'success',
                title: 'Mensaje de pedido',
                text: 'El pedido se ha enviado con éxito',
              })
            }
          });
        }
      });
    }
  }
  else {
    $.toaster({ priority: 'danger', title: 'Mensaje de error', message: 'No se puede enviar un pedido sin productos' });
  }
} */

function mostrarHistorialPedidos() {
  let uid = auth.currentUser.uid;

  let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuarioRef.on('value', function (snapshot) {
    let region = snapshot.val().region;

    let rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`);
    rutaHistorialPedidosGerentes.once('value', function (snapshot) {
      let pedidos = snapshot.val();
      let filas = "";
      let inverso = [], ids = [];

      for (let pedido in pedidos) {
        if (pedidos[pedido].encabezado.promotora == uid) {
          inverso.unshift(pedidos[pedido]);
          ids.unshift(pedido);
        }
      }
      // inverso.reverse();

      for (let i in inverso) {
        let encabezado = inverso[i].encabezado;
        let dia = encabezado.fechaCaptura.substr(0, 2);
        let mes = encabezado.fechaCaptura.substr(3, 2);
        let año = encabezado.fechaCaptura.substr(6, 4);
        let fechaCaptura = `${mes}/${dia}/${año}`;
        moment.locale('es');
        let fechaCapturaMostrar = moment(fechaCaptura).format('LL');
        filas += `<tr>
                    <td><a href="#detallesPedido" aria-controls="detallesPedido" role="tab" data-toggle="tab" onclick="mostrarDatosPedido('${region}', '${ids[i]}')">${fechaCapturaMostrar} - ${encabezado.ruta} - ${encabezado.tienda}</a></td>
                  </tr>`;
      }
      $('#historialPedidos').html(filas);
    });
  });
}

function mostrarDatosPedido(region, idPedido) {
  let rutaPedidoHistorial = db.ref(`historialPedidosGerentes/${region}/pedidos/${idPedido}`);
  rutaPedidoHistorial.on('value', function (snapshot) {
    let datos = snapshot.val();

    let encabezado = datos.encabezado;
    let detalle = datos.detalle;

    let filas = "";
    for (let producto in detalle) {
      filas += `<tr>
                  <td>${detalle[producto].clave}</td>
                  <td>${detalle[producto].nombre}</td>
                  <td>${detalle[producto].pedidoPz}</td>
                  <td>${detalle[producto].degusPz}</td>
                  <td>${detalle[producto].cambioFisicoPz}</td>
                  <td>${detalle[producto].totalPz}</td>
                  <td>${detalle[producto].totalKg}</td>
                </tr>`;
    }

    $('#tiendaHistorial').val(encabezado.tienda);
    $('#fechaHistorial').val(encabezado.fechaCaptura)
    //$('#filaTotalesHistorial').before(filas);
    let rutaUsuarios = db.ref(`usuarios/tiendas/supervisoras/${encabezado.promotora}`);
    rutaUsuarios.on('value', function (snapshot) {
      let nombre = snapshot.val().nombre;
      $('#coordinadorHistorial').val(nombre);
    });

    $('#productosPedidoHistorial tbody').html(filas);
    calcularTotalesHistorial();
  });
}

//var fotoFile;
function ImprimirObjeto(o) {
  var salida = "";
  for (var p in o) {
    salida += p + ': ' + o[p] + 'n';
  }
  alert(salida);
}

var fotoProducto;

function tomarFoto() {
  navigator.camera.getPicture(
    function (imageData) {
      let image = document.getElementById('foto');
      image.src = "data:image/jpeg;base64," + imageData;;
      fotoProducto = imageData;
    },
    function (message) {
      alert('Falló debido a: ' + message);
    },
    {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      correctOrientation: true
    });
}

function enviarTicketCalidadProducto() {
  let producto = $('#productosTicket').val();
  let cantidad = $('#cantidadMalEstado').val();
  let fechaCaducidad = $('#fechaCaducidad').val();
  let date = new Date(fechaCaducidad);
  let fCad = moment(date).format('DD/MM/YYYY');
  let lote = $('#loteProducto').val();
  let problema = $('input:radio[name=problemasProductos]:checked').val();
  let descripcion = $('#descripcionTicket').val();
  let fecha = moment().format('DD/MM/YYYY');
  let tienda = $('#tienda').val();
  let uid = auth.currentUser.uid;

  if ((producto != null || producto != undefined) && cantidad.length > 0 && fechaCaducidad.length > 0 && lote.length > 0 && problema.length > 0 && descripcion.length > 0 && (tienda != null || tienda != undefined)) {
    let ticketsRef = db.ref('tickets/calidadProducto');
    ticketsRef.once('value', function (snapshot) {
      let tickets = snapshot.val();

      let keys = Object.keys(tickets);
      let last = keys[keys.length - 1];
      let ultimoTicket = tickets[last];
      let lastclave = ultimoTicket.clave;

      let datosTicket = {
        producto: producto,
        fechaCaducidad: fCad,
        cantidad: Number(cantidad),
        lote: lote,
        problema: problema,
        descripcion: descripcion,
        tienda: tienda,
        fecha: fecha,
        clave: lastclave + 1,
        estado: "Pendiente",
        respuesta: "",
        promotora: uid,
        fotoUrl: ""
      }

      let ticketKey = ticketsRef.push(datosTicket).getKey();
      let nameFoto = "Foto " + moment().format('DD-MM-YYYY hh:mm:ss a');
      let storageRef = storage.ref(uid + '/fotosCalidadProductos/').child(nameFoto);
      let uploadTask = storageRef.putString(fotoProducto, 'base64', { contentType: 'image/jpg' });
      uploadTask.on('state_changed', function (snapshot) {

      }, function (error) {
        //alert('Error: '+error);
      }, function () {
        let refTicket = db.ref('tickets/calidadProducto/' + ticketKey);
        let downloadURL = uploadTask.snapshot.downloadURL;
        refTicket.update({ fotoUrl: downloadURL });
        //alert('Foto enviada');
      });
    });

    $('#productosTicket').val('');
    $("#productosTicket option[value=Seleccionar]").attr('selected', true);
    $('#cantidadMalEstado').val('')
    $('#fechaCaducidad').val('');
    $('#loteProducto').val('');
    $('input:radio[name=problemasProductos]:checked').val('');
    $('#descripcionTicket').val('');
    $('#tienda').val('');
    $('#foto').attr('src', "");
  }
  else {
    if (producto == undefined || producto == null) {
      $('#productosTicket').parent().parent().addClass('has-error');
      $('#helpblockProductoTicket').show();
    }
    else {
      $('#productosTicket').parent().parent().removeClass('has-error');
      $('#helpblockProductoTicket').hide();
    }
    if (cantidad.length < 1) {
      $('#cantidadMalEstado').parent().parent().addClass('has-error');
      $('#helpblockCantidadMalEstado').show();
    }
    else {
      $('#cantidadMalEstado').parent().parent().removeClass('has-error');
      $('#helpblockCantidadMalEstado').hide();
    }
    if (fechaCaducidad.length < 1) {
      $('#fechaCaducidad').parent().parent().addClass('has-error');
      $('#helpblockFechaCaducidad').show();
    }
    else {
      $('#fechaCaducidad').parent().parent().removeClass('has-error');
      $('#helpblockFechaCaducidad').hide();
    }
    if (lote.length < 1) {
      $('#loteProducto').parent().parent().addClass('has-error');
      $('#helpblockLoteProducto').show();
    }
    else {
      $('#loteProducto').parent().parent().removeClass('has-error');
      $('#helpblockLoteProducto').hide();
    }
    if (descripcion.length < 1) {
      $('#descripcionTicket').parent().parent().addClass('has-error');
      $('#helpblockDescripcion').show();
    }
    else {
      $('#descripcionTicket').parent().parent().removeClass('has-error');
      $('#helpblockDescripcion').hide();
    }
  }
}

$('#formCalidadProducto').on('show.bs.collapse', function () {
  $('#formRetrasoPedido').collapse('hide');
});

$('#formRetrasoPedido').on('show.bs.collapse', function () {
  $('#formCalidadProducto').collapse('hide');
});

db.ref('ofertas').orderByChild('activa').equalTo(true).on('value', function (ofertasActivas) {
  let uid = auth.currentUser.uid;
  db.ref(`usuarios/tiendas/supervisoras/${uid}`).once('value', function (snapshot) {
    let zona = snapshot.val().region;

    db.ref(`zonas/${zona}`).once('value', function (snapshot) {
      let consorcios = snapshot.val().consorcios;
      let tiendas = snapshot.val().tiendas;

      let ofertasPromotora = [];
      ofertasActivas.forEach(function (oferta) {
        if (consorcios.includes(oferta.val().consorcio)) {
          let tiendasOferta = oferta.val().tiendas;
          let flag = false;
          let misTiendas = [];
          for (let tiendaOferta of tiendasOferta) {
            if (tiendas.includes(tiendaOferta)) {
              flag = true;
              misTiendas.push(tiendaOferta);
            }
          }
          if (flag) {
            ofertasPromotora.push({
              key: oferta.key,
              misTiendas: misTiendas,
              ...oferta.val()
            });
          }
        }
      });

      let numOfertas = ofertasPromotora.length;
      ofertasPromotora = ofertasPromotora.reverse();

      if (numOfertas > 0) {
        swal({
          type: 'info',
          title: 'Notificación',
          text: `¡Hay ${numOfertas} ofertas disponibles para tu zona!`
        });

        let panelsOfertas = '';
        ofertasPromotora.forEach(function (oferta) {

          let filasProductos = "";
          oferta.productos.forEach(function (producto) {
            filasProductos += `<tr>
                                <td class="text-left">${producto.clave}</td>
                                <td class="text-left">${producto.nombre}</td>
                                <td class="text-left">$ ${producto.precioOferta}</td>
                              </tr>`;
          });

          let tiendasPromotora = "";
          oferta.misTiendas.forEach(function (tienda) {
            tiendasPromotora += `<button class="btn btn-tienda">${tienda}</button> `
          });

          panelsOfertas += `<div class="panel panel-default">
                              <div class="panel-heading" role="tab">
                                <h3 class="panel-title">Oferta: <span class="text-muted">${oferta.clave}</span></h3>
                                <p class="panel-title">Consorcio: <span>${oferta.consorcio}</span></p>
                                <p class="panel-title">Fecha de inicio: <span class="text-muted">${oferta.fechaInicio}</span></p>
                                <p class="panel-title">Fecha de fin: <span class="text-muted">${oferta.fechaFin}</span></p>
                                <a class="btn btn-primary" role="button" data-toggle="collapse" data-parent="#accordion" href="#oferta-${oferta.key}" aria-expanded="true" aria-controls="oferta-${oferta.key}">
                                  <span class="glyphicon glyphicon-eye-open"></span> Ver detalles
                                </a>
                                <a class="btn btn-danger" role="button" data-toggle="collapse" data-parent="#accordion" href="#tiendas-${oferta.key}" aria-expanded="true" aria-controls="tiendas-${oferta.key}">
                                  <i class="fas fa-store"></i> Ver tiendas
                                </a>
                              </div>
                              <div id="oferta-${oferta.key}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                                <div class="panel-body">
                                  <div class="table-responsive">
                                    <table class="table table-condensed">
                                      <thead>
                                        <tr>
                                          <th>Clave</th>
                                          <th>Nombre</th>
                                          <th>Precio</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${filasProductos}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                              <div id="tiendas-${oferta.key}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                                <div class="panel-body">
                                  ${tiendasPromotora}
                                </div>
                              </div>
                            </div>`;
        });
        $('#accordion').html(panelsOfertas);
      }
      else {
        swal({
          type: 'info',
          title: "Notificación",
          text: `No hay ofertas disponibles para tu zona en este momento`
        });
        $('#contenedorOfertas').html('');
      }
    });
  });
});

function checarPorOfertas() {
  let uid = auth.currentUser.uid;
  db.ref(`usuarios/tiendas/supervisoras/${uid}`).once('value', function (snapshot) {
    let zona = snapshot.val().region;

    db.ref(`zonas/${zona}`).once('value', function (snapshot) {
      let consorcios = snapshot.val().consorcios;
      let tiendas = snapshot.val().tiendas;

      db.ref('ofertas').orderByChild('activa').equalTo(true).once('value', function (ofertasActivas) {
        let ofertasPromotora = [];

        ofertasActivas.forEach(function (oferta) {
          if (consorcios.includes(oferta.val().consorcio)) {

            let tiendasOferta = oferta.val().tiendas;
            let flag = false;
            let misTiendas = [];
            for (let tiendaOferta of tiendasOferta) {
              if (tiendas.includes(tiendaOferta)) {
                flag = true;

                misTiendas.push(tiendaOferta);
                //break;
              }
            }
            if (flag) {
              ofertasPromotora.push({
                key: oferta.key,
                misTiendas: misTiendas,
                ...oferta.val()
              });
            }
          }
        });

        let numOfertas = ofertasPromotora.length;
        ofertasPromotora = ofertasPromotora.reverse();

        if (numOfertas > 0) {
          swal({
            type: 'info',
            title: 'Notificación',
            text: `¡Hay ${numOfertas} ofertas disponibles para tu zona!`
          });
        }
        else {
          swal({
            type: 'info',
            title: "Notificación",
            text: `No hay ofertas disponibles para tu zona en este momento`
          });
          $('#contenedorOfertas').html('');
        }
      });
    });
  })
}

function mostrarDatosOferta(e, idOferta) {
  e.preventDefault()
  db.ref(`ofertas/${idOferta}`).on('value', function (snapshot) {
    let oferta = snapshot.val();
    let productos = oferta.productos;

    $('#claveOferta').html(oferta.clave);
    $('#consorcioOferta').html(oferta.consorcio);

    let filas = '';
    for (let producto of productos) {
      filas += `<tr>
                  <td>${producto.clave}</td>
                  <td>${producto.nombre}</td>
                  <td>${producto.precioOferta}</td>
                  <td>${producto.fechaInicio}</td>
                  <td>${producto.fechaFin}</td>
                </tr>`;
    }
    $('#productosOferta tbody').html(filas);
    $('#oferta').tab('show')
  });
}

function enviarPedidoMateriales() {
  let uid = getQueryVariable('id');
  db.ref(`usuarios/tiendas/supervisoras/${uid}`).once('value', function (snapshot) {
    let region = snapshot.val().region;
    let
  });
}

function llenarSelectMateriales() {
  db.ref(`materiales`).on('value', function (snapshot) {
    let materiales = snapshot.val();
    let options = '<option id="SeleccionarMaterial" value="Seleccionar" disabled selected>Seleccionar</option>';

    for (let material in materiales) {
      if (materiales[material].activo) {
        options += `<option value="${material}"> ${material} ${materiales[material].nombre} ${materiales[material].empaque}</option>`;
      }
    }
    $('#selectMateriales').html(options);
  });
}

$('#selectMateriales').change(function () {
  let clave = $('#selectMateriales').val();

  db.ref(`materiales/${clave}`).on('value', function (snapshot) {
    let material = snapshot.val();
    $('#claveMateriales').val(clave);
    $('#nombreMateriales').val(material.nombre);
    $('#empaqueMateriales').val(material.empaque);
    $('#precioUnitarioMateriales').val(material.precioUnitario);
    $('#unidadMateriales').val(material.unidad);
  });

  if (this.value != null || this.value != undefined) {
    $('#materiales').parent().removeClass('has-error');
    $('#helpblockMateriales').hide();
  } else {
    $('#materiales').parent().addClass('has-error');
    $('#helpblockMateriales').show();
  }
});

function agregarMaterial() {
  let clave = $('#claveMateriales').val();
  let nombre = $('#nombreMateriales').val();
  let cantidad = $('#cantidadMateriales').val();
  let empaque = $('#empaqueMateriales').val();
  let precioUnitario = $('#precioUnitarioMateriales').val();
  let unidad = $('#unidadMateriales').val();
  let materialSeleccionado = $('#selectMateriales').val();
  let costo = cantidad * precioUnitario;

  if (materialSeleccionado != null && materialSeleccionado != undefined && materialSeleccionado != "SeleccionarMaterial" && cantidad.length > 0) {
    if (listaClavesMateriales.length > 0) {
      if (listaClavesMateriales.includes(clave)) {
        limpiarCamposMateriales();
        $.toaster({ priority: 'warning', title: 'Mensaje de información', message: `El material ${clave} ya ha sido agregado` });
      }
      else {
        let fila = `<tr>
                      <td>${clave}</td>
                      <td>${nombre}</td>
                      <td>${cantidad}</td>
                      <td>${unidad}</td>
                      <td>${costo}</td>
                      <td style="display:none;">${empaque}</td>
                      <td><button class="btn btn-warning" type="button" onclick="modalEditarMaterial('${clave}')"><span class="glyphicon glyphicon-pencil"></span></button></td>
                      <td><button class="btn btn-danger" type="button" onclick="eliminarMaterialDePedido('${clave}')"><span class="glyphicon glyphicon-trash"></span></button></td>
                    </tr>`;

        $('#filaTotalesMateriales').before(fila);
        calcularTotalesMateriales();

        let datosMaterial = {
          clave: clave,
          nombre: nombre,
          cantidad: Number(cantidad),
          costo: Number(costo),
          precioUnitario: Number(precioUnitario),
          unidad: unidad
        };

        listaMaterialesPedido.push(datosMaterial);
        listaClavesMateriales.push(clave);

        limpiarCamposMateriales();
        $.toaster({ priority: 'info', title: 'Mensaje de material', message: `Se agregó el material ${clave} a la lista` });
      }
    }
    else {
      let fila = `<tr>
                    <td>${clave}</td>
                    <td>${nombre}</td>
                    <td>${cantidad}</td>
                    <td>${unidad}</td>
                    <td>${costo}</td>
                    <td style="display:none;">${empaque}</td>
                    <td><button class="btn btn-warning" type="button" onclick="modalEditarMaterial('${clave}')"><span class="glyphicon glyphicon-pencil"></span></button></td>
                    <td><button class="btn btn-danger" type="button" onclick="eliminarMaterialDePedido('${clave}')"><span class="glyphicon glyphicon-trash"></span></button></td>
                  </tr>`;

      $('#filaTotalesMateriales').before(fila);
      calcularTotalesMateriales();

      let datosMaterial = {
        clave: clave,
        nombre: nombre,
        cantidad: Number(cantidad),
        costo: Number(costo),
        precioUnitario: Number(precioUnitario),
        unidad: unidad
      };
      console.table(datosMaterial)
      listaMaterialesPedido.push(datosMaterial);
      listaClavesMateriales.push(clave);

      limpiarCamposMateriales();
      $.toaster({ priority: 'info', title: 'Mensaje de material', message: `Se agregó el material ${clave} a la lista` });
    }
  }
  else {
    if (materialSeleccionado == null || materialSeleccionado == undefined) {
      $('#selectMateriales').parent().addClass('has-error');
      $('#helpblockMateriales').show();
    }
    else {
      $('#selectMateriales').parent().removeClass('has-error');
      $('#helpblockMateriales').hide();
    }
    if (cantidad.length < 1) {
      $('#cantidadMateriales').parent().addClass('has-error');
      $('#helpblockCantidadMateriales').show();
    }
    else {
      $('#cantidadMateriales').parent().removeClass('has-error');
      $('#helpblockCantidadMateriales').hide();
    }
  }
}

function guardarPedidoMateriales() {
  if (listaMaterialesPedido.length > 0) {
    let confirmar = confirm("¿Está seguro(a) de enviar el pedido?");
    if (confirmar) {
      db.ref('pedidosMateriales').once('value', function (snapshot) {
        let existe = (snapshot.val() != null);
        if (existe) {
          let listapedidos = snapshot.val();
          let keys = Object.keys(listapedidos);
          last = keys[keys.length - 1],
            ultimoPedido = listapedidos[last],
            lastclave = ultimoPedido.clave,
            pedidoRef = db.ref('pedidosMateriales'),
            tienda = $('#tiendaMateriales').val(),
            consorcio = $('#consorcio').val(),
            zona = $('#regionMateriales').val(),
            fechaCaptura = moment().format('DD/MM/YYYY'),
            uid = auth.currentUser.uid,
            idTienda = $('#tiendas').val();
          costoTotal = 0;

          listaMaterialesPedido.forEach(function (material) {
            costoTotal += material.costo;
          })

          let pedido = {
            clave: lastclave + 1,
            fechaCaptura: fechaCaptura,
            tienda: tienda,
            consorcio: consorcio,
            costoTotal: costoTotal,
            estado: "Recibido",
            promotora: uid,
            zona: zona
          };

          let key = pedidoRef.push(pedido).getKey(),
            materialesRef = db.ref(`pedidosMateriales/${key}/materiales`);

          for (let material in listaMaterialesPedido) {
            materialesRef.push(listaMaterialesPedido[material]);
          }

          $("#tiendas").val($('#tiendas > option:first').val());
          $('#selectMateriales').val($('#selectMateriales > option:first').val());
          $('#selectMateriales').focus();
          $('#materialesPedido tbody').empty()
            .append(`<tr id="filaTotalesMateriales">
                      <td></td>
                      <td>Totales</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td class="hidden"></td>
                      <td></td>
                    </tr>`);
          listaMaterialesPedido.length = 0;
          listaClavesMateriales.length = 0;
          $('#panel').addClass('active in');
          $('#materiales').removeClass('active in');
        }
        else {
          let pedidoRef = db.ref('pedidosMateriales'),
            tienda = $('#tiendaMateriales').val(),
            consorcio = $('#consorcioMateriales').val(),
            zona = $('#regionMateriales').val(),
            fechaCaptura = moment().format('DD/MM/YYYY'),
            uid = auth.currentUser.uid,
            idTienda = $('#tiendas').val(),
            costoTotal = 0;

          listaMaterialesPedido.forEach(function (material) {
            costoTotal += material.costo;
          })

          let pedido = {
            clave: 1,
            fechaCaptura: fechaCaptura,
            tienda: tienda,
            consorcio: consorcio,
            costoTotal: costoTotal,
            estado: "Recibido",
            promotora: uid,
            zona: zona
          };

          let key = pedidoRef.push(pedido).getKey(),
            materialesRef = db.ref(`pedidosMateriales/${key}/materiales`);

          for (let material in listaMaterialesPedido) {
            materialesRef.push(listaMaterialesPedido[material]);
          }

          $("#tiendas").val($('#tiendas > option:first').val());
          $('#selectMateriales').val($('#selectMateriales > option:first').val());
          $('#selectMateriales').focus();
          $('#materialesPedido tbody').empty()
            .append(`<tr id="filaTotalesMateriales">
                      <td></td>
                      <td>Totales</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td class="hidden"></td>
                      <td></td>
                    </tr>`);
          listaMaterialesPedido.length = 0;
          listaClavesMateriales.length = 0;
          $('#panel').addClass('active in');
          $('#materiales').removeClass('active in');
        }
      });

      $.toaster({ priority: 'success', title: 'Mensaje de pedido', message: 'Tu pedido se ha enviado con éxito' });
    }
  }
  else {
    $.toaster({ priority: 'danger', title: 'Mensaje de error', message: 'No se puede enviar un pedido sin materiales' });
  }
}

function modalEditarMaterial(claveMaterial) {
  $('#modalEditarMaterial').modal('show');

  $('#materialesPedido tbody tr').each(function (i) {
    let columnas = $(this).children('td');

    if (columnas[0].outerText == claveMaterial) {
      $('#modalEditarMaterial').attr('data-i', i);
      $('#claveMaterialEditar').val(columnas[0].outerText);
      $('#nombreMaterialEditar').val(columnas[1].outerText);
      $('#cantidadMaterialEditar').val(columnas[2].outerText);
    }
  });
}

function calcularTotalesMateriales() {
  let $filaTotales = $('#filaTotalesMateriales');
  let hermanos = $filaTotales.siblings();

  let TotalCantidad = 0, TotalCosto = 0;

  hermanos.each(function () {
    TotalCantidad += Number($(this)[0].cells[2].innerHTML);
    TotalCosto += Number($(this)[0].cells[4].innerHTML);
  });

  TCantidad = TotalCantidad.toFixed(4);
  TCosto = TotalCosto;
  $filaTotales[0].cells[2].innerHTML = TotalCantidad;
  $filaTotales[0].cells[4].innerHTML = TotalCosto.toFixed(4);
}

function guardarCambiosMaterial() {
  let cantidad = $('#cantidadMaterialEditar').val();
  let i = Number($('#modalEditarMaterial').attr('data-i'));

  if (cantidad.length > 0) {
    listaMaterialesPedido[i].cantidad = Number(cantidad);
    // console.table(listaMaterialesPedido[i])

    let fila = $('#materialesPedido tbody tr')[i];
    let columnas = fila.children;
    columnas[2].innerHTML = cantidad;

    calcularTotalesMateriales();
  }
  else {
    if (cantidad.length < 1) {
      $('#cantidadMaterialEditar').parent().addClass('has-error');
      $('#helpblockCantidadMaterialEditar').show();
    }
    else {
      $('#cantidadMaterialEditar').parent().removeClass('has-error');
      $('#helpblockCantidadMaterialEditar').hide();
    }
  }
}

function eliminarMaterialDePedido(claveMaterial) {
  let mensajeConfirmacion = confirm("¿Realmente desea quitar este material?");
  if (mensajeConfirmacion) {

    $("#materialesPedido tbody tr").each(function (i) {
      if ($(this).children("td")[0].outerText == claveMaterial) {
        $(this).remove();
        listaMaterialesPedido.splice(i, 1);

        if (listaClavesMateriales.includes(claveMaterial)) {
          let index = listaClavesMateriales.indexOf(claveMaterial);
          listaClavesMateriales.splice(index, 1);
        }
        calcularTotalesMateriales();
      }
    });
  }
}

function limpiarCamposMateriales() {
  $('#selectMateriales').val($('#selectMateriales > option:first').val());
  $('#selectMateriales').focus();
  $('#claveMateriales').val('');
  $('#cantidadMateriales').val('');
  $('#precioUnitarioMateriales').val('');
  $('#unidadMateriales').val('');
}

/* var productosChequeo = [],
    marcas = [], */
// var productosChequeo = {},
var productosChequeo = [], //se cambio a un arreglo para insertarlos con clave de firebase
  marcas = {},
  productoAnterior = '';

function llenarSelectConsorcioChequeo() {
  let uid = auth.currentUser.uid;
  db.ref(`usuarios/tiendas/supervisoras/${uid}`).once('value', function (snapshot) {
    let zona = snapshot.val().region;
    $('#zonaChequeo').val(zona);

    db.ref(`zonas/${zona}/`).once('value', function (snapshot) {
      let options = '<option value="" disabled selected>Seleccionar</option>';
      let consorcios = snapshot.val().consorcios;
      consorcios.forEach(function (consorcio) {
        options += `<option value="${consorcio}">${consorcio}</option>`;
      });

      $('#consorcioChequeo').html(options);
    });
  })
}

$('#consorcioChequeo').change(function () {
  let consorcio = $(this).val();

  llenarSelectsProductosMarcasChequeo(consorcio);
});

function llenarSelectsProductosMarcasChequeo(consorcio) {
  db.ref(`consorcios/${consorcio}/`).once('value', function (snapshot) {
    let options = '<option value="" disabled selected>Seleccionar</option>';
    let optionsMarcas = '<option value="" disabled selected>Seleccionar</option>';
    let productos = snapshot.val().productos;
    for (let producto in productos) {
      options += `<option value="${producto}">${producto} - ${productos[producto].nombre}</option>`;
    }

    let marcas = snapshot.val().marcas;
    for (let marca of marcas) {
      optionsMarcas += `<option value="${marca}">${marca}</option>`;
    }

    $('#productoChequeo').html(options);
    $('#marca').html(optionsMarcas);
  });
}

$('#productoChequeo').change(function () {
  let producto = $(this).val();
  if (producto != null && producto != undefined) {
    $('#productoChequeo').parent().removeClass('has-error');
    $('#helpblockProductoChequeo').hide();

    let consorcio = $('#consorcioChequeo').val();
    db.ref(`productos/${consorcio}/${producto}`).once('value', function (snapshot) {
      $('#nombreProductoChequeo').val(snapshot.val().nombre);
    });
  }
  else {
    $('#productoChequeo').parent().addClass('has-error');
    $('#helpblockProductoChequeo').show();
  }
})

$('#marca').change(function () {
  let marca = $(this).val();
  if (marca != null && marca != undefined) {
    $('#marca').parent().removeClass('has-error');
    $('#helpblockMarca').hide();
  }
  else {
    $('#marca').parent().addClass('has-error');
    $('#helpblockMarca').show();
  }
})

$('#precioOferta').keyup(function () {
  let precioOferta = Number($(this).val());
  if (precioOferta > 0) {
    $('#precioOferta').parent().removeClass('has-error');
    $('#helpblockPrecioOferta').hide();
  }
  else {
    $('#precioOferta').parent().addClass('has-error');
    $('#helpblockPrecioOferta').show();
  }
})

$('#precioRegular').keyup(function () {
  let precioRegular = Number($(this).val());
  if (precioRegular > 0) {
    $('#precioRegular').parent().removeClass('has-error');
    $('#helpblockPrecioRegular').hide();
  }
  else {
    $('#precioORegular').parent().addClass('has-error');
    $('#helpblockPrecioRegular').show();
  }
})

$('#vigenciaFinal').change(function () {
  let vigenciaFinal = $(this).val();
  if (vigenciaFinal.length > 0) {
    $('#vigenciaFinal').parent().parent().removeClass('has-error');
    $('#helpblockVigenciaFinal').hide();
  } else {
    $('#vigenciaFinal').parent().parent().addClass('has-error');
    $('#helpblockVigenciaFinal').show();
  }
})

function agregarMarca() {
  let producto = $('#productoChequeo').val();
  let marca = $('#marca').val();
  let precioOferta = Number($('#precioOferta').val());
  let precioRegular = Number($('#precioRegular').val());
  let vigenciaInicial = $('#vigenciaInicial').val();
  let vigenciaFinal = $('#vigenciaFinal').val();

  if (producto != null && producto != undefined && marca != null && marca != undefined && precioOferta > 0 && precioRegular > 0 && vigenciaFinal.length > 0) {
    if (vigenciaInicial.length === 0) {
      vigenciaInicial = '';
    }

    /* let marcaObj = {
      [marca]: {
        precioOferta,
        precioRegular,
        vigenciaInicial,
        vigenciaFinal
      }
    }

    marcas.push(marcaObj); */
    let vigenciaI = vigenciaInicial.split('-').reverse().join('/');
    let vigenciaF = vigenciaFinal.split('-').reverse().join('/');

    marcas[marca] = {
      precioRegular: precioRegular,
      precioOferta: precioOferta,
      vigenciaInicial: vigenciaI,
      vigenciaFinal: vigenciaF
    }

    toastr.success('Se ha agregado la marca', 'Mensaje', {
      "closeButton": false,
      "debug": true,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-top-right",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "3000",
      "timeOut": "3000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    })

    $('#marca').val('');
    $('#precioOferta').val('');
    $('#precioRegular').val('');
    $('#vigenciaInicial').val('');
    $('#vigenciaFinal').val('');
  }
  else {
    if (producto == undefined || producto == null) {
      $('#productoChequeo').parent().addClass('has-error');
      $('#helpblockProductoChequeo').show();
    } else {
      $('#productoChequeo').parent().removeClass('has-error');
      $('#helpblockProductoChequeo').hide();
    }
    if (marca == null || marca == undefined) {
      $('#marca').parent().addClass('has-error');
      $('#helpblockMarca').show();
    } else {
      $('#marca').parent().removeClass('has-error');
      $('#helpblockMarca').hide();
    }
    if (precioOferta == 0) {
      $('#precioOferta').parent().addClass('has-error');
      $('#helpblockPrecioOferta').show();
    } else {
      $('#precioOferta').parent().removeClass('has-error');
      $('#helpblockPrecioOferta').hide();
    }
    if (precioRegular == 0) {
      $('#precioRegular').parent().addClass('has-error');
      $('#helpblockPrecioRegular').show();
    } else {
      $('#precioRegular').parent().removeClass('has-error');
      $('#helpblockPrecioRegular').hide();
    }
    if (vigenciaFinal.length < 1) {
      $('#vigenciaFinal').parent().parent().addClass('has-error');
      $('#helpblockVigenciaFinal').show();
    } else {
      $('#vigenciaFinal').parent().parent().removeClass('has-error');
      $('#helpblockVigenciaFinal').hide();
    }
  }
}

function borrarProductoChequeo(claveProducto) {
  $(`#producto-${claveProducto}`).remove();
}

function agregarProductoChequeo() {
  let claveProducto = $('#productoChequeo').val();
  let nombreProducto = $('#nombreProductoChequeo').val();
  /* let producto = {
    [claveProducto]: marcas
  } */
  //productosChequeo[claveProducto] = marcas;

  if (claveProducto != null && claveProducto != undefined && nombreProducto.length > 0) {
    productosChequeo.push({
      claveProducto: claveProducto,
      nombreProducto: nombreProducto,
      marcas: marcas
    });

    let marcasHtml = '';

    for (let marca in marcas) {
      marcasHtml += `<div class="col-xs-6">
                      <address>
                        <small><strong>${marca} - ${nombreProducto}</strong></small><br>
                        <small>Precio regular: ${marcas[marca].precioRegular}</small><br>
                        <small>Precio oferta: ${marcas[marca].precioOferta}</small><br>
                        <small>Vigencia inicial: ${marcas[marca].vigenciaInicial}</small><br>
                        <small>Vigencia final: ${marcas[marca].vigenciaFinal}</small>
                      </address>
                    </div>`;
    }
    /* marcas.forEach(function(marca) {
      marcasHtml += `<div class="col-xs-6">
                      <address>
                        <small><strong>${Object.keys(marca)[0]}</strong></small><br>
                        <small>Precio regular: ${Object.keys(marca)[0].precioRegular}</small><br>
                        <small>Precio oferta: ${Object.keys(marca)[0].precioOferta}</small><br>
                        <small>Vigencia inicial: ${Object.keys(marca)[0].vigenciaInicial}</small><br>
                        <small>Vigencia final: ${Object.keys(marca)[0].vigenciaFinal}</small>
                      </address>
                    </div>`;
    });*/

    let productoHtml = `<div id="producto-${claveProducto}" class="panel panel-default">
                          <div class="panel-heading" role="tab" id="headingOne">
                            
                            <h4 class="panel-title">
                              <a role="button" data-toggle="collapse" data-parent="#contenedorProductosChequeo" href="#collapse${claveProducto}" aria-expanded="true" aria-controls="collapse${claveProducto}">
                                ${claveProducto}
                              </a>
                            </h4>
                          </div>
                          <div id="collapse${claveProducto}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                            <div class="panel-body">
                              <div class="row" id="contenedor${claveProducto}">
                                ${marcasHtml}
                              </div>
                            </div>
                          </div>
                        </div>`;

    $('#contenedorProductosChequeo').append(productoHtml);

    /* productosChequeo.push(producto);
    marcas = []; */
    $('#productoChequeo').val('')
    $('#nombreProductoChequeo').val('')
    marcas = {};

    $('#productoChequeo').parent().removeClass('has-error');
    $('#helpblockProductoChequeo').hide();
  }
  else {
    $('#productoChequeo').parent().addClass('has-error');
    $('#helpblockProductoChequeo').show();
  }
}

function guardarChequeo() {
  let fechaCaptura = moment().format("DD/MM/YYYY");
  let consorcio = $('#consorcioChequeo').val();
  let zona = $('#zonaChequeo').val();

  //if(consorcio != null && consorcio != undefined && Object.keys(productosChequeo).length > 0) {
  if (consorcio != null && consorcio != undefined && productosChequeo.length > 0) {
    swal({
      title: 'Confirmación',
      text: `¿Está suguro(a) de mandar este chequeo?`,
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Enviar'
    }).then((result) => {
      if (result.value) {
        let chequeo = {
          consorcio: consorcio,
          fechaCaptura: fechaCaptura,
          zona: zona,
          // productos: productosChequeo
        }
        let key = db.ref(`chequeosPrecios/`).push(chequeo).getKey();
        productosChequeo.forEach(function (producto) {
          db.ref(`chequeosPrecios/${key}/productos`).push(producto);
        });

        // productosChequeo = {},
        productosChequeo = [],
          marcas = {},
          productoAnterior = '';

        $('#contenedorProductosChequeo').html('');
        $('#consorcioChequeo').val('');
        $('#productoChequeo').val('');
        $('#nombreProductoChequeo').val('');
        $('#marca').val('');
        $('#precioOferta').val('');
        $('#precioRegular').val('');
        $('#vigenciaInicial').val('');
        $('#vigenciaFinal').val('');
      }
    })
  }
}

function limpiarChequeo() {
  productosChequeo = {};
  marcas = {};

  $('#contenedorProductosChequeo').html('');
  $('#consorcioChequeo').val('');
  $('#productoChequeo').val('');
  $('#nombreProductoChequeo').val('');
  $('#marca').val('');
  $('#precioOferta').val('');
  $('#precioRegular').val('');
  $('#vigenciaInicial').val('');
  $('#vigenciaFinal').val('');
}

/* if(marcas.length === 0) {
  let productoHtml = `<div class="panel panel-default">
                        <div class="panel-heading" role="tab" id="headingOne">
                          <span onclick="borrarProducto()" style="background-color:grey; width:20px; margin:0 auto; text-aling:center; float:right; color:white; border-radius:50px; padding:3px;" class="glyphicon glyphicon-remove"></span>
                          <h4 class="panel-title">
                            <a role="button" data-toggle="collapse" data-parent="#contenedorProductosChequeo" href="#collapse${producto}" aria-expanded="true" aria-controls="collapse${producto}">
                              ${producto}
                            </a>
                          </h4>
                        </div>
                        <div id="collapse${producto}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                          <div class="panel-body">
                            <div class="row" id="contenedor${producto}">
                              <div class="col-xs-6">
                                <address>
                                  <small><strong>${marca}</strong></small><br>
                                  <small>Precio regular: ${precioRegular}</small><br>
                                  <small>Precio oferta: ${precioOferta}</small><br>
                                  <small>Fecha: ${vigencia}</small>
                                </address>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>`;

  $('#contenedorProductosChequeo').append(productoHtml);
  productoAnterior = producto;
}else {
  if(producto === productoAnterior) {
    $(`#contenedor${producto}`).append(`
      <div class="col-xs-6">
        <address>
          <small><strong>${marca}</strong></small><br>
          <small>Precio regular: ${precioRegular}</small><br>
          <small>Precio oferta: ${precioOferta}</small><br>
          <small>Fecha: ${vigencia}</small>
        </address>
      </div>
    `)
  }else {
    let productoHtml = `<div class="panel panel-default">
                        <div class="panel-heading" role="tab" id="headingOne">
                          <span onclick="borrarProducto()" style="background-color:grey; width:20px; margin:0 auto; text-aling:center; float:right; color:white; border-radius:50px; padding:3px;" class="glyphicon glyphicon-remove"></span>
                          <h4 class="panel-title">
                            <a role="button" data-toggle="collapse" data-parent="#contenedorProductosChequeo" href="#collapse${producto}" aria-expanded="true" aria-controls="collapse${producto}">
                              ${producto}
                            </a>
                          </h4>
                        </div>
                        <div id="collapse${producto}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                          <div class="panel-body">
                            <div class="row" id="contenedor${producto}">
                              <div class="col-xs-6">
                                <address>
                                  <small><strong>${marca}</strong></small><br>
                                  <small>Precio regular: ${precioRegular}</small><br>
                                  <small>Precio oferta: ${precioOferta}</small><br>
                                  <small>Fecha: ${vigencia}</small>
                                </address>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>`;

  $('#contenedorProductosChequeo').append(productoHtml);
  productoAnterior = producto;
  }
} */

function cerrarSideMenu() {
  slideout.close();
}

function llenarSelectPromotoras() {
  let uid = auth.currentUser.uid;
  db.ref(`usuarios/tiendas/supervisoras/${uid}/promotoras`).once('value', function(snapshot) {
    let promotoras = snapshot.val();
    let options = '<option selected disabled>Seleccionar</option>';

    for(let promotora in promotoras) {
      options += `<option value="${promotoras[promotora].id}-${promotoras[promotora].nombre}">${promotoras[promotora].id}-${promotoras[promotora].nombre}</option>`;
    }

    $('#promotoraVentaDiaria').html(options);
  });
}

function llenarMultisSelect() {
  let consorcio = $('#consorcioVentaDiaria').val();
  $('#productosVentaDiaria').multiselect('destroy');
  /* $('#productosVentaDiaria').select2('destroy'); */
  db.ref(`consorcios/${consorcio}/productos/`).once('value', function(snapshot) {
    let productos = snapshot.val();
    let options = '';

    for(let producto in productos) {
      options += `<option value="${producto}">${producto} - ${productos[producto].nombre}</option>`;
    }

    $('#productosVentaDiaria').html(options);
    $('#productosVentaDiaria').multiselect({
      buttonText: function(options, select) {
          if (options.length === 0) {
            return 'Seleccionar...';
          }
          else if (options.length >= 2) {
            return `${options.length} productos seleccionados`;
          }
          else {
            var labels = [];
            options.each(function() {
              if ($(this).attr('label') !== undefined) {
                labels.push($(this).attr('label'));
              }
              else {
                labels.push($(this).html());
              }
            });
            return labels.join(', ') + '';
          }
        }
    });
    /* $('#productosVentaDiaria').select2({
      placeholder: 'Seleccionar',
    }); */
  });
}

/* function agregarProductosVentaDiaria() {
  let html = '';
  $('#productosVentaDiaria :selected').each(function(i, selected) {
    html += `<li class="list-group-item">
              <p>${$(selected).text()}</p>
              <label>Kilos: </label>
              <div class="input-group">
                <input id="${$(selected).val()}-kilos" class="kilosvd form-control"></input>
                <span class="input-group-addon" id="basic-addon1">kg</span>
              </div>
              <label>Pesos: </label>
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">$</span>
                <input id="${$(selected).val()}-pesos" class="pesosvd form-control"></input>
              </div> 
             </li>`;
  });

  $('#contenedorVentaDiaria').html(html);
} */

function agregarProductosVentaDiaria() {
  let html = '';
  let consorcio = $('#consorcioVentaDiaria').val();
  $('#productosVentaDiaria :selected').each(function(i, selected) {
    let idProducto = $(selected).val();

    db.ref(`consorcios/${consorcio}/productos/${idProducto}`).once('value', snapshot => {
      html += `<li class="list-group-item">
                <p>${$(selected).text()}</p>
                <div class="form-group">
                  <input id="${idProducto}-nombre" value="${snapshot.val().nombre}" type="text" class="hidden form-control">
                </div>
                <label>Kilos: </label>
                <div class="input-group">
                  <input id="${idProducto}-kilos" min="0" data-id="${idProducto}" type="number" class="kilosvd form-control"></input>
                  <span class="input-group-addon" id="basic-addon1">kg</span>
                </div>
                <div class="form-group">
                  <input id="${idProducto}-precio" value="${snapshot.val().precioUnitario}" type="number" class="hidden form-control">
                </div>
                <label>Pesos: </label>
                <div class="input-group">
                  <span class="input-group-addon">$</span>
                  <input id="${idProducto}-pesos" type="number" readonly class="pesosvd form-control"></input>
                </div> 
              </li>`;
    });
  });

  $('#contenedorVentaDiaria').html(html);

  $('.kilosvd').bind('keyup', function(e) {
    let input = $(this);
    let idProducto = input.attr('data-id')
    let kilos = Number($(this).val());
    let precio = Number($(`#${idProducto}-precio`).val());
    let pesos = Number((kilos * precio).toFixed(2));
    $(`#${idProducto}-pesos`).val(pesos);
  })
}

function guardarVentaDiaria() {
  let fechaInput = $('#fechaVentaDiaria').val();
  let fecha = `${fechaInput.split('-')[1]}/${fechaInput.split('-')[2]}/${fechaInput.split('-')[0]}`
  //let fecha = moment(new Date(date)).format('DD/MM/YYYY');

  let idPromotora = $('#promotoraVentaDiaria').val().split('-')[0]
  let nombrePromotora = $('#promotoraVentaDiaria').val().split('-')[1]
  let zona = $('#zonaVentaDiaria').val();
  let tienda = $('#tiendaVentaDiaria').val();
  let consorcio = $('#consorcioVentaDiaria').val();

  let productos = {};
  let totalKilos = 0;
  let totalPesos = 0;

  let listaProductos = $('#productosVentaDiaria').val();
  let noSeleccionados = $('#productosVentaDiaria').find('option').not(':selected');
  noSeleccionados.map(function () {
    let nombre = this.text.split(' - ')[1];
    productos[this.value] = {
      nombre,
      kilos: 0,
      pesos: 0
    } 
  }).get();

  for(let producto of listaProductos) {
    let nombre = $(`#${producto}-nombre`).val();
    let kilos =  Number($(`#${producto}-kilos`).val());
    let pesos =  Number($(`#${producto}-pesos`).val());

    productos[producto] = {
      nombre,
      kilos,
      pesos,
    }
    totalKilos += kilos;
    totalPesos += pesos;
  }

  totalPesos = Number(totalPesos.toFixed(2));

  let ventaDiaria = {
    fecha,
    idPromotora,
    nombrePromotora,
    zona,
    tienda,
    consorcio,
    productos,
    totalKilos,
    totalPesos
  }

  swal({
    title: 'Mensaje',
    text: `¿Está seguro de enviar la venta?`,
    type: 'info',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Enviar',
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      db.ref(`ventasDiarias`).push(ventaDiaria);
      limpiarCamposVentaDiaria();

      $('.inputExistencias').val('');
      swal({
        type: 'success',
        title: 'Mensaje',
        text: 'La venta se envió correctamente',
      });
    }
  });
}

function limpiarCamposVentaDiaria() {
  $('#fechaVentaDiaria').val('');
  $('#promotoraVentaDiaria').val($('#promotoraVentaDiaria > option:first').val());
  $('#zonaVentaDiaria').val('');
  $('#tiendaVentaDiaria').val('');
  $('#consorcioVentaDiaria').val('');
  // $("#productosVentaDiaria").select2("val", "-");
  $('#productosVentaDiaria').multiselect('deselectAll', false);
  $('#productosVentaDiaria').multiselect('updateButtonText');
  $('#contenedorVentaDiaria').html('')
}
