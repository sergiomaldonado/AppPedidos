const db = firebase.database(),
      auth = firebase.auth(),
      storage = firebase.storage();
var listaProductosPedido = [],
    listaClavesProductos = [],
    TKilos, TPiezas;

function logout() {
  auth.signOut();
}

function mostrarDatosPerfil() {
  let uid = auth.currentUser.uid;
  let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuariosRef.on('value', function(snapshot) {
    let usuario = snapshot.val();
    $('#nombrePerfil').val(usuario.nombre);
    $('#nombreUsuario').val(usuario.username);
  });
}

$('#btnHabilitarEditar').click(function(e) {
  e.preventDefault();
  $('#nombrePerfil').removeAttr('readonly');
  $('#nombreUsuario').removeAttr('readonly');
  $('#btnEditarPerfil').attr('disabled', false);
  $('#btnHabilitarEditar').attr('disabled', true);
});

function editarPerfil() {
  let uid = auth.currentUser.uid, nombre = $('#nombrePerfil').val(), usuario = $('#nombreUsuario').val();

  if(nombre.length > 0 && usuario.length > 0) {
    let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/`);
    usuariosRef.child(uid).update({
      nombre: nombre,
      usuario: usuario
    }, function() {
      mostrarDatosPerfil();
      $('#nombrePerfil').attr('readonly', true);
      $('#nombreUsuario').attr('readonly', true);
      $('#btnEditarPerfil').attr('disabled', true);
      $('#btnHabilitarEditar').attr('disabled', false);

      $.toaster({ priority : 'success', title : 'Mensaje de información', message : 'Se actualizaron sus datos con exito'});
    });
  }
  else {
    if(nombre.length < 0 ) {
      $('#nombrePerfil').parent().addClass('has-error');
      $('#helpblockNombrePerfil').show();
    }
    else {
      $('#nombrePerfil').parent().removeClass('has-error');
      $('#helpblockNombrePerfil').hide();
    }
    if(usuario.length < 0) {
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

  if(nuevaContraseña.length > 0) {
    auth.currentUser.updatePassword(contraseñaNueva)
    .then(function () {
      $.toaster({ priority : 'success', title : 'Mensaje de información', message : 'Se actualizó su contraseña exitosamente'});
      $('#nuevaContraseña').parent().removeClass('has-error');
      $('#helpblockNuevaContraseña').hide();
    }, function(error) {
      $.toaster({ priority : 'danger', title : 'Error al cambiar contraseña', message : 'La contraseña debe ser de 8 caracteres como mínimo y puede contener números y letras'});
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
  ticketsRef.orderByChild("promotora").equalTo(uid).on("value", function(snapshot) {
    let tickets = snapshot.val();
    $('#ticketsCalidadProducto tbody').empty();

    for(let ticket in tickets) {
      let datos = tickets[ticket];

      let dia = datos.fecha.substr(0,2);
      let mes = datos.fecha.substr(3,2);
      let año = datos.fecha.substr(6,4);
      let fecha = mes + '/' + dia + '/' + año;
      moment.locale('es');
      let fechaMostrar = moment(fecha).format('LL');

      let tr = $('<tr/>');
      let td = $('<td/>');
      let a = $('<a/>', {
        'onclick': 'abrirModalTicket("'+ticket+'")',
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

  let ticketRef = db.ref('tickets/calidadProducto/'+idTicket);
  ticketRef.once('value', function(snapshot) {
    let datos = snapshot.val();
    $('#claveTicket').val(datos.clave);
    $('#claveProducto').val(datos.producto);

    let dia = datos.fecha.substr(0,2);
    let mes = datos.fecha.substr(3,2);
    let año = datos.fecha.substr(6,4);
    let fechaMostrar = año + '-' + mes + '-' + dia;

    $('#fechaTicket').val(fechaMostrar);
    $('#respuesta').val(datos.respuesta);
    $('#problemaTicket').val(datos.problema);
  });
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/tiendas/${usuario}/lista`);
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    // let trs = "";
    let lis = "";

    let arrayNotificaciones = [], idsNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
      idsNotificaciones.push(notificacion);
    }

    arrayNotificaciones.reverse();

    for(let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      // trs += `<tr><td>'${arrayNotificaciones[i].mensaje} ${fecha}</td></tr>`;
      if(i%2 == 0) {
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
  let notificacionesRef = db.ref('notificaciones/tiendas/'+uid);
  notificacionesRef.on('value', function(snapshot) {
    let cont = snapshot.val().cont;

    if(cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/tiendas/'+uid);
  notificacionesRef.update({cont: 0});
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      /* db.ref(`usuarios/tiendas/supervisoras/${user.uid}`).on('value', (snapshot)=> {
        let usuario = snpashot.val().agente;
        
        if(agente) {
          $('')
        }
      }); */
      /* db.ref('regiones/').once('value', (snapshot) => {
        localStorage.setItem('regiones', snapshot.val());
      }) */

      mostrarTicketsCalidadProducto();
      //llenarSelectTiendas();
      llenarSelectRegiones();
      mostrarHistorialPedidos();
      mostrarNotificaciones();
      mostrarContador();

      mostrarContadorKilos();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function llenarSelectRegiones() {
  let uid = auth.currentUser.uid;
  db.ref(`usuarios/tiendas/supervisoras/${uid}`).once('value', (snapshot) => {
    let agente = snapshot.val();
    let regiones = agente.regiones;
    let options = `<option value="Seleccionar">Selecciona una región</option>`;

    $('.region p').html(`Pedidos región ${regiones[0]}`);

    for(let region of regiones) {
      options += `<option value="${region}">${region}</option>`;
    }
    $('#regiones').show().html(options).msDropdown();
  });
}

$('#regiones').change(function() {
  llenarSelectTiendas();
  let region = $(this).val();
  $('.region p').html(`Pedidos región ${region}`);
})

function llenarSelectTiendas() {
  let region = $('#regiones').val();

  $('#tiendas').msDropdown().data("dd").destroy();

  db.ref(`regionesAgentes/${region}`).once('value', (snapshot) => {
    let regionDB = snapshot.val();

    let options = `<option value="Tiendas" disabled selected>Selecciona una tienda para visitar</option>`
    for(let tienda in regionDB) {
      options += `<option value="${tienda}">${regionDB[tienda].nombre}</option>`;
    }
    $('#tiendas').show().html(options).msDropdown();
  });
}

Vue.use(VueFire)

new Vue({
  el: '#app',
  data: {
    region: ''
   //uid: auth.currentUser.uid,
    //region: "",
  },
  firebase: {
    // regiones: db.ref('regiones'),
    // usuario: db.ref(`usuarios/tiendas/supervisoras/${auth.currentUser.uid}`)  
  },
  computed: {
    regionesSelect() {
      
    }
  },
  /* beforeCreate() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        db.ref(`usuarios/tiendas/supervisoras/${user.uid}`).once('value', (snapshot) => {
          this.region = snapshot.val().regiones[0];
        });
      } 
    });
  }, */
  created() {
    
  },
  methods: {
    
  }
})

function llenarSelectProductos() {
  let consorcio = $('#consorcio').val();

  let productosRef = db.ref(`productos/${consorcio}`);
  productosRef.on('value', function(snapshot) {
    let productos = snapshot.val();
    let options = '<option id="SeleccionarProducto" value="Seleccionar" disabled selected>Seleccionar</option>';
    
    for(let producto in productos) {
      if(productos[producto].activo) {
        options += `<option value="${producto}"> ${producto} ${productos[producto].nombre} ${productos[producto].empaque}</option>`;
      }
    }
    $('#productos').html(options);
    $('#productosTicket').html(options);
  });
}

$('#tiendas').change(function(){
  let idTienda = $("#tiendas").val();
  let region = $('#regiones').val();
  db.ref(`regionesAgentes/${region}/${idTienda}`)
    .once('value', (snapshot) => {
      let tienda = snapshot.val();
      $('#tienda').val(tienda.nombre);
      $('#region').val(region);
      $('#consorcio').val(tienda.consorcio);
      $('#consorcioTicket').val(tienda.consorcio);

      llenarSelectProductos();
      llenarTablaExistencias();
  });
});

function llenarTablaExistencias(){
  let consorcio = $('#consorcio').val();

  let productosRef = db.ref(`productos/${consorcio}`);
  productosRef.on('value', function(snapshot) {
    let productos = snapshot.val();
    let filas = "";
    for(let producto in productos) {
      filas += `<tr>
                  <td>
                    Clave | Nombre | Empaque <br>
                    <strong>${producto} | ${productos[producto].nombre} | ${productos[producto].empaque}</strong>
                    <input id="existencia-${producto}" data-clave="${producto}" type="number" class="form-control input-sm text-right" value="0" min="0">
                  </td>
                </tr>`;
    }
    $('#tabla-existencias tbody').html(filas);
  });
}

function guardarExistencia() {
  let consorcio = $('#consorcio').val();

  $('#tabla-existencias tbody tr td input').each(function () {
    let clave = $(this).attr('data-clave');
    let existencia = Number($(this).val());

    let productoRef = db.ref(`productos/${consorcio}/${clave}`);
    productoRef.update({existencia: existencia});
  });

  $.toaster({priority: 'success', title: 'Mensaje de información', message: `La existencia se guardó correctamente`});
}

$('#tabla-existencias tbody tr td input').keypress(function() {
     if(!$.trim(this.value).length) { // zero-length string AFTER a trim
      $(this).parents('p').addClass('warning');
     }
});

$('#productos').change(function() {
  let consorcio = $('#consorcio').val();
  let idProducto = $('#productos').val();

  let productoActualRef = db.ref('productos/'+consorcio+'/'+idProducto);
  productoActualRef.on('value', function(snapshot) {
    let producto = snapshot.val();
    $('#clave').val(idProducto);
    $('#claveConsorcio').val(producto.claveConsorcio);
    $('#nombre').val(producto.nombre);
    $('#empaque').val(producto.empaque);
    $('#precioUnitario').val(producto.precioUnitario);
    $('#unidad').val(producto.unidad);
  });

  if(this.value != null || this.value != undefined) {
    $('#productos').parent().removeClass('has-error');
    $('#helpblockProductos').hide();
  } else {
    $('#productos').parent().addClass('has-error');
    $('#helpblockProductos').show();
  }
});

$('#productosTicket').change(function() {
  let consorcio = $('#consorcioTicket').val();
  let idProducto = $('#productos').val();

  let productoActualRef = db.ref('productos/'+consorcio+'/'+idProducto);
  productoActualRef.on('value', function(snapshot) {
    let producto = snapshot.val();
    $('#productoTicket').val(idProducto);
  });

  if(this.value != null || this.value != undefined) {
    $('#productosTicket').parent().parent().removeClass('has-error');
    $('#helpblockProductoTicket').hide();
  }
  else {
    $('#productosTicket').parent().parent().addClass('has-error');
    $('#helpblockProductoTicket').show();
  }
});

$('#pedidoPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($('#cambioFisicoPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);

  if(this.value.length < 1) {
    $('#pedidoPz').parent().addClass('has-error');
    $('#helpblockPedidoPz').show();
  }
  else {
    $('#pedidoPz').parent().removeClass('has-error');
    $('#helpblockPedidoPz').hide();
  }
});

$('#degusPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($('#cambioFisicoPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);

  if(this.value.length < 1) {
    $('#degusPz').parent().addClass('has-error');
    $('#helpblockDegusPz').show();
  }
  else {
    $('#degusPz').parent().removeClass('has-error');
    $('#helpblockDegusPz').hide();
  }
});

$('#cambioFisicoPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($(this).val());
  if(cambioFisicoPz == undefined || cambioFisicoPz == null) {
    cambioFisicoPz = 0;
  }
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$(document).ready(function() {
  //llenarSelectTiendas();
  //llenarSelectProductos();
  $('.input-group.date').datepicker({
    autoclose: true,
    format: "dd/mm/yyyy",
    language: "es"
  });

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
});

function eliminarProductoDePedido(claveProducto) {
  let mensajeConfirmacion = confirm("¿Realmente desea quitar este producto?");
  if(mensajeConfirmacion) {

    $("#productosPedido tbody tr").each(function (i) {
      if($(this).children("td")[0].outerText == claveProducto) {
        $(this).remove();
        listaProductosPedido.splice(i, 1);

        if(listaClavesProductos.includes(claveProducto)) {
          let index = listaClavesProductos.indexOf(claveProducto);
          listaClavesProductos.splice(index, 1);
        }
        calcularTotales();
      }
    });
  }
}

$('#pedidoPzEditar').keyup(function(){
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisico = Number($('#cambioFisicoEditar').val());
  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz+degusPz+cambioFisico;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);

  if(this.value.length < 1) {
    $('#pedidoPzEditar').parent().addClass('has-error');
    $('#helpblockPedidoPzEditar').show();
  }
  else {
    $('#pedidoPzEditar').parent().removeClass('has-error');
    $('#helpblockPedidoPzEditar').hide();
  }
});

$('#degusPzEditar').keyup(function(){
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisico = Number($('#cambioFisicoEditar').val());
  if(degusPz == undefined || degusPz == null) {
    degusPz = 0;
  }

  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz+degusPz+cambioFisico;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

$('#cambioFisicoEditar').keyup(function(){
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisico = Number($(this).val());
  if(cambioFisico == undefined || cambioFisico == null) {
    cambioFisico = 0;
  }
  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz+degusPz+cambioFisico;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

function modalEditarProducto(claveProducto) {
  $('#modalEditarProducto').modal('show');

  $('#productosPedido tbody tr').each(function(i) {
    let columnas = $(this).children('td');

    if(columnas[0].outerText == claveProducto) {
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

  if(pedidoPz.length > 0 && degusPz.length > 0) {
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
    if(pedidoPz.length < 1) {
      $('#pedidoPzEditar').parent().addClass('has-error');
      $('#helpblockPedidoPzEditar').show();
    }
    else {
      $('#pedidoPzEditar').parent().removeClass('has-error');
      $('#helpblockPedidoPzEditar').hide();
    }
    if(degusPz.length < 1) {
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
  let hermanos = $filaTotales.siblings();

  let TotalPiezas = 0, TotalKilos = 0;

  hermanos.each(function (){
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

  if(productoSeleccionado != null && productoSeleccionado != undefined && productoSeleccionado != "SeleccionarProducto" && pedidoPz.length > 0) {
    if(cambioFisicoPz.length < 1) {
      cambioFisicoPz = 0;
    }
    if(degusPz.length < 1) {
      degusPz = 0;
    }

    if(listaClavesProductos.length > 0) {
      if(listaClavesProductos.includes(clave)) {
        limpiarCampos();
        $.toaster({priority: 'warning', title: 'Mensaje de información', message: `El producto ${clave} ya fue agregado`});
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

        $('#filaTotales').before(fila);
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
        $.toaster({priority: 'info', title: 'Mensaje de producto', message: `Se agregó el producto ${clave} a la lista`});
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

      $('#filaTotales').before(fila);
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
      $.toaster({priority : 'info', title : 'Mensaje de producto', message : 'Se agregó el producto '+ clave + ' a la lista'});
    }
  }
  else {
    if(productoSeleccionado == null || productoSeleccionado == undefined) {
      $('#productos').parent().addClass('has-error');
      $('#helpblockProductos').show();
    }
    else {
      $('#productos').parent().removeClass('has-error');
      $('#helpblockProductos').hide();
    }
    if(pedidoPz.length < 1) {
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
  if($(this).prop('checked')) {
    $('#nuevaContraseña').attr('type', 'text');
  }
  else {
    $('#nuevaContraseña').attr('type', 'password');
  }
});

function mostrarContadorKilos() {
  let uid = auth.currentUser.uid;
  let rutaUsuario = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  rutaUsuario.on('value', function(snapshot) {
    let contadorKilos = snapshot.val().contadorKilos;

    if(contadorKilos == undefined) {
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

function guardarPedido() {
  if(listaProductosPedido.length > 0) {
    let confirmar = confirm("¿Está seguro(a) de enviar el pedido?");
    if(confirmar) {

      let pedidosRef = db.ref('pedidoEntrada');
      pedidosRef.once('value', function(snapshot) {
        let existe = (snapshot.val() != null);
        if(existe) {
          let listapedidos = snapshot.val();

          let keys = Object.keys(listapedidos);
              last = keys[keys.length-1],
              ultimoPedido = listapedidos[last],
              lastclave = ultimoPedido.encabezado.clave,
              pedidoRef = db.ref('pedidoEntrada/'),
              tienda = $('#tienda').val(),
              consorcio = $('#consorcioTicket').val(),
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
              agrupado: false
            }
          };

          let key = pedidoRef.push(encabezado).getKey(),
              pedidoDetalleRef = db.ref(`pedidoEntrada/${key}/detalle`);

          for(let producto in listaProductosPedido) {
            pedidoDetalleRef.push(listaProductosPedido[producto]);
            let claveProducto = listaProductosPedido[producto].clave;
            let nombre = listaProductosPedido[producto].nombre;
            let totalKg = Number(listaProductosPedido[producto].totalKg);
            let totalPz = Number(listaProductosPedido[producto].totalPz);

            guardarEstadistica(claveProducto, nombre, ruta, fechaCaptura, totalKg, totalPz);
          }

          let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
          usuarioRef.once('value', function(snapshot) {
            let region = snapshot.val().region,
                contadorKilos = snapshot.val().contadorKilos,
                historialPedidosRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`),
                keyHistorial = historialPedidosRef.push(encabezado).getKey(),
                pedidoDetalleHistorialRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos/${keyHistorial}/detalle`),
                //variables para mandar pedidos a historial para que los gerentes vean cuantos pedidos manda cada quien de su zona
                rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`),
                claveHistorial = rutaHistorialPedidosGerentes.push(encabezado).getKey(),
                rutaDetallesHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos/${claveHistorial}/detalle`);

            for(let producto in listaProductosPedido) {
              pedidoDetalleHistorialRef.push(listaProductosPedido[producto]);
              rutaDetallesHistorialPedidosGerentes.push(listaProductosPedido[producto]);
            }

            if(contadorKilos == undefined) {
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
          rutaContadorPedidos.once('value', function(snapshot) {
            let cantidad = snapshot.val().cantidad;
            rutaContadorPedidos.update({
              cantidad: cantidad + 1 
            });
          });

          //Envío de notificación al almacen
          let usuariosAlmacenRef = db.ref('usuarios/planta/almacen');
          usuariosAlmacenRef.once('value', function(snapshot) {
            let usuarios = snapshot.val();
            for(let usuario in usuarios) {
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
              notificacionesRef.once('value', function(snapshot) {
                let notusuario = snapshot.val();
                let cont = notusuario.cont + 1;

                notificacionesRef.update({cont: cont});
              });
            }
          });
        }
        else {
          let pedidoRef = db.ref('pedidoEntrada/');
          let tienda = $('#tienda').val();
          let consorcio = $('#consorcioTicket').val();
          let ruta = $('#region').val();
          let fechaCaptura = moment().format('DD/MM/YYYY');
          let uid = auth.currentUser.uid;
          let idTienda = $('#tiendas').val();

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
              agrupado: false
            }
          };

          let key = pedidoRef.push(encabezado).getKey(),
              pedidoDetalleRef = db.ref(`pedidoEntrada/${key}/detalle`);

          for(let producto in listaProductosPedido) {
            pedidoDetalleRef.push(listaProductosPedido[producto]);
            let claveProducto = listaProductosPedido[producto].clave;
            let nombre = listaProductosPedido[producto].nombre;
            let totalKg = Number(listaProductosPedido[producto].totalKg);
            let totalPz = Number(listaProductosPedido[producto].totalPz);

            guardarEstadistica(claveProducto, nombre, ruta, fechaCaptura, totalKg, totalPz);
          } 

          let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
          usuarioRef.once('value', function(snapshot) {
            let region = snapshot.val().region,
                contadorKilos = snapshot.val().contadorKilos,
                historialPedidosRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`),
                keyHistorial = historialPedidosRef.push(encabezado).getKey(),
                pedidoDetalleHistorialRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos/${keyHistorial}/detalle`),
                //variables para mandar pedidos a historial para que los gerentes vean cuantos pedidos manda cada quien de su zona
                rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`),
                claveHistorial = rutaHistorialPedidosGerentes.push(encabezado).getKey(),
                rutaDetallesHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos/${claveHistorial}/detalle`);

            for(let producto in listaProductosPedido) {
              pedidoDetalleHistorialRef.push(listaProductosPedido[producto]);
              rutaDetallesHistorialPedidosGerentes.push(listaProductosPedido[producto]);
            }

            if(contadorKilos == undefined) {
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
          rutaContadorPedidos.once('value', function(snapshot) {
            let cantidad = snapshot.val().cantidad;
            rutaContadorPedidos.update({
              cantidad: cantidad + 1 
            });
          });

          //Envío de notificación al almacen
          let usuariosAlmacenRef = db.ref('usuarios/planta/almacen');
          usuariosAlmacenRef.once('value', function(snapshot) {
            let usuarios = snapshot.val();
            for(let usuario in usuarios) {
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
              notificacionesRef.once('value', function(snapshot) {
                let notusuario = snapshot.val();
                let cont = notusuario.cont + 1;

                notificacionesRef.update({cont: cont});
              });
            }
          });
        }
      });

      $.toaster({ priority : 'success', title : 'Mensaje de pedido', message : 'Tu pedido se ha enviado con éxito'});
    }
    else {

    }
  }
  else {
    $.toaster({ priority : 'danger', title : 'Mensaje de error', message : 'No se puede enviar un pedido sin productos'});
  }
}

function mostrarHistorialPedidos() {
  let uid = auth.currentUser.uid;
  
  let usuarioRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuarioRef.on('value', function(snapshot) {
    let region = snapshot.val().region;

    let rutaHistorialPedidosGerentes = db.ref(`historialPedidosGerentes/${region}/pedidos`);
    rutaHistorialPedidosGerentes.once('value', function(snapshot) {
      let pedidos = snapshot.val();
      let filas = "";
      let inverso = [], ids = [];

      for(let pedido in pedidos) {
        if(pedidos[pedido].encabezado.promotora == uid) {
          inverso.unshift(pedidos[pedido]);
          ids.unshift(pedido);
        }
      }
      // inverso.reverse();

      for(let i in inverso) {
        let encabezado = inverso[i].encabezado;
        let dia = encabezado.fechaCaptura.substr(0,2);
        let mes = encabezado.fechaCaptura.substr(3,2);
        let año = encabezado.fechaCaptura.substr(6,4);
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
  rutaPedidoHistorial.on('value', function(snapshot) {
    let datos = snapshot.val();

    let encabezado = datos.encabezado;
    let detalle = datos.detalle;

    let filas = "";
    for(let producto in detalle) {
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
    rutaUsuarios.on('value', function(snapshot) {
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
    function(imageData) {
      let image = document.getElementById('foto');
      image.src = "data:image/jpeg;base64," + imageData;;
      fotoProducto = imageData;
    },
    function(message) {
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

  if((producto != null || producto != undefined) && cantidad.length > 0 && fechaCaducidad.length > 0 && lote.length > 0 && problema.length > 0 && descripcion.length > 0  && (tienda != null || tienda != undefined)) {
    let ticketsRef = db.ref('tickets/calidadProducto');
    ticketsRef.once('value', function(snapshot) {
      let tickets = snapshot.val();

      let keys = Object.keys(tickets);
      let last = keys[keys.length-1];
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
        clave: lastclave+1,
        estado: "Pendiente",
        respuesta: "",
        promotora: uid,
        fotoUrl: ""
      }

      let ticketKey = ticketsRef.push(datosTicket).getKey();
      let nameFoto = "Foto " + moment().format('DD-MM-YYYY hh:mm:ss a');
      let storageRef = storage.ref(uid+'/fotosCalidadProductos/').child(nameFoto);
      let uploadTask = storageRef.putString(fotoProducto, 'base64', {contentType:'image/jpg'});
      uploadTask.on('state_changed', function(snapshot){

      }, function(error) {
        //alert('Error: '+error);
      }, function() {
        let refTicket = db.ref('tickets/calidadProducto/'+ticketKey);
        let downloadURL = uploadTask.snapshot.downloadURL;
        refTicket.update({fotoUrl: downloadURL});
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
    if(producto == undefined || producto == null) {
      $('#productosTicket').parent().parent().addClass('has-error');
      $('#helpblockProductoTicket').show();
    }
    else {
      $('#productosTicket').parent().parent().removeClass('has-error');
      $('#helpblockProductoTicket').hide();
    }
    if(cantidad.length < 1) {
      $('#cantidadMalEstado').parent().parent().addClass('has-error');
      $('#helpblockCantidadMalEstado').show();
    }
    else {
      $('#cantidadMalEstado').parent().parent().removeClass('has-error');
      $('#helpblockCantidadMalEstado').hide();
    }
    if(fechaCaducidad.length < 1) {
      $('#fechaCaducidad').parent().parent().addClass('has-error');
      $('#helpblockFechaCaducidad').show();
    }
    else {
      $('#fechaCaducidad').parent().parent().removeClass('has-error');
      $('#helpblockFechaCaducidad').hide();
    }
    if(lote.length < 1) {
      $('#loteProducto').parent().parent().addClass('has-error');
      $('#helpblockLoteProducto').show();
    }
    else {
      $('#loteProducto').parent().parent().removeClass('has-error');
      $('#helpblockLoteProducto').hide();
    }
    if(descripcion.length < 1) {
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
